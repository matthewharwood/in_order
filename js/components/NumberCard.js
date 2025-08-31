import { audioManager } from '../utils/audioManager.js';

export class NumberCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isDragging = false;
    this.touchOffset = { x: 0, y: 0 };
    this.cloneElement = null;
  }

  connectedCallback() {
    this.render();
    this.setupDragAndDrop();
    this.setupTouchEvents();
  }

  render() {
    const value = this.textContent || this.getAttribute('value') || '';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          touch-action: none; /* Prevent default touch behaviors */
        }
        
        .number-card {
          width: 100px;
          height: 90px;
          background: linear-gradient(145deg, 
            var(--color-surface, #fafaf9) 0%, 
            var(--color-surface-variant, #f5f5f4) 100%);
          color: var(--color-text-secondary, #44403c);
          border: 2px solid var(--color-border, #d6d3d1);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 12px 8px 8px 8px;
          font-family: var(--font-mono, 'Cinzel', serif);
          cursor: grab;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.25),
            0 1px 3px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
        }
        
        .number-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          pointer-events: none;
        }
        
        .number-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-primary, #292524);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          z-index: 1;
          font-family: var(--font-gothic, 'Grenze Gotisch', cursive);
        }
        
        .drag-handle {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          opacity: 0.4;
          transition: opacity 0.2s ease;
        }
        
        .drag-dots {
          display: flex;
          gap: 3px;
        }
        
        .dot {
          width: 4px;
          height: 4px;
          background-color: var(--color-text-muted, #78716c);
          border-radius: 50%;
        }
        
        .drag-icon {
          font-size: 16px;
          color: var(--color-text-muted, #78716c);
          margin-top: 2px;
        }
        
        .number-card:hover {
          background: linear-gradient(145deg, 
            var(--color-primary-light, #fde047) 0%, 
            var(--color-primary, #facc15) 100%);
          border-color: var(--color-primary-dark, #eab308);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.35),
            0 6px 10px rgba(0, 0, 0, 0.25),
            0 0 20px var(--color-primary, #facc15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          cursor: grab;
        }
        
        .number-card:hover .drag-handle {
          opacity: 0.7;
        }
        
        .number-card:hover .number-value {
          color: var(--color-primary-contrast, #0c0a09);
          transform: scale(1.05);
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
        }
        
        .number-card:active {
          cursor: grabbing;
          transform: scale(0.98);
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .number-card.dragging {
          opacity: 0.3;
          transform: scale(0.9);
          cursor: grabbing;
          background: var(--color-surface-variant, #e7e5e4);
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .number-card.dragging .number-value {
          opacity: 0.5;
        }
        
        .number-card.dragging .drag-handle {
          opacity: 0.2;
        }
        
        .number-card.touch-dragging {
          opacity: 0.2;
          pointer-events: none;
          transform: scale(0.85);
          filter: blur(1px);
        }
        
        :host([slot="card-slot"]) .number-card {
          cursor: grab;
        }
        
        :host([slot="card-slot"]) .number-card:active {
          cursor: grabbing;
        }
        
        /* Pulse animation for potential swap target */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .number-card.swap-target {
          animation: pulse 0.5s ease-in-out infinite;
          border-color: var(--color-secondary, #ef4444);
          background: linear-gradient(145deg, 
            var(--color-secondary-light, #f87171) 0%, 
            var(--color-secondary, #ef4444) 100%);
          box-shadow: 0 0 25px var(--color-secondary, #ef4444);
        }
        
        /* Disable tap highlight on touch devices */
        .number-card {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Light mode disabled state */
        [data-theme="light"] .number-card.disabled {
          cursor: default !important;
          background: linear-gradient(145deg, 
            #ecfdf5 0%, 
            #d1fae5 100%);
          border: 2px solid #10b981;
          opacity: 0.95;
          pointer-events: none;
        }
        
        [data-theme="light"] .number-card.disabled:hover {
          transform: none;
          background: linear-gradient(145deg, 
            #ecfdf5 0%, 
            #d1fae5 100%);
          border: 2px solid #10b981;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.08);
        }
        
        [data-theme="light"] .number-card.disabled .number-value {
          color: #047857;
        }
        
        /* Dark mode disabled state */
        [data-theme="dark"] .number-card.disabled {
          cursor: default !important;
          background: linear-gradient(145deg, 
            rgba(250, 204, 21, 0.3) 0%,
            rgba(139, 92, 246, 0.2) 100%);
          border: 2px solid #10b981;
          opacity: 1;
          pointer-events: none;
          box-shadow: 
            0 0 20px rgba(250, 204, 21, 0.4),
            0 0 15px rgba(16, 185, 129, 0.3),
            inset 0 0 10px rgba(250, 204, 21, 0.2);
        }
        
        [data-theme="dark"] .number-card.disabled:hover {
          transform: none;
          background: linear-gradient(145deg, 
            rgba(250, 204, 21, 0.3) 0%,
            rgba(139, 92, 246, 0.2) 100%);
          border: 2px solid #10b981;
          box-shadow: 
            0 0 20px rgba(250, 204, 21, 0.4),
            0 0 15px rgba(16, 185, 129, 0.3),
            inset 0 0 10px rgba(250, 204, 21, 0.2);
        }
        
        [data-theme="dark"] .number-card.disabled .number-value {
          color: var(--color-primary, #facc15);
          text-shadow: 0 0 10px rgba(250, 204, 21, 0.6);
        }
        
        .number-card.disabled .drag-handle {
          opacity: 0.2;
        }
        
        [data-theme="light"] .number-card.disabled .dot {
          background-color: #34d399;
        }
        
        [data-theme="dark"] .number-card.disabled .dot {
          background-color: var(--color-primary, #facc15);
          box-shadow: 0 0 4px rgba(250, 204, 21, 0.5);
        }
      </style>
      <div class="number-card" draggable="true">
        <span class="number-value">${value}</span>
        <div class="drag-handle">
          <div class="drag-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="drag-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="drag-icon">⋮⋮</div>
        </div>
      </div>
    `;
  }

  setupDragAndDrop() {
    const card = this.shadowRoot.querySelector('.number-card');
    
    card.addEventListener('dragstart', (e) => {
      this.isDragging = true;
      card.classList.add('dragging');
      
      // Prepare audio during drag start (important for iPad/iOS)
      audioManager.prepareAudioForPlayback();
      
      // Store the card's value and reference
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.getValue());
      e.dataTransfer.setData('card-id', this.id || '');
      
      // Store reference to the dragged element
      if (window.draggedCard !== this) {
        window.draggedCard = this;
      }
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('card-drag-start', {
        detail: { value: this.getValue(), card: this },
        bubbles: true,
        composed: true
      }));
    });
    
    card.addEventListener('dragend', (e) => {
      this.isDragging = false;
      card.classList.remove('dragging');
      
      // Clear the dragged reference
      if (window.draggedCard === this) {
        window.draggedCard = null;
      }
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('card-drag-end', {
        detail: { value: this.getValue(), card: this },
        bubbles: true,
        composed: true
      }));
    });
  }

  setupTouchEvents() {
    const card = this.shadowRoot.querySelector('.number-card');
    let touchItem = null;
    let touchOffset = { x: 0, y: 0 };
    let draggedClone = null;
    let lastTouchTarget = null;

    // Touch start
    card.addEventListener('touchstart', (e) => {
      // Prevent default to avoid scrolling
      e.preventDefault();
      e.stopPropagation();
      
      // Prepare audio during touch start (critical for iPad)
      audioManager.prepareAudioForPlayback();
      
      const touch = e.touches[0];
      touchItem = this;
      
      // Calculate offset from touch point to card center
      const rect = card.getBoundingClientRect();
      touchOffset.x = touch.clientX - rect.left - rect.width / 2;
      touchOffset.y = touch.clientY - rect.top - rect.height / 2;
      
      // Add dragging class
      card.classList.add('touch-dragging');
      
      // Store reference
      window.draggedCard = this;
      
      // Create a clone for visual feedback
      draggedClone = this.createDragClone(touch.clientX - touchOffset.x, touch.clientY - touchOffset.y);
      document.body.appendChild(draggedClone);
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('card-drag-start', {
        detail: { value: this.getValue(), card: this },
        bubbles: true,
        composed: true
      }));
    }, { passive: false });

    // Touch move
    card.addEventListener('touchmove', (e) => {
      if (!touchItem) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      
      // Update clone position
      if (draggedClone) {
        draggedClone.style.left = (touch.clientX - touchOffset.x - 50) + 'px';
        draggedClone.style.top = (touch.clientY - touchOffset.y - 45) + 'px';
      }
      
      // Find element under touch point (excluding the clone)
      draggedClone.style.pointerEvents = 'none';
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      draggedClone.style.pointerEvents = 'auto';
      
      // Find the card slot under the touch
      let targetSlot = null;
      if (elementBelow) {
        // Check if it's a slot or inside a slot
        const shadowRoot = this.getRootNode().host?.shadowRoot || this.getRootNode();
        const point = { x: touch.clientX, y: touch.clientY };
        
        // Try to find slot in shadow DOM
        if (shadowRoot) {
          const slots = shadowRoot.querySelectorAll('.card-slot');
          slots.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            if (point.x >= rect.left && point.x <= rect.right &&
                point.y >= rect.top && point.y <= rect.bottom) {
              targetSlot = slot;
            }
          });
        }
      }
      
      // Handle drag over effects
      if (targetSlot && targetSlot !== lastTouchTarget) {
        // Remove previous hover
        if (lastTouchTarget) {
          lastTouchTarget.classList.remove('drag-over');
          const prevCard = lastTouchTarget.querySelector('number-card');
          if (prevCard) {
            const prevCardElement = prevCard.shadowRoot.querySelector('.number-card');
            if (prevCardElement) prevCardElement.classList.remove('swap-target');
          }
        }
        // Add new hover
        targetSlot.classList.add('drag-over');
        const targetCard = targetSlot.querySelector('number-card');
        if (targetCard && targetCard !== this) {
          const targetCardElement = targetCard.shadowRoot.querySelector('.number-card');
          if (targetCardElement) targetCardElement.classList.add('swap-target');
        }
        lastTouchTarget = targetSlot;
      } else if (!targetSlot && lastTouchTarget) {
        lastTouchTarget.classList.remove('drag-over');
        const prevCard = lastTouchTarget.querySelector('number-card');
        if (prevCard) {
          const prevCardElement = prevCard.shadowRoot.querySelector('.number-card');
          if (prevCardElement) prevCardElement.classList.remove('swap-target');
        }
        lastTouchTarget = null;
      }
    }, { passive: false });

    // Touch end
    card.addEventListener('touchend', (e) => {
      if (!touchItem) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.changedTouches[0];
      
      // Remove clone
      if (draggedClone) {
        draggedClone.remove();
        draggedClone = null;
      }
      
      // Remove dragging class
      card.classList.remove('touch-dragging');
      
      // Find drop target
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Find the card slot under the touch
      let targetSlot = null;
      if (elementBelow) {
        const shadowRoot = this.getRootNode().host?.shadowRoot || this.getRootNode();
        const point = { x: touch.clientX, y: touch.clientY };
        
        if (shadowRoot) {
          const slots = shadowRoot.querySelectorAll('.card-slot');
          slots.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            if (point.x >= rect.left && point.x <= rect.right &&
                point.y >= rect.top && point.y <= rect.bottom) {
              targetSlot = slot;
            }
          });
        }
      }
      
      // Handle drop
      if (targetSlot) {
        // Remove drag-over class
        targetSlot.classList.remove('drag-over');
        const targetCard = targetSlot.querySelector('number-card');
        if (targetCard) {
          const targetCardElement = targetCard.shadowRoot.querySelector('.number-card');
          if (targetCardElement) targetCardElement.classList.remove('swap-target');
        }
        
        // Trigger drop logic
        this.handleTouchDrop(targetSlot, this);
      }
      
      // Clear references
      touchItem = null;
      lastTouchTarget = null;
      window.draggedCard = null;
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('card-drag-end', {
        detail: { value: this.getValue(), card: this },
        bubbles: true,
        composed: true
      }));
    }, { passive: false });

    // Touch cancel
    card.addEventListener('touchcancel', (e) => {
      if (draggedClone) {
        draggedClone.remove();
        draggedClone = null;
      }
      card.classList.remove('touch-dragging');
      if (lastTouchTarget) {
        lastTouchTarget.classList.remove('drag-over');
        const prevCard = lastTouchTarget.querySelector('number-card');
        if (prevCard) {
          const prevCardElement = prevCard.shadowRoot.querySelector('.number-card');
          if (prevCardElement) prevCardElement.classList.remove('swap-target');
        }
      }
      touchItem = null;
      lastTouchTarget = null;
      window.draggedCard = null;
    });
  }

  createDragClone(x, y) {
    const clone = document.createElement('div');
    clone.style.position = 'fixed';
    clone.style.left = (x - 50) + 'px';
    clone.style.top = (y - 45) + 'px';
    clone.style.width = '100px';
    clone.style.height = '90px';
    clone.style.background = 'linear-gradient(145deg, #fafaf9 0%, #f5f5f4 100%)';
    clone.style.border = '2px solid #78716c';
    clone.style.borderRadius = '12px';
    clone.style.display = 'flex';
    clone.style.alignItems = 'center';
    clone.style.justifyContent = 'center';
    clone.style.fontFamily = 'var(--font-mono, Cinzel, serif)';
    clone.style.fontSize = '28px';
    clone.style.fontWeight = '700';
    clone.style.color = '#292524';
    clone.style.zIndex = '10000';
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '0.9';
    clone.style.transform = 'scale(1.15) rotate(3deg)';
    clone.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)';
    clone.style.transition = 'transform 0.2s ease';
    clone.textContent = this.getValue();
    return clone;
  }

  handleTouchDrop(targetSlot, draggedCard) {
    if (!targetSlot || !draggedCard) return;
    
    // Get the current card in this slot (if any)
    const currentCard = targetSlot.querySelector('number-card');
    
    // Get the source slot (where the dragged card came from)
    const sourceSlot = draggedCard.parentElement;
    
    // If dropping on an occupied slot, swap the cards
    if (currentCard && currentCard !== draggedCard) {
      // Swap the cards
      sourceSlot.appendChild(currentCard);
      targetSlot.appendChild(draggedCard);
      
      // Update slot states
      sourceSlot.classList.add('occupied');
      targetSlot.classList.add('occupied');
    } else if (!currentCard) {
      // If dropping on an empty slot, just move the card
      targetSlot.appendChild(draggedCard);
      targetSlot.classList.add('occupied');
      
      // Clear the source slot if it's now empty
      if (sourceSlot && sourceSlot.classList.contains('card-slot')) {
        sourceSlot.classList.remove('occupied');
        // Add placeholder back to empty slot
        if (!sourceSlot.querySelector('number-card')) {
          const placeholder = document.createElement('span');
          placeholder.className = 'slot-placeholder';
          placeholder.innerHTML = '⊕';
          sourceSlot.appendChild(placeholder);
        }
      }
    }
    
    // Remove placeholder if it exists
    const placeholder = targetSlot.querySelector('.slot-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
    
    // Trigger order check on the container
    // Since targetSlot is in shadow DOM, we need to get the host
    const shadowRoot = targetSlot.getRootNode();
    if (shadowRoot && shadowRoot.host && shadowRoot.host.tagName === 'NUMBER-CARD-CONTAINER') {
      const container = shadowRoot.host;
      console.log('Touch drop: Calling checkOrder on container');
      container.isUserInteraction = true; // Mark as user interaction
      
      // Check immediately to maintain user gesture chain for iPad audio
      container.checkOrder();
      
      // Reset flag after a short delay
      setTimeout(() => {
        container.isUserInteraction = false; // Reset flag
      }, 100);
    } else {
      console.error('Could not find container to check order');
    }
  }

  getValue() {
    const valueSpan = this.shadowRoot.querySelector('.number-value');
    return valueSpan ? valueSpan.textContent : '';
  }

  setValue(value) {
    const valueSpan = this.shadowRoot.querySelector('.number-value');
    if (valueSpan) {
      valueSpan.textContent = value;
    }
    this.textContent = value;
  }
}

customElements.define('number-card', NumberCard);