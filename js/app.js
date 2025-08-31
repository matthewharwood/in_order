import { 
  generateRandomNumbers, 
  generateFiveRandomNumbers,
  fiveNumberGenerator 
} from './utils/randomNumbers.js';
import { NumberCard } from './components/NumberCard.js';
import { NumberCardContainer } from './components/NumberCardContainer.js';
import { GameSettings } from './components/GameSettings.js';
import { Inventory } from './components/Inventory.js';
import { saveGameState, loadGameState, debouncedSave } from './utils/stateManager.js';
import { initializeTheme } from './utils/themeManager.js';

export default async function init() {
  console.log('App initialized with ESM modules and state management');
  
  // Initialize theme from idb-keyval
  await initializeTheme();
  
  // Wait for custom elements to be defined
  await customElements.whenDefined('game-settings');
  await customElements.whenDefined('number-card-container');
  
  // Small delay to ensure components are fully initialized
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Clear any default containers from HTML before restoring state
  const containerWrapper = document.getElementById('container-wrapper');
  if (containerWrapper) {
    containerWrapper.innerHTML = '';
  }
  
  // Try to load saved state
  const savedState = await loadGameState();
  console.log('Loaded saved state on init:', savedState);
  
  if (savedState && savedState.settings) {
    console.log('Restoring saved game state...');
    await restoreGameState(savedState);
  } else {
    console.log('No saved state found, applying default settings...');
    // Apply default settings when no saved state exists
    const defaultSettings = {
      numberOfContainers: 1,
      containers: [
        { cards: 5, minRange: 0, maxRange: 100, winningMode: 'asc' }
      ]
    };
    await updateContainers(defaultSettings);
    // Save the default state
    await saveGameState();
  }
  
  // Setup event listeners for auto-save
  setupAutoSave();
  
  // Listen for settings changes
  document.addEventListener('settings-applied', async (e) => {
    console.log('Settings applied:', e.detail);
    await updateContainers(e.detail);
    // State is already saved in updateContainers, no need to save again
  });
  
  console.log('10 random numbers (1-50):', generateRandomNumbers(10, 1, 50));
  console.log('5 random numbers (0-100):', generateFiveRandomNumbers());
  console.log('Using higher-order function:', fiveNumberGenerator());
  console.log('Custom params with HOF:', fiveNumberGenerator(3, 10, 20));
}

async function restoreGameState(state) {
  console.log('Restoring game state:', state);
  
  // Restore settings first
  if (state.settings) {
    const settingsElement = document.querySelector('game-settings');
    if (settingsElement && settingsElement.setSettings) {
      console.log('Setting saved settings:', state.settings);
      settingsElement.setSettings(state.settings);
      
      // Update containers based on settings
      const containerWrapper = document.getElementById('container-wrapper');
      if (containerWrapper) {
        containerWrapper.innerHTML = '';
        
        // Create containers based on saved settings
        state.settings.containers.forEach((config, index) => {
          console.log(`Creating container ${index}:`, config);
          const container = document.createElement('number-card-container');
          container.setAttribute('total-cards', config.cards);
          container.setAttribute('min-range', config.minRange);
          container.setAttribute('max-range', config.maxRange);
          container.setAttribute('winning-mode', config.winningMode || 'asc');
          containerWrapper.appendChild(container);
        });
      }
    }
  }
  
  // Wait for containers to be fully rendered and connected
  await new Promise(resolve => requestAnimationFrame(() => {
    setTimeout(resolve, 200);
  }));
  
  // Restore container states (including card positions and original numbers)
  if (state.containers && state.containers.length > 0) {
    const containers = document.querySelectorAll('number-card-container');
    console.log('Restoring container states:', state.containers);
    state.containers.forEach((containerState, index) => {
      if (containers[index] && containers[index].setState) {
        console.log(`Restoring container ${index} state:`, containerState);
        containers[index].setState(containerState);
      }
    });
  }
}


async function updateContainers(settings) {
  // Find container wrapper
  const containerWrapper = document.getElementById('container-wrapper');
  if (!containerWrapper) {
    console.error('Container wrapper not found');
    return;
  }
  
  // Clear existing containers
  containerWrapper.innerHTML = '';
  
  // Create new containers based on settings
  settings.containers.forEach((config, index) => {
    const container = document.createElement('number-card-container');
    container.setAttribute('total-cards', config.cards);
    container.setAttribute('min-range', config.minRange);
    container.setAttribute('max-range', config.maxRange);
    container.setAttribute('winning-mode', config.winningMode || 'asc');
    
    containerWrapper.appendChild(container);
    
    // Generate and set numbers (limit to 8)
    const numbers = generateRandomNumbers(Math.min(config.cards, 8), config.minRange, config.maxRange);
    container.setNumbers(numbers);
  });
  
  // Wait for containers to initialize then save state
  await new Promise(resolve => setTimeout(resolve, 200));
  await saveGameState();
}

function setupAutoSave() {
  // Save state when cards are reordered
  document.addEventListener('drop', (e) => {
    // Use debounced save to avoid saving too frequently
    debouncedSave();
  });
  
  // Save state when cards reach winning state
  document.addEventListener('cards-ordered', (e) => {
    console.log('Cards ordered, saving state...');
    debouncedSave();
  });
  
  // Save state periodically (every 30 seconds) as backup
  setInterval(() => {
    saveGameState();
  }, 30000);
  
  // Save state before page unload
  window.addEventListener('beforeunload', () => {
    // Try to save synchronously (though IndexedDB is async, we try our best)
    saveGameState();
  });
}

// Ensure state is saved synchronously on page unload
window.addEventListener('pagehide', () => {
  saveGameState();
});

// Also save on visibility change (mobile browsers)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveGameState();
  }
});

// Use a more robust initialization approach
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already loaded
  init();
}