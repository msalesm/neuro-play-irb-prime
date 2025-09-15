export interface BiofeedbackState {
  emotionalEnergy: number; // 0-100
  impulsivityLevel: number; // 0-100
  errorCount: number;
  consecutiveErrors: number;
  sessionStartTime: number;
  isBreathingExerciseActive: boolean;
  recentErrors: ErrorEvent[];
  clickFrequency: number; // clicks per second
  averageResponseTime: number;
}

export interface ErrorEvent {
  timestamp: number;
  responseTime: number;
  type: 'incorrect' | 'timeout' | 'impulsive';
  gameContext?: any;
}

export interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  cycles: number;
  description: string;
}

export interface BiofeedbackConfig {
  errorThreshold: number; // errors in timeWindow to trigger breathing
  timeWindow: number; // milliseconds
  impulsivityThreshold: number; // response time threshold
  energyIncreaseRate: number;
  energyDecreaseRate: number;
  clickFrequencyThreshold: number; // clicks per second
}

export interface GameResponse {
  isCorrect: boolean;
  responseTime: number;
  timestamp: number;
  gameSpecificData?: any;
}

export interface BiofeedbackMetrics {
  totalBreathingExercises: number;
  averageEmotionalEnergy: number;
  regulationSuccessRate: number;
  impulsivityEvents: number;
  sessionDuration: number;
}