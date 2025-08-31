// Initialize theme before anything else to prevent flash
import './utils/themeManager.js';

// Import web components
import './components/ThemeToggle.js';
import './components/NumberCard.js';
import './components/NumberCardContainer.js';
import './components/CoinBag.js';
import './components/Inventory.js';
import './components/GameSettings.js';
import './components/Scoreboard.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('Number ordering game initialized');
});