export class NumberCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .number-card {
          width: 50px;
          height: 30px;
          background-color: #f5f5f4; /* stone-100 */
          color: #44403c; /* stone-700 */
          border: 1px solid #d6d3d1; /* stone-300 */
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        
        .number-card:hover {
          background-color: #e7e5e4; /* stone-200 */
          color: #292524; /* stone-800 */
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .number-card:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      </style>
      <div class="number-card">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('number-card', NumberCard);