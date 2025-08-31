import { clearGameState, saveGameState } from '../utils/stateManager.js';
import { getTheme, setTheme } from '../utils/themeManager.js';

export class GameSettings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.settings = {
      numberOfContainers: 1,
      containers: [
        { cards: 5, minRange: 0, maxRange: 100, winningMode: 'asc' }
      ]
    };
  }

  async connectedCallback() {
    this.render();
    this.addEventListeners();
    // Initialize theme buttons after render
    await this.updateThemeButtons();
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
          background: linear-gradient(135deg, var(--color-secondary, #ef4444) 0%, var(--color-secondary-dark, #dc2626) 100%);
          border: 2px solid var(--color-secondary-dark, #dc2626);
          color: var(--color-text-inverse, #ffffff);
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          user-select: none;
        }
        
        .settings-button:hover {
          background: linear-gradient(135deg, var(--color-secondary-light, #f87171) 0%, var(--color-secondary, #ef4444) 100%);
          transform: rotate(90deg);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 20px var(--color-secondary, #ef4444);
        }
        
        .settings-button:active {
          transform: rotate(90deg) scale(0.95);
        }
        
        .settings-button.open {
          transform: rotate(180deg);
          background: linear-gradient(135deg, var(--color-accent, #8b5cf6) 0%, var(--color-accent-dark, #7c3aed) 100%);
          border-color: var(--color-accent-dark, #7c3aed);
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
          background-color: var(--color-background, #ffffff);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          z-index: 1001;
        }
        
        .side-panel.open {
          right: 0;
        }
        
        .panel-header {
          padding: 24px;
          background: linear-gradient(135deg, var(--color-surface, #fafaf9) 0%, var(--color-surface-variant, #f5f5f4) 100%);
          border-bottom: 2px solid var(--color-border, #e7e5e4);
        }
        
        .panel-title {
          margin: 0;
          font-family: var(--font-display, 'UnifrakturMaguntia', cursive);
          font-size: 28px;
          font-weight: 600;
          color: var(--color-text-primary, #1c1917);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .close-button {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 32px;
          height: 32px;
          border: none;
          background-color: transparent;
          color: var(--color-text-secondary, #57534e);
          font-size: 24px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background-color: var(--color-secondary, #ef4444);
          color: var(--color-text-inverse, #ffffff);
          transform: scale(1.1);
        }
        
        .panel-content {
          padding: 24px;
          padding-bottom: 300px;
        }
        
        .settings-section {
          margin-bottom: 32px;
        }
        
        .section-title {
          font-family: var(--font-accent, 'Pirata One', cursive);
          font-size: 20px;
          font-weight: 500;
          color: var(--color-text-primary, #44403c);
          margin-bottom: 16px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        /* Custom Input Styles */
        .input-group {
          margin-bottom: 16px;
        }
        
        .input-label {
          display: block;
          font-family: var(--font-sans, 'MedievalSharp', cursive);
          font-size: 14px;
          color: var(--color-text-secondary, #57534e);
          margin-bottom: 8px;
        }
        
        .custom-input {
          width: 100%;
          padding: 10px 12px;
          font-family: var(--font-mono, 'Cinzel', serif);
          font-size: 14px;
          background-color: var(--color-surface, #fafaf9);
          border: 2px solid var(--color-border, #d6d3d1);
          border-radius: 6px;
          color: var(--color-text-primary, #1c1917);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .custom-input:focus {
          outline: none;
          border-color: var(--color-primary, #facc15);
          background-color: var(--color-surface-variant, #f5f5f4);
          box-shadow: 0 0 10px var(--color-primary, #facc15);
        }
        
        .custom-input:hover {
          border-color: var(--color-border-strong, #a8a29e);
        }
        
        .custom-select {
          width: 100%;
          padding: 10px 12px;
          font-family: var(--font-mono, 'Cinzel', serif);
          font-size: 14px;
          background-color: var(--color-surface, #fafaf9);
          border: 2px solid var(--color-border, #d6d3d1);
          border-radius: 6px;
          color: #1c1917; /* stone-900 */
          cursor: pointer;
          transition: all 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2357534e' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        
        .custom-select:focus {
          outline: none;
          border-color: #78716c; /* stone-500 */
          background-color: #ffffff;
        }
        
        .container-config {
          background-color: #fafaf9; /* stone-50 */
          border: 1px solid #e7e5e4; /* stone-200 */
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .container-header {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #44403c; /* stone-700 */
          margin-bottom: 12px;
        }
        
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .input-group-small {
          margin-bottom: 0;
        }
        
        .input-label-small {
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .apply-button {
          width: calc(33% - 48px);
          padding: 12px 24px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 600;
          background-color: #44403c; /* stone-700 */
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: fixed;
          bottom: 24px;
          right: 24px;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1002;
        }
        
        .apply-button:hover {
          background-color: #292524; /* stone-800 */
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .apply-button:active {
          transform: translateY(0);
        }
        
        .reset-button {
          width: 100%;
          padding: 10px 20px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 500;
          background-color: transparent;
          color: #57534e; /* stone-600 */
          border: 2px solid #d6d3d1; /* stone-300 */
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
        }
        
        .reset-button:hover {
          border-color: #a8a29e; /* stone-400 */
          color: #44403c; /* stone-700 */
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
          
          .apply-button {
            width: calc(80% - 48px);
          }
          
          .input-row {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .side-panel {
            width: 100%;
          }
          
          .apply-button {
            width: calc(100% - 48px);
          }
        }
        
        /* Theme Toggle Styles */
        .theme-toggle-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: linear-gradient(135deg, 
            var(--color-surface-variant, #f5f5f4) 0%, 
            var(--color-surface, #fafaf9) 100%);
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .theme-label {
          font-family: var(--font-accent, 'Pirata One', cursive);
          font-size: 18px;
          color: var(--color-text-primary, #1c1917);
        }
        
        .theme-toggle-container {
          display: flex;
          background: var(--color-border, #d6d3d1);
          border-radius: 50px;
          padding: 4px;
          gap: 4px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .theme-option {
          width: 50px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.3s ease;
        }
        
        .theme-option:hover {
          transform: scale(1.1);
        }
        
        .theme-option.active {
          background: linear-gradient(135deg, 
            var(--color-primary, #facc15) 0%, 
            var(--color-primary-dark, #eab308) 100%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 12px var(--color-primary, #facc15);
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
            <h3 class="section-title">Theme</h3>
            <div class="theme-toggle-section">
              <span class="theme-label">Color Mode</span>
              <div class="theme-toggle-container">
                <button class="theme-option" id="theme-light" data-theme="light" aria-label="Light Mode">
                  ☀️
                </button>
                <button class="theme-option" id="theme-dark" data-theme="dark" aria-label="Dark Mode">
                  🌙
                </button>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">Container Configuration</h3>
            
            <div class="input-group">
              <label class="input-label" for="numContainers">Number of Containers</label>
              <select class="custom-select" id="numContainers">
                <option value="1" selected>1 Container</option>
                <option value="2">2 Containers</option>
                <option value="3">3 Containers</option>
                <option value="4">4 Containers</option>
                <option value="5">5 Containers</option>
              </select>
            </div>
            
            <div id="containerConfigs">
              <!-- Container configurations will be dynamically generated here -->
            </div>
          </div>
          
          <div class="settings-section">
            <button class="reset-button" id="resetBtn">Reset to Defaults</button>
            <button class="reset-button" id="clearStorageBtn" style="background-color: var(--color-secondary, #ef4444); color: white; border-color: var(--color-secondary-dark, #dc2626); margin-top: 12px;">🗑️ Clear Saved Data</button>
          </div>
        </div>
        <button class="apply-button" id="applyBtn">Apply Settings</button>
      </div>
    `;
    
    this.updateContainerConfigs();
    this.updateThemeButtons();
  }
  
  async updateThemeButtons() {
    const currentTheme = await getTheme();
    const lightBtn = this.shadowRoot.getElementById('theme-light');
    const darkBtn = this.shadowRoot.getElementById('theme-dark');
    
    if (lightBtn && darkBtn) {
      lightBtn.classList.toggle('active', currentTheme === 'light');
      darkBtn.classList.toggle('active', currentTheme === 'dark');
    }
  }

  updateContainerConfigs() {
    const containerConfigsDiv = this.shadowRoot.getElementById('containerConfigs');
    if (!containerConfigsDiv) return;
    
    containerConfigsDiv.innerHTML = '';
    
    for (let i = 0; i < this.settings.numberOfContainers; i++) {
      const config = this.settings.containers[i] || { cards: 5, minRange: 0, maxRange: 100, winningMode: 'asc' };
      
      const containerDiv = document.createElement('div');
      containerDiv.className = 'container-config';
      containerDiv.innerHTML = `
        <div class="container-header">Container ${i + 1}</div>
        <div class="input-row">
          <div class="input-group-small">
            <label class="input-label input-label-small" for="cards-${i}">Cards (max 8)</label>
            <input type="number" class="custom-input" id="cards-${i}" 
                   value="${config.cards}" min="1" max="8" data-container="${i}" data-field="cards">
          </div>
          <div class="input-group-small">
            <label class="input-label input-label-small" for="min-${i}">Min Range</label>
            <input type="number" class="custom-input" id="min-${i}" 
                   value="${config.minRange}" min="0" max="999" data-container="${i}" data-field="minRange">
          </div>
          <div class="input-group-small">
            <label class="input-label input-label-small" for="max-${i}">Max Range</label>
            <input type="number" class="custom-input" id="max-${i}" 
                   value="${config.maxRange}" min="1" max="1000" data-container="${i}" data-field="maxRange">
          </div>
        </div>
        <div class="input-row" style="margin-top: 8px;">
          <div class="input-group-small" style="grid-column: span 3;">
            <label class="input-label input-label-small" for="mode-${i}">Winning Mode</label>
            <select class="custom-select" id="mode-${i}" 
                    data-container="${i}" data-field="winningMode" style="width: 100%;">
              <option value="asc" ${config.winningMode === 'asc' ? 'selected' : ''}>↑ Ascending (Low to High)</option>
              <option value="desc" ${config.winningMode === 'desc' ? 'selected' : ''}>↓ Descending (High to Low)</option>
            </select>
          </div>
        </div>
      `;
      
      containerConfigsDiv.appendChild(containerDiv);
    }
    
    // Add input listeners
    const inputs = containerConfigsDiv.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const containerIndex = parseInt(e.target.dataset.container);
        const field = e.target.dataset.field;
        const value = field === 'winningMode' ? e.target.value : parseInt(e.target.value);
        
        if (!this.settings.containers[containerIndex]) {
          this.settings.containers[containerIndex] = { cards: 5, minRange: 0, maxRange: 100, winningMode: 'asc' };
        }
        
        this.settings.containers[containerIndex][field] = value;
        // Save state when container settings change
        saveGameState();
      });
    });
  }

  addEventListeners() {
    const settingsBtn = this.shadowRoot.getElementById('settingsBtn');
    const closeBtn = this.shadowRoot.getElementById('closeBtn');
    const overlay = this.shadowRoot.getElementById('overlay');
    const numContainers = this.shadowRoot.getElementById('numContainers');
    const applyBtn = this.shadowRoot.getElementById('applyBtn');
    const resetBtn = this.shadowRoot.getElementById('resetBtn');
    const clearStorageBtn = this.shadowRoot.getElementById('clearStorageBtn');
    const lightBtn = this.shadowRoot.getElementById('theme-light');
    const darkBtn = this.shadowRoot.getElementById('theme-dark');
    
    this.handleSettingsClick = () => this.togglePanel();
    this.handleCloseClick = () => this.closePanel();
    this.handleOverlayClick = () => this.closePanel();
    this.handleEscKey = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePanel();
      }
    };
    this.handleNumContainersChange = async (e) => {
      this.settings.numberOfContainers = parseInt(e.target.value);
      this.updateContainerConfigs();
      // Save settings when number of containers changes
      await saveGameState();
    };
    this.handleApply = () => this.applySettings();
    this.handleReset = () => this.resetSettings();
    this.handleClearStorage = async () => {
      if (confirm('This will clear all saved game data and refresh the page. Are you sure?')) {
        await clearGameState();
        window.location.reload();
      }
    };
    this.handleThemeChange = async (theme) => {
      await setTheme(theme);
      await this.updateThemeButtons();
    };
    
    settingsBtn.addEventListener('click', this.handleSettingsClick);
    closeBtn.addEventListener('click', this.handleCloseClick);
    overlay.addEventListener('click', this.handleOverlayClick);
    numContainers.addEventListener('change', this.handleNumContainersChange);
    applyBtn.addEventListener('click', this.handleApply);
    resetBtn.addEventListener('click', this.handleReset);
    if (clearStorageBtn) clearStorageBtn.addEventListener('click', this.handleClearStorage);
    document.addEventListener('keydown', this.handleEscKey);
    
    if (lightBtn) lightBtn.addEventListener('click', async () => await this.handleThemeChange('light'));
    if (darkBtn) darkBtn.addEventListener('click', async () => await this.handleThemeChange('dark'));
  }

  removeEventListeners() {
    const settingsBtn = this.shadowRoot.getElementById('settingsBtn');
    const closeBtn = this.shadowRoot.getElementById('closeBtn');
    const overlay = this.shadowRoot.getElementById('overlay');
    const numContainers = this.shadowRoot.getElementById('numContainers');
    const applyBtn = this.shadowRoot.getElementById('applyBtn');
    const resetBtn = this.shadowRoot.getElementById('resetBtn');
    const clearStorageBtn = this.shadowRoot.getElementById('clearStorageBtn');
    
    if (settingsBtn) settingsBtn.removeEventListener('click', this.handleSettingsClick);
    if (closeBtn) closeBtn.removeEventListener('click', this.handleCloseClick);
    if (overlay) overlay.removeEventListener('click', this.handleOverlayClick);
    if (numContainers) numContainers.removeEventListener('change', this.handleNumContainersChange);
    if (applyBtn) applyBtn.removeEventListener('click', this.handleApply);
    if (resetBtn) resetBtn.removeEventListener('click', this.handleReset);
    if (clearStorageBtn) clearStorageBtn.removeEventListener('click', this.handleClearStorage);
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

  async applySettings() {
    // Dispatch custom event with settings
    this.dispatchEvent(new CustomEvent('settings-applied', {
      detail: {
        numberOfContainers: this.settings.numberOfContainers,
        containers: this.settings.containers.slice(0, this.settings.numberOfContainers)
      },
      bubbles: true,
      composed: true
    }));
    
    // Save state immediately after applying settings
    await saveGameState();
    
    this.closePanel();
  }

  async resetSettings() {
    this.settings = {
      numberOfContainers: 1,
      containers: [
        { cards: 5, minRange: 0, maxRange: 100, winningMode: 'asc' }
      ]
    };
    
    // Update the select
    const numContainers = this.shadowRoot.getElementById('numContainers');
    if (numContainers) {
      numContainers.value = '1';
    }
    
    this.updateContainerConfigs();
    
    // Save state immediately after resetting
    await saveGameState();
  }

  getSettings() {
    return {
      numberOfContainers: this.settings.numberOfContainers,
      containers: this.settings.containers.slice(0, this.settings.numberOfContainers)
    };
  }

  setSettings(settings) {
    if (!settings) return;
    
    this.settings = {
      numberOfContainers: settings.numberOfContainers || 1,
      containers: settings.containers || [
        { cards: 5, minRange: 0, maxRange: 100, winningMode: 'asc' }
      ]
    };
    
    // Update the select
    const numContainers = this.shadowRoot.getElementById('numContainers');
    if (numContainers) {
      numContainers.value = String(this.settings.numberOfContainers);
    }
    
    this.updateContainerConfigs();
  }
}

customElements.define('game-settings', GameSettings);