// iPad-specific fixes for state restoration

export function isIPad() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function getIPadDelay(normalDelay) {
  return isIPad() ? normalDelay * 2 : normalDelay;
}

export async function waitForShadowDOM(element, timeout = 1000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (element.shadowRoot && element.shadowRoot.getElementById('cardsArea')) {
      // Found the shadow DOM content
      await new Promise(resolve => requestAnimationFrame(resolve));
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.warn('Timeout waiting for shadow DOM');
  return false;
}