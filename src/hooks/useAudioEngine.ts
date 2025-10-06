import { useEffect, useCallback } from 'react';
import { audioEngine, FeedbackIntensity, ErrorType, SpeechOptions } from '@/lib/audioEngine';

/**
 * React Hook for using the Unified Audio Engine
 * Provides convenient methods for audio feedback in components
 */
export const useAudioEngine = () => {
  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = () => {
      audioEngine.setEnabled(true);
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playSuccess = useCallback(async (intensity: FeedbackIntensity = 'medium') => {
    await audioEngine.playSuccess(intensity);
  }, []);

  const playError = useCallback(async (type: ErrorType = 'soft') => {
    await audioEngine.playError(type);
  }, []);

  const playWarning = useCallback(async () => {
    await audioEngine.playWarning();
  }, []);

  const playLevelUp = useCallback(async () => {
    await audioEngine.playLevelUp();
  }, []);

  const playAchievement = useCallback(async () => {
    await audioEngine.playAchievement();
  }, []);

  const playHint = useCallback(async () => {
    await audioEngine.playHint();
  }, []);

  const playTick = useCallback(async () => {
    await audioEngine.playTick();
  }, []);

  const speak = useCallback(async (text: string, options?: SpeechOptions) => {
    await audioEngine.speak(text, options);
  }, []);

  const stopSpeaking = useCallback(() => {
    audioEngine.stopSpeaking();
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioEngine.setVolume(volume);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    audioEngine.setEnabled(enabled);
  }, []);

  const fadeOut = useCallback(async (duration?: number) => {
    await audioEngine.fadeOut(duration);
  }, []);

  const fadeIn = useCallback(async (duration?: number) => {
    await audioEngine.fadeIn(duration);
  }, []);

  return {
    // Feedback sounds
    playSuccess,
    playError,
    playWarning,
    playLevelUp,
    playAchievement,
    playHint,
    playTick,
    
    // Text-to-Speech
    speak,
    stopSpeaking,
    isSpeaking: () => audioEngine.isSpeaking(),
    
    // Controls
    setVolume,
    setEnabled,
    getVolume: () => audioEngine.getVolume(),
    isEnabled: () => audioEngine.isAudioEnabled(),
    
    // Effects
    fadeOut,
    fadeIn,
    
    // Utilities
    getAvailableVoices: () => audioEngine.getAvailableVoices(),
  };
};
