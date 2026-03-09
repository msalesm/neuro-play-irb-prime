import { describe, it, expect } from 'vitest';
import {
  analyzeSession,
  analyzeTrend,
  checkMastery,
  suggestPromptReduction,
  suggestReinforcementSchedule,
  PROMPT_HIERARCHY,
} from '@/modules/aba/engine';
import type { TrialData } from '@/modules/aba/engine';

// ─── Helpers ──────────────────────────────────────────────

function makeTrial(overrides: Partial<TrialData> = {}): TrialData {
  return {
    correct: true,
    promptLevel: 'independent',
    reinforcementGiven: true,
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════
// 1. analyzeSession
// ════════════════════════════════════════════════════════════

describe('analyzeSession', () => {
  it('returns zeros for empty trial list (no data = no analysis)', () => {
    const result = analyzeSession([]);
    expect(result.totalTrials).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.independenceRate).toBe(0);
    expect(result.averagePromptLevel).toBe(0);
  });

  it('correct_rate = 7/10 = 70% exactly', () => {
    // Why: 7 correct out of 10 trials should give exactly 70% accuracy.
    // This tests the fundamental correct_rate calculation used in ABA reporting.
    const trials: TrialData[] = [
      ...Array(7).fill(null).map(() => makeTrial({ correct: true })),
      ...Array(3).fill(null).map(() => makeTrial({ correct: false })),
    ];
    const result = analyzeSession(trials);
    expect(result.totalTrials).toBe(10);
    expect(result.correctTrials).toBe(7);
    expect(result.accuracy).toBe(70);
  });

  it('100% independence rate when all trials are independent', () => {
    // Clinically: learner has mastered the skill without prompts
    const trials = Array(5).fill(null).map(() => makeTrial({ promptLevel: 'independent' }));
    const result = analyzeSession(trials);
    expect(result.independenceRate).toBe(100);
  });

  it('0% independence rate when all trials use full physical prompt', () => {
    // Clinically: learner still requires maximum support
    const trials = Array(5).fill(null).map(() => makeTrial({ promptLevel: 'full_physical' }));
    const result = analyzeSession(trials);
    expect(result.independenceRate).toBe(0);
  });

  it('average prompt level reflects the hierarchy values', () => {
    // 3 independent (7) + 2 verbal (6) → avg = (7*3+6*2)/5 = 33/5 = 6.6
    const trials: TrialData[] = [
      ...Array(3).fill(null).map(() => makeTrial({ promptLevel: 'independent' })),
      ...Array(2).fill(null).map(() => makeTrial({ promptLevel: 'verbal' })),
    ];
    const result = analyzeSession(trials);
    expect(result.averagePromptLevel).toBe(6.6);
  });

  it('reinforcement rate = 80% when 4/5 trials reinforced', () => {
    const trials: TrialData[] = [
      ...Array(4).fill(null).map(() => makeTrial({ reinforcementGiven: true })),
      makeTrial({ reinforcementGiven: false }),
    ];
    const result = analyzeSession(trials);
    expect(result.reinforcementRate).toBe(80);
  });

  it('computes average latency only from trials with latency data', () => {
    // Why: not all trials have latency. Engine should ignore undefined latencies.
    const trials: TrialData[] = [
      makeTrial({ latencyMs: 1000 }),
      makeTrial({ latencyMs: 2000 }),
      makeTrial({}), // no latency
    ];
    const result = analyzeSession(trials);
    expect(result.averageLatencyMs).toBe(1500);
  });
});

// ════════════════════════════════════════════════════════════
// 2. analyzeTrend
// ════════════════════════════════════════════════════════════

describe('analyzeTrend', () => {
  it('returns stable with fewer than 3 sessions (insufficient data)', () => {
    expect(analyzeTrend([50, 60])).toBe('stable');
  });

  it('detects upward trend when recent sessions improve by >10 points', () => {
    // Clinically: learner is acquiring the skill, accuracy is rising
    expect(analyzeTrend([40, 45, 50, 70, 75, 80])).toBe('up');
  });

  it('detects downward trend when recent sessions regress by >10 points', () => {
    // Clinically: regression — possible maintenance failure
    expect(analyzeTrend([80, 75, 70, 50, 45, 40])).toBe('down');
  });

  it('returns stable when recent and earlier averages are close', () => {
    expect(analyzeTrend([70, 72, 68, 71, 69, 70])).toBe('stable');
  });
});

// ════════════════════════════════════════════════════════════
// 3. checkMastery
// ════════════════════════════════════════════════════════════

describe('checkMastery', () => {
  it('returns false with fewer sessions than consecutiveSessions threshold', () => {
    // Only 2 sessions, threshold requires 3
    const sessions = [
      analyzeSession(Array(10).fill(null).map(() => makeTrial())),
      analyzeSession(Array(10).fill(null).map(() => makeTrial())),
    ];
    expect(checkMastery(sessions)).toBe(false);
  });

  it('mastery NOT reached when accuracy=79% (below 80% threshold)', () => {
    // Why: boundary test. 79% should NOT trigger mastery.
    // Clinically: the learner is close but hasn't met criterion yet.
    const sessions = Array(3).fill(null).map(() => {
      const trials: TrialData[] = [
        ...Array(79).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'independent' })),
        ...Array(21).fill(null).map(() => makeTrial({ correct: false, promptLevel: 'independent' })),
      ];
      return analyzeSession(trials);
    });
    // accuracy = 79%, independenceRate = 100%
    // With default threshold of 80%, mastery should NOT be reached
    expect(checkMastery(sessions)).toBe(false);
  });

  it('mastery reached when accuracy=80% and independence=80% for 3 sessions', () => {
    // Why: exact boundary — 80% meets the ≥80% threshold.
    const sessions = Array(3).fill(null).map(() => {
      const trials: TrialData[] = [
        ...Array(80).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'independent' })),
        ...Array(20).fill(null).map(() => makeTrial({ correct: false, promptLevel: 'independent' })),
      ];
      return analyzeSession(trials);
    });
    expect(checkMastery(sessions)).toBe(true);
  });

  it('mastery fails if independence is below threshold even with high accuracy', () => {
    // Clinically: child gets answers right but still needs prompts → not mastered
    const sessions = Array(3).fill(null).map(() => {
      const trials: TrialData[] = [
        ...Array(90).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'verbal' })), // not independent!
        ...Array(10).fill(null).map(() => makeTrial({ correct: false, promptLevel: 'verbal' })),
      ];
      return analyzeSession(trials);
    });
    // accuracy = 90%, but independenceRate = 0%
    expect(checkMastery(sessions)).toBe(false);
  });

  it('supports custom mastery criteria', () => {
    const sessions = Array(5).fill(null).map(() => {
      const trials = Array(20).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'independent' }));
      return analyzeSession(trials);
    });
    // Custom: 90% accuracy, 90% independence, 5 consecutive sessions
    expect(checkMastery(sessions, {
      accuracyThreshold: 90,
      independenceThreshold: 90,
      consecutiveSessions: 5,
    })).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════
// 4. suggestPromptReduction
// ════════════════════════════════════════════════════════════

describe('suggestPromptReduction', () => {
  it('suggests reducing prompt when accuracy ≥80%', () => {
    // Clinically: learner is succeeding at current prompt → fade to next level
    const result = suggestPromptReduction('verbal', 85, 80);
    expect(result.level).toBe('independent');
    expect(PROMPT_HIERARCHY[result.level]).toBeGreaterThan(PROMPT_HIERARCHY['verbal']);
  });

  it('suggests increasing prompt when accuracy <50%', () => {
    // Clinically: too many errors at current level → increase support temporarily
    const result = suggestPromptReduction('gestural', 30, 20);
    expect(result.level).toBe('model');
    expect(PROMPT_HIERARCHY[result.level]).toBeLessThan(PROMPT_HIERARCHY['gestural']);
  });

  it('maintains current prompt when accuracy is between 50-79%', () => {
    // Clinically: learner is progressing but not ready for fading
    const result = suggestPromptReduction('model', 65, 50);
    expect(result.level).toBe('model');
  });

  it('does not go below full_physical (floor)', () => {
    const result = suggestPromptReduction('full_physical', 30, 10);
    expect(result.level).toBe('full_physical');
  });

  it('does not go above independent (ceiling)', () => {
    const result = suggestPromptReduction('independent', 95, 95);
    expect(result.level).toBe('independent');
  });
});

// ════════════════════════════════════════════════════════════
// 5. suggestReinforcementSchedule
// ════════════════════════════════════════════════════════════

describe('suggestReinforcementSchedule', () => {
  it('recommends continuous reinforcement in early learning (< 5 sessions)', () => {
    // Clinically: acquisition phase requires every correct response reinforced
    const result = suggestReinforcementSchedule(70, 50, 3);
    expect(result.type).toBe('continuous');
    expect(result.ratio).toBe(1);
  });

  it('recommends continuous reinforcement when accuracy < 60%', () => {
    const result = suggestReinforcementSchedule(45, 30, 10);
    expect(result.type).toBe('continuous');
  });

  it('recommends variable ratio for maintenance phase (high accuracy + independence)', () => {
    // Clinically: skill is maintained, thin the schedule to prevent satiation
    const result = suggestReinforcementSchedule(90, 85, 15);
    expect(result.type).toBe('variable_ratio');
    expect(result.ratio).toBe(3);
  });

  it('recommends fixed ratio for intermediate phase', () => {
    // Clinically: fluency building — moderate schedule
    const result = suggestReinforcementSchedule(70, 60, 8);
    expect(result.type).toBe('fixed_ratio');
    expect(result.ratio).toBe(2);
  });
});

// ════════════════════════════════════════════════════════════
// 6. Mastery progression and regression
// ════════════════════════════════════════════════════════════

describe('mastery progression and regression', () => {
  it('accuracy increases as consecutive correct trials accumulate', () => {
    // Simulate adding one correct trial at a time and checking accuracy grows
    const accuracies: number[] = [];
    for (let n = 1; n <= 5; n++) {
      const trials = Array(n).fill(null).map(() => makeTrial({ correct: true }));
      const result = analyzeSession(trials);
      accuracies.push(result.accuracy);
    }
    // All should be 100% since every trial is correct
    expect(accuracies.every(a => a === 100)).toBe(true);
  });

  it('accuracy drops when incorrect trials are added after mastery', () => {
    // 5 correct then 3 incorrect → accuracy = 5/8 = 62.5 → rounds to 63%
    const trials: TrialData[] = [
      ...Array(5).fill(null).map(() => makeTrial({ correct: true })),
      ...Array(3).fill(null).map(() => makeTrial({ correct: false })),
    ];
    const result = analyzeSession(trials);
    expect(result.accuracy).toBeLessThan(100);
    expect(result.accuracy).toBe(63); // 5/8 rounded
  });

  it('trend detects regression after mastery period', () => {
    // Sessions: 90, 90, 90, 60, 55, 50 → earlier avg=90, recent avg≈55 → down
    const trend = analyzeTrend([90, 90, 90, 60, 55, 50]);
    expect(trend).toBe('down');
  });
});
