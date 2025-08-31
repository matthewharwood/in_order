import { CoinBag } from './CoinBag.js';

export class Inventory extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Listen for coin changes from CoinBag
    document.addEventListener('coins-changed', (e) => {
      console.log('Inventory received coins-changed event:', e.detail);
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 150px;
          z-index: 100;
        }
        
        .inventory-container {
          width: 100%;
          height: 100%;
          background: var(--color-surface, #f5f5f4);
          border-radius: var(--radius-xl, 0.75rem);
          padding: var(--space-5, 1.25rem);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.3),
            0 5px 15px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        /* Light theme border */
        [data-theme="light"] .inventory-container {
          border: 3px solid #000000;
          background: linear-gradient(135deg, 
            var(--color-surface, #f5f5f4) 0%, 
            var(--color-surface-variant, #e7e5e4) 100%);
        }
        
        /* Dark theme border */
        [data-theme="dark"] .inventory-container {
          border: 3px solid #ffffff;
          background: linear-gradient(135deg, 
            var(--color-surface, #1c1917) 0%, 
            var(--color-surface-variant, #292524) 100%);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.5),
            0 5px 15px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(250, 204, 21, 0.1);
        }
        
        .coins-section {
          display: flex;
          align-items: center;
          gap: var(--space-4, 1rem);
        }
        
        .coin-label {
          font-family: var(--font-accent, 'Pirata One', cursive);
          font-size: var(--text-lg, 1.25rem);
          color: var(--color-text-secondary);
          margin-left: var(--space-2, 0.5rem);
        }
        
        /* Decorative elements */
        .inventory-container::before,
        .inventory-container::after {
          content: '⚔️';
          position: absolute;
          font-size: 24px;
          opacity: 0.3;
        }
        
        .inventory-container::before {
          top: var(--space-3, 0.75rem);
          left: var(--space-3, 0.75rem);
          transform: rotate(-15deg);
        }
        
        .inventory-container::after {
          content: '🛡️';
          bottom: var(--space-3, 0.75rem);
          right: var(--space-3, 0.75rem);
          transform: rotate(15deg);
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          :host {
            width: calc(100% - 32px);
            max-width: 600px;
          }
        }
        
        @media (max-width: 480px) {
          .inventory-container {
            padding: var(--space-4, 1rem);
          }
          
          .coin-count {
            font-size: var(--text-2xl, 1.953rem);
          }
          
          .coin-icon {
            width: 36px;
            height: 36px;
            font-size: 18px;
          }
        }
      </style>
      
      <div class="inventory-container">
        <div class="coins-section">
          <coin-bag></coin-bag>
          <span class="coin-label">Coins</span>
        </div>
      </div>
    `;
  }

  // Delegate coin methods to CoinBag
  getCoinBag() {
    return this.shadowRoot.querySelector('coin-bag');
  }
  
  async setCoins(amount) {
    const coinBag = this.getCoinBag();
    if (coinBag && coinBag.setCoins) {
      await coinBag.setCoins(amount);
    }
  }

  async addCoins(amount) {
    const coinBag = this.getCoinBag();
    if (coinBag && coinBag.addCoins) {
      await coinBag.addCoins(amount);
    }
  }

  getCoins() {
    const coinBag = this.getCoinBag();
    return coinBag ? coinBag.getCoins() : 0;
  }
}

customElements.define('game-inventory', Inventory);