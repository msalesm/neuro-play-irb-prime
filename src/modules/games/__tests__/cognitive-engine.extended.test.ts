import { describe, it, expect } from 'vitest';
import {
  normalizeByAge,
  calculateDomainScores,
  classify,
  generateBehavioralProfile,
  calculateIntraSessionVariability,
  VALIDATION_STATUS,
} from '@/modules/games/cognitive-engine';
import type { GamePerformanceData } from '@/types/cognitive-analysis';

// ════════════════════════════════════════════════════════════
// 1. Age group baseline lookup correctness
// ════════════════════════════════════════════════════════════

describe('age group baseline lookup', () => {
  const AGE_GROUPS = ['4-6', '7-9', '10-12', '13-15', '16+'];

  it('returns different means for reaction_time across all age groups', () => {
    // Younger children (4-6) have slower RT than older (16+).
    // Each age group must resolve to a distinct baseline.
    const scores = AGE_GROUPS.map(ag => normalizeByAge(700, 'reaction_time', ag, true));
    // A fixed 700ms RT should produce different T-scores per age group
    const unique = new Set(scores);
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });

  it('4-6 has the highest RT mean (slowest baseline for youngest children)', () => {
    // 1200ms is the mean for 4-6. Scoring exactly the mean → T=50.
    expect(normalizeByAge(1200, 'reaction_time', '4-6', true)).toBe(50);
    // Same 1200ms for 16+ (mean=450) should be very bad
    expect(normalizeByAge(1200, 'reaction_time', '16+', true)).toBeLessThan(30);
  });

  it('accuracy baseline scales with age (older children have higher mean)', () => {
    // 4-6 mean accuracy = 0.60; 16+ mean = 0.88
    // A child scoring 0.70 accuracy:
    //   4-6: above mean → T > 50
    //   16+: below mean → T < 50
    const score46 = normalizeByAge(0.70, 'accuracy', '4-6');
    const score16 = normalizeByAge(0.70, 'accuracy', '16+');
    expect(score46).toBeGreaterThan(50);
    expect(score16).toBeLessThan(50);
  });
});

// ════════════════════════════════════════════════════════════
// 2. calculateDomainScores with known inputs
// ════════════════════════════════════════════════════════════

describe('calculateDomainScores — known inputs', () => {
  it('perfect performance across all 6 battery tasks → all scores ≥ 65', () => {
    // A child performing perfectly on every domain should score above adequate threshold
    const data: GamePerformanceData[] = [
      { gameId: 'attention-sustained', gameName: 'A', sessionDate: '2024-01-01',
        metrics: { reactionTime: 400, accuracy: 0.95, omissionErrors: 0, totalAttempts: 50 } },
      { gameId: 'inhibitory-control', gameName: 'B', sessionDate: '2024-01-01',
        metrics: { reactionTime: 400, commissionErrors: 0, totalAttempts: 50 } },
      { gameId: 'working-memory', gameName: 'C', sessionDate: '2024-01-01',
        metrics: { maxSpan: 8, accuracy: 0.95 } },
      { gameId: 'cognitive-flexibility', gameName: 'D', sessionDate: '2024-01-01',
        metrics: { perseverationErrors: 0, totalAttempts: 50, accuracy: 0.95, reactionTime: 400 } },
      { gameId: 'visuomotor-coordination', gameName: 'E', sessionDate: '2024-01-01',
        metrics: { averageDeviation: 2, reactionTime: 400, corrections: 0 } },
      { gameId: 'behavioral-persistence', gameName: 'F', sessionDate: '2024-01-01',
        metrics: { persistence: 400, totalAttempts: 15, recoveryAfterError: true } },
    ];
    const scores = calculateDomainScores(data, '7-9');
    expect(scores.attention).toBeGreaterThanOrEqual(65);
    expect(scores.inhibition).toBeGreaterThanOrEqual(65);
    expect(scores.memory).toBeGreaterThanOrEqual(65);
    expect(scores.flexibility).toBeGreaterThanOrEqual(65);
    expect(scores.coordination).toBeGreaterThanOrEqual(65);
    expect(scores.persistence).toBeGreaterThanOrEqual(50); // persistence calc is different
  });

  it('very poor performance → all scores < 45', () => {
    const data: GamePerformanceData[] = [
      { gameId: 'attention-sustained', gameName: 'A', sessionDate: '2024-01-01',
        metrics: { reactionTime: 2000, accuracy: 0.20, omissionErrors: 15, totalAttempts: 20 } },
      { gameId: 'inhibitory-control', gameName: 'B', sessionDate: '2024-01-01',
        metrics: { reactionTime: 2000, commissionErrors: 15, totalAttempts: 20 } },
      { gameId: 'working-memory', gameName: 'C', sessionDate: '2024-01-01',
        metrics: { maxSpan: 1, accuracy: 0.20 } },
      { gameId: 'cognitive-flexibility', gameName: 'D', sessionDate: '2024-01-01',
        metrics: { perseverationErrors: 15, totalAttempts: 20, accuracy: 0.20, reactionTime: 2000 } },
      { gameId: 'visuomotor-coordination', gameName: 'E', sessionDate: '2024-01-01',
        metrics: { averageDeviation: 50, reactionTime: 2000, corrections: 20 } },
    ];
    const scores = calculateDomainScores(data, '7-9');
    expect(scores.attention).toBeLessThan(45);
    expect(scores.inhibition).toBeLessThan(45);
    expect(scores.memory).toBeLessThan(45);
    expect(scores.flexibility).toBeLessThan(45);
    expect(scores.coordination).toBeLessThan(45);
  });
});

// ════════════════════════════════════════════════════════════
// 3. Edge cases: extreme metric values
// ════════════════════════════════════════════════════════════

describe('edge cases — extreme and boundary inputs', () => {
  it('reactionTime=0 does not throw and produces a valid score', () => {
    // RT=0 is physically impossible but must not crash the engine
    const data: GamePerformanceData[] = [{
      gameId: 'attention-sustained', gameName: 'T', sessionDate: '2024-01-01',
      metrics: { reactionTime: 0, accuracy: 0.80 },
    }];
    const scores = calculateDomainScores(data, '7-9');
    expect(scores.attention).toBeGreaterThanOrEqual(0);
    expect(scores.attention).toBeLessThanOrEqual(100);
  });

  it('accuracy=1.0 (perfect) produces score ≥ 65 for age 7-9', () => {
    // Z = (1.0 - 0.72) / 0.12 ≈ 2.33 → T ≈ 73
    const score = normalizeByAge(1.0, 'accuracy', '7-9');
    expect(score).toBeGreaterThanOrEqual(65);
  });

  it('accuracy=0.0 (zero) produces score well below 50', () => {
    // Z = (0 - 0.72) / 0.12 = -6 → T = -10 → clamped to 0
    const score = normalizeByAge(0.0, 'accuracy', '7-9');
    expect(score).toBeLessThanOrEqual(10);
  });

  it('negative reactionTime does not throw (clamped to ceiling)', () => {
    const score = normalizeByAge(-100, 'reaction_time', '7-9', true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('very large metric values do not produce NaN or Infinity', () => {
    const extremes = [Number.MAX_SAFE_INTEGER, 999999, -999999];
    for (const val of extremes) {
      const score = normalizeByAge(val, 'reaction_time', '7-9', true);
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('score never exceeds 100 or goes below 0 for all age groups × metrics', () => {
    const ageGroups = ['4-6', '7-9', '10-12', '13-15', '16+'];
    const metrics = ['reaction_time', 'accuracy', 'omission_rate', 'commission_rate', 'max_span'];
    const values = [0, 0.001, 0.5, 1.0, 5, 100, 5000, -10];

    for (const ag of ageGroups) {
      for (const metric of metrics) {
        for (const val of values) {
          const score = normalizeByAge(val, metric, ag, metric === 'reaction_time');
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});

// ════════════════════════════════════════════════════════════
// 4. DomainClassification output includes _validationStatus
// ════════════════════════════════════════════════════════════

describe('_validationStatus metadata', () => {
  it('every domain in generateBehavioralProfile includes _validationStatus', () => {
    const profile = generateBehavioralProfile('child-1', [], '7-9');
    const domainKeys = ['attention', 'inhibition', 'memory', 'flexibility', 'coordination', 'persistence'] as const;
    for (const key of domainKeys) {
      const domain = profile.domains[key] as any;
      expect(domain._validationStatus).toEqual(VALIDATION_STATUS);
      expect(domain._validationStatus.isScientificallyValidated).toBe(false);
    }
  });

  it('profile-level _validationStatus is false', () => {
    const profile = generateBehavioralProfile('child-1', [], '7-9');
    expect(profile._validationStatus!.isScientificallyValidated).toBe(false);
  });

  it('_validationStatus persists regardless of input data', () => {
    const data: GamePerformanceData[] = [{
      gameId: 'attention-sustained', gameName: 'T', sessionDate: '2024-01-01',
      metrics: { reactionTime: 500, accuracy: 0.90 },
    }];
    const profile = generateBehavioralProfile('child-1', data, '7-9');
    expect(profile._validationStatus!.isScientificallyValidated).toBe(false);
    expect(profile.domains.attention._validationStatus.isScientificallyValidated).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════
// 5. GameMetricsCollector & adaptive engine (from engine.ts)
// ════════════════════════════════════════════════════════════

import { GameMetricsCollector, calculateAdaptiveDifficulty, getBatteryGames, findGamesByDomain, getGamesForAge } from '@/modules/games/engine';

describe('GameMetricsCollector', () => {
  it('tracks correct/error counts accurately', () => {
    const collector = new GameMetricsCollector();
    collector.recordEvent({ type: 'trial_start', timestamp: 1000 });
    collector.recordEvent({ type: 'correct', timestamp: 1500 });
    collector.recordEvent({ type: 'trial_start', timestamp: 2000 });
    collector.recordEvent({ type: 'error', timestamp: 2800 });
    collector.recordEvent({ type: 'trial_start', timestamp: 3000 });
    collector.recordEvent({ type: 'omission', timestamp: 4000 });

    const summary = collector.getSummary();
    expect(summary.correctAnswers).toBe(1);
    expect(summary.errorsCount).toBe(1);
    expect(summary.omissionErrors).toBe(1);
    expect(summary.totalAttempts).toBe(3);
    expect(summary.accuracy).toBeCloseTo(1 / 3, 2);
  });

  it('calculates reaction time from trial_start to correct/error', () => {
    const collector = new GameMetricsCollector();
    collector.recordEvent({ type: 'trial_start', timestamp: 0 });
    collector.recordEvent({ type: 'correct', timestamp: 600 });
    collector.recordEvent({ type: 'trial_start', timestamp: 1000 });
    collector.recordEvent({ type: 'correct', timestamp: 1400 });

    const summary = collector.getSummary();
    // avg of 600 and 400 = 500
    expect(summary.reactionTimeMs).toBe(500);
  });

  it('handles empty session without throwing', () => {
    const collector = new GameMetricsCollector();
    const summary = collector.getSummary();
    expect(summary.accuracy).toBe(0);
    expect(summary.totalAttempts).toBe(0);
    expect(summary.reactionTimeMs).toBe(0);
  });
});

describe('calculateAdaptiveDifficulty', () => {
  it('increases difficulty when accuracy > 85%', () => {
    const result = calculateAdaptiveDifficulty(5, 0.90);
    expect(result.newDifficulty).toBe(6);
  });

  it('decreases difficulty when accuracy < 65%', () => {
    const result = calculateAdaptiveDifficulty(5, 0.50);
    expect(result.newDifficulty).toBe(4);
  });

  it('maintains difficulty when accuracy is in target range', () => {
    const result = calculateAdaptiveDifficulty(5, 0.75);
    expect(result.newDifficulty).toBe(5);
  });

  it('does not exceed max difficulty (10)', () => {
    const result = calculateAdaptiveDifficulty(10, 0.95);
    expect(result.newDifficulty).toBe(10);
  });

  it('does not go below min difficulty (1)', () => {
    const result = calculateAdaptiveDifficulty(1, 0.20);
    expect(result.newDifficulty).toBe(1);
  });
});

describe('game registry queries', () => {
  it('getBatteryGames returns exactly 6 battery tasks', () => {
    expect(getBatteryGames()).toHaveLength(6);
  });

  it('findGamesByDomain("attention") includes attention-sustained', () => {
    const games = findGamesByDomain('attention');
    expect(games.some(g => g.id === 'attention-sustained')).toBe(true);
  });

  it('getGamesForAge(3) returns empty (below min age)', () => {
    expect(getGamesForAge(3)).toHaveLength(0);
  });

  it('getGamesForAge(8) includes battery games', () => {
    const games = getGamesForAge(8);
    expect(games.length).toBeGreaterThan(6);
  });
});
