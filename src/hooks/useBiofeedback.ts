// EDU stub: full biofeedback engine removed. Returns inert defaults.
import type { BiofeedbackState, GameResponse, BiofeedbackMetrics, BreathingPattern } from '@/types/biofeedback';

const DEFAULT_STATE: BiofeedbackState = {
  emotionalEnergy: 100,
  impulsivityLevel: 0,
  errorCount: 0,
  consecutiveErrors: 0,
  sessionStartTime: Date.now(),
  isBreathingExerciseActive: false,
  recentErrors: [],
  clickFrequency: 0,
  averageResponseTime: 0,
};

const DEFAULT_PATTERN: BreathingPattern = {
  name: 'Respiração 4-4-4',
  inhale: 4, hold: 4, exhale: 4, pause: 0, cycles: 4,
  description: 'Inspire, segure e expire por 4 segundos',
};

export function useBiofeedback() {
  return {
    state: DEFAULT_STATE,
    trackClick: () => {},
    recordResponse: (_r: GameResponse) => {},
    startBreathingExercise: () => {},
    completeBreathingExercise: () => {},
    shouldTriggerBreathing: () => false,
    getBreathingPattern: () => DEFAULT_PATTERN,
    getMetrics: (): BiofeedbackMetrics => ({
      averageResponseTime: 0, errorRate: 0, impulsivityScore: 0,
      energyTrend: 'stable', breathingExercisesCompleted: 0,
    } as BiofeedbackMetrics),
    resetSession: () => {},
    enabled: false,
    level: 0,
    start: () => {},
    stop: () => {},
  };
}
export default useBiofeedback;
