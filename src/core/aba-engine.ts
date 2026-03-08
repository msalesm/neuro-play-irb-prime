/**
 * ABA Program Engine
 * 
 * Centralized logic for Applied Behavior Analysis programs.
 * Supports: DTT, NET, Task Analysis, Prompting, Shaping.
 */

// ─── Types ────────────────────────────────────────────────

export const ABA_TEACHING_METHODS = [
  'DTT',    // Discrete Trial Training
  'NET',    // Natural Environment Teaching
  'task_analysis',
  'prompting',
  'shaping',
  'chaining',
  'modeling',
  'incidental',
] as const;

export type AbaTeachingMethod = typeof ABA_TEACHING_METHODS[number];

export const PROMPT_LEVELS = [
  'full_physical',
  'partial_physical',
  'model',
  'gestural',
  'positional',
  'verbal',
  'independent',
] as const;

export type PromptLevel = typeof PROMPT_LEVELS[number];

export const PROMPT_HIERARCHY: Record<PromptLevel, number> = {
  full_physical: 1,
  partial_physical: 2,
  model: 3,
  gestural: 4,
  positional: 5,
  verbal: 6,
  independent: 7,
};

export interface TrialData {
  correct: boolean;
  promptLevel: PromptLevel;
  latencyMs?: number;
  reinforcementGiven: boolean;
  reinforcementType?: string;
  notes?: string;
}

export interface SessionAnalysis {
  totalTrials: number;
  correctTrials: number;
  accuracy: number; // 0-100
  independenceRate: number; // 0-100 (% at independent level)
  averagePromptLevel: number; // 1-7
  averageLatencyMs: number;
  reinforcementRate: number; // 0-100
  trend: 'up' | 'stable' | 'down';
  masteryReached: boolean; // >=80% accuracy at independent for 3+ sessions
}

export interface MasteryCriteria {
  accuracyThreshold: number; // default 80%
  independenceThreshold: number; // default 80%
  consecutiveSessions: number; // default 3
}

const DEFAULT_MASTERY: MasteryCriteria = {
  accuracyThreshold: 80,
  independenceThreshold: 80,
  consecutiveSessions: 3,
};

// ─── Analysis Functions ───────────────────────────────────

/**
 * Analyze a single session's trials
 */
export function analyzeSession(trials: TrialData[]): Omit<SessionAnalysis, 'trend' | 'masteryReached'> {
  if (trials.length === 0) {
    return {
      totalTrials: 0, correctTrials: 0, accuracy: 0,
      independenceRate: 0, averagePromptLevel: 0,
      averageLatencyMs: 0, reinforcementRate: 0,
    };
  }

  const correctTrials = trials.filter(t => t.correct).length;
  const independentTrials = trials.filter(t => t.promptLevel === 'independent').length;
  const latencies = trials.filter(t => t.latencyMs).map(t => t.latencyMs!);
  const reinforced = trials.filter(t => t.reinforcementGiven).length;

  const promptLevelValues = trials.map(t => PROMPT_HIERARCHY[t.promptLevel]);
  const avgPromptLevel = promptLevelValues.reduce((a, b) => a + b, 0) / promptLevelValues.length;

  return {
    totalTrials: trials.length,
    correctTrials,
    accuracy: Math.round((correctTrials / trials.length) * 100),
    independenceRate: Math.round((independentTrials / trials.length) * 100),
    averagePromptLevel: Math.round(avgPromptLevel * 10) / 10,
    averageLatencyMs: latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 0,
    reinforcementRate: Math.round((reinforced / trials.length) * 100),
  };
}

/**
 * Analyze trend across multiple sessions
 */
export function analyzeTrend(
  sessionAccuracies: number[]
): 'up' | 'stable' | 'down' {
  if (sessionAccuracies.length < 3) return 'stable';
  
  const recent = sessionAccuracies.slice(-3);
  const earlier = sessionAccuracies.slice(0, Math.min(3, sessionAccuracies.length - 3));
  
  if (earlier.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  
  if (recentAvg - earlierAvg > 10) return 'up';
  if (earlierAvg - recentAvg > 10) return 'down';
  return 'stable';
}

/**
 * Check if mastery criteria have been met
 */
export function checkMastery(
  recentSessionAnalyses: Array<Omit<SessionAnalysis, 'trend' | 'masteryReached'>>,
  criteria: MasteryCriteria = DEFAULT_MASTERY
): boolean {
  if (recentSessionAnalyses.length < criteria.consecutiveSessions) return false;
  
  const lastN = recentSessionAnalyses.slice(-criteria.consecutiveSessions);
  
  return lastN.every(
    s => s.accuracy >= criteria.accuracyThreshold && s.independenceRate >= criteria.independenceThreshold
  );
}

/**
 * Suggest next prompt level based on performance
 */
export function suggestPromptReduction(
  currentLevel: PromptLevel,
  accuracy: number,
  independenceRate: number
): { level: PromptLevel; reason: string } {
  const currentRank = PROMPT_HIERARCHY[currentLevel];
  
  // If accuracy is high and at current prompt level, try reducing
  if (accuracy >= 80 && currentRank < 7) {
    const nextLevel = (Object.entries(PROMPT_HIERARCHY)
      .find(([_, rank]) => rank === currentRank + 1)?.[0] || currentLevel) as PromptLevel;
    return {
      level: nextLevel,
      reason: `Acurácia de ${accuracy}% permite redução de suporte`,
    };
  }
  
  // If accuracy is too low, increase support
  if (accuracy < 50 && currentRank > 1) {
    const prevLevel = (Object.entries(PROMPT_HIERARCHY)
      .find(([_, rank]) => rank === currentRank - 1)?.[0] || currentLevel) as PromptLevel;
    return {
      level: prevLevel,
      reason: `Acurácia de ${accuracy}% — aumentar suporte temporariamente`,
    };
  }
  
  return {
    level: currentLevel,
    reason: `Manter nível atual (acurácia: ${accuracy}%)`,
  };
}

/**
 * Generate reinforcement schedule suggestion
 */
export function suggestReinforcementSchedule(
  accuracy: number,
  independenceRate: number,
  sessionCount: number
): { type: 'continuous' | 'fixed_ratio' | 'variable_ratio'; ratio: number; reason: string } {
  // Early learning: continuous reinforcement
  if (sessionCount < 5 || accuracy < 60) {
    return { type: 'continuous', ratio: 1, reason: 'Fase de aquisição — reforço contínuo' };
  }
  
  // Maintenance: thin the schedule
  if (accuracy >= 80 && independenceRate >= 70) {
    return { 
      type: 'variable_ratio', 
      ratio: 3, 
      reason: 'Fase de manutenção — esquema variável VR3' 
    };
  }
  
  // Intermediate: fixed ratio
  return { 
    type: 'fixed_ratio', 
    ratio: 2, 
    reason: 'Fase de fluência — esquema fixo FR2' 
  };
}
