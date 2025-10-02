export interface ReportRequest {
  userId: string;
  startDate: string;
  endDate: string;
  reportType: 'comprehensive' | 'progress' | 'diagnostic';
}

export interface ReportResponse {
  reportId: string;
  status: 'success' | 'partial' | 'error';
  data: ReportData;
  generatedAt: string;
  warning?: string;
}

export interface ReportData {
  demographic: {
    userId: string;
    period: { start: string; end: string };
    totalDays: number;
  };
  general: {
    totalSessions: number;
    totalDurationMinutes: number;
    avgAccuracy: number;
    avgReactionTime: number;
    completionRate: number;
  };
  cognitiveScores: {
    [category: string]: {
      currentLevel: number;
      initialLevel: number;
      totalXP: number;
      sessionsCompleted: number;
      avgAccuracy: number;
      improvement: number;
    };
  };
  temporalEvolution: Array<{
    date: string;
    accuracy: number;
    sessionCount: number;
    avgReactionTime: number;
  }>;
  behavioral: {
    errorPatterns: {
      impulsive: number;
      attention: number;
      cognitive: number;
    };
    bestPerformanceTime: string;
    consistencyScore: number;
    strugglesDetected: string[];
  };
  aiAnalysis?: {
    executiveSummary: string;
    domainAnalysis: { [category: string]: string };
    strengths: string[];
    areasOfConcern: string[];
    recommendations: string[];
    diagnosticIndicators?: string[];
  };
}

export interface SessionData {
  id: string;
  user_id: string;
  trail_id: string;
  created_at: string;
  completed_at: string | null;
  performance_data: {
    score?: number;
    accuracy?: number;
    reaction_time?: number;
    [key: string]: any;
  };
  struggles_detected: string[] | null;
  cognitive_category: string;
  current_level: number;
  total_xp: number;
}

export interface SessionsQueryResult {
  sessions: SessionData[];
  trailsData: {
    [category: string]: {
      initialLevel: number;
      currentLevel: number;
      totalXP: number;
    };
  };
}

export interface NeurodiversityProfile {
  detected_conditions?: string[];
  support_preferences?: any;
  [key: string]: any;
}

export interface GeneralMetrics {
  totalSessions: number;
  totalDurationMinutes: number;
  avgAccuracy: number;
  avgReactionTime: number;
  completionRate: number;
  cognitiveScores: {
    [category: string]: {
      currentLevel: number;
      initialLevel: number;
      totalXP: number;
      sessionsCompleted: number;
      avgAccuracy: number;
      improvement: number;
    };
  };
}

export interface BehavioralPatterns {
  errorPatterns: {
    impulsive: number;
    attention: number;
    cognitive: number;
  };
  bestPerformanceTime: string;
  consistencyScore: number;
  strugglesDetected: string[];
}

export interface TemporalDataPoint {
  date: string;
  accuracy: number;
  sessionCount: number;
  avgReactionTime: number;
}
