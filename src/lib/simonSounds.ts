export type SimonColor = 'red' | 'blue' | 'green' | 'yellow';

// Professional frequencies matching original Simon game
const FREQUENCIES: Record<SimonColor, number> = {
  red: 415,    // G#4
  blue: 310,   // D#4  
  green: 252,  // C4
  yellow: 209  // G#3
};

// ADSR Envelope parameters
interface ADSREnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

const DEFAULT_ENVELOPE: ADSREnvelope = {
  attack: 0.02,   // 20ms attack
  decay: 0.1,     // 100ms decay
  sustain: 0.7,   // 70% sustain level
  release: 0.15   // 150ms release
};

export class SimonSoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    // Don't initialize AudioContext in constructor (mobile requirement)
  }

  private initAudioContext() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
      this.isInitialized = true;
      
      // Resume AudioContext if suspended (iOS requirement)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled && !this.isInitialized) {
      this.initAudioContext();
    }
  }

  playColorTone(color: SimonColor, duration: number = 0.4) {
    if (!this.isEnabled) return;
    
    // Initialize audio on first interaction (mobile requirement)
    if (!this.isInitialized) {
      this.initAudioContext();
    }
    
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Set frequency
    oscillator.frequency.value = FREQUENCIES[color];
    oscillator.type = 'sine';

    // ADSR Envelope
    const { attack, decay, sustain, release } = DEFAULT_ENVELOPE;
    
    // Attack
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attack);
    
    // Decay to sustain
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    
    // Sustain
    const sustainEnd = now + duration - release;
    gainNode.gain.setValueAtTime(sustain, sustainEnd);
    
    // Release
    gainNode.gain.exponentialRampToValueAtTime(0.01, sustainEnd + release);

    oscillator.start(now);
    oscillator.stop(sustainEnd + release);
  }

  playErrorSound() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Descending tone for error
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  playSuccessSound() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Play ascending arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C-E-G-C
    
    notes.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + index * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  playVictoryFanfare() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Victory melody
    const melody = [
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.15 }, // G5
      { freq: 1046.50, duration: 0.4 }  // C6 (longer)
    ];

    let time = now;
    melody.forEach(note => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.4, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);

      oscillator.start(time);
      oscillator.stop(time + note.duration);

      time += note.duration;
    });
  }

  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

export const simonSoundEngine = new SimonSoundEngine();
