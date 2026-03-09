import { describe, it, expect } from 'vitest';
import { generateUnifiedProfile } from '@/modules/behavioral/engine';
import type { ProfileDataSources } from '@/modules/behavioral/engine';

// ════════════════════════════════════════════════════════════
// 1. generateUnifiedProfile — cognitive domains
// ════════════════════════════════════════════════════════════

describe('generateUnifiedProfile', () => {
  it('returns default 50 scores when no data sources provided', () => {
    // Why: with no game data, all cognitive scores default to 50 (neutral baseline)
    const profile = generateUnifiedProfile('child-1', {});
    expect(profile.cognitive.attention.score).toBe(50);
    expect(profile.cognitive.memory.score).toBe(50);
    expect(profile.overallScore).toBe(50);
    expect(profile.dataCompleteness).toBe(0);
  });

  it('attention index above 80 with perfect game data (accuracy=1.0)', () => {
    // Why: accuracy=1.0 means 100% correct → score should be very high.
    // Clinically: a child with perfect accuracy demonstrates excellent attention.
    const sources: ProfileDataSources = {
      gameMetrics: [
        { gameId: 'attention-sustained', date: '2024-01-01', metrics: { accuracy: 1.0 } },
      ],
    };
    const profile = generateUnifiedProfile('child-1', sources);
    // accuracy 1.0 → 100 → attention score = 100
    expect(profile.cognitive.attention.score).toBeGreaterThanOrEqual(80);
  });

  it('attention index below 40 with poor game data (accuracy=0.2)', () => {
    // Why: accuracy=0.2 means only 20% correct → weak attention
    const sources: ProfileDataSources = {
      gameMetrics: [
        { gameId: 'attention-sustained', date: '2024-01-01', metrics: { accuracy: 0.2 } },
      ],
    };
    const profile = generateUnifiedProfile('child-1', sources);
    // accuracy 0.2 → 20 → attention score = 20
    expect(profile.cognitive.attention.score).toBeLessThanOrEqual(40);
  });

  it('all domain scores are clamped between 0 and 100 with extreme inputs', () => {
    // Stress test: inputs designed to overflow the 0-100 range
    const extremeCases: ProfileDataSources[] = [
      // Very high accuracy
      { gameMetrics: [{ gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 5.0 } }] },
      // Very low (negative) accuracy — shouldn't happen but must be safe
      { gameMetrics: [{ gameId: 'g1', date: '2024-01-01', metrics: { accuracy: -1.0 } }] },
      // Zero accuracy
      { gameMetrics: [{ gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.0 } }] },
    ];

    for (const sources of extremeCases) {
      const profile = generateUnifiedProfile('child-1', sources);
      const allScores = [
        ...Object.values(profile.cognitive).map(d => d.score),
        ...Object.values(profile.socioemotional).map(d => d.score),
        ...Object.values(profile.executive).map(d => d.score),
      ];
      for (const score of allScores) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });
});

// ════════════════════════════════════════════════════════════
// 2. Domain classification
// ════════════════════════════════════════════════════════════

describe('domain classification', () => {
  it('score ≥75 classifies as adequate', () => {
    const sources: ProfileDataSources = {
      gameMetrics: [
        { gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.80 } },
      ],
    };
    const profile = generateUnifiedProfile('child-1', sources);
    // accuracy 0.80 → 80 → score=80 → adequate (threshold is 75)
    expect(profile.cognitive.attention.classification).toBe('adequate');
  });

  it('score <25 classifies as intervention', () => {
    const sources: ProfileDataSources = {
      gameMetrics: [
        { gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.15 } },
      ],
    };
    const profile = generateUnifiedProfile('child-1', sources);
    // accuracy 0.15 → 15 → intervention (threshold <25)
    expect(profile.cognitive.attention.classification).toBe('intervention');
  });
});

// ════════════════════════════════════════════════════════════
// 3. Socioemotional domains
// ════════════════════════════════════════════════════════════

describe('socioemotional domain scoring', () => {
  it('maps storyMetrics scores directly to domain scores', () => {
    const sources: ProfileDataSources = {
      storyMetrics: {
        empathyScore: 85,
        impulseControlScore: 70,
        socialFlexibilityScore: 60,
        frustrationToleranceScore: 40,
        overallScore: 65,
        totalDecisions: 10,
      },
    };
    const profile = generateUnifiedProfile('child-1', sources);
    expect(profile.socioemotional.empathy.score).toBe(85);
    expect(profile.socioemotional.impulseControl.score).toBe(70);
    expect(profile.socioemotional.frustrationTolerance.score).toBe(40);
  });
});

// ════════════════════════════════════════════════════════════
// 4. Data completeness
// ════════════════════════════════════════════════════════════

describe('data completeness', () => {
  it('completeness = 0 with no sources', () => {
    const profile = generateUnifiedProfile('child-1', {});
    expect(profile.dataCompleteness).toBe(0);
  });

  it('completeness = 0.25 with only game data', () => {
    const profile = generateUnifiedProfile('child-1', {
      gameMetrics: [{ gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.7 } }],
    });
    expect(profile.dataCompleteness).toBe(0.25);
  });

  it('completeness = 1.0 with all four sources', () => {
    const profile = generateUnifiedProfile('child-1', {
      gameMetrics: [{ gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.7 } }],
      storyMetrics: {
        empathyScore: 70, impulseControlScore: 70, socialFlexibilityScore: 70,
        frustrationToleranceScore: 70, overallScore: 70, totalDecisions: 5,
      },
      routineMetrics: {
        organizationIndex: 70, autonomyScore: 70, avgLatencySeconds: 30,
        completionRate: 80, totalExecutions: 10,
      },
      abaData: { independencePercentage: 75, activePrograms: 3, masteredSkills: 2, trend: 'up' },
    });
    expect(profile.dataCompleteness).toBe(1);
  });
});

// ════════════════════════════════════════════════════════════
// 5. Strengths and areas for development
// ════════════════════════════════════════════════════════════

describe('strengths and areas for development', () => {
  it('identifies high-scoring domains as strengths', () => {
    const sources: ProfileDataSources = {
      gameMetrics: [
        { gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.90 } },
      ],
    };
    const profile = generateUnifiedProfile('child-1', sources);
    // accuracy 90 → attention=90 (≥70) → should be a strength
    expect(profile.strengths.length).toBeGreaterThan(0);
  });

  it('identifies low-scoring domains as areas for development', () => {
    const sources: ProfileDataSources = {
      gameMetrics: [
        { gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.30 } },
      ],
    };
    const profile = generateUnifiedProfile('child-1', sources);
    // accuracy 30 → scores around 30 (<50) → areas for development
    expect(profile.areasForDevelopment.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════
// 6. Recommendations
// ════════════════════════════════════════════════════════════

describe('recommendations', () => {
  it('always returns at least one recommendation', () => {
    const profile = generateUnifiedProfile('child-1', {});
    expect(profile.recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it('generates attention-specific recommendation for low attention scores', () => {
    const sources: ProfileDataSources = {
      gameMetrics: [
        { gameId: 'g1', date: '2024-01-01', metrics: { accuracy: 0.10 } },
      ],
    };
    const profile = generateUnifiedProfile('child-1', sources);
    // Very low accuracy → attention in intervention → specific recommendation
    const hasAttentionRec = profile.recommendations.some(r => r.includes('atenção'));
    expect(hasAttentionRec).toBe(true);
  });
});
