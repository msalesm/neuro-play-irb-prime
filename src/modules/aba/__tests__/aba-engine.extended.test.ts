import { describe, it, expect } from 'vitest';
import {
  analyzeSession,
  analyzeTrend,
  checkMastery,
  suggestPromptReduction,
  suggestReinforcementSchedule,
  PROMPT_HIERARCHY,
  PROMPT_LEVELS,
  ABA_TEACHING_METHODS,
} from '@/modules/aba/engine';
import type { TrialData, PromptLevel } from '@/modules/aba/engine';

function makeTrial(overrides: Partial<TrialData> = {}): TrialData {
  return { correct: true, promptLevel: 'independent', reinforcementGiven: true, ...overrides };
}

// ════════════════════════════════════════════════════════════
// 1. Trial recording — mastery percentage updates
// ════════════════════════════════════════════════════════════

describe('trial recording — mastery tracking', () => {
  it('accuracy increases as correct ratio improves from 1/5 to 5/5', () => {
    // Simulate progressively better sessions
    const ratios = [
      { correct: 1, total: 5 },
      { correct: 3, total: 5 },
      { correct: 5, total: 5 },
    ];
    const accuracies = ratios.map(({ correct, total }) => {
      const trials = [
        ...Array(correct).fill(null).map(() => makeTrial({ correct: true })),
        ...Array(total - correct).fill(null).map(() => makeTrial({ correct: false })),
      ];
      return analyzeSession(trials).accuracy;
    });
    // 20%, 60%, 100% — must be strictly increasing
    expect(accuracies[0]).toBeLessThan(accuracies[1]);
    expect(accuracies[1]).toBeLessThan(accuracies[2]);
    expect(accuracies[0]).toBe(20);
    expect(accuracies[1]).toBe(60);
    expect(accuracies[2]).toBe(100);
  });

  it('no-response trials (incorrect with no prompt) still count toward total', () => {
    // A "no response" is recorded as incorrect — must not be dropped
    const trials: TrialData[] = [
      makeTrial({ correct: true }),
      makeTrial({ correct: false, promptLevel: 'full_physical' }),
      makeTrial({ correct: false, promptLevel: 'full_physical' }),
    ];
    const result = analyzeSession(trials);
    expect(result.totalTrials).toBe(3);
    expect(result.accuracy).toBe(33); // 1/3 rounded
  });
});

// ════════════════════════════════════════════════════════════
// 2. Prompt fading — level decreases after high accuracy
// ════════════════════════════════════════════════════════════

describe('prompt fading logic', () => {
  it('walks through the full prompt hierarchy from full_physical to independent', () => {
    // Verify each level can be reduced one step when accuracy ≥ 80%
    const levels: PromptLevel[] = ['full_physical', 'partial_physical', 'model', 'gestural', 'positional', 'verbal'];
    const expectedNext: PromptLevel[] = ['partial_physical', 'model', 'gestural', 'positional', 'verbal', 'independent'];

    for (let i = 0; i < levels.length; i++) {
      const result = suggestPromptReduction(levels[i], 85, 80);
      expect(result.level).toBe(expectedNext[i]);
    }
  });

  it('prompt level stays same at accuracy 60% (not ready to fade)', () => {
    const result = suggestPromptReduction('gestural', 60, 40);
    expect(result.level).toBe('gestural');
  });

  it('prompt level increases at accuracy 40% (need more support)', () => {
    const result = suggestPromptReduction('verbal', 40, 20);
    expect(result.level).toBe('positional');
    expect(PROMPT_HIERARCHY[result.level]).toBeLessThan(PROMPT_HIERARCHY['verbal']);
  });
});

// ════════════════════════════════════════════════════════════
// 3. Program status transitions (mastery boundary)
// ════════════════════════════════════════════════════════════

describe('program status transitions', () => {
  it('79% accuracy across 3 sessions → NOT mastered (boundary -1)', () => {
    const sessions = Array(3).fill(null).map(() => {
      const trials = [
        ...Array(79).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'independent' })),
        ...Array(21).fill(null).map(() => makeTrial({ correct: false, promptLevel: 'independent' })),
      ];
      return analyzeSession(trials);
    });
    expect(checkMastery(sessions)).toBe(false);
  });

  it('80% accuracy + 80% independence across 3 sessions → mastered (exact boundary)', () => {
    const sessions = Array(3).fill(null).map(() => {
      const trials = [
        ...Array(80).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'independent' })),
        ...Array(20).fill(null).map(() => makeTrial({ correct: false, promptLevel: 'independent' })),
      ];
      return analyzeSession(trials);
    });
    expect(checkMastery(sessions)).toBe(true);
  });

  it('90% accuracy but only 2 sessions → NOT mastered (needs 3 consecutive)', () => {
    const sessions = Array(2).fill(null).map(() => {
      const trials = Array(100).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'independent' }));
      return analyzeSession(trials);
    });
    expect(checkMastery(sessions)).toBe(false);
  });

  it('high accuracy but low independence → NOT mastered', () => {
    // 95% correct but all with verbal prompts → independenceRate = 0%
    const sessions = Array(3).fill(null).map(() => {
      const trials = [
        ...Array(95).fill(null).map(() => makeTrial({ correct: true, promptLevel: 'verbal' })),
        ...Array(5).fill(null).map(() => makeTrial({ correct: false, promptLevel: 'verbal' })),
      ];
      return analyzeSession(trials);
    });
    expect(checkMastery(sessions)).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════
// 4. Session summary — correct_rate accuracy
// ════════════════════════════════════════════════════════════

describe('session summary — correct_rate precision', () => {
  it('0/10 = 0%', () => {
    const trials = Array(10).fill(null).map(() => makeTrial({ correct: false }));
    expect(analyzeSession(trials).accuracy).toBe(0);
  });

  it('10/10 = 100%', () => {
    const trials = Array(10).fill(null).map(() => makeTrial({ correct: true }));
    expect(analyzeSession(trials).accuracy).toBe(100);
  });

  it('3/10 = 30%', () => {
    const trials = [
      ...Array(3).fill(null).map(() => makeTrial({ correct: true })),
      ...Array(7).fill(null).map(() => makeTrial({ correct: false })),
    ];
    expect(analyzeSession(trials).accuracy).toBe(30);
  });

  it('1/3 = 33% (rounds down from 33.33)', () => {
    const trials = [
      makeTrial({ correct: true }),
      makeTrial({ correct: false }),
      makeTrial({ correct: false }),
    ];
    expect(analyzeSession(trials).accuracy).toBe(33);
  });

  it('2/3 = 67% (rounds up from 66.67)', () => {
    const trials = [
      makeTrial({ correct: true }),
      makeTrial({ correct: true }),
      makeTrial({ correct: false }),
    ];
    expect(analyzeSession(trials).accuracy).toBe(67);
  });
});

// ════════════════════════════════════════════════════════════
// 5. Trend detection edge cases
// ════════════════════════════════════════════════════════════

describe('trend detection edge cases', () => {
  it('all sessions identical → stable', () => {
    expect(analyzeTrend([50, 50, 50, 50, 50, 50])).toBe('stable');
  });

  it('single session → stable (insufficient data)', () => {
    expect(analyzeTrend([80])).toBe('stable');
  });

  it('exactly 3 sessions improving → stable (no earlier window to compare)', () => {
    // With exactly 3, earlier slice is empty → stable
    expect(analyzeTrend([60, 70, 80])).toBe('stable');
  });

  it('4 sessions with big jump in last 3 → up', () => {
    expect(analyzeTrend([40, 70, 75, 80])).toBe('up');
  });
});

// ════════════════════════════════════════════════════════════
// 6. Reinforcement schedule transitions
// ════════════════════════════════════════════════════════════

describe('reinforcement schedule transitions', () => {
  it('low accuracy + many sessions → still continuous (struggling learner)', () => {
    const result = suggestReinforcementSchedule(40, 20, 20);
    expect(result.type).toBe('continuous');
  });

  it('high accuracy + high independence + many sessions → variable ratio', () => {
    const result = suggestReinforcementSchedule(95, 90, 20);
    expect(result.type).toBe('variable_ratio');
    expect(result.ratio).toBe(3);
  });

  it('moderate accuracy mid-sessions → fixed ratio', () => {
    const result = suggestReinforcementSchedule(75, 60, 10);
    expect(result.type).toBe('fixed_ratio');
    expect(result.ratio).toBe(2);
  });
});

// ════════════════════════════════════════════════════════════
// 7. Constants integrity
// ════════════════════════════════════════════════════════════

describe('constants integrity', () => {
  it('PROMPT_HIERARCHY has 7 levels from 1 to 7', () => {
    expect(Object.keys(PROMPT_HIERARCHY)).toHaveLength(7);
    const values = Object.values(PROMPT_HIERARCHY).sort((a, b) => a - b);
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('PROMPT_LEVELS matches PROMPT_HIERARCHY keys', () => {
    const hierarchyKeys = Object.keys(PROMPT_HIERARCHY).sort();
    const levels = [...PROMPT_LEVELS].sort();
    expect(levels).toEqual(hierarchyKeys);
  });

  it('ABA_TEACHING_METHODS includes DTT and NET', () => {
    expect(ABA_TEACHING_METHODS).toContain('DTT');
    expect(ABA_TEACHING_METHODS).toContain('NET');
  });
});
