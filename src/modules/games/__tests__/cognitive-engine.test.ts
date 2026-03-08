import { describe, it, expect } from 'vitest';
import { normalizeByAge, calculateZScore, calculateDomainScores } from '@/modules/games/cognitive-engine';
import type { GamePerformanceData } from '@/types/cognitive-analysis';

describe('Cognitive Engine', () => {
  describe('normalizeByAge', () => {
    it('returns 50 for mean value', () => {
      // 7-9 age group, reaction_time mean = 900
      const score = normalizeByAge(900, 'reaction_time', '7-9', true);
      expect(score).toBe(50);
    });

    it('returns higher score for better-than-average reaction time', () => {
      // Faster reaction time (lower is better, invertScale=true)
      const score = normalizeByAge(700, 'reaction_time', '7-9', true);
      expect(score).toBeGreaterThan(50);
    });

    it('returns lower score for worse-than-average reaction time', () => {
      const score = normalizeByAge(1100, 'reaction_time', '7-9', true);
      expect(score).toBeLessThan(50);
    });

    it('clamps to 0-100 range', () => {
      const veryLow = normalizeByAge(2000, 'reaction_time', '7-9', true);
      const veryHigh = normalizeByAge(100, 'reaction_time', '7-9', true);
      expect(veryLow).toBeGreaterThanOrEqual(0);
      expect(veryHigh).toBeLessThanOrEqual(100);
    });

    it('returns 50 for unknown metric', () => {
      const score = normalizeByAge(100, 'nonexistent_metric', '7-9');
      expect(score).toBe(50);
    });

    it('returns 50 for unknown age group', () => {
      const score = normalizeByAge(900, 'reaction_time', 'unknown');
      expect(score).toBe(50);
    });

    it('works for all age groups', () => {
      const ageGroups = ['4-6', '7-9', '10-12', '13-15', '16+'];
      for (const ag of ageGroups) {
        const score = normalizeByAge(0.72, 'accuracy', ag);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('calculateZScore', () => {
    it('returns 0 for mean value', () => {
      expect(calculateZScore(50, 50, 10)).toBe(0);
    });

    it('returns 1 for one SD above mean', () => {
      expect(calculateZScore(60, 50, 10)).toBe(1);
    });

    it('returns -2 for two SDs below mean', () => {
      expect(calculateZScore(30, 50, 10)).toBe(-2);
    });

    it('returns 0 when SD is 0', () => {
      expect(calculateZScore(100, 50, 0)).toBe(0);
    });
  });

  describe('calculateDomainScores', () => {
    it('returns default scores of 50 for empty data', () => {
      const scores = calculateDomainScores([], '7-9');
      expect(scores.attention).toBe(50);
      expect(scores.inhibition).toBe(50);
      expect(scores.memory).toBe(50);
      expect(scores.flexibility).toBe(50);
      expect(scores.coordination).toBe(50);
      expect(scores.persistence).toBe(50);
    });

    it('calculates attention score from relevant game data', () => {
      const data: GamePerformanceData[] = [
        {
          gameId: 'attention-sustained',
          gameName: 'Atenção Sustentada',
          sessionDate: '2024-01-01',
          metrics: {
            reactionTime: 700,
            accuracy: 0.85,
            omissionErrors: 2,
            totalAttempts: 20,
            reactionTimeVariability: 200,
          },
        },
      ];
      const scores = calculateDomainScores(data, '7-9');
      expect(scores.attention).toBeGreaterThan(50);
    });

    it('calculates inhibition score from go/no-go data', () => {
      const data: GamePerformanceData[] = [
        {
          gameId: 'inhibitory-control',
          gameName: 'Controle Inibitório',
          sessionDate: '2024-01-01',
          metrics: {
            commissionErrors: 1,
            totalAttempts: 20,
            reactionTime: 600,
            accuracy: 0.90,
          },
        },
      ];
      const scores = calculateDomainScores(data, '7-9');
      expect(scores.inhibition).toBeGreaterThan(50);
    });

    it('produces scores between 0 and 100', () => {
      const data: GamePerformanceData[] = [
        {
          gameId: 'attention-sustained',
          gameName: 'Test',
          sessionDate: '2024-01-01',
          metrics: { reactionTime: 500, accuracy: 0.95 },
        },
      ];
      const scores = calculateDomainScores(data, '7-9');
      for (const value of Object.values(scores)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    });
  });
});
