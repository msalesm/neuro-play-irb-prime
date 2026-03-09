// Types for behavioral cognitive analysis - Educational Profile
// NOTE: This system generates EDUCATIONAL BEHAVIORAL PROFILES, NOT clinical diagnoses.

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
    omissionErrors?: number;
    commissionErrors?: number;
    reactionTimeVariability?: number; // standard deviation
    maxSpan?: number; // for memory tasks
    perseverationErrors?: number; // for flexibility tasks
    averageDeviation?: number; // for coordination tasks
    corrections?: number; // for coordination tasks
    postErrorLatency?: number; // ms after error
    recoveryAfterError?: boolean;
    blockPerformance?: number[]; // per-block scores
  };
}

// The 6 official battery domains
export interface CognitiveDomainScores {
  attention: number; // 0-100 - Sustained Attention (CPT-like)
  inhibition: number; // 0-100 - Inhibitory Control (Go/No-Go)
  memory: number; // 0-100 - Working Memory (Span)
  flexibility: number; // 0-100 - Cognitive Flexibility (Set-shifting)
  coordination: number; // 0-100 - Visuomotor Coordination
  persistence: number; // 0-100 - Behavioral Persistence
}

export type RiskClassification = 'adequate' | 'monitoring' | 'attention' | 'intervention';

export interface DomainClassification {
  score: number;
  zScore: number;
  percentile: number;
  classification: RiskClassification;
}

export interface BehavioralIndicator {
  indicator: string;
  observed: boolean;
  frequency?: 'rare' | 'occasional' | 'frequent';
  context?: string;
}

export interface ValidationStatus {
  isScientificallyValidated: boolean;
  note: string;
  disclaimer: string;
}

export interface BehavioralProfile {
  userId: string;
  generatedAt: string;
  overallScore: number; // 0-100
  domains: {
    attention: DomainClassification;
    inhibition: DomainClassification;
    memory: DomainClassification;
    flexibility: DomainClassification;
    coordination: DomainClassification;
    persistence: DomainClassification;
  };
  behavioralIndicators: BehavioralIndicator[];
  evolutionTrend: 'improving' | 'stable' | 'declining';
  strengths: string[];
  areasForDevelopment: string[];
  educationalRecommendations: string[];
  interpretativeAnalysis: string;
  suggestedActivities: string[];
  /** Attached by the engine to every profile — allows UI to show provisional disclaimer */
  _validationStatus?: ValidationStatus;
}

// Legacy compatibility alias
export type DiagnosticReport = BehavioralProfile;
export type CognitiveProfile = CognitiveDomainScores;

export interface AnalysisRequest {
  userId: string;
  performanceData: GamePerformanceData[];
  userAge?: number;
  ageGroup?: '4-6' | '7-9' | '10-12' | '13-15' | '16+';
}

// Baseline metrics for age-normalized scoring
export interface BaselineMetric {
  ageGroup: string;
  metricName: string;
  mean: number;
  standardDeviation: number;
  sampleSize: number;
}

// Cognitive history entry for longitudinal tracking
export interface CognitiveHistoryEntry {
  userId: string;
  assessmentDate: string;
  domains: CognitiveDomainScores;
  overallScore: number;
  sessionIds: string[];
}

// Official battery task IDs
export const BATTERY_TASK_IDS = [
  'attention-sustained', // Domain 1
  'inhibitory-control',  // Domain 2
  'working-memory',      // Domain 3
  'cognitive-flexibility',// Domain 4
  'visuomotor-coordination', // Domain 5
  'behavioral-persistence',  // Domain 6
] as const;

export type BatteryTaskId = typeof BATTERY_TASK_IDS[number];

// Games that are EXCLUDED from the analysis motor (stimulation only)
export const STIMULATION_ONLY_GAMES = [
  'CacaLetras',
  'SilabaMagica',
  'PhonologicalProcessing',
  'PhonologicalProcessingGame',
  'EmotionLab',
  'EmotionalWeather',
  'SocialCompass',
  'SocialScenarios',
  'TheoryOfMind',
  'LogicaRapida',
  'SpatialArchitect',
  'StackTower',
  'SensoryFlow',
] as const;
