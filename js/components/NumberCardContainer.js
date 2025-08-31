import { generateRandomNumbers } from '../utils/randomNumbers.js';
import { debouncedSave } from '../utils/stateManager.js';
import { audioManager } from '../utils/audioManager.js';
import { animate } from 'animejs';
import { isIPad, getIPadDelay } from '../utils/ipadFix.js';

export class NumberCardContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._numbers = [];
    this.slots = [];
    this.winnerAudio = null;
    this.isUserInteraction = false; // Track if change is from user drag/drop
  }

  static get observedAttributes() {
    return ['total-cards', 'min-range', 'max-range', 'winning-mode'];
  }

  connectedCallback() {
    this.render();
    this.setupDragAndDrop();
    // Don't preload audio - it causes unwanted playback
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this.setupDragAndDrop();
    }
  }


  generateNumbers() {
    let totalCards = parseInt(this.getAttribute('total-cards')) || 5;
    // Limit to maximum 8 cards
    totalCards = Math.min(totalCards, 8);
    
    const minRange = parseInt(this.getAttribute('min-range')) || 0;
    const maxRange = parseInt(this.getAttribute('max-range')) || 100;
    this._numbers = generateRandomNumbers(totalCards, minRange, maxRange);
    console.log('Generated numbers:', this._numbers);
  }

  render() {
    this.generateNumbers();
    const winningMode = this.getAttribute('winning-mode') || 'asc';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: var(--space-4, 1rem);
        }
        
        .container {
          padding: var(--space-4, 1rem);
          background-color: var(--color-surface, #fafaf9);
          border: 2px solid var(--color-border, #e7e5e4);
          border-radius: var(--radius-lg, 0.5rem);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        /* Light mode winner state */
        [data-theme="light"] .container.winner {
          background: linear-gradient(135deg, 
            #ecfdf5 0%, 
            #d1fae5 100%);
          border: 3px solid #10b981;
          box-shadow: 
            0 0 30px rgba(16, 185, 129, 0.3),
            0 4px 12px rgba(16, 185, 129, 0.2);
        }
        
        /* Dark mode winner state */
        [data-theme="dark"] .container.winner {
          background: linear-gradient(135deg, 
            rgba(250, 204, 21, 0.15) 0%,
            rgba(250, 204, 21, 0.25) 50%,
            rgba(139, 92, 246, 0.15) 100%);
          border: 3px solid #10b981;
          box-shadow: 
            0 0 40px rgba(250, 204, 21, 0.5),
            0 0 80px rgba(139, 92, 246, 0.3),
            0 0 30px rgba(16, 185, 129, 0.4),
            inset 0 0 20px rgba(250, 204, 21, 0.2);
        }
        
        @keyframes winner-pulse-light {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 50px rgba(16, 185, 129, 0.5);
          }
        }
        
        @keyframes winner-pulse-dark {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 40px rgba(250, 204, 21, 0.5),
              0 0 80px rgba(139, 92, 246, 0.3);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 60px rgba(250, 204, 21, 0.7),
              0 0 100px rgba(139, 92, 246, 0.5);
          }
        }
        
        [data-theme="light"] .container.winner {
          animation: winner-pulse-light 2s ease-in-out infinite;
        }
        
        [data-theme="dark"] .container.winner {
          animation: winner-pulse-dark 2s ease-in-out infinite;
        }
        
        
        .title {
          width: 100%;
          margin: 0 0 var(--space-3, 0.75rem) 0;
          font-family: var(--font-accent, 'Pirata One', cursive);
          font-size: var(--text-xl, 1.563rem);
          font-weight: var(--font-semibold, 600);
          color: var(--color-text-primary, #292524);
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .winning-mode-badge {
          font-size: var(--text-sm, 0.8rem);
          padding: 4px 10px;
          background: linear-gradient(135deg, var(--color-accent, #8b5cf6) 0%, var(--color-accent-dark, #7c3aed) 100%);
          color: var(--color-text-inverse, #ffffff);
          border-radius: var(--radius-md, 0.375rem);
          font-family: var(--font-mono, 'Cinzel', serif);
          text-transform: uppercase;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        [data-theme="light"] .container.winner .winning-mode-badge {
          background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
          color: #047857;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }
        
        [data-theme="dark"] .container.winner .winning-mode-badge {
          background: linear-gradient(135deg, 
            var(--color-primary, #facc15) 0%, 
            var(--color-primary-dark, #eab308) 100%);
          color: var(--color-primary-contrast, #0c0a09);
          box-shadow: 
            0 0 20px rgba(250, 204, 21, 0.6),
            0 2px 8px rgba(0, 0, 0, 0.4);
          font-weight: bold;
        }
        
        .cards-area {
          display: flex;
          flex-wrap: wrap;
          gap: 36px;
          min-height: 110px;
          padding: var(--space-4, 1rem);
          background: linear-gradient(135deg, 
            var(--color-surface-variant, #f5f5f4) 0%, 
            var(--color-surface, #fafaf9) 100%);
          border-radius: var(--radius-lg, 0.5rem);
          margin-bottom: var(--space-3, 0.75rem);
          border: 1px solid var(--color-border, #e7e5e4);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        [data-theme="light"] .container.winner .cards-area {
          background: linear-gradient(135deg, 
            rgba(236, 253, 245, 0.9) 0%, 
            rgba(209, 250, 229, 0.9) 100%);
          border: 2px solid #10b981;
          pointer-events: none;
        }
        
        [data-theme="dark"] .container.winner .cards-area {
          background: linear-gradient(135deg, 
            rgba(250, 204, 21, 0.08) 0%,
            rgba(139, 92, 246, 0.08) 100%);
          border: 2px solid #10b981;
          box-shadow: 
            0 0 15px rgba(16, 185, 129, 0.3),
            inset 0 2px 10px rgba(250, 204, 21, 0.2),
            inset 0 -2px 10px rgba(139, 92, 246, 0.2);
          pointer-events: none;
        }
        
        /* Disable drag functionality when winner */
        .container.winner .card-slot {
          cursor: not-allowed;
          pointer-events: none;
        }
        
        .container.winner number-card {
          opacity: 0.9;
          cursor: default !important;
        }
        
        .card-slot {
          width: 104px;
          height: 94px;
          border: 3px dashed var(--color-border-strong, #d6d3d1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, 
            var(--color-border, #d6d3d1) 0%, 
            var(--color-surface-variant, #e7e5e4) 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .card-slot.occupied {
          border: none;
          background: transparent;
          box-shadow: none;
        }
        
        .card-slot.drag-over {
          background: linear-gradient(145deg, 
            var(--emerald-200, #a7f3d0) 0%, 
            var(--emerald-100, #d1fae5) 100%);
          border-color: var(--emerald-500, #10b981);
          border-width: 3px;
          border-style: solid;
          transform: scale(1.08);
          box-shadow: 
            0 0 20px rgba(16, 185, 129, 0.3),
            inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .card-slot.drag-over.occupied {
          background: linear-gradient(145deg, 
            var(--yellow-300, #fde047) 0%, 
            var(--yellow-200, #fef08a) 100%);
          border-color: var(--yellow-500, #eab308);
          box-shadow: 
            0 0 20px rgba(234, 179, 8, 0.4),
            0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        @keyframes pulse-empty {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        .slot-placeholder {
          font-family: var(--font-gothic, 'Grenze Gotisch', cursive);
          font-size: 32px;
          color: var(--color-text-muted, #a8a29e);
          pointer-events: none;
          opacity: 0.4;
          animation: pulse-empty 2s ease-in-out infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .slot-placeholder-text {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }
        
        .stats {
          width: 100%;
          margin-top: var(--space-3, 0.75rem);
          padding-top: var(--space-3, 0.75rem);
          border-top: 1px solid var(--color-border, #e7e5e4);
          font-family: var(--font-mono, 'Cinzel', serif);
          font-size: var(--text-sm, 0.8rem);
          color: var(--color-text-secondary, #57534e);
        }
        
        [data-theme="light"] .container.winner .stats {
          border-top-color: #10b981;
          color: #047857;
          font-weight: bold;
        }
        
        [data-theme="dark"] .container.winner .stats {
          border-top-color: #10b981;
          color: var(--color-primary, #facc15);
          font-weight: bold;
          text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
        }
        
        /* Light mode status message */
        [data-theme="light"] .status-message {
          padding: var(--space-2, 0.5rem);
          margin-top: var(--space-2, 0.5rem);
          background-color: #ecfdf5;
          border: 2px solid #10b981;
          border-radius: var(--radius-md, 0.375rem);
          color: #047857;
          font-family: var(--font-sans, 'MedievalSharp', cursive);
          font-size: var(--text-sm, 0.8rem);
          text-align: center;
          display: none;
        }
        
        /* Dark mode status message */
        [data-theme="dark"] .status-message {
          padding: var(--space-2, 0.5rem);
          margin-top: var(--space-2, 0.5rem);
          background: linear-gradient(135deg,
            rgba(250, 204, 21, 0.2) 0%,
            rgba(139, 92, 246, 0.2) 100%);
          border: 2px solid #10b981;
          border-radius: var(--radius-md, 0.375rem);
          color: var(--color-primary, #facc15);
          font-family: var(--font-accent, 'Pirata One', cursive);
          font-size: var(--text-base, 1rem);
          font-weight: bold;
          text-align: center;
          text-shadow: 0 0 20px rgba(250, 204, 21, 0.6);
          box-shadow: 
            0 0 20px rgba(250, 204, 21, 0.3),
            0 0 15px rgba(16, 185, 129, 0.3),
            inset 0 0 10px rgba(250, 204, 21, 0.1);
          display: none;
        }
        
        [data-theme="light"] .status-message.show {
          display: block;
          animation: slide-in 0.3s ease-out;
        }
        
        [data-theme="dark"] .status-message.show {
          display: block;
          animation: slide-in-glow 0.5s ease-out;
        }
        
        @keyframes slide-in-glow {
          from {
            transform: translateY(-10px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slide-in {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      </style>
      <div class="container" id="container">
        <h3 class="title">
          <span>Random Number Cards</span>
          <span class="winning-mode-badge">${winningMode === 'desc' ? '↓ DESC' : '↑ ASC'}</span>
        </h3>
        <div class="cards-area" id="cardsArea">
          ${this._numbers.map((num, index) => `
            <div class="card-slot occupied" data-slot-index="${index}">
              <number-card id="card-${index}-${num}">${num}</number-card>
            </div>
          `).join('')}
        </div>
        <div class="stats">
          Total: ${this._numbers.length} cards (max 8) | 
          Range: ${this.getAttribute('min-range') || 0}-${this.getAttribute('max-range') || 100} | 
          Min: ${Math.min(...this._numbers)} | 
          Max: ${Math.max(...this._numbers)} |
          Mode: ${winningMode.toUpperCase()}
        </div>
        <div class="status-message" id="statusMessage"></div>
      </div>
    `;
  }

  setupDragAndDrop() {
    const cardsArea = this.shadowRoot.getElementById('cardsArea');
    if (!cardsArea) return;

    // Get all slots
    const slots = cardsArea.querySelectorAll('.card-slot');
    
    slots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('drag-over');
      });

      slot.addEventListener('dragleave', (e) => {
        slot.classList.remove('drag-over');
      });

      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        const draggedCard = window.draggedCard;
        if (!draggedCard) return;

        // Get the current card in this slot (if any)
        const currentCard = slot.querySelector('number-card');
        
        // Get the source slot (where the dragged card came from)
        const sourceSlot = draggedCard.parentElement;
        
        // If dropping on an occupied slot, swap the cards
        if (currentCard && currentCard !== draggedCard) {
          // Swap the cards
          sourceSlot.appendChild(currentCard);
          slot.appendChild(draggedCard);
          
          // Update slot states
          sourceSlot.classList.add('occupied');
          slot.classList.add('occupied');
        } else if (!currentCard) {
          // If dropping on an empty slot, just move the card
          slot.appendChild(draggedCard);
          slot.classList.add('occupied');
          
          // Clear the source slot if it's now empty
          if (sourceSlot && sourceSlot.classList.contains('card-slot')) {
            sourceSlot.classList.remove('occupied');
            // Add placeholder back to empty slot
            if (!sourceSlot.querySelector('number-card')) {
              const placeholder = document.createElement('div');
              placeholder.className = 'slot-placeholder';
              placeholder.innerHTML = `
                <span>⊕</span>
                <span class="slot-placeholder-text">Drop</span>
              `;
              sourceSlot.appendChild(placeholder);
            }
          }
        }
        
        // Remove placeholder if it exists
        const placeholder = slot.querySelector('.slot-placeholder');
        if (placeholder) {
          placeholder.remove();
        }
        
        // Check if cards are in order immediately for iPad audio
        console.log('Drop event: Calling checkOrder');
        this.isUserInteraction = true; // Mark as user interaction
        
        // Check immediately to maintain user gesture chain for audio
        this.checkOrder();
        
        // Reset flag and save state after a short delay
        setTimeout(() => {
          this.isUserInteraction = false; // Reset flag
          debouncedSave(); // Save state
        }, 100);
      });
    });

    // Listen for card drag events
    this.addEventListener('card-drag-start', (e) => {
      const card = e.detail.card;
      const slot = card.parentElement;
      
      // Prepare audio during drag start (important for iPad)
      audioManager.prepareAudioForPlayback();
      
      // Add placeholder when card is dragged out
      setTimeout(() => {
        if (slot && slot.classList.contains('card-slot') && !slot.querySelector('number-card')) {
          const placeholder = document.createElement('div');
          placeholder.className = 'slot-placeholder';
          placeholder.innerHTML = `
            <span>⊕</span>
            <span class="slot-placeholder-text">Drop</span>
          `;
          slot.appendChild(placeholder);
          slot.classList.remove('occupied');
        }
      }, 10);
    });
  }

  checkOrder() {
    const cardsArea = this.shadowRoot.getElementById('cardsArea');
    if (!cardsArea) {
      console.error('Cards area not found!');
      return;
    }
    
    const cards = cardsArea.querySelectorAll('number-card');
    console.log('Found cards:', cards.length);
    
    const values = Array.from(cards).map(card => {
      const val = card.getValue();
      console.log('Card value:', val, 'parsed:', parseInt(val));
      return parseInt(val);
    });
    
    const winningMode = this.getAttribute('winning-mode') || 'asc';
    
    // Debug logging
    console.log('=== CHECKING ORDER ===');
    console.log('Current values:', values);
    console.log('Mode:', winningMode);
    console.log('Original numbers count:', this._numbers.length);
    console.log('Current cards count:', values.length);
    
    // Check if we have all cards
    if (values.length !== this._numbers.length) {
      console.log('Not all cards present! Expected:', this._numbers.length, 'Got:', values.length);
      return;
    }
    
    // Check if values are in order based on mode
    let isOrdered = true;
    for (let i = 1; i < values.length; i++) {
      if (winningMode === 'asc') {
        // Ascending order: each number should be >= previous
        if (values[i] < values[i - 1]) {
          console.log(`Not ascending: ${values[i]} < ${values[i-1]} at position ${i}`);
          isOrdered = false;
          break;
        }
      } else if (winningMode === 'desc') {
        // Descending order: each number should be <= previous
        if (values[i] > values[i - 1]) {
          console.log(`Not descending: ${values[i]} > ${values[i-1]} at position ${i}`);
          isOrdered = false;
          break;
        }
      }
    }
    
    console.log('Is ordered:', isOrdered);
    
    // Show status message and apply winner styling
    const statusMessage = this.shadowRoot.getElementById('statusMessage');
    const container = this.shadowRoot.getElementById('container');
    
    if (!statusMessage || !container) {
      console.error('Could not find statusMessage or container elements!');
      return;
    }
    
    console.log('Final check - isOrdered:', isOrdered, 'hasAllCards:', values.length === this._numbers.length);
    
    if (isOrdered && values.length === this._numbers.length) {
      console.log('🎉 WINNER! Applying winner state');
      console.log('Container element:', container);
      console.log('Container classes before:', container.className);
      const modeText = winningMode === 'desc' ? 'descending' : 'ascending';
      statusMessage.textContent = `✅ Perfect! Cards are in ${modeText} order!`;
      statusMessage.className = 'status-message show';
      
      // Add winner class to container (this disables interactions via CSS)
      container.classList.add('winner');
      console.log('Container classes after:', container.className);
      console.log('Container computed background:', window.getComputedStyle(container).backgroundColor);
      
      // Disable drag functionality on all cards
      cards.forEach(card => {
        if (card.shadowRoot) {
          const cardElement = card.shadowRoot.querySelector('.number-card');
          if (cardElement) {
            cardElement.draggable = false;
            cardElement.style.cursor = 'default';
            cardElement.classList.add('disabled');
          }
        }
      });
      
      // Remove event listeners from slots
      const slots = cardsArea.querySelectorAll('.card-slot');
      slots.forEach(slot => {
        slot.style.pointerEvents = 'none';
      });
      
      // Play winner sound ONLY if this was triggered by user interaction
      if (this.isUserInteraction) {
        console.log('User interaction detected, playing winner sound...');
        // Use the audio manager which handles iPad/iOS properly
        audioManager.playWinnerSound();
      } else {
        console.log('Skipping audio - not a user interaction');
      }
      
      // Dispatch success event
      this.dispatchEvent(new CustomEvent('cards-ordered', {
        detail: { values, mode: winningMode, isWinner: true },
        bubbles: true,
        composed: true
      }));
      
      // Animate container down after a short delay
      setTimeout(() => {
        this.animateContainerDown();
      }, 1500);
    } else {
      statusMessage.className = 'status-message';
      container.classList.remove('winner');
      
      // Re-enable drag functionality if it was disabled
      cards.forEach(card => {
        if (card.shadowRoot) {
          const cardElement = card.shadowRoot.querySelector('.number-card');
          if (cardElement) {
            cardElement.draggable = true;
            cardElement.style.cursor = '';
            cardElement.classList.remove('disabled');
          }
        }
      });
      
      // Re-enable slots
      const slots = cardsArea.querySelectorAll('.card-slot');
      slots.forEach(slot => {
        slot.style.pointerEvents = '';
      });
    }
  }

  setNumbers(numbers) {
    // Limit to maximum 8 numbers
    this._numbers = numbers.slice(0, 8);
    this.render();
    this.setupDragAndDrop();
  }

  getCurrentOrder() {
    const cardsArea = this.shadowRoot.getElementById('cardsArea');
    const cards = cardsArea.querySelectorAll('number-card');
    return Array.from(cards).map(card => parseInt(card.getValue()));
  }

  getState() {
    return {
      originalNumbers: this._numbers,
      currentOrder: this.getCurrentOrder(),
      attributes: {
        totalCards: this.getAttribute('total-cards'),
        minRange: this.getAttribute('min-range'),
        maxRange: this.getAttribute('max-range'),
        winningMode: this.getAttribute('winning-mode')
      },
      isWinner: this.shadowRoot.getElementById('container').classList.contains('winner')
    };
  }

  setState(state) {
    if (!state) return;
    
    console.log('[setState] Restoring container state:', state);
    
    // Set attributes
    if (state.attributes) {
      if (state.attributes.totalCards) this.setAttribute('total-cards', state.attributes.totalCards);
      if (state.attributes.minRange) this.setAttribute('min-range', state.attributes.minRange);
      if (state.attributes.maxRange) this.setAttribute('max-range', state.attributes.maxRange);
      if (state.attributes.winningMode) this.setAttribute('winning-mode', state.attributes.winningMode);
    }
    
    // Set the original numbers
    if (state.originalNumbers) {
      this._numbers = state.originalNumbers;
    }
    
    // Render with the original numbers first
    this.render();
    this.setupDragAndDrop();
    
    // Wait for render to complete, especially on iPad
    const restoreDelay = getIPadDelay(100);
    
    setTimeout(() => {
      // Verify shadow DOM is ready
      if (!this.shadowRoot || !this.shadowRoot.getElementById('cardsArea')) {
        console.error('[setState] Shadow DOM not ready after delay');
        return;
      }
      
      // Then rearrange cards to match the saved order
      if (state.currentOrder && state.currentOrder.length > 0) {
        this.restoreCardOrder(state.currentOrder);
      }
      
      // Check if it was a winner state
      if (state.isWinner) {
        // Don't play audio when restoring state
        this.isUserInteraction = false;
        this.checkOrder();
      }
    }, restoreDelay);
  }

  restoreCardOrder(savedOrder) {
    const cardsArea = this.shadowRoot.getElementById('cardsArea');
    if (!cardsArea) {
      console.error('[restoreCardOrder] Cards area not found');
      return;
    }
    
    const slots = cardsArea.querySelectorAll('.card-slot');
    if (!slots || slots.length === 0) {
      console.error('[restoreCardOrder] No slots found');
      return;
    }
    
    console.log('[restoreCardOrder] Restoring order:', savedOrder);
    
    // Wait a frame for cards to be ready
    requestAnimationFrame(() => {
      const allCards = cardsArea.querySelectorAll('number-card');
      
      if (!allCards || allCards.length === 0) {
        console.warn('[restoreCardOrder] No cards found - skipping restore');
        return;
      }
      
      // Create a map of value to card element
      const cardMap = new Map();
      allCards.forEach(card => {
        const value = parseInt(card.getValue());
        if (!isNaN(value)) {
          cardMap.set(value, card);
        }
      });
      
      console.log(`[restoreCardOrder] Found ${cardMap.size} cards`);
      
      // Collect cards to move
      const moves = [];
      savedOrder.forEach((value, targetIndex) => {
        if (targetIndex < slots.length && cardMap.has(value)) {
          moves.push({ card: cardMap.get(value), targetSlot: slots[targetIndex] });
        }
      });
      
      // Clear all slots first (remove placeholders)
      slots.forEach(slot => {
        const placeholder = slot.querySelector('.slot-placeholder');
        if (placeholder) placeholder.remove();
        slot.classList.remove('occupied');
      });
      
      // Use document fragment to batch DOM operations
      const fragment = document.createDocumentFragment();
      
      // Temporarily move all cards to fragment
      allCards.forEach(card => {
        fragment.appendChild(card);
      });
      
      // Place cards in correct slots
      moves.forEach(({ card, targetSlot }) => {
        targetSlot.appendChild(card);
        targetSlot.classList.add('occupied');
      });
      
      console.log('[restoreCardOrder] Order restored successfully');
    });
  }
  
  animateContainerDown() {
    // Get the container wrapper and this container's position
    const containerWrapper = document.getElementById('container-wrapper');
    if (!containerWrapper) return;
    
    // Create a new container with the same settings
    const newContainer = document.createElement('number-card-container');
    newContainer.setAttribute('total-cards', this.getAttribute('total-cards'));
    newContainer.setAttribute('min-range', this.getAttribute('min-range'));
    newContainer.setAttribute('max-range', this.getAttribute('max-range'));
    newContainer.setAttribute('winning-mode', this.getAttribute('winning-mode'));
    
    // Insert new container at the top
    containerWrapper.insertBefore(newContainer, containerWrapper.firstChild);
    
    // Generate numbers for the new container
    const totalCards = Math.min(parseInt(this.getAttribute('total-cards')) || 5, 8);
    const minRange = parseInt(this.getAttribute('min-range')) || 0;
    const maxRange = parseInt(this.getAttribute('max-range')) || 100;
    const numbers = generateRandomNumbers(totalCards, minRange, maxRange);
    
    // Wait for the new container to be ready then set numbers
    setTimeout(() => {
      newContainer.setNumbers(numbers);
    }, 100);
    
    // Animate this completed container down
    animate(this, {
      translateY: [0, 250],
      opacity: [1, 0.6],
      scale: [1, 0.95],
      duration: 800,
      easing: 'easeOutCubic',
      complete: () => {
        // Keep the container visible but moved down
        this.style.transform = 'translateY(250px) scale(0.95)';
        this.style.opacity = '0.6';
        this.style.pointerEvents = 'none';
      }
    });
    
    // Animate the new container in
    animate(newContainer, {
      translateY: [-100, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutCubic'
    });
    
    // Save the state after creating new container
    setTimeout(() => {
      debouncedSave();
    }, 1000);
  }
}

customElements.define('number-card-container', NumberCardContainer);