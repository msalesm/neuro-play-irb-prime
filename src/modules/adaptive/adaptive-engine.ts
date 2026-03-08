/**
 * Adaptive Engine
 * 
 * Core intelligence for adaptive intervention.
 * Analyzes multi-source performance data to drive real-time adjustments.
 */

import { calculateAdaptiveDifficulty } from '@/modules/games/engine';

// ─── Types ────────────────────────────────────────────────

export interface PerformanceSnapshot {
  accuracy: number;           // 0-1
  reactionTimeMs: number;
  persistenceSeconds: number;
  decisionLatencyMs: number;
  errorsCount: number;
  totalAttempts: number;
  sessionDurationSeconds: number;
  abaLatencyMs?: number;
  blockPerformance?: number[];
}

export interface AdaptiveProfile {
  childId: string;
  currentDifficulty: number;
  recommendedDifficulty: number;
  frustrationLevel: FrustrationState;
  engagementLevel: 'high' | 'moderate' | 'low' | 'disengaged';
  persistenceClassification: 'strong' | 'moderate' | 'weak';
  interventionType: InterventionType;
  adjustments: AdaptiveAdjustment[];
  updatedAt: string;
}

export type FrustrationState = 'calm' | 'mild' | 'moderate' | 'high';
export type InterventionType = 'maintain' | 'simplify' | 'challenge' | 'reinforce' | 'break';

export interface AdaptiveAdjustment {
  type: 'difficulty' | 'duration' | 'reinforcement' | 'break' | 'activity_switch';
  action: string;
  reason: string;
  priority: number; // 1-5, 5 = most urgent
}

// ─── Thresholds ───────────────────────────────────────────

const THRESHOLDS = {
  HIGH_ACCURACY: 0.85,
  LOW_ACCURACY: 0.60,
  VERY_LOW_ACCURACY: 0.40,
  LOW_PERSISTENCE_SECONDS: 60,
  HIGH_REACTION_TIME_MS: 2000,
  FRUSTRATION_ERROR_RATE: 0.5,
  DISENGAGEMENT_LATENCY_MS: 5000,
  MIN_ATTEMPTS_FOR_ANALYSIS: 5,
} as const;

// ─── Core Analysis ────────────────────────────────────────

export function analyzePerformance(
  childId: string,
  snapshot: PerformanceSnapshot,
  currentDifficulty: number
): AdaptiveProfile {
  const frustration = detectFrustration(snapshot);
  const engagement = classifyEngagement(snapshot);
  const persistence = classifyPersistence(snapshot);
  const adjustments = generateAdjustments(snapshot, frustration, engagement, currentDifficulty);
  
  // Use existing adaptive engine for difficulty calculation
  const { newDifficulty } = calculateAdaptiveDifficulty(
    currentDifficulty,
    snapshot.accuracy,
    {
      targetAccuracyMin: THRESHOLDS.LOW_ACCURACY,
      targetAccuracyMax: THRESHOLDS.HIGH_ACCURACY,
    }
  );
  
  // Override difficulty if frustration is high
  const recommendedDifficulty = frustration === 'high' 
    ? Math.max(1, currentDifficulty - 2)
    : newDifficulty;

  const interventionType = determineInterventionType(frustration, engagement, snapshot.accuracy);

  return {
    childId,
    currentDifficulty,
    recommendedDifficulty,
    frustrationLevel: frustration,
    engagementLevel: engagement,
    persistenceClassification: persistence,
    interventionType,
    adjustments: adjustments.sort((a, b) => b.priority - a.priority),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Frustration Detection ────────────────────────────────

export function detectFrustration(snapshot: PerformanceSnapshot): FrustrationState {
  let frustrationScore = 0;
  
  // High error rate increases frustration
  const errorRate = snapshot.totalAttempts > 0 
    ? snapshot.errorsCount / snapshot.totalAttempts 
    : 0;
  if (errorRate > THRESHOLDS.FRUSTRATION_ERROR_RATE) frustrationScore += 2;
  else if (errorRate > 0.35) frustrationScore += 1;
  
  // Very low accuracy
  if (snapshot.accuracy < THRESHOLDS.VERY_LOW_ACCURACY) frustrationScore += 2;
  else if (snapshot.accuracy < THRESHOLDS.LOW_ACCURACY) frustrationScore += 1;
  
  // Declining block performance (giving up pattern)
  if (snapshot.blockPerformance && snapshot.blockPerformance.length >= 3) {
    const last = snapshot.blockPerformance.slice(-2);
    const first = snapshot.blockPerformance.slice(0, 2);
    const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    if (firstAvg - lastAvg > 20) frustrationScore += 2;
  }
  
  // Low persistence
  if (snapshot.persistenceSeconds < THRESHOLDS.LOW_PERSISTENCE_SECONDS) frustrationScore += 1;
  
  if (frustrationScore >= 5) return 'high';
  if (frustrationScore >= 3) return 'moderate';
  if (frustrationScore >= 1) return 'mild';
  return 'calm';
}

// ─── Engagement Classification ────────────────────────────

function classifyEngagement(snapshot: PerformanceSnapshot): AdaptiveProfile['engagementLevel'] {
  if (snapshot.decisionLatencyMs > THRESHOLDS.DISENGAGEMENT_LATENCY_MS) return 'disengaged';
  if (snapshot.totalAttempts < THRESHOLDS.MIN_ATTEMPTS_FOR_ANALYSIS) return 'low';
  if (snapshot.reactionTimeMs > THRESHOLDS.HIGH_REACTION_TIME_MS) return 'low';
  if (snapshot.accuracy > 0.7 && snapshot.reactionTimeMs < 1500) return 'high';
  return 'moderate';
}

// ─── Persistence Classification ───────────────────────────

function classifyPersistence(snapshot: PerformanceSnapshot): AdaptiveProfile['persistenceClassification'] {
  if (snapshot.persistenceSeconds >= 180 && snapshot.totalAttempts >= 15) return 'strong';
  if (snapshot.persistenceSeconds >= 90 || snapshot.totalAttempts >= 8) return 'moderate';
  return 'weak';
}

// ─── Intervention Type ────────────────────────────────────

function determineInterventionType(
  frustration: FrustrationState,
  engagement: AdaptiveProfile['engagementLevel'],
  accuracy: number
): InterventionType {
  if (frustration === 'high') return 'break';
  if (frustration === 'moderate') return 'reinforce';
  if (engagement === 'disengaged') return 'break';
  if (accuracy > THRESHOLDS.HIGH_ACCURACY) return 'challenge';
  if (accuracy < THRESHOLDS.LOW_ACCURACY) return 'simplify';
  return 'maintain';
}

// ─── Adjustment Generation ────────────────────────────────

function generateAdjustments(
  snapshot: PerformanceSnapshot,
  frustration: FrustrationState,
  engagement: AdaptiveProfile['engagementLevel'],
  currentDifficulty: number
): AdaptiveAdjustment[] {
  const adjustments: AdaptiveAdjustment[] = [];

  // Difficulty adjustments
  if (snapshot.accuracy > THRESHOLDS.HIGH_ACCURACY) {
    adjustments.push({
      type: 'difficulty',
      action: 'increase',
      reason: `Acerto acima de ${THRESHOLDS.HIGH_ACCURACY * 100}% — aumentar dificuldade`,
      priority: 3,
    });
  } else if (snapshot.accuracy < THRESHOLDS.LOW_ACCURACY) {
    adjustments.push({
      type: 'difficulty',
      action: 'decrease',
      reason: `Acerto abaixo de ${THRESHOLDS.LOW_ACCURACY * 100}% — reduzir dificuldade`,
      priority: 4,
    });
  }

  // Persistence-based adjustments
  if (snapshot.persistenceSeconds < THRESHOLDS.LOW_PERSISTENCE_SECONDS) {
    adjustments.push({
      type: 'duration',
      action: 'shorten_tasks',
      reason: 'Persistência baixa — recomendar tarefas mais curtas',
      priority: 4,
    });
  }

  // Frustration-based adjustments
  if (frustration === 'high') {
    adjustments.push({
      type: 'reinforcement',
      action: 'apply_positive_reinforcement',
      reason: 'Frustração alta — aplicar reforço positivo e pausa',
      priority: 5,
    });
    adjustments.push({
      type: 'break',
      action: 'suggest_breathing_exercise',
      reason: 'Nível de frustração elevado — sugerir exercício de respiração',
      priority: 5,
    });
  } else if (frustration === 'moderate') {
    adjustments.push({
      type: 'reinforcement',
      action: 'encourage',
      reason: 'Frustração moderada — incentivar e validar esforço',
      priority: 3,
    });
  }

  // Engagement-based adjustments
  if (engagement === 'disengaged') {
    adjustments.push({
      type: 'activity_switch',
      action: 'switch_game',
      reason: 'Desengajamento detectado — sugerir troca de atividade',
      priority: 4,
    });
  }

  return adjustments;
}

// ─── Intervention Plan ────────────────────────────────────

export interface InterventionPlan {
  childId: string;
  generatedAt: string;
  currentState: AdaptiveProfile;
  nextSessionRecommendations: {
    suggestedDifficulty: number;
    suggestedDurationMinutes: number;
    suggestedGameTypes: string[];
    preSessionAction?: string;
    postSessionAction?: string;
  };
}

export function generateInterventionPlan(profile: AdaptiveProfile): InterventionPlan {
  const suggestedDuration = profile.persistenceClassification === 'weak' ? 3 
    : profile.persistenceClassification === 'moderate' ? 5 : 8;

  const gameTypes: string[] = [];
  if (profile.frustrationLevel === 'high' || profile.frustrationLevel === 'moderate') {
    gameTypes.push('emotional-regulation', 'coordination');
  }
  if (profile.engagementLevel === 'low' || profile.engagementLevel === 'disengaged') {
    gameTypes.push('persistence', 'coordination');
  }
  if (profile.interventionType === 'challenge') {
    gameTypes.push('memory', 'flexibility', 'inhibition');
  }
  if (gameTypes.length === 0) {
    gameTypes.push('attention', 'memory');
  }

  return {
    childId: profile.childId,
    generatedAt: new Date().toISOString(),
    currentState: profile,
    nextSessionRecommendations: {
      suggestedDifficulty: profile.recommendedDifficulty,
      suggestedDurationMinutes: suggestedDuration,
      suggestedGameTypes: [...new Set(gameTypes)],
      preSessionAction: profile.frustrationLevel !== 'calm' 
        ? 'Iniciar com exercício de respiração ou atividade lúdica leve' 
        : undefined,
      postSessionAction: profile.interventionType === 'reinforce'
        ? 'Reforço positivo: destacar conquistas da sessão'
        : undefined,
    },
  };
}

// ─── Reinforcement Logic ──────────────────────────────────

export function shouldApplyReinforcement(
  accuracy: number,
  streak: number,
  frustration: FrustrationState
): { apply: boolean; type: 'celebration' | 'encouragement' | 'badge' | 'none'; message: string } {
  if (frustration === 'high') {
    return { apply: true, type: 'encouragement', message: 'Você está indo bem! Cada tentativa conta. 💪' };
  }
  if (streak >= 5 && accuracy > 0.8) {
    return { apply: true, type: 'celebration', message: 'Incrível! 5 acertos seguidos! 🎉' };
  }
  if (streak >= 3) {
    return { apply: true, type: 'badge', message: 'Ótima sequência! Continue assim! ⭐' };
  }
  if (accuracy < 0.5 && frustration === 'moderate') {
    return { apply: true, type: 'encouragement', message: 'Está ficando mais fácil, continue! 🌟' };
  }
  return { apply: false, type: 'none', message: '' };
}
