// Use the global idbKeyval from the UMD script loaded in HTML
const { get, set } = window.idbKeyval;

export class CoinBag extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.coins = 0;
    this.isInitialized = false;
  }

  async connectedCallback() {
    // Load coins from storage
    await this.loadCoins();
    this.render();
    this.isInitialized = true;
    
    // Listen for coin events
    this.setupEventListeners();
  }

  async loadCoins() {
    try {
      const savedCoins = await get('gameCoins');
      if (savedCoins !== undefined && savedCoins !== null) {
        this.coins = parseInt(savedCoins) || 0;
        console.log('Loaded coins from storage:', this.coins);
      } else {
        this.coins = 0;
        await this.saveCoins();
        console.log('Initialized coins to 0');
      }
    } catch (error) {
      console.error('Error loading coins:', error);
      this.coins = 0;
    }
  }

  async saveCoins() {
    try {
      await set('gameCoins', this.coins);
      console.log('Saved coins to storage:', this.coins);
    } catch (error) {
      console.error('Error saving coins:', error);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .coin-display {
          display: flex;
          align-items: center;
          gap: var(--space-3, 0.75rem);
        }
        
        .coin-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.5);
          position: relative;
          animation: coin-spin 3s linear infinite;
        }
        
        @keyframes coin-spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        @keyframes coin-earned {
          0% {
            transform: scale(1) rotateY(0deg);
          }
          25% {
            transform: scale(1.5) rotateY(90deg);
          }
          50% {
            transform: scale(1.3) rotateY(180deg);
          }
          75% {
            transform: scale(1.1) rotateY(270deg);
          }
          100% {
            transform: scale(1) rotateY(360deg);
          }
        }
        
        .coin-icon.earning {
          animation: coin-earned 0.6s ease-out;
        }
        
        .coin-icon::after {
          content: '₹';
          color: #8B4513;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .coin-count {
          font-family: var(--font-gothic, 'Grenze Gotisch', cursive);
          font-size: var(--text-3xl, 2.441rem);
          font-weight: 700;
          color: var(--color-text-primary);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        
        .coin-count.adding {
          transform: scale(1.2);
          color: var(--color-primary, #facc15);
        }
        
        /* Dark theme specific */
        [data-theme="dark"] .coin-count {
          color: var(--color-primary, #facc15);
          text-shadow: 
            0 0 20px rgba(250, 204, 21, 0.5),
            2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        /* Floating coin animation */
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          20% {
            transform: translateY(-20px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) scale(0.5);
            opacity: 0;
          }
        }
        
        .coin-popup {
          position: absolute;
          top: -20px;
          right: -20px;
          font-family: var(--font-mono, 'Cinzel', serif);
          font-size: var(--text-xl, 1.563rem);
          font-weight: bold;
          color: #FFD700;
          text-shadow: 
            2px 2px 4px rgba(0, 0, 0, 0.5),
            0 0 10px rgba(255, 215, 0, 0.8);
          pointer-events: none;
          animation: float-up 1.5s ease-out;
        }
      </style>
      
      <div class="coin-display">
        <div class="coin-icon" id="coinIcon"></div>
        <div class="coin-count" id="coinCount">${this.coins}</div>
      </div>
    `;
  }

  setupEventListeners() {
    // Listen for cards-ordered event (winning a container)
    document.addEventListener('cards-ordered', async (e) => {
      if (e.detail && e.detail.isWinner) {
        console.log('Container won! Adding 10 coins');
        await this.addCoins(10);
        this.showCoinEarned(10);
      }
    });
  }

  async addCoins(amount) {
    this.coins += amount;
    await this.saveCoins();
    this.updateDisplay();
    
    // Dispatch event for other components
    this.dispatchEvent(new CustomEvent('coins-changed', {
      detail: { coins: this.coins, added: amount },
      bubbles: true,
      composed: true
    }));
  }

  async setCoins(amount) {
    this.coins = amount;
    await this.saveCoins();
    this.updateDisplay();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('coins-changed', {
      detail: { coins: this.coins },
      bubbles: true,
      composed: true
    }));
  }

  updateDisplay() {
    const countElement = this.shadowRoot.getElementById('coinCount');
    const iconElement = this.shadowRoot.getElementById('coinIcon');
    
    if (countElement) {
      countElement.textContent = this.coins;
      countElement.classList.add('adding');
      setTimeout(() => countElement.classList.remove('adding'), 300);
    }
    
    if (iconElement) {
      iconElement.classList.add('earning');
      setTimeout(() => iconElement.classList.remove('earning'), 600);
    }
  }

  showCoinEarned(amount) {
    const coinIcon = this.shadowRoot.getElementById('coinIcon');
    if (!coinIcon) return;
    
    // Create floating +10 text
    const popup = document.createElement('div');
    popup.className = 'coin-popup';
    popup.textContent = `+${amount}`;
    coinIcon.appendChild(popup);
    
    // Remove after animation
    setTimeout(() => popup.remove(), 1500);
  }

  getCoins() {
    return this.coins;
  }

  async resetCoins() {
    this.coins = 0;
    await this.saveCoins();
    this.updateDisplay();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('coins-changed', {
      detail: { coins: this.coins, reset: true },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('coin-bag', CoinBag);