/**
 * Unified Audio Engine for NeuroPlay
 * Handles all audio feedback, contextual sounds, and text-to-speech
 */

export type FeedbackIntensity = 'low' | 'medium' | 'high';
export type ErrorType = 'soft' | 'harsh';

export interface ADSREnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface Tone {
  frequency: number;
  duration: number;
  envelope?: ADSREnvelope;
}

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voice?: string;
}

export interface AudioPreset {
  success: {
    low: Tone[];
    medium: Tone[];
    high: Tone[];
  };
  error: {
    soft: Tone[];
    harsh: Tone[];
  };
  warning: Tone[];
  levelUp: Tone[];
  achievement: Tone[];
  hint: Tone[];
  tick: Tone[];
}

class UnifiedAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;
  private volume: number = 0.5;
  private speechSynth: SpeechSynthesis | null = null;
  private currentSpeech: SpeechSynthesisUtterance | null = null;

  // Audio presets for different game types
  private presets: AudioPreset = {
    success: {
      low: [
        { frequency: 523.25, duration: 0.1 }, // C5
        { frequency: 659.25, duration: 0.15 } // E5
      ],
      medium: [
        { frequency: 523.25, duration: 0.1 }, // C5
        { frequency: 659.25, duration: 0.1 }, // E5
        { frequency: 783.99, duration: 0.2 }  // G5
      ],
      high: [
        { frequency: 523.25, duration: 0.1 }, // C5
        { frequency: 659.25, duration: 0.1 }, // E5
        { frequency: 783.99, duration: 0.1 }, // G5
        { frequency: 1046.50, duration: 0.3 } // C6
      ]
    },
    error: {
      soft: [
        { frequency: 200, duration: 0.15 },
        { frequency: 150, duration: 0.2 }
      ],
      harsh: [
        { frequency: 100, duration: 0.3 }
      ]
    },
    warning: [
      { frequency: 440, duration: 0.1 },
      { frequency: 440, duration: 0.1 }
    ],
    levelUp: [
      { frequency: 523.25, duration: 0.1 },
      { frequency: 659.25, duration: 0.1 },
      { frequency: 783.99, duration: 0.1 },
      { frequency: 1046.50, duration: 0.15 },
      { frequency: 1318.51, duration: 0.25 }
    ],
    achievement: [
      { frequency: 659.25, duration: 0.1 },
      { frequency: 783.99, duration: 0.1 },
      { frequency: 1046.50, duration: 0.1 },
      { frequency: 783.99, duration: 0.1 },
      { frequency: 1046.50, duration: 0.3 }
    ],
    hint: [
      { frequency: 800, duration: 0.1 },
      { frequency: 1000, duration: 0.15 }
    ],
    tick: [
      { frequency: 1000, duration: 0.05 }
    ]
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.speechSynth = window.speechSynthesis;
    }
  }

  /**
   * Initialize AudioContext (must be called on user interaction)
   */
  private initAudioContext(): boolean {
    if (this.isInitialized || typeof window === 'undefined') return false;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      this.isInitialized = true;
      
      // Resume AudioContext if suspended (iOS requirement)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Enable or disable audio
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled && !this.isInitialized) {
      this.initAudioContext();
    }
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Check if audio is enabled
   */
  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Play success sound
   */
  async playSuccess(intensity: FeedbackIntensity = 'medium'): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    
    await this.playSequence(this.presets.success[intensity], 'precise');
  }

  /**
   * Play error sound
   */
  async playError(type: ErrorType = 'soft'): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    
    await this.playSequence(this.presets.error[type], 'precise');
  }

  /**
   * Play warning sound
   */
  async playWarning(): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    
    await this.playSequence(this.presets.warning, 'precise');
  }

  /**
   * Play level up sound
   */
  async playLevelUp(): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    
    await this.playSequence(this.presets.levelUp, 'precise');
  }

  /**
   * Play achievement sound
   */
  async playAchievement(): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    
    await this.playSequence(this.presets.achievement, 'precise');
  }

  /**
   * Play hint sound
   */
  async playHint(): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    
    await this.playSequence(this.presets.hint, 'precise');
  }

  /**
   * Play tick sound (for timers, counters)
   */
  async playTick(): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    
    await this.playSequence(this.presets.tick, 'precise');
  }

  /**
   * Play a single tone
   */
  async playTone(
    frequency: number,
    duration: number,
    envelope?: ADSREnvelope
  ): Promise<void> {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) {
      return;
    }

    if (!this.isInitialized) this.initAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Apply ADSR envelope if provided
    if (envelope) {
      const { attack, decay, sustain, release } = envelope;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + attack);
      gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      gainNode.gain.setValueAtTime(sustain, now + duration - release);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } else {
      // Simple envelope
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);

    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  }

  /**
   * Play a sequence of tones
   */
  async playSequence(
    tones: Tone[],
    timing: 'precise' | 'relaxed' = 'precise'
  ): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isInitialized) this.initAudioContext();
    if (!this.audioContext) return;

    const gap = timing === 'precise' ? 0.05 : 0.1;

    for (const tone of tones) {
      await this.playTone(tone.frequency, tone.duration, tone.envelope);
      await this.sleep((tone.duration + gap) * 1000);
    }
  }

  /**
   * Text-to-Speech using Web Speech API
   */
  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (!this.isEnabled || !this.speechSynth) return;

    // Cancel any ongoing speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume !== undefined ? options.volume : this.volume;
    utterance.lang = options.lang || 'pt-BR';

    // Select voice if specified
    if (options.voice) {
      const voices = this.speechSynth.getVoices();
      const selectedVoice = voices.find(v => v.name.includes(options.voice!));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    this.currentSpeech = utterance;

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        this.currentSpeech = null;
        resolve();
      };
      utterance.onerror = (error) => {
        this.currentSpeech = null;
        reject(error);
      };
      this.speechSynth!.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stopSpeaking(): void {
    if (this.speechSynth && this.currentSpeech) {
      this.speechSynth.cancel();
      this.currentSpeech = null;
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.speechSynth?.speaking || false;
  }

  /**
   * Fade out audio over specified duration
   */
  async fadeOut(duration: number = 1000): Promise<void> {
    if (!this.masterGain || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const durationSeconds = duration / 1000;
    
    this.masterGain.gain.setValueAtTime(this.volume, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + durationSeconds);

    await this.sleep(duration);
    this.masterGain.gain.setValueAtTime(this.volume, now + durationSeconds);
  }

  /**
   * Fade in audio over specified duration
   */
  async fadeIn(duration: number = 1000): Promise<void> {
    if (!this.masterGain || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const durationSeconds = duration / 1000;
    
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, now + durationSeconds);

    await this.sleep(duration);
  }

  /**
   * Get available voices for TTS
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynth) return [];
    return this.speechSynth.getVoices();
  }

  /**
   * Utility: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopSpeaking();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.masterGain = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const audioEngine = new UnifiedAudioEngine();
