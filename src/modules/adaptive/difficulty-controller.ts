/**
 * Difficulty Controller
 * 
 * Multi-factor difficulty calculation considering
 * performance history, frustration state, and session context.
 */

import type { FrustrationState } from './adaptive-engine';

// ─── Types ────────────────────────────────────────────────

export interface DifficultyDecision {
  newDifficulty: number;
  reason: string;
  confidence: number; // 0-1
  factors: DifficultyFactor[];
}

export interface DifficultyFactor {
  name: string;
  weight: number;
  value: number;
  direction: 'increase' | 'decrease' | 'maintain';
}

export interface SessionHistory {
  difficulty: number;
  accuracy: number;
  completionRate: number;
  frustration: FrustrationState;
  date: string;
}

// ─── Controller ───────────────────────────────────────────

export function calculateNextDifficulty(
  currentDifficulty: number,
  recentSessions: SessionHistory[],
  maxDifficulty = 10
): DifficultyDecision {
  if (recentSessions.length === 0) {
    return {
      newDifficulty: currentDifficulty,
      reason: 'Sem histórico suficiente',
      confidence: 0.3,
      factors: [],
    };
  }

  const factors: DifficultyFactor[] = [];
  let difficultyDelta = 0;

  // Factor 1: Recent accuracy trend
  const recentAccuracies = recentSessions.slice(-5).map(s => s.accuracy);
  const avgAccuracy = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
  
  const accuracyFactor: DifficultyFactor = {
    name: 'Tendência de acerto',
    weight: 0.4,
    value: avgAccuracy,
    direction: avgAccuracy > 0.85 ? 'increase' : avgAccuracy < 0.6 ? 'decrease' : 'maintain',
  };
  factors.push(accuracyFactor);
  if (accuracyFactor.direction === 'increase') difficultyDelta += 1 * accuracyFactor.weight;
  else if (accuracyFactor.direction === 'decrease') difficultyDelta -= 1 * accuracyFactor.weight;

  // Factor 2: Frustration pattern
  const recentFrustrations = recentSessions.slice(-3).map(s => s.frustration);
  const highFrustrationCount = recentFrustrations.filter(f => f === 'high' || f === 'moderate').length;
  
  const frustrationFactor: DifficultyFactor = {
    name: 'Nível de frustração',
    weight: 0.3,
    value: highFrustrationCount / Math.max(1, recentFrustrations.length),
    direction: highFrustrationCount >= 2 ? 'decrease' : 'maintain',
  };
  factors.push(frustrationFactor);
  if (frustrationFactor.direction === 'decrease') difficultyDelta -= 1 * frustrationFactor.weight;

  // Factor 3: Completion rate
  const avgCompletion = recentSessions.slice(-5)
    .reduce((sum, s) => sum + s.completionRate, 0) / Math.min(5, recentSessions.length);
  
  const completionFactor: DifficultyFactor = {
    name: 'Taxa de conclusão',
    weight: 0.2,
    value: avgCompletion,
    direction: avgCompletion > 0.9 ? 'increase' : avgCompletion < 0.5 ? 'decrease' : 'maintain',
  };
  factors.push(completionFactor);
  if (completionFactor.direction === 'increase') difficultyDelta += 1 * completionFactor.weight;
  else if (completionFactor.direction === 'decrease') difficultyDelta -= 1 * completionFactor.weight;

  // Factor 4: Consistency
  if (recentAccuracies.length >= 3) {
    const variance = recentAccuracies.reduce((sum, a) => sum + Math.pow(a - avgAccuracy, 2), 0) / recentAccuracies.length;
    const isConsistent = variance < 0.02;
    
    const consistencyFactor: DifficultyFactor = {
      name: 'Consistência',
      weight: 0.1,
      value: isConsistent ? 1 : 0,
      direction: isConsistent && avgAccuracy > 0.75 ? 'increase' : 'maintain',
    };
    factors.push(consistencyFactor);
    if (consistencyFactor.direction === 'increase') difficultyDelta += 0.5 * consistencyFactor.weight;
  }

  // Calculate final difficulty
  const rawDifficulty = currentDifficulty + Math.round(difficultyDelta);
  const newDifficulty = Math.max(1, Math.min(maxDifficulty, rawDifficulty));
  
  const confidence = Math.min(1, recentSessions.length / 10);
  const dominantDirection = difficultyDelta > 0.2 ? 'aumentada' : difficultyDelta < -0.2 ? 'reduzida' : 'mantida';

  return {
    newDifficulty,
    reason: `Dificuldade ${dominantDirection} com base em ${factors.length} fatores (confiança: ${Math.round(confidence * 100)}%)`,
    confidence,
    factors,
  };
}

/**
 * Calculate optimal difficulty for a specific session
 * considering time of day and recent emotional state.
 */
export function calculateSessionDifficulty(
  baseDifficulty: number,
  frustration: FrustrationState,
  sessionNumber: number
): number {
  let adjusted = baseDifficulty;

  // First session of the day: start slightly easier
  if (sessionNumber === 1) {
    adjusted = Math.max(1, adjusted - 1);
  }

  // Frustration override
  switch (frustration) {
    case 'high':
      adjusted = Math.max(1, adjusted - 2);
      break;
    case 'moderate':
      adjusted = Math.max(1, adjusted - 1);
      break;
  }

  return Math.max(1, Math.min(10, adjusted));
}
