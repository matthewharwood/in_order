class NumberCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._value = 0;
    this._isDragging = false;
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
          cursor: ${draggable ? 'grab' : 'default'};
          transition: all 0.2s ease;
          position: relative;
          box-shadow: var(--shadow-md);
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
          transform: ${draggable ? 'translateY(-4px)' : 'none'};
          box-shadow: ${draggable ? 'var(--shadow-lg)' : 'var(--shadow-md)'};
          border-color: var(--color-primary, #facc15);
        }

        .card.dragging {
          opacity: 0.5;
          cursor: grabbing;
          transform: scale(1.05);
        }

        .card.drag-over {
          border-color: var(--color-success, #10b981);
          background: var(--color-success-bg, #ecfdf5);
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
      </div>
    `;
  }

  setupDragHandlers() {
    const card = this.shadowRoot.querySelector('.card');
    
    card.addEventListener('dragstart', (e) => {
      if (this.getAttribute('draggable') === 'false') {
        e.preventDefault();
        return;
      }
      this._isDragging = true;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.getAttribute('value'));
      e.dataTransfer.setData('card-id', this.id || '');
      
      // Store reference to dragged element
      this.getRootNode().host._draggedElement = this;
    });

    card.addEventListener('dragend', () => {
      this._isDragging = false;
      card.classList.remove('dragging');
    });

    card.addEventListener('dragover', (e) => {
      if (this.getAttribute('draggable') === 'false') return;
      e.preventDefault();
      card.classList.add('drag-over');
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
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