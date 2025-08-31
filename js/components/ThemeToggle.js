export class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTheme = localStorage.getItem('theme') || 'dark';
  }

  connectedCallback() {
    this.render();
    this.applyTheme(this.currentTheme);
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }

        .theme-toggle {
          background: var(--toggle-bg, #1c1917);
          border: 2px solid var(--toggle-border, #44403c);
          border-radius: 50px;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .theme-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .toggle-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--icon-bg, #292524);
          transition: all 0.3s ease;
        }

        .toggle-icon.active {
          background: var(--icon-active-bg, #facc15);
          box-shadow: 0 0 10px var(--icon-glow, #facc15);
        }

        .icon {
          font-size: 20px;
        }

        .divider {
          width: 2px;
          height: 20px;
          background: var(--divider-color, #44403c);
        }
      </style>
      <div class="theme-toggle">
        <div class="toggle-icon ${this.currentTheme === 'light' ? 'active' : ''}" data-theme="light">
          <span class="icon">☀️</span>
        </div>
        <div class="divider"></div>
        <div class="toggle-icon ${this.currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
          <span class="icon">🌙</span>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const icons = this.shadowRoot.querySelectorAll('.toggle-icon');
    icons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        this.setTheme(theme);
      });
    });
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
    this.render();
    this.attachEventListeners();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

customElements.define('theme-toggle', ThemeToggle);