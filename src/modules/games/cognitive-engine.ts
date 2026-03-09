/**
 * Deterministic Cognitive Engine
 * 
 * Calculates behavioral cognitive profiles from structured task data.
 * NO AI dependency - pure deterministic calculations.
 * NO clinical/diagnostic terminology.
 */

import type {
  GamePerformanceData,
  CognitiveDomainScores,
  DomainClassification,
  RiskClassification,
  BehavioralIndicator,
  BehavioralProfile,
  BaselineMetric,
  BATTERY_TASK_IDS,
} from '@/types/cognitive-analysis';

// ============================================================
// VALIDATION STATUS — Single config flag for scientific validation
// When validation studies are complete, set isScientificallyValidated = true
// to remove all provisional disclaimers from the platform.
// ============================================================

export const VALIDATION_STATUS = {
  isScientificallyValidated: false,
  note: 'Baseline data is provisional. Not validated for clinical diagnosis.',
  disclaimer: 'Estes indicadores são baseados em referências provisórias e não substituem avaliação clínica profissional.',
} as const;

export type ValidationStatus = typeof VALIDATION_STATUS;

// ============================================================
// BASELINE REFERENCE DATA (provisional - pending scientific validation)
// ============================================================

const BASELINE_DATA: Record<string, Record<string, { mean: number; sd: number }>> = {
  '4-6': {
    'reaction_time': { mean: 1200, sd: 300 },
    'accuracy': { mean: 0.60, sd: 0.15 },
    'omission_rate': { mean: 0.25, sd: 0.10 },
    'commission_rate': { mean: 0.30, sd: 0.12 },
    'max_span': { mean: 3, sd: 1 },
    'perseveration_rate': { mean: 0.35, sd: 0.15 },
    'deviation': { mean: 25, sd: 10 },
    'persistence_time': { mean: 120, sd: 60 },
    'rt_variability': { mean: 400, sd: 150 },
  },
  '7-9': {
    'reaction_time': { mean: 900, sd: 200 },
    'accuracy': { mean: 0.72, sd: 0.12 },
    'omission_rate': { mean: 0.18, sd: 0.08 },
    'commission_rate': { mean: 0.22, sd: 0.10 },
    'max_span': { mean: 4.5, sd: 1.2 },
    'perseveration_rate': { mean: 0.25, sd: 0.12 },
    'deviation': { mean: 18, sd: 8 },
    'persistence_time': { mean: 180, sd: 60 },
    'rt_variability': { mean: 300, sd: 120 },
  },
  '10-12': {
    'reaction_time': { mean: 700, sd: 150 },
    'accuracy': { mean: 0.80, sd: 0.10 },
    'omission_rate': { mean: 0.12, sd: 0.06 },
    'commission_rate': { mean: 0.15, sd: 0.08 },
    'max_span': { mean: 5.5, sd: 1.0 },
    'perseveration_rate': { mean: 0.18, sd: 0.10 },
    'deviation': { mean: 12, sd: 6 },
    'persistence_time': { mean: 240, sd: 60 },
    'rt_variability': { mean: 220, sd: 100 },
  },
  '13-15': {
    'reaction_time': { mean: 550, sd: 120 },
    'accuracy': { mean: 0.85, sd: 0.08 },
    'omission_rate': { mean: 0.08, sd: 0.05 },
    'commission_rate': { mean: 0.10, sd: 0.06 },
    'max_span': { mean: 6, sd: 1.0 },
    'perseveration_rate': { mean: 0.12, sd: 0.08 },
    'deviation': { mean: 8, sd: 4 },
    'persistence_time': { mean: 300, sd: 60 },
    'rt_variability': { mean: 180, sd: 80 },
  },
  '16+': {
    'reaction_time': { mean: 450, sd: 100 },
    'accuracy': { mean: 0.88, sd: 0.07 },
    'omission_rate': { mean: 0.06, sd: 0.04 },
    'commission_rate': { mean: 0.08, sd: 0.05 },
    'max_span': { mean: 7, sd: 1.2 },
    'perseveration_rate': { mean: 0.08, sd: 0.06 },
    'deviation': { mean: 5, sd: 3 },
    'persistence_time': { mean: 360, sd: 60 },
    'rt_variability': { mean: 150, sd: 70 },
  },
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Normalize a raw metric value using Z-score based on age group baseline.
 * Returns a score on a 0-100 scale (T-score style: 50 + Z*10, clamped).
 */
export function normalizeByAge(
  metricValue: number,
  metricName: string,
  ageGroup: string,
  invertScale = false
): number {
  const baseline = BASELINE_DATA[ageGroup]?.[metricName];
  if (!baseline || baseline.sd === 0) return 50;

  let z = (metricValue - baseline.mean) / baseline.sd;
  
  // For metrics where lower is better (reaction time, errors, deviation)
  if (invertScale) z = -z;

  const tScore = 50 + z * 10;
  return Math.max(0, Math.min(100, Math.round(tScore)));
}

/**
 * Calculate Z-score for a metric.
 */
export function calculateZScore(value: number, mean: number, sd: number): number {
  if (sd === 0) return 0;
  return (value - mean) / sd;
}

/**
 * Calculate domain scores from performance data.
 */
export function calculateDomainScores(
  performanceData: GamePerformanceData[],
  ageGroup: string = '7-9'
): CognitiveDomainScores {
  const scores: CognitiveDomainScores = {
    attention: 50,
    inhibition: 50,
    memory: 50,
    flexibility: 50,
    coordination: 50,
    persistence: 50,
  };

  for (const data of performanceData) {
    const gameId = data.gameId.toLowerCase();
    const m = data.metrics;

    // DOMAIN 1: Sustained Attention
    if (gameId.includes('attention') || gameId === 'attention-sustained') {
      const components: number[] = [];
      if (m.omissionErrors !== undefined && m.totalAttempts) {
        components.push(normalizeByAge(m.omissionErrors / m.totalAttempts, 'omission_rate', ageGroup, true));
      }
      if (m.reactionTime) {
        components.push(normalizeByAge(m.reactionTime, 'reaction_time', ageGroup, true));
      }
      if (m.reactionTimeVariability) {
        components.push(normalizeByAge(m.reactionTimeVariability, 'rt_variability', ageGroup, true));
      }
      if (m.accuracy !== undefined) {
        components.push(normalizeByAge(m.accuracy, 'accuracy', ageGroup));
      }
      // Performance curve degradation check
      if (m.blockPerformance && m.blockPerformance.length >= 2) {
        const firstHalf = m.blockPerformance.slice(0, Math.floor(m.blockPerformance.length / 2));
        const secondHalf = m.blockPerformance.slice(Math.floor(m.blockPerformance.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const degradation = Math.max(0, firstAvg - secondAvg);
        components.push(Math.max(0, 100 - degradation * 2));
      }
      if (components.length > 0) {
        scores.attention = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
      }
    }

    // DOMAIN 2: Inhibitory Control (Go/No-Go)
    if (gameId.includes('inhibit') || gameId.includes('foco') || gameId === 'inhibitory-control') {
      const components: number[] = [];
      if (m.commissionErrors !== undefined && m.totalAttempts) {
        components.push(normalizeByAge(m.commissionErrors / m.totalAttempts, 'commission_rate', ageGroup, true));
      }
      if (m.reactionTime) {
        components.push(normalizeByAge(m.reactionTime, 'reaction_time', ageGroup, true));
      }
      if (m.postErrorLatency) {
        // Post-error slowing is a sign of good self-monitoring
        const postErrorBonus = m.postErrorLatency > (m.reactionTime || 500) * 1.1 ? 10 : 0;
        components.push(50 + postErrorBonus);
      }
      if (components.length > 0) {
        scores.inhibition = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
      }
    }

    // DOMAIN 3: Working Memory (Span)
    if (gameId.includes('memory') || gameId.includes('sequence') || gameId === 'working-memory') {
      const components: number[] = [];
      if (m.maxSpan !== undefined) {
        components.push(normalizeByAge(m.maxSpan, 'max_span', ageGroup));
      }
      if (m.accuracy !== undefined) {
        components.push(normalizeByAge(m.accuracy, 'accuracy', ageGroup));
      }
      if (m.reactionTime) {
        components.push(normalizeByAge(m.reactionTime, 'reaction_time', ageGroup, true));
      }
      if (components.length > 0) {
        scores.memory = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
      }
    }

    // DOMAIN 4: Cognitive Flexibility (Set-shifting)
    if (gameId.includes('flexib') || gameId === 'cognitive-flexibility') {
      const components: number[] = [];
      if (m.perseverationErrors !== undefined && m.totalAttempts) {
        components.push(normalizeByAge(m.perseverationErrors / m.totalAttempts, 'perseveration_rate', ageGroup, true));
      }
      if (m.reactionTime) {
        components.push(normalizeByAge(m.reactionTime, 'reaction_time', ageGroup, true));
      }
      if (m.accuracy !== undefined) {
        components.push(normalizeByAge(m.accuracy, 'accuracy', ageGroup));
      }
      if (components.length > 0) {
        scores.flexibility = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
      }
    }

    // DOMAIN 5: Visuomotor Coordination
    if (gameId.includes('touch') || gameId.includes('coordination') || gameId === 'visuomotor-coordination') {
      const components: number[] = [];
      if (m.averageDeviation !== undefined) {
        components.push(normalizeByAge(m.averageDeviation, 'deviation', ageGroup, true));
      }
      if (m.reactionTime) {
        components.push(normalizeByAge(m.reactionTime, 'reaction_time', ageGroup, true));
      }
      if (m.corrections !== undefined) {
        components.push(Math.max(0, 100 - m.corrections * 5));
      }
      if (components.length > 0) {
        scores.coordination = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
      }
    }

    // DOMAIN 6: Behavioral Persistence
    if (gameId.includes('persist') || gameId === 'behavioral-persistence') {
      const components: number[] = [];
      if (m.persistence) {
        components.push(normalizeByAge(m.persistence, 'persistence_time', ageGroup));
      }
      if (m.totalAttempts) {
        components.push(Math.min(100, m.totalAttempts * 10));
      }
      if (m.recoveryAfterError !== undefined) {
        components.push(m.recoveryAfterError ? 75 : 35);
      }
      if (components.length > 0) {
        scores.persistence = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
      }
    }
  }

  return scores;
}

/**
 * Classify a domain score into risk level.
 */
export function classify(score: number): RiskClassification {
  if (score >= 65) return 'adequate';
  if (score >= 50) return 'monitoring';
  if (score >= 35) return 'attention';
  return 'intervention';
}

/**
 * Attach validation metadata to a classification result.
 */
function withValidation<T>(result: T): T & { _validationStatus: ValidationStatus } {
  return { ...result, _validationStatus: VALIDATION_STATUS };
}

/**
 * Calculate percentile from Z-score (approximation).
 */
function zToPercentile(z: number): number {
  // Using approximation of the normal CDF
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  const cdf = 0.5 * (1.0 + sign * y);
  return Math.round(cdf * 100);
}

/**
 * Create full domain classification from score.
 */
function classifyDomain(score: number): DomainClassification & { _validationStatus: ValidationStatus } {
  const zScore = (score - 50) / 10;
  return withValidation({
    score,
    zScore: Math.round(zScore * 100) / 100,
    percentile: zToPercentile(zScore),
    classification: classify(score),
  });
}

/**
 * Detect behavioral patterns from the full profile.
 */
export function detectBehaviorPatterns(
  scores: CognitiveDomainScores,
  performanceData: GamePerformanceData[]
): BehavioralIndicator[] {
  const indicators: BehavioralIndicator[] = [];

  // Attention-related patterns
  if (scores.attention < 40) {
    indicators.push({
      indicator: 'Dificuldade em manter foco sustentado ao longo da tarefa',
      observed: true,
      frequency: 'frequent',
    });
  }

  // Check performance degradation over time
  const attentionData = performanceData.find(d => 
    d.gameId.toLowerCase().includes('attention')
  );
  if (attentionData?.metrics.blockPerformance) {
    const blocks = attentionData.metrics.blockPerformance;
    if (blocks.length >= 3) {
      const lastBlock = blocks[blocks.length - 1];
      const firstBlock = blocks[0];
      if (firstBlock - lastBlock > 20) {
        indicators.push({
          indicator: 'Queda significativa de desempenho ao longo do tempo (fadiga atencional)',
          observed: true,
          frequency: 'frequent',
        });
      }
    }
  }

  // Inhibition patterns
  if (scores.inhibition < 40) {
    indicators.push({
      indicator: 'Tendência a respostas impulsivas antes do processamento completo',
      observed: true,
      frequency: 'frequent',
    });
  }

  // Memory patterns
  if (scores.memory < 40) {
    indicators.push({
      indicator: 'Capacidade de retenção temporária abaixo do esperado para a faixa etária',
      observed: true,
      frequency: 'frequent',
    });
  }

  // Flexibility patterns
  if (scores.flexibility < 40) {
    indicators.push({
      indicator: 'Dificuldade em adaptar-se a mudanças de regra (rigidez comportamental)',
      observed: true,
      frequency: 'frequent',
    });
  }

  // Coordination patterns
  if (scores.coordination < 40) {
    indicators.push({
      indicator: 'Coordenação visuomotora em desenvolvimento',
      observed: true,
      frequency: 'occasional',
    });
  }

  // Persistence patterns
  if (scores.persistence < 40) {
    indicators.push({
      indicator: 'Baixa tolerância à frustração em tarefas progressivamente difíceis',
      observed: true,
      frequency: 'frequent',
    });
  }

  // Cross-domain patterns
  if (scores.attention < 45 && scores.inhibition < 45) {
    indicators.push({
      indicator: 'Padrão combinado de desatenção e impulsividade observado',
      observed: true,
      frequency: 'frequent',
      context: 'Observado em múltiplas tarefas estruturadas',
    });
  }

  if (scores.flexibility < 45 && scores.memory < 45) {
    indicators.push({
      indicator: 'Dificuldade nas funções executivas de alto nível (flexibilidade + memória operacional)',
      observed: true,
      frequency: 'occasional',
    });
  }

  // High performance indicators
  if (scores.attention >= 70 && scores.inhibition >= 70) {
    indicators.push({
      indicator: 'Bom controle atencional e inibitório',
      observed: true,
      frequency: 'frequent',
    });
  }

  return indicators;
}

/**
 * Determine evolution trend by comparing current vs previous scores.
 */
export function calculateEvolutionTrend(
  currentScores: CognitiveDomainScores,
  previousScores?: CognitiveDomainScores
): 'improving' | 'stable' | 'declining' {
  if (!previousScores) return 'stable';

  const domains = Object.keys(currentScores) as (keyof CognitiveDomainScores)[];
  let totalDiff = 0;
  for (const domain of domains) {
    totalDiff += currentScores[domain] - previousScores[domain];
  }
  const avgDiff = totalDiff / domains.length;

  if (avgDiff > 5) return 'improving';
  if (avgDiff < -5) return 'declining';
  return 'stable';
}

/**
 * Generate the full behavioral profile from performance data.
 * This is the main entry point for the engine.
 */
export function generateBehavioralProfile(
  userId: string,
  performanceData: GamePerformanceData[],
  ageGroup: string = '7-9',
  previousScores?: CognitiveDomainScores
): BehavioralProfile {
  const scores = calculateDomainScores(performanceData, ageGroup);
  const indicators = detectBehaviorPatterns(scores, performanceData);
  const trend = calculateEvolutionTrend(scores, previousScores);

  const domainEntries = Object.entries(scores) as [keyof CognitiveDomainScores, number][];
  const overallScore = Math.round(
    domainEntries.reduce((sum, [, val]) => sum + val, 0) / domainEntries.length
  );

  const strengths: string[] = [];
  const areasForDevelopment: string[] = [];

  const domainLabels: Record<keyof CognitiveDomainScores, string> = {
    attention: 'Atenção Sustentada',
    inhibition: 'Controle Inibitório',
    memory: 'Memória Operacional',
    flexibility: 'Flexibilidade Cognitiva',
    coordination: 'Coordenação Visuomotora',
    persistence: 'Persistência Comportamental',
  };

  for (const [key, value] of domainEntries) {
    if (value >= 65) {
      strengths.push(`${domainLabels[key]} dentro ou acima do esperado`);
    } else if (value < 45) {
      areasForDevelopment.push(`${domainLabels[key]} abaixo do esperado para a faixa etária`);
    }
  }

  const recommendations = generateRecommendations(scores);

  return {
    userId,
    generatedAt: new Date().toISOString(),
    overallScore,
    domains: {
      attention: classifyDomain(scores.attention),
      inhibition: classifyDomain(scores.inhibition),
      memory: classifyDomain(scores.memory),
      flexibility: classifyDomain(scores.flexibility),
      coordination: classifyDomain(scores.coordination),
      persistence: classifyDomain(scores.persistence),
    },
    behavioralIndicators: indicators,
    evolutionTrend: trend,
    strengths,
    areasForDevelopment,
    educationalRecommendations: recommendations,
    interpretativeAnalysis: generateInterpretativeText(scores, indicators, ageGroup),
    suggestedActivities: suggestActivities(scores),
    _validationStatus: VALIDATION_STATUS,
  };
}

/**
 * Generate educational recommendations based on scores.
 */
function generateRecommendations(scores: CognitiveDomainScores): string[] {
  const recs: string[] = [];

  if (scores.attention < 50) {
    recs.push('Praticar atividades de atenção sustentada com duração progressiva');
    recs.push('Reduzir estímulos distratores no ambiente de estudo');
  }
  if (scores.inhibition < 50) {
    recs.push('Exercícios de parar-e-pensar antes de agir');
    recs.push('Jogos de espera e controle de impulso');
  }
  if (scores.memory < 50) {
    recs.push('Treinar memória operacional com sequências crescentes');
    recs.push('Usar estratégias de chunking e repetição');
  }
  if (scores.flexibility < 50) {
    recs.push('Atividades com mudança de regras para treinar adaptação');
    recs.push('Rotinas com pequenas variações programadas');
  }
  if (scores.coordination < 50) {
    recs.push('Exercícios de coordenação motora fina');
    recs.push('Atividades de traçado e controle motor');
  }
  if (scores.persistence < 50) {
    recs.push('Desafios graduais com reforço positivo');
    recs.push('Ensinar estratégias de enfrentamento da frustração');
  }

  if (recs.length === 0) {
    recs.push('Manter rotina de estimulação cognitiva variada');
    recs.push('Aumentar gradualmente a complexidade das tarefas');
  }

  return recs;
}

/**
 * Generate interpretative text (deterministic, no AI).
 */
function generateInterpretativeText(
  scores: CognitiveDomainScores,
  indicators: BehavioralIndicator[],
  ageGroup: string
): string {
  const parts: string[] = [];

  parts.push(
    `Perfil Interpretativo Educacional — Faixa etária: ${ageGroup} anos.\n`
  );

  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  if (overall >= 65) {
    parts.push('O desempenho geral nas tarefas estruturadas situa-se dentro ou acima do esperado para a faixa etária.');
  } else if (overall >= 50) {
    parts.push('O desempenho geral nas tarefas estruturadas situa-se na faixa esperada, com algumas áreas que podem se beneficiar de estimulação direcionada.');
  } else if (overall >= 35) {
    parts.push('O desempenho geral indica áreas que necessitam de atenção e estimulação mais direcionada.');
  } else {
    parts.push('O desempenho geral sugere necessidade de avaliação mais aprofundada por profissional qualificado.');
  }

  const observedIndicators = indicators.filter(i => i.observed && i.frequency === 'frequent');
  if (observedIndicators.length > 0) {
    parts.push('\nPadrões comportamentais observados com frequência:');
    observedIndicators.forEach(ind => {
      parts.push(`• ${ind.indicator}`);
    });
  }

  parts.push('\n⚠️ IMPORTANTE: Este perfil apresenta PADRÕES COMPORTAMENTAIS observados durante atividades educacionais estruturadas. Não constitui avaliação clínica e não substitui análise por profissional qualificado.');

  return parts.join('\n');
}

/**
 * Suggest activities based on lowest-scoring domains.
 */
function suggestActivities(scores: CognitiveDomainScores): string[] {
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => a - b) as [keyof CognitiveDomainScores, number][];

  const activities: Record<keyof CognitiveDomainScores, string[]> = {
    attention: ['Tarefa de Atenção Sustentada', 'Exercícios de vigilância'],
    inhibition: ['Tarefa Go/No-Go', 'Exercícios de controle inibitório'],
    memory: ['Sequência de Memória Operacional', 'Span crescente'],
    flexibility: ['Tarefa de Troca de Regras', 'Exercícios de flexibilidade'],
    coordination: ['Mapeamento de Toque', 'Traçado controlado'],
    persistence: ['Desafio Progressivo', 'Exercícios de persistência'],
  };

  // Return activities for the 3 lowest domains
  return sorted
    .slice(0, 3)
    .flatMap(([domain]) => activities[domain]);
}

/**
 * Calculate intra-session variability (standard deviation per block).
 */
export function calculateIntraSessionVariability(blockScores: number[]): {
  mean: number;
  standardDeviation: number;
  coefficientOfVariation: number;
} {
  if (blockScores.length === 0) return { mean: 0, standardDeviation: 0, coefficientOfVariation: 0 };

  const mean = blockScores.reduce((a, b) => a + b, 0) / blockScores.length;
  const squaredDiffs = blockScores.map(s => Math.pow(s - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / blockScores.length;
  const sd = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 100) / 100,
    standardDeviation: Math.round(sd * 100) / 100,
    coefficientOfVariation: mean > 0 ? Math.round((sd / mean) * 100) / 100 : 0,
  };
}
