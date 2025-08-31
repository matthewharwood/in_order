// Audio Manager for handling audio playback, especially on iOS/iPad
class AudioManager {
  constructor() {
    this.isUnlocked = false;
    this.winnerAudio = null;
    this.audioContext = null;
    this.audioBuffer = null;
    this.unlockPromise = null;
    
    // Try to create AudioContext (with webkit prefix for Safari)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioContext = new AudioContext();
    }
    
    // Setup unlock listener
    this.setupUnlock();
    
    // Pre-load the winner sound
    this.preloadWinnerSound();
  }
  
  setupUnlock() {
    // Create a promise that resolves when audio is unlocked
    this.unlockPromise = new Promise((resolve) => {
      const unlock = async () => {
        if (this.isUnlocked) return;
        
        console.log('Attempting to unlock audio...');
        
        try {
          // Method 1: Create and play silent HTML Audio
          if (!this.winnerAudio) {
            this.winnerAudio = new Audio('img/winner.mp3');
            this.winnerAudio.volume = 0.25;
          }
          
          // Play silent sound to unlock
          const silentAudio = new Audio();
          silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAAA=';
          silentAudio.volume = 0;
          
          try {
            await silentAudio.play();
            silentAudio.pause();
            console.log('✅ HTML Audio unlocked');
          } catch (e) {
            console.log('HTML Audio unlock failed:', e);
          }
          
          // Method 2: Resume AudioContext if suspended
          if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('✅ AudioContext resumed');
          }
          
          // Method 3: Pre-play the actual winner audio at volume 0
          if (this.winnerAudio) {
            const originalVolume = this.winnerAudio.volume;
            this.winnerAudio.volume = 0;
            this.winnerAudio.currentTime = 0;
            
            try {
              await this.winnerAudio.play();
              this.winnerAudio.pause();
              this.winnerAudio.currentTime = 0;
              this.winnerAudio.volume = originalVolume;
              console.log('✅ Winner audio pre-loaded and unlocked');
            } catch (e) {
              console.log('Winner audio preload failed:', e);
              this.winnerAudio.volume = originalVolume;
            }
          }
          
          this.isUnlocked = true;
          console.log('✅ Audio system unlocked successfully');
          
          // Remove listeners after unlocking
          document.removeEventListener('touchstart', unlock);
          document.removeEventListener('touchend', unlock);
          document.removeEventListener('click', unlock);
          document.removeEventListener('mousedown', unlock);
          
          resolve();
        } catch (error) {
          console.error('Audio unlock error:', error);
        }
      };
      
      // Add multiple event listeners to catch first user interaction
      document.addEventListener('touchstart', unlock, { once: true, passive: true });
      document.addEventListener('touchend', unlock, { once: true, passive: true });
      document.addEventListener('click', unlock, { once: true });
      document.addEventListener('mousedown', unlock, { once: true });
    });
  }
  
  async preloadWinnerSound() {
    try {
      // Create audio element
      if (!this.winnerAudio) {
        this.winnerAudio = new Audio('img/winner.mp3');
        this.winnerAudio.volume = 0.25;
        this.winnerAudio.preload = 'auto';
        
        // Force load on iOS
        this.winnerAudio.load();
        
        console.log('Winner audio element created and loading...');
      }
      
      // Also load as AudioBuffer for Web Audio API fallback
      if (this.audioContext) {
        try {
          const response = await fetch('img/winner.mp3');
          const arrayBuffer = await response.arrayBuffer();
          this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          console.log('Winner audio buffer loaded for Web Audio API');
        } catch (e) {
          console.log('Failed to load audio buffer:', e);
        }
      }
    } catch (error) {
      console.error('Failed to preload winner sound:', error);
    }
  }
  
  async playWinnerSound() {
    console.log('🎵 Playing winner sound...');
    
    // Ensure audio is unlocked first
    if (!this.isUnlocked) {
      console.log('Audio not yet unlocked, waiting...');
      await this.unlockPromise;
    }
    
    let played = false;
    
    // Method 1: Try HTML Audio first
    if (this.winnerAudio) {
      try {
        // Reset and play
        this.winnerAudio.currentTime = 0;
        this.winnerAudio.volume = 0.25;
        
        // Clone the audio for iOS (sometimes helps)
        const audioClone = this.winnerAudio.cloneNode();
        audioClone.volume = 0.25;
        
        // Try playing the clone
        const playPromise = audioClone.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Winner sound playing (HTML Audio clone)!');
              played = true;
            })
            .catch(async (error) => {
              console.log('Clone play failed, trying original:', error);
              // Try original if clone fails
              try {
                await this.winnerAudio.play();
                console.log('✅ Winner sound playing (HTML Audio original)!');
                played = true;
              } catch (e) {
                console.error('HTML Audio playback failed:', e);
              }
            });
        }
      } catch (error) {
        console.error('HTML Audio error:', error);
      }
    }
    
    // Method 2: Fallback to Web Audio API if HTML Audio fails
    if (!played && this.audioContext && this.audioBuffer) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;
        
        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.25;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Play
        source.start(0);
        console.log('✅ Winner sound playing (Web Audio API)!');
        played = true;
      } catch (error) {
        console.error('Web Audio API playback failed:', error);
      }
    }
    
    if (!played) {
      console.error('❌ Could not play winner sound with any method');
      
      // Last resort: Create new audio and try immediately
      try {
        const lastResort = new Audio('img/winner.mp3');
        lastResort.volume = 0.25;
        await lastResort.play();
        console.log('✅ Winner sound playing (last resort)!');
      } catch (e) {
        console.error('Last resort audio failed:', e);
      }
    }
  }
  
  // Method to be called during drag start to prepare audio
  prepareAudioForPlayback() {
    if (this.winnerAudio) {
      // iOS sometimes needs the audio to be "touched" during user interaction
      this.winnerAudio.load();
      this.winnerAudio.currentTime = 0;
    }
  }
}

// Create singleton instance
const audioManager = new AudioManager();

export { audioManager };