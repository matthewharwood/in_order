import { get } from './storage.js';

export async function initializeTheme() {
  try {
    // Get saved theme from idb
    const savedTheme = await get('theme');
    
    if (savedTheme) {
      // Apply saved theme
      document.documentElement.setAttribute('data-theme', savedTheme);
      return savedTheme;
    }
    
    // No saved theme, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = prefersDark ? 'dark' : 'light';
    
    // Apply default theme
    document.documentElement.setAttribute('data-theme', defaultTheme);
    
    return defaultTheme;
  } catch (error) {
    console.error('Error initializing theme:', error);
    // Fallback to dark theme
    document.documentElement.setAttribute('data-theme', 'dark');
    return 'dark';
  }
}

// Initialize theme immediately to prevent flash
initializeTheme();