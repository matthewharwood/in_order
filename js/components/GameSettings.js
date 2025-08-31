export class GameSettings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 32px;
          right: 32px;
          z-index: 1000;
        }
        
        .settings-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #f5f5f4; /* stone-100 */
          border: 2px solid #d6d3d1; /* stone-300 */
          color: #44403c; /* stone-700 */
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          user-select: none;
        }
        
        .settings-button:hover {
          background-color: #e7e5e4; /* stone-200 */
          transform: rotate(90deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .settings-button:active {
          transform: rotate(90deg) scale(0.95);
        }
        
        .settings-button.open {
          transform: rotate(180deg);
          background-color: #292524; /* stone-800 */
          border-color: #1c1917; /* stone-900 */
        }
        
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          z-index: -1;
        }
        
        .overlay.open {
          opacity: 1;
          visibility: visible;
        }
        
        .side-panel {
          position: fixed;
          top: 0;
          right: -100%;
          width: 33%;
          height: 100vh;
          background-color: #ffffff;
          box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          z-index: 1001;
        }
        
        .side-panel.open {
          right: 0;
        }
        
        .panel-header {
          padding: 24px;
          background-color: #fafaf9; /* stone-50 */
          border-bottom: 1px solid #e7e5e4; /* stone-200 */
        }
        
        .panel-title {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: #1c1917; /* stone-900 */
        }
        
        .close-button {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 32px;
          height: 32px;
          border: none;
          background-color: transparent;
          color: #57534e; /* stone-600 */
          font-size: 24px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background-color: #e7e5e4; /* stone-200 */
          color: #1c1917; /* stone-900 */
        }
        
        .panel-content {
          padding: 24px;
        }
        
        .settings-section {
          margin-bottom: 32px;
        }
        
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: #44403c; /* stone-700 */
          margin-bottom: 16px;
        }
        
        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f4; /* stone-100 */
        }
        
        .setting-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          color: #57534e; /* stone-600 */
        }
        
        .setting-value {
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          color: #1c1917; /* stone-900 */
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          :host {
            top: 16px;
            right: 16px;
          }
          
          .side-panel {
            width: 80%;
          }
        }
        
        @media (max-width: 480px) {
          .side-panel {
            width: 100%;
          }
        }
      </style>
      
      <button class="settings-button" id="settingsBtn" aria-label="Game Settings">
        ⚙️
      </button>
      
      <div class="overlay" id="overlay"></div>
      
      <div class="side-panel" id="sidePanel">
        <div class="panel-header">
          <button class="close-button" id="closeBtn" aria-label="Close Settings">
            ✕
          </button>
          <h2 class="panel-title">Game Settings</h2>
        </div>
        <div class="panel-content">
          <div class="settings-section">
            <h3 class="section-title">Game Configuration</h3>
            <div class="setting-item">
              <span class="setting-label">Number Range</span>
              <span class="setting-value">0 - 100</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Card Count</span>
              <span class="setting-value">Variable</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Animation Speed</span>
              <span class="setting-value">Normal</span>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">Display Options</h3>
            <div class="setting-item">
              <span class="setting-label">Theme</span>
              <span class="setting-value">Stone</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Font Size</span>
              <span class="setting-value">Medium</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Show Statistics</span>
              <span class="setting-value">Enabled</span>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">Advanced</h3>
            <div class="setting-item">
              <span class="setting-label">Auto-refresh</span>
              <span class="setting-value">Disabled</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Debug Mode</span>
              <span class="setting-value">Off</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    const settingsBtn = this.shadowRoot.getElementById('settingsBtn');
    const closeBtn = this.shadowRoot.getElementById('closeBtn');
    const overlay = this.shadowRoot.getElementById('overlay');
    
    this.handleSettingsClick = () => this.togglePanel();
    this.handleCloseClick = () => this.closePanel();
    this.handleOverlayClick = () => this.closePanel();
    this.handleEscKey = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePanel();
      }
    };
    
    settingsBtn.addEventListener('click', this.handleSettingsClick);
    closeBtn.addEventListener('click', this.handleCloseClick);
    overlay.addEventListener('click', this.handleOverlayClick);
    document.addEventListener('keydown', this.handleEscKey);
  }

  removeEventListeners() {
    const settingsBtn = this.shadowRoot.getElementById('settingsBtn');
    const closeBtn = this.shadowRoot.getElementById('closeBtn');
    const overlay = this.shadowRoot.getElementById('overlay');
    
    if (settingsBtn) settingsBtn.removeEventListener('click', this.handleSettingsClick);
    if (closeBtn) closeBtn.removeEventListener('click', this.handleCloseClick);
    if (overlay) overlay.removeEventListener('click', this.handleOverlayClick);
    document.removeEventListener('keydown', this.handleEscKey);
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    this.isOpen = true;
    const settingsBtn = this.shadowRoot.getElementById('settingsBtn');
    const sidePanel = this.shadowRoot.getElementById('sidePanel');
    const overlay = this.shadowRoot.getElementById('overlay');
    
    settingsBtn.classList.add('open');
    sidePanel.classList.add('open');
    overlay.classList.add('open');
    
    this.dispatchEvent(new CustomEvent('settings-opened'));
  }

  closePanel() {
    this.isOpen = false;
    const settingsBtn = this.shadowRoot.getElementById('settingsBtn');
    const sidePanel = this.shadowRoot.getElementById('sidePanel');
    const overlay = this.shadowRoot.getElementById('overlay');
    
    settingsBtn.classList.remove('open');
    sidePanel.classList.remove('open');
    overlay.classList.remove('open');
    
    this.dispatchEvent(new CustomEvent('settings-closed'));
  }
}

customElements.define('game-settings', GameSettings);