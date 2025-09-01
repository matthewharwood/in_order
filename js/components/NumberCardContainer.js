import { get, set } from '../utils/storage.js';
import { generateRandomNumbers } from '../utils/randomNumbers.js';

class NumberCardContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._numbers = [];
    this._draggedElement = null;
    this._containerKey = '';
  }

  static get observedAttributes() {
    return ['total-cards', 'min-range', 'max-range', 'container-id', 'card-size'];
  }

  async connectedCallback() {
    this.setupContainerKey();
    await this.initializeNumbers();
    this.render();
    this.setupDragAndDrop();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.setupContainerKey();
      this.initializeNumbers().then(() => {
        this.render();
        this.setupDragAndDrop();
      });
    }
  }

  setupContainerKey() {
    // Create unique key for this container instance
    const containerId = this.getAttribute('container-id') || 'default';
    this._containerKey = `numberContainer_${containerId}`;
  }

  async initializeNumbers() {
    const totalCards = Number(this.getAttribute('total-cards')) || 5;
    const minRange = Number(this.getAttribute('min-range')) || 0;
    const maxRange = Number(this.getAttribute('max-range')) || 100;

    // Validate total cards (2-8)
    const validatedTotal = Math.min(Math.max(totalCards, 2), 8);

    try {
      // Try to load from idb first
      const savedState = await get(this._containerKey);
      
      if (savedState && savedState.numbers && savedState.numbers.length === validatedTotal) {
        console.log(`Loaded numbers from storage for ${this._containerKey}:`, savedState.numbers);
        this._numbers = savedState.numbers;
      } else {
        // Generate new random numbers
        this._numbers = generateRandomNumbers(validatedTotal, minRange, maxRange);
        console.log(`Generated new numbers for ${this._containerKey}:`, this._numbers);
        
        // Save to idb
        await this.saveState();
      }
    } catch (error) {
      console.error('Error initializing numbers:', error);
      // Fallback to generating new numbers
      this._numbers = generateRandomNumbers(validatedTotal, minRange, maxRange);
    }
  }

  async saveState() {
    try {
      const state = {
        numbers: this._numbers,
        timestamp: Date.now(),
        totalCards: this._numbers.length,
        minRange: Number(this.getAttribute('min-range')) || 0,
        maxRange: Number(this.getAttribute('max-range')) || 100
      };
      
      await set(this._containerKey, state);
      console.log(`Saved state for ${this._containerKey}:`, state);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  render() {
    const cardSize = this.getAttribute('card-size') || 'medium';
    const totalCards = this._numbers.length;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
        }

        .container {
          background: var(--color-surface-variant, #e7e5e4);
          border-radius: var(--radius-xl, 0.75rem);
          padding: 1.5rem;
          min-height: 150px;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
        }

        .container.drag-active {
          background: var(--color-surface-hover, rgba(250, 204, 21, 0.1));
          border: 2px dashed var(--color-primary, #facc15);
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.2);
          transition: all 0.2s ease;
        }

        .title {
          font-family: var(--font-sans, 'Space Grotesk', sans-serif);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: normal;
        }

        .cards-wrapper {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          min-height: 120px;
        }

        .card-slot {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .card-slot.empty {
          border: 3px dashed var(--color-border, #d6d3d1);
          border-radius: var(--radius-lg, 0.5rem);
          background: var(--color-surface, #f5f5f4);
          opacity: 0.5;
        }

        .card-slot.empty.small {
          width: 60px;
          height: 80px;
        }

        .card-slot.empty.medium {
          width: 80px;
          height: 100px;
        }

        .card-slot.empty.large {
          width: 100px;
          height: 120px;
        }

        .card-slot.drag-over {
          background: var(--color-surface-hover, rgba(16, 185, 129, 0.1));
          border-color: var(--color-success, #10b981);
          opacity: 1;
          transform: scale(1.05);
          transition: all 0.2s ease;
        }

        .controls {
          margin-top: 1.5rem;
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        button {
          padding: 0.5rem 1rem;
          background: var(--color-primary, #facc15);
          color: var(--color-primary-contrast, #000);
          border: none;
          border-radius: var(--radius-md, 0.375rem);
          font-family: var(--font-sans);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        button:active {
          transform: translateY(0);
        }

        button.secondary {
          background: var(--color-surface, #f5f5f4);
          color: var(--color-text-primary);
        }

        @media (max-width: 768px) {
          .cards-wrapper {
            gap: 0.5rem;
          }

          .container {
            padding: 1rem;
          }
        }
      </style>

      <div class="container" id="container">
        <div class="title">
          Number Cards
          <span class="info">${totalCards} cards</span>
        </div>
        <div class="cards-wrapper" id="cards-wrapper">
          ${this._numbers.map((num, index) => `
            <div class="card-slot" data-index="${index}">
              <number-card 
                value="${num}" 
                size="${cardSize}"
                draggable="true"
                id="card-${index}"
              ></number-card>
            </div>
          `).join('')}
        </div>
        <div class="controls">
          <button type="button" id="shuffle-btn">Shuffle</button>
          <button type="button" id="new-numbers-btn" class="secondary">New Numbers</button>
          <button type="button" id="sort-asc-btn" class="secondary">Sort �</button>
          <button type="button" id="sort-desc-btn" class="secondary">Sort �</button>
        </div>
      </div>
    `;

    this.setupControlButtons();
  }

  setupControlButtons() {
    const shuffleBtn = this.shadowRoot.getElementById('shuffle-btn');
    const newNumbersBtn = this.shadowRoot.getElementById('new-numbers-btn');
    const sortAscBtn = this.shadowRoot.getElementById('sort-asc-btn');
    const sortDescBtn = this.shadowRoot.getElementById('sort-desc-btn');

    shuffleBtn?.addEventListener('click', () => this.shuffleCards());
    newNumbersBtn?.addEventListener('click', () => this.generateNewNumbers());
    sortAscBtn?.addEventListener('click', () => this.sortCards('asc'));
    sortDescBtn?.addEventListener('click', () => this.sortCards('desc'));
  }

  setupDragAndDrop() {
    const container = this.shadowRoot.getElementById('container');
    const slots = this.shadowRoot.querySelectorAll('.card-slot');

    // Add touch support for mobile
    this.setupTouchSupport();
    
    slots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!slot.querySelector('number-card')) {
          slot.classList.add('drag-over');
        }
      });

      slot.addEventListener('dragleave', () => {
        setTimeout(() => {
          slot.classList.remove('drag-over');
        }, 50);
      });

      slot.addEventListener('drop', async (e) => {
        e.preventDefault();
        // Remove drag-over class with slight delay for visual feedback
        setTimeout(() => {
          slot.classList.remove('drag-over');
        }, 100);

        const draggedValue = e.dataTransfer.getData('text/plain');
        const draggedId = e.dataTransfer.getData('card-id');
        
        // Find the dragged card
        const draggedCard = this.shadowRoot.getElementById(draggedId);
        if (!draggedCard) return;

        // Get the current card in this slot (if any)
        const currentCard = slot.querySelector('number-card');
        
        // Find the source slot
        const sourceSlot = draggedCard.parentElement;
        
        if (sourceSlot === slot) return; // Same slot, no action needed

        // Swap cards
        if (currentCard) {
          // Move current card to source slot
          sourceSlot.appendChild(currentCard);
        } else {
          // Source slot becomes empty
          sourceSlot.classList.add('empty');
        }

        // Move dragged card to this slot
        slot.appendChild(draggedCard);
        slot.classList.remove('empty');

        // Update internal state
        await this.updateNumbersFromDOM();
      });
    });

    // Handle drag start/end for visual feedback with timeout
    let dragTimeout;
    
    container.addEventListener('dragstart', () => {
      clearTimeout(dragTimeout);
      container.classList.add('drag-active');
    });

    container.addEventListener('dragend', () => {
      // Remove feedback after a short delay
      dragTimeout = setTimeout(() => {
        container.classList.remove('drag-active');
      }, 100);
    });
  }

  async updateNumbersFromDOM() {
    const slots = this.shadowRoot.querySelectorAll('.card-slot');
    const newNumbers = [];

    slots.forEach(slot => {
      const card = slot.querySelector('number-card');
      if (card) {
        newNumbers.push(Number(card.getAttribute('value')));
      }
    });

    this._numbers = newNumbers;
    await this.saveState();

    // Dispatch custom event for parent components
    this.dispatchEvent(new CustomEvent('numbers-changed', {
      detail: { numbers: this._numbers },
      bubbles: true
    }));
  }

  async shuffleCards() {
    // Fisher-Yates shuffle
    const shuffled = [...this._numbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    this._numbers = shuffled;
    await this.saveState();
    this.render();
    this.setupDragAndDrop();
  }

  async generateNewNumbers() {
    const totalCards = Number(this.getAttribute('total-cards')) || 5;
    const minRange = Number(this.getAttribute('min-range')) || 0;
    const maxRange = Number(this.getAttribute('max-range')) || 100;
    
    const validatedTotal = Math.min(Math.max(totalCards, 2), 8);
    this._numbers = generateRandomNumbers(validatedTotal, minRange, maxRange);
    
    await this.saveState();
    this.render();
    this.setupDragAndDrop();
  }

  async sortCards(direction = 'asc') {
    const sorted = [...this._numbers].sort((a, b) => {
      return direction === 'asc' ? a - b : b - a;
    });
    
    this._numbers = sorted;
    await this.saveState();
    this.render();
    this.setupDragAndDrop();
  }

  async clearState() {
    try {
      await set(this._containerKey, null);
      console.log(`Cleared state for ${this._containerKey}`);
    } catch (error) {
      console.error('Error clearing state:', error);
    }
  }

  setupTouchSupport() {
    // Add touch event support for mobile drag and drop
    const cards = this.shadowRoot.querySelectorAll('number-card');
    
    cards.forEach(card => {
      let touchItem = null;
      let touchOffset = { x: 0, y: 0 };
      let originalSlot = null;
      
      card.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = card.getBoundingClientRect();
        
        touchOffset.x = touch.clientX - rect.left;
        touchOffset.y = touch.clientY - rect.top;
        
        // Create a clone for dragging
        touchItem = card.cloneNode(true);
        touchItem.style.position = 'fixed';
        touchItem.style.zIndex = '9999';
        touchItem.style.pointerEvents = 'none';
        touchItem.style.opacity = '0.8';
        touchItem.style.transform = 'scale(1.05) rotate(2deg)';
        touchItem.style.left = `${touch.clientX - touchOffset.x}px`;
        touchItem.style.top = `${touch.clientY - touchOffset.y}px`;
        
        document.body.appendChild(touchItem);
        
        originalSlot = card.parentElement;
        card.style.opacity = '0.3';
        
        // Add drag-active class to container
        const container = this.shadowRoot.getElementById('container');
        container.classList.add('drag-active');
        
        e.preventDefault();
      }, { passive: false });
      
      card.addEventListener('touchmove', (e) => {
        if (!touchItem) return;
        
        const touch = e.touches[0];
        touchItem.style.left = `${touch.clientX - touchOffset.x}px`;
        touchItem.style.top = `${touch.clientY - touchOffset.y}px`;
        
        // Find element under touch point
        touchItem.style.display = 'none';
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        touchItem.style.display = 'block';
        
        // Check if over a valid drop target
        const dropSlot = elementBelow?.closest('.card-slot');
        if (dropSlot && dropSlot.getRootNode() === this.shadowRoot) {
          // Clear all drag-over classes
          this.shadowRoot.querySelectorAll('.card-slot').forEach(s => {
            s.classList.remove('drag-over');
          });
          
          // Add drag-over to current slot
          if (!dropSlot.querySelector('number-card') || dropSlot !== originalSlot) {
            dropSlot.classList.add('drag-over');
          }
        }
        
        e.preventDefault();
      }, { passive: false });
      
      card.addEventListener('touchend', async (e) => {
        if (!touchItem) return;
        
        const touch = e.changedTouches[0];
        
        // Find drop target
        touchItem.style.display = 'none';
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        touchItem.style.display = 'block';
        
        const dropSlot = elementBelow?.closest('.card-slot');
        
        // Clean up
        document.body.removeChild(touchItem);
        touchItem = null;
        card.style.opacity = '1';
        
        // Remove drag-active class
        const container = this.shadowRoot.getElementById('container');
        setTimeout(() => {
          container.classList.remove('drag-active');
        }, 100);
        
        // Clear all drag-over classes
        this.shadowRoot.querySelectorAll('.card-slot').forEach(s => {
          setTimeout(() => {
            s.classList.remove('drag-over');
          }, 100);
        });
        
        // Handle drop
        if (dropSlot && dropSlot.getRootNode() === this.shadowRoot && dropSlot !== originalSlot) {
          const targetCard = dropSlot.querySelector('number-card');
          
          if (targetCard) {
            // Swap cards
            originalSlot.appendChild(targetCard);
          }
          
          dropSlot.appendChild(card);
          
          // Update state
          await this.updateNumbersFromDOM();
        }
        
        e.preventDefault();
      }, { passive: false });
    });
  }

  getNumbers() {
    return [...this._numbers];
  }

  setNumbers(numbers) {
    if (Array.isArray(numbers)) {
      this._numbers = numbers;
      this.saveState();
      this.render();
      this.setupDragAndDrop();
    }
  }
}

customElements.define('number-card-container', NumberCardContainer);