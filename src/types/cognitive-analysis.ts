// Types for cognitive analysis and AI diagnosis

export interface GamePerformanceData {
  gameId: string;
  gameName: string;
  sessionDate: string;
  metrics: {
    reactionTime?: number; // milliseconds
    accuracy?: number; // percentage
    consistency?: number; // percentage
    persistence?: number; // attempts or duration
    focusTime?: number; // seconds
    errorsCount?: number;
    correctAnswers?: number;
    totalAttempts?: number;
  };
}

export interface CognitiveProfile {
  attention: number; // 0-100
  memory: number; // 0-100
  language: number; // 0-100
  logic: number; // 0-100
  emotion: number; // 0-100
  coordination: number; // 0-100
}

export interface DiagnosticReport {
  userId: string;
  generatedAt: string;
  overallScore: number; // 0-100
  cognitiveProfile: CognitiveProfile;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  detailedAnalysis: string;
  suggestedGames: string[];
}

export interface AnalysisRequest {
  userId: string;
  performanceData: GamePerformanceData[];
  userAge?: number;
  userProfile?: string; // TDAH, TEA, Dyslexia, etc.
}
