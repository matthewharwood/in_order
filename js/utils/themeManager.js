// Theme manager using idb-keyval for persistent storage

export async function getTheme() {
  try {
    const theme = await window.idbKeyval.get('theme');
    return theme || 'dark'; // Default to dark theme
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'dark';
  }
}

export async function setTheme(theme) {
  try {
    await window.idbKeyval.set('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    return true;
  } catch (error) {
    console.error('Error setting theme:', error);
    return false;
  }
}

export async function initializeTheme() {
  const theme = await getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}