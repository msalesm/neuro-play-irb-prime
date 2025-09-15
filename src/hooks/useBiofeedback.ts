import { useState, useEffect, useCallback, useRef } from 'react';
import { BiofeedbackState, ErrorEvent, GameResponse, BiofeedbackConfig, BreathingPattern, BiofeedbackMetrics } from '@/types/biofeedback';

const DEFAULT_CONFIG: BiofeedbackConfig = {
  errorThreshold: 3,
  timeWindow: 10000, // 10 seconds
  impulsivityThreshold: 300, // ms
  energyIncreaseRate: 15,
  energyDecreaseRate: 10,
  clickFrequencyThreshold: 3, // clicks per second
};

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    name: 'calm',
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    pause: 4000,
    cycles: 3,
    description: 'Padrão equilibrado para acalmar'
  },
  {
    name: 'anxiety',
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
    pause: 0,
    cycles: 4,
    description: 'Padrão para reduzir ansiedade'
  },
  {
    name: 'focus',
    inhale: 3000,
    hold: 3000,
    exhale: 3000,
    pause: 3000,
    cycles: 5,
    description: 'Padrão para melhorar foco'
  }
];

export function useBiofeedback(config: Partial<BiofeedbackConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<BiofeedbackState>({
    emotionalEnergy: 30,
    impulsivityLevel: 0,
    errorCount: 0,
    consecutiveErrors: 0,
    sessionStartTime: Date.now(),
    isBreathingExerciseActive: false,
    recentErrors: [],
    clickFrequency: 0,
    averageResponseTime: 500,
  });

  const clickTimestamps = useRef<number[]>([]);
  const responseTimes = useRef<number[]>([]);

  // Calculate emotional energy based on recent patterns
  const updateEmotionalEnergy = useCallback(() => {
    const now = Date.now();
    const recentErrors = state.recentErrors.filter(
      error => now - error.timestamp < finalConfig.timeWindow
    );
    
    let energyDelta = 0;
    
    // Increase energy for errors
    if (recentErrors.length >= finalConfig.errorThreshold) {
      energyDelta += finalConfig.energyIncreaseRate;
    }
    
    // Increase energy for high impulsivity
    if (state.clickFrequency > finalConfig.clickFrequencyThreshold) {
      energyDelta += 10;
    }
    
    // Increase energy for very fast responses (impulsive)
    if (state.averageResponseTime < finalConfig.impulsivityThreshold) {
      energyDelta += 8;
    }
    
    // Decrease energy naturally over time
    if (!recentErrors.length && state.clickFrequency <= 1) {
      energyDelta -= finalConfig.energyDecreaseRate;
    }
    
    setState(prev => ({
      ...prev,
      emotionalEnergy: Math.max(0, Math.min(100, prev.emotionalEnergy + energyDelta)),
      recentErrors,
      impulsivityLevel: state.clickFrequency > finalConfig.clickFrequencyThreshold ? 70 : 
                       state.averageResponseTime < finalConfig.impulsivityThreshold ? 50 : 0
    }));
  }, [state, finalConfig]);

  // Track user clicks for frequency analysis
  const trackClick = useCallback(() => {
    const now = Date.now();
    clickTimestamps.current = [...clickTimestamps.current, now].filter(
      timestamp => now - timestamp < 1000 // last second
    );
    
    const frequency = clickTimestamps.current.length;
    setState(prev => ({ ...prev, clickFrequency: frequency }));
  }, []);

  // Record a game response
  const recordResponse = useCallback((response: GameResponse) => {
    responseTimes.current = [...responseTimes.current, response.responseTime].slice(-10);
    const avgResponseTime = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length;
    
    if (!response.isCorrect) {
      const errorEvent: ErrorEvent = {
        timestamp: response.timestamp,
        responseTime: response.responseTime,
        type: response.responseTime < finalConfig.impulsivityThreshold ? 'impulsive' : 'incorrect',
        gameContext: response.gameSpecificData,
      };
      
      setState(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        consecutiveErrors: prev.consecutiveErrors + 1,
        recentErrors: [...prev.recentErrors, errorEvent],
        averageResponseTime: avgResponseTime,
      }));
    } else {
      setState(prev => ({
        ...prev,
        consecutiveErrors: 0,
        averageResponseTime: avgResponseTime,
      }));
    }
  }, [finalConfig.impulsivityThreshold]);

  // Start breathing exercise
  const startBreathingExercise = useCallback(() => {
    setState(prev => ({ ...prev, isBreathingExerciseActive: true }));
  }, []);

  // Complete breathing exercise
  const completeBreathingExercise = useCallback(() => {
    setState(prev => ({
      ...prev,
      isBreathingExerciseActive: false,
      emotionalEnergy: Math.max(0, prev.emotionalEnergy - 25), // Significant reduction
      consecutiveErrors: 0,
    }));
  }, []);

  // Get appropriate breathing pattern
  const getBreathingPattern = useCallback((): BreathingPattern => {
    if (state.emotionalEnergy > 80) {
      return BREATHING_PATTERNS.find(p => p.name === 'anxiety') || BREATHING_PATTERNS[0];
    } else if (state.impulsivityLevel > 50) {
      return BREATHING_PATTERNS.find(p => p.name === 'focus') || BREATHING_PATTERNS[0];
    }
    return BREATHING_PATTERNS.find(p => p.name === 'calm') || BREATHING_PATTERNS[0];
  }, [state.emotionalEnergy, state.impulsivityLevel]);

  // Check if breathing exercise should be triggered
  const shouldTriggerBreathing = useCallback((): boolean => {
    return (
      !state.isBreathingExerciseActive &&
      (state.emotionalEnergy > 70 ||
       state.consecutiveErrors >= 3 ||
       state.impulsivityLevel > 60)
    );
  }, [state]);

  // Get current metrics for educational system
  const getMetrics = useCallback((): BiofeedbackMetrics => {
    const sessionDuration = Date.now() - state.sessionStartTime;
    return {
      totalBreathingExercises: 0, // Would track this in real implementation
      averageEmotionalEnergy: state.emotionalEnergy,
      regulationSuccessRate: state.errorCount > 0 ? 
        ((state.errorCount - state.recentErrors.length) / state.errorCount) * 100 : 100,
      impulsivityEvents: state.recentErrors.filter(e => e.type === 'impulsive').length,
      sessionDuration: Math.floor(sessionDuration / 1000),
    };
  }, [state]);

  // Reset session
  const resetSession = useCallback(() => {
    setState({
      emotionalEnergy: 30,
      impulsivityLevel: 0,
      errorCount: 0,
      consecutiveErrors: 0,
      sessionStartTime: Date.now(),
      isBreathingExerciseActive: false,
      recentErrors: [],
      clickFrequency: 0,
      averageResponseTime: 500,
    });
    clickTimestamps.current = [];
    responseTimes.current = [];
  }, []);

  // Update energy periodically
  useEffect(() => {
    const interval = setInterval(updateEmotionalEnergy, 2000);
    return () => clearInterval(interval);
  }, [updateEmotionalEnergy]);

  return {
    state,
    trackClick,
    recordResponse,
    startBreathingExercise,
    completeBreathingExercise,
    shouldTriggerBreathing,
    getBreathingPattern,
    getMetrics,
    resetSession,
    breathingPatterns: BREATHING_PATTERNS,
  };
}