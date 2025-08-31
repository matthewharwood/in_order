import { generateRandomNumbers } from '../utils/randomNumbers.js';

export class NumberCardContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._numbers = [];
  }

  static get observedAttributes() {
    return ['total-cards'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'total-cards' && oldValue !== newValue) {
      this.render();
    }
  }

  generateNumbers() {
    const totalCards = parseInt(this.getAttribute('total-cards')) || 5;
    this._numbers = generateRandomNumbers(totalCards, 0, 100);
  }

  render() {
    this.generateNumbers();
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: var(--space-4, 1rem);
        }
        
        .container {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2, 0.5rem);
          padding: var(--space-4, 1rem);
          background-color: var(--stone-50, #fafaf9);
          border: 1px solid var(--stone-200, #e7e5e4);
          border-radius: var(--radius-lg, 0.5rem);
        }
        
        .title {
          width: 100%;
          margin: 0 0 var(--space-3, 0.75rem) 0;
          font-family: var(--font-sans, 'Space Grotesk', sans-serif);
          font-size: var(--text-lg, 1.25rem);
          font-weight: var(--font-semibold, 600);
          color: var(--stone-800, #292524);
        }
        
        .stats {
          width: 100%;
          margin-top: var(--space-3, 0.75rem);
          padding-top: var(--space-3, 0.75rem);
          border-top: 1px solid var(--stone-200, #e7e5e4);
          font-family: var(--font-mono, 'Space Mono', monospace);
          font-size: var(--text-sm, 0.8rem);
          color: var(--stone-600, #57534e);
        }
      </style>
      <div class="container">
        <h3 class="title">Random Number Cards</h3>
        ${this._numbers.map(num => `<number-card>${num}</number-card>`).join('')}
        <div class="stats">
          Total: ${this._numbers.length} cards | 
          Range: 0-100 | 
          Min: ${Math.min(...this._numbers)} | 
          Max: ${Math.max(...this._numbers)}
        </div>
      </div>
    `;
  }

  setNumbers(numbers) {
    this._numbers = numbers;
    this.render();
  }
}

customElements.define('number-card-container', NumberCardContainer);