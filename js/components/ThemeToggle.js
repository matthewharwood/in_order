import { get, set } from '../utils/storage.js';

class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this.render();
    await this.initTheme();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1000;
        }

        button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid var(--color-border-strong, #57534e);
          background: var(--color-surface, #1c1917);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          padding: 0;
        }

        button:hover {
          transform: scale(1.1);
          border-color: var(--color-primary, #facc15);
        }

        button:active {
          transform: scale(0.95);
        }

        .icon {
          width: 24px;
          height: 24px;
          transition: all 0.3s ease;
        }

        .sun {
          display: none;
        }

        .moon {
          display: block;
        }

        :host([theme="light"]) .sun {
          display: block;
        }

        :host([theme="light"]) .moon {
          display: none;
        }

        @media (max-width: 768px) {
          :host {
            top: 0.5rem;
            right: 0.5rem;
          }

          button {
            width: 40px;
            height: 40px;
          }

          .icon {
            width: 20px;
            height: 20px;
          }
        }
      </style>

      <button type="button" aria-label="Toggle theme" title="Toggle theme">
        <svg class="icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg class="icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    `;
  }

  async initTheme() {
    try {
      // Try to get theme from idb
      const savedTheme = await get('theme');
      
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // Fallback to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        this.setTheme(defaultTheme);
        await set('theme', defaultTheme);
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      // Fallback to dark theme
      this.setTheme('dark');
    }
  }

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => this.toggleTheme());

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
      // Only update if no saved preference
      const savedTheme = await get('theme');
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
      }
    });
  }

  async toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    this.setTheme(newTheme);
    
    try {
      await set('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.setAttribute('theme', theme);
  }
}

customElements.define('theme-toggle', ThemeToggle);