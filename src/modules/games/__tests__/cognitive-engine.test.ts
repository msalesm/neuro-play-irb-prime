import { describe, it, expect } from 'vitest';
import {
  normalizeByAge,
  calculateZScore,
  calculateDomainScores,
  classify,
  detectBehaviorPatterns,
  calculateEvolutionTrend,
  generateBehavioralProfile,
  calculateIntraSessionVariability,
  VALIDATION_STATUS,
} from '@/modules/games/cognitive-engine';
import type { GamePerformanceData, CognitiveDomainScores } from '@/types/cognitive-analysis';

// ════════════════════════════════════════════════════════════
// 1. normalizeByAge
// ════════════════════════════════════════════════════════════

describe('normalizeByAge', () => {
  it('returns exactly 50 for the age-group mean (baseline calibration check)', () => {
    // 7-9 reaction_time mean = 900ms. A child scoring exactly the mean
    // should land at the 50th T-score, indicating average performance.
    expect(normalizeByAge(900, 'reaction_time', '7-9', true)).toBe(50);
  });

  it('rewards faster-than-average reaction time (lower is better)', () => {
    // 500ms is 2 SDs faster than the 900ms mean (SD=200).
    // Clinically: a child with 500ms RT shows strong processing speed.
    const score = normalizeByAge(500, 'reaction_time', '7-9', true);
    expect(score).toBeGreaterThan(60);
    // Z = -(500-900)/200 = 2 → T = 50+20 = 70
    expect(score).toBe(70);
  });

  it('penalizes slower-than-average reaction time', () => {
    // 1300ms is 2 SDs slower → clinically: sluggish processing
    const score = normalizeByAge(1300, 'reaction_time', '7-9', true);
    expect(score).toBeLessThan(40);
    expect(score).toBe(30);
  });

  it('clamps extremely bad values to 0 (floor)', () => {
    // 3000ms is catastrophically slow → would compute T<0, must clamp to 0
    const score = normalizeByAge(3000, 'reaction_time', '7-9', true);
    expect(score).toBe(0);
  });

  it('clamps extremely good values to 100 (ceiling)', () => {
    // 0ms is impossibly fast → T would exceed 100, must clamp
    const score = normalizeByAge(0, 'reaction_time', '7-9', true);
    expect(score).toBe(100);
  });

  it('returns 50 for unknown metric (safe fallback for missing baselines)', () => {
    expect(normalizeByAge(100, 'nonexistent_metric', '7-9')).toBe(50);
  });

  it('returns 50 for unknown age group (safe fallback)', () => {
    expect(normalizeByAge(900, 'reaction_time', 'unknown')).toBe(50);
  });

  it('normalizes accuracy correctly (higher is better, no inversion)', () => {
    // 7-9 accuracy mean=0.72, SD=0.12. A child with 0.96 accuracy:
    // Z = (0.96-0.72)/0.12 = 2 → T = 70
    const score = normalizeByAge(0.96, 'accuracy', '7-9', false);
    expect(score).toBe(70);
  });

  it('produces valid scores for all five age groups', () => {
    const ageGroups = ['4-6', '7-9', '10-12', '13-15', '16+'];
    for (const ag of ageGroups) {
      const score = normalizeByAge(0.72, 'accuracy', ag);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ════════════════════════════════════════════════════════════
// 2. calculateZScore
// ════════════════════════════════════════════════════════════

describe('calculateZScore', () => {
  it('returns 0 when value equals mean', () => {
    expect(calculateZScore(50, 50, 10)).toBe(0);
  });

  it('returns +1 for one SD above mean', () => {
    expect(calculateZScore(60, 50, 10)).toBe(1);
  });

  it('returns -2 for two SDs below mean', () => {
    expect(calculateZScore(30, 50, 10)).toBe(-2);
  });

  it('returns 0 when SD is 0 (prevents division by zero)', () => {
    expect(calculateZScore(100, 50, 0)).toBe(0);
  });

  it('handles negative Z-scores for values below the mean', () => {
    // Clinically: a child scoring 20 on a mean-50 SD-10 scale is 3 SDs below
    expect(calculateZScore(20, 50, 10)).toBe(-3);
  });
});

// ════════════════════════════════════════════════════════════
// 3. classify
// ════════════════════════════════════════════════════════════

describe('classify', () => {
  it('classifies score ≥65 as adequate', () => {
    expect(classify(65)).toBe('adequate');
    expect(classify(100)).toBe('adequate');
  });

  it('classifies score 50-64 as monitoring', () => {
    expect(classify(50)).toBe('monitoring');
    expect(classify(64)).toBe('monitoring');
  });

  it('classifies score 35-49 as attention', () => {
    expect(classify(35)).toBe('attention');
    expect(classify(49)).toBe('attention');
  });

  it('classifies score <35 as intervention', () => {
    expect(classify(34)).toBe('intervention');
    expect(classify(0)).toBe('intervention');
  });

  // Boundary precision test
  it('exact boundary values map correctly', () => {
    expect(classify(65)).toBe('adequate');
    expect(classify(64)).toBe('monitoring');
    expect(classify(50)).toBe('monitoring');
    expect(classify(49)).toBe('attention');
    expect(classify(35)).toBe('attention');
    expect(classify(34)).toBe('intervention');
  });
});

// ════════════════════════════════════════════════════════════
// 4. calculateDomainScores
// ════════════════════════════════════════════════════════════

describe('calculateDomainScores', () => {
  it('returns all domains at 50 for empty data (no-data baseline)', () => {
    const scores = calculateDomainScores([], '7-9');
    expect(scores.attention).toBe(50);
    expect(scores.inhibition).toBe(50);
    expect(scores.memory).toBe(50);
    expect(scores.flexibility).toBe(50);
    expect(scores.coordination).toBe(50);
    expect(scores.persistence).toBe(50);
  });

  it('above-average attention: RT=500ms, accuracy=0.90 for age 7-9', () => {
    // Why: 500ms RT is 2 SDs better than 900ms mean; 0.90 accuracy is 1.5 SDs above 0.72 mean.
    // Clinically: a child performing well above peers on sustained attention.
    const data: GamePerformanceData[] = [{
      gameId: 'attention-sustained',
      gameName: 'Atenção Sustentada',
      sessionDate: '2024-01-01',
      metrics: { reactionTime: 500, accuracy: 0.90 },
    }];
    const scores = calculateDomainScores(data, '7-9');
    // RT normalized: Z=2 → T=70; Accuracy normalized: Z≈1.5 → T=65; average ≈ 68
    expect(scores.attention).toBeGreaterThan(50);
    expect(scores.attention).toBeGreaterThanOrEqual(65);
  });

  it('below-average attention: RT=2000ms, accuracy=0.30 for age 7-9', () => {
    // Why: 2000ms is >5 SDs slower; 0.30 accuracy is >3 SDs below mean.
    // Clinically: severely impaired sustained attention.
    const data: GamePerformanceData[] = [{
      gameId: 'attention-sustained',
      gameName: 'Atenção Sustentada',
      sessionDate: '2024-01-01',
      metrics: { reactionTime: 2000, accuracy: 0.30 },
    }];
    const scores = calculateDomainScores(data, '7-9');
    expect(scores.attention).toBeLessThan(40);
  });

  it('calculates inhibition from commission errors and RT', () => {
    // Why: 1 commission error out of 20 = 0.05 rate, well below 0.22 mean.
    // Clinically: excellent impulse control.
    const data: GamePerformanceData[] = [{
      gameId: 'inhibitory-control',
      gameName: 'Controle Inibitório',
      sessionDate: '2024-01-01',
      metrics: { commissionErrors: 1, totalAttempts: 20, reactionTime: 600, accuracy: 0.90 },
    }];
    const scores = calculateDomainScores(data, '7-9');
    expect(scores.inhibition).toBeGreaterThan(50);
  });

  it('calculates memory from maxSpan and accuracy', () => {
    // Why: maxSpan=7 is ~2 SDs above 4.5 mean for 7-9.
    // Clinically: strong working memory capacity.
    const data: GamePerformanceData[] = [{
      gameId: 'working-memory',
      gameName: 'Memória Operacional',
      sessionDate: '2024-01-01',
      metrics: { maxSpan: 7, accuracy: 0.85 },
    }];
    const scores = calculateDomainScores(data, '7-9');
    expect(scores.memory).toBeGreaterThan(55);
  });

  it('all scores remain within 0-100 for 10 varied random inputs', () => {
    // Stress test: ensure clamping works regardless of extreme metric values
    const testCases = [
      { rt: 0, acc: 1.0 },
      { rt: 5000, acc: 0.0 },
      { rt: 100, acc: 0.5 },
      { rt: 900, acc: 0.72 },
      { rt: 1500, acc: 0.1 },
      { rt: 300, acc: 0.99 },
      { rt: 2500, acc: 0.05 },
      { rt: 450, acc: 0.88 },
      { rt: 1100, acc: 0.40 },
      { rt: 50, acc: 1.0 },
    ];
    for (const tc of testCases) {
      const data: GamePerformanceData[] = [{
        gameId: 'attention-sustained',
        gameName: 'Test',
        sessionDate: '2024-01-01',
        metrics: { reactionTime: tc.rt, accuracy: tc.acc },
      }];
      const scores = calculateDomainScores(data, '7-9');
      for (const value of Object.values(scores)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it('child with zero errors should never receive intervention classification', () => {
    // Why: omissionErrors=0 and commissionErrors=0 represent perfect performance.
    // Must never classify as intervention (that would be a clinical false alarm).
    const data: GamePerformanceData[] = [
      {
        gameId: 'attention-sustained',
        gameName: 'Atenção',
        sessionDate: '2024-01-01',
        metrics: { omissionErrors: 0, totalAttempts: 20, accuracy: 0.85, reactionTime: 700 },
      },
      {
        gameId: 'inhibitory-control',
        gameName: 'Inibição',
        sessionDate: '2024-01-01',
        metrics: { commissionErrors: 0, totalAttempts: 20, accuracy: 0.90, reactionTime: 600 },
      },
    ];
    const scores = calculateDomainScores(data, '7-9');
    expect(classify(scores.attention)).not.toBe('intervention');
    expect(classify(scores.inhibition)).not.toBe('intervention');
  });
});

// ════════════════════════════════════════════════════════════
// 5. detectBehaviorPatterns
// ════════════════════════════════════════════════════════════

describe('detectBehaviorPatterns', () => {
  it('detects attention difficulty when attention score < 40', () => {
    const scores: CognitiveDomainScores = {
      attention: 35, inhibition: 60, memory: 55, flexibility: 60, coordination: 50, persistence: 50,
    };
    const indicators = detectBehaviorPatterns(scores, []);
    const attentionIndicators = indicators.filter(i => i.indicator.includes('foco sustentado'));
    expect(attentionIndicators.length).toBe(1);
    expect(attentionIndicators[0].observed).toBe(true);
  });

  it('detects combined attention+inhibition pattern', () => {
    // Clinically: this pattern may indicate ADHD-like profile (not diagnosis)
    const scores: CognitiveDomainScores = {
      attention: 40, inhibition: 40, memory: 55, flexibility: 60, coordination: 50, persistence: 50,
    };
    const indicators = detectBehaviorPatterns(scores, []);
    const combined = indicators.filter(i => i.indicator.includes('desatenção e impulsividade'));
    expect(combined.length).toBe(1);
  });

  it('detects good control when both attention and inhibition are high', () => {
    const scores: CognitiveDomainScores = {
      attention: 75, inhibition: 75, memory: 55, flexibility: 60, coordination: 50, persistence: 50,
    };
    const indicators = detectBehaviorPatterns(scores, []);
    const positive = indicators.filter(i => i.indicator.includes('Bom controle'));
    expect(positive.length).toBe(1);
  });

  it('returns no negative indicators for a fully adequate profile', () => {
    const scores: CognitiveDomainScores = {
      attention: 70, inhibition: 70, memory: 70, flexibility: 70, coordination: 70, persistence: 70,
    };
    const indicators = detectBehaviorPatterns(scores, []);
    const negative = indicators.filter(i => i.indicator.includes('Dificuldade') || i.indicator.includes('Baixa'));
    expect(negative.length).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════
// 6. calculateEvolutionTrend
// ════════════════════════════════════════════════════════════

describe('calculateEvolutionTrend', () => {
  const baseline: CognitiveDomainScores = {
    attention: 50, inhibition: 50, memory: 50, flexibility: 50, coordination: 50, persistence: 50,
  };

  it('returns stable when no previous scores exist', () => {
    expect(calculateEvolutionTrend(baseline)).toBe('stable');
  });

  it('returns improving when average gain > 5 points', () => {
    const improved: CognitiveDomainScores = {
      attention: 60, inhibition: 60, memory: 60, flexibility: 60, coordination: 60, persistence: 60,
    };
    expect(calculateEvolutionTrend(improved, baseline)).toBe('improving');
  });

  it('returns declining when average loss > 5 points', () => {
    const declined: CognitiveDomainScores = {
      attention: 40, inhibition: 40, memory: 40, flexibility: 40, coordination: 40, persistence: 40,
    };
    expect(calculateEvolutionTrend(declined, baseline)).toBe('declining');
  });

  it('returns stable when change is within ±5 points', () => {
    const similar: CognitiveDomainScores = {
      attention: 53, inhibition: 48, memory: 52, flexibility: 50, coordination: 51, persistence: 49,
    };
    expect(calculateEvolutionTrend(similar, baseline)).toBe('stable');
  });
});

// ════════════════════════════════════════════════════════════
// 7. generateBehavioralProfile (integration)
// ════════════════════════════════════════════════════════════

describe('generateBehavioralProfile', () => {
  it('_validationStatus.isScientificallyValidated must be false', () => {
    // Critical: until scientific validation studies are complete,
    // every profile must carry the provisional disclaimer.
    const profile = generateBehavioralProfile('child-1', [], '7-9');
    expect(profile._validationStatus).toBeDefined();
    expect(profile._validationStatus!.isScientificallyValidated).toBe(false);
  });

  it('overall score is the mean of all 6 domain scores', () => {
    // With no data, all domains = 50, so overall should = 50
    const profile = generateBehavioralProfile('child-1', [], '7-9');
    expect(profile.overallScore).toBe(50);
  });

  it('generates strengths for high-scoring domains', () => {
    const data: GamePerformanceData[] = [{
      gameId: 'attention-sustained',
      gameName: 'Atenção',
      sessionDate: '2024-01-01',
      metrics: { reactionTime: 500, accuracy: 0.90 },
    }];
    const profile = generateBehavioralProfile('child-1', data, '7-9');
    // Attention domain should score ≥65 → should appear in strengths
    if (profile.domains.attention.score >= 65) {
      expect(profile.strengths.length).toBeGreaterThan(0);
    }
  });

  it('generates areasForDevelopment for low-scoring domains', () => {
    const data: GamePerformanceData[] = [{
      gameId: 'attention-sustained',
      gameName: 'Atenção',
      sessionDate: '2024-01-01',
      metrics: { reactionTime: 2000, accuracy: 0.20 },
    }];
    const profile = generateBehavioralProfile('child-1', data, '7-9');
    // Attention should score very low → area for development
    expect(profile.domains.attention.score).toBeLessThan(45);
    expect(profile.areasForDevelopment.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════
// 8. calculateIntraSessionVariability
// ════════════════════════════════════════════════════════════

describe('calculateIntraSessionVariability', () => {
  it('returns zeros for empty input', () => {
    const result = calculateIntraSessionVariability([]);
    expect(result.mean).toBe(0);
    expect(result.standardDeviation).toBe(0);
    expect(result.coefficientOfVariation).toBe(0);
  });

  it('returns zero SD for identical block scores', () => {
    // Clinically: perfectly consistent performance across blocks
    const result = calculateIntraSessionVariability([80, 80, 80, 80]);
    expect(result.mean).toBe(80);
    expect(result.standardDeviation).toBe(0);
    expect(result.coefficientOfVariation).toBe(0);
  });

  it('calculates correct SD for known values', () => {
    // [60, 80] → mean=70, SD=10, CV=10/70≈0.14
    const result = calculateIntraSessionVariability([60, 80]);
    expect(result.mean).toBe(70);
    expect(result.standardDeviation).toBe(10);
    expect(result.coefficientOfVariation).toBe(0.14);
  });
});
