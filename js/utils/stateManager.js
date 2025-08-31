const GAME_STATE_KEY = 'orderGameState';

export const saveGameState = async () => {
  try {
    const state = {
      settings: getSettingsState(),
      containers: getContainersState(),
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    await window.idbKeyval.set(GAME_STATE_KEY, state);
    console.log('Game state saved:', state);
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
};

export const loadGameState = async () => {
  try {
    const state = await window.idbKeyval.get(GAME_STATE_KEY);
    console.log('Loaded game state from IndexedDB:', state);
    
    // Validate the loaded state
    if (state && typeof state === 'object') {
      // Check if state has required properties
      if (!state.settings || !state.containers) {
        console.warn('Loaded state is missing required properties');
        return null;
      }
      return state;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

export const clearGameState = async () => {
  try {
    await window.idbKeyval.del(GAME_STATE_KEY);
    console.log('Game state cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear game state:', error);
    return false;
  }
};

const getSettingsState = () => {
  const settingsElement = document.querySelector('game-settings');
  if (settingsElement && settingsElement.getSettings) {
    const settings = settingsElement.getSettings();
    console.log('Getting settings state:', settings);
    return settings;
  }
  console.warn('GameSettings element not found or getSettings not available');
  // Return default settings if element not found
  return {
    numberOfContainers: 1,
    containers: [
      { cards: 5, minRange: 0, maxRange: 100, winningMode: 'asc' }
    ]
  };
};

const getContainersState = () => {
  const containers = document.querySelectorAll('number-card-container');
  const states = Array.from(containers).map(container => {
    if (container.getState) {
      const state = container.getState();
      console.log('Getting container state:', state);
      return state;
    }
    return null;
  }).filter(Boolean);
  console.log('All container states:', states);
  return states;
};

// Auto-save debounce helper
let saveTimeout;
export const debouncedSave = () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveGameState();
  }, 500); // Save after 500ms of inactivity
};