import { animate } from '../vendor/anime.esm.js';

class NumberCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._value = 0;
    this._isDragging = false;
    this._currentAnimation = null;
  }

  static get observedAttributes() {
    return ['value', 'draggable', 'size'];
  }

  connectedCallback() {
    this.render();
    this.setupDragHandlers();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'value') {
        this._value = Number(newValue);
      }
      this.render();
    }
  }

  render() {
    const value = this.getAttribute('value') || '0';
    const draggable = this.getAttribute('draggable') !== 'false';
    const size = this.getAttribute('size') || 'medium';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          user-select: none;
          -webkit-user-select: none;
        }

        .card {
          background: var(--color-surface, #f5f5f4);
          border: 3px solid var(--color-border-strong, #a8a29e);
          border-radius: var(--radius-lg, 0.5rem);
          color: var(--color-text-primary, #1c1917);
          font-family: var(--font-mono, 'Space Mono', monospace);
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ${draggable ? 'grab' : 'pointer'};
          transition: filter 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out;
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          will-change: transform, opacity;
          overflow: hidden;
        }

        .card.small {
          width: 60px;
          height: 80px;
          font-size: 1.5rem;
        }

        .card.medium {
          width: 80px;
          height: 100px;
          font-size: 2rem;
        }

        .card.large {
          width: 100px;
          height: 120px;
          font-size: 2.5rem;
        }

        .card:hover {
          filter: brightness(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: var(--color-primary, #facc15);
        }

        .card:active {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .card.dragging {
          opacity: 0.9;
          cursor: grabbing;
        }

        .card.drag-over {
          border-color: var(--color-success, #10b981);
          background: var(--color-success-bg, #ecfdf5);
        }

        .ripple-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          pointer-events: none;
        }

        .number {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .card.medium {
            width: 70px;
            height: 90px;
            font-size: 1.75rem;
          }
        }
      </style>

      <div class="card ${size}" draggable="${draggable}">
        <span class="number">${value}</span>
        <div class="ripple-container"></div>
      </div>
    `;
  }

  setupDragHandlers() {
    const card = this.shadowRoot.querySelector('.card');
    
    // Hover animations
    card.addEventListener('mouseenter', () => {
      if (this._currentAnimation) this._currentAnimation.pause();
      
      this._currentAnimation = animate(card, {
        scale: [1, 1.05],
        rotate: [0, 1, 0],
        duration: 200,
        easing: 'easeOutCubic'
      });
    });

    card.addEventListener('mouseleave', () => {
      if (this._currentAnimation) this._currentAnimation.pause();
      
      this._currentAnimation = animate(card, {
        scale: [1.05, 1],
        rotate: [0, -1, 0],
        duration: 300,
        easing: 'easeOutCubic'
      });
    });

    // Click animations
    card.addEventListener('pointerdown', (e) => {
      animate(card, {
        scale: [1, 0.95],
        duration: 50,
        easing: 'easeOutQuad'
      });
    });

    card.addEventListener('pointerup', () => {
      animate(card, {
        scale: [0.95, 1.02, 1],
        duration: 300,
        easing: 'easeOutElastic'
      });
    });

    card.addEventListener('click', (e) => {
      this.createRipple(e);
    });
    
    // Drag animations
    card.addEventListener('dragstart', (e) => {
      if (this.getAttribute('draggable') === 'false') {
        e.preventDefault();
        return;
      }
      this._isDragging = true;
      card.classList.add('dragging');
      
      // Lift effect animation
      animate(card, {
        scale: [1, 1.05],
        rotate: [0, 2],
        duration: 150,
        easing: 'easeOutCubic'
      });
      
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.getAttribute('value'));
      e.dataTransfer.setData('card-id', this.id || '');
      
      // Store reference to dragged element
      if (this.getRootNode().host) {
        this.getRootNode().host._draggedElement = this;
      }
    });

    card.addEventListener('dragend', () => {
      this._isDragging = false;
      card.classList.remove('dragging');
      
      // Drop effect animation
      animate(card, {
        scale: [1.05, 1],
        rotate: [2, 0],
        duration: 200,
        easing: 'easeOutCubic'
      });
    });

    card.addEventListener('dragover', (e) => {
      if (this.getAttribute('draggable') === 'false') return;
      e.preventDefault();
      
      if (!card.classList.contains('drag-over')) {
        card.classList.add('drag-over');
        
        // Pulse effect on drag over
        animate(card, {
          scale: [1, 1.05, 1],
          duration: 400,
          easing: 'easeInOutQuad'
        });
      }
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
      
      // Scale back animation
      animate(card, {
        scale: [1.05, 1],
        duration: 200,
        easing: 'easeOutCubic'
      });
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      
      // Success drop animation
      animate(card, {
        scale: [1, 0.95, 1.02, 1],
        duration: 400,
        easing: 'easeOutElastic'
      });
    });
  }

  createRipple(event) {
    const card = this.shadowRoot.querySelector('.card');
    const rippleContainer = card.querySelector('.ripple-container');
    if (!rippleContainer) return;
    
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = size + 'px';
    
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    rippleContainer.appendChild(ripple);
    
    // Animate ripple
    animate(ripple, {
      scale: [0, 1],
      opacity: [0.6, 0],
      duration: 600,
      easing: 'easeOutQuad',
      complete: () => ripple.remove()
    });
  }

  getValue() {
    return Number(this.getAttribute('value') || 0);
  }

  setValue(value) {
    this.setAttribute('value', value);
  }
}

customElements.define('number-card', NumberCard);