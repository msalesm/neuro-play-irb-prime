import { describe, it, expect } from 'vitest';
import {
  computeCognitiveScores,
  computeTrend,
  computeStrengthsChallenges,
  computeStudentProgress,
  computeClassStats,
} from '@/modules/school/class-analytics-engine';

describe('class-analytics-engine', () => {
  describe('computeCognitiveScores', () => {
    it('returns baseline scores when no sessions', () => {
      const scores = computeCognitiveScores(0, 0);
      expect(scores.attention).toBe(50);
      expect(scores.memory).toBe(50);
    });

    it('never uses Math.random', () => {
      const a = computeCognitiveScores(75, 20);
      const b = computeCognitiveScores(75, 20);
      expect(a).toEqual(b); // deterministic
    });

    it('scales with accuracy and session count', () => {
      const low = computeCognitiveScores(30, 20);
      const high = computeCognitiveScores(90, 20);
      expect(high.attention).toBeGreaterThan(low.attention);
    });

    it('blends with baseline when few sessions', () => {
      const few = computeCognitiveScores(90, 2);
      const many = computeCognitiveScores(90, 30);
      // With few sessions, score should be closer to baseline (50)
      expect(few.attention).toBeLessThan(many.attention);
    });
  });

  describe('computeTrend', () => {
    it('returns stable with few data points', () => {
      expect(computeTrend([80, 75, 70])).toBe('stable');
    });

    it('detects upward trend', () => {
      expect(computeTrend([90, 88, 85, 82, 80, 60, 55, 50, 45, 40])).toBe('up');
    });

    it('detects downward trend', () => {
      expect(computeTrend([40, 45, 50, 55, 60, 80, 85, 88, 90, 92])).toBe('down');
    });
  });

  describe('computeStrengthsChallenges', () => {
    it('identifies strengths above 70', () => {
      const { strengths } = computeStrengthsChallenges({
        attention: 80, memory: 40, language: 60, executive: 75,
      });
      expect(strengths).toContain('Atenção');
      expect(strengths).toContain('Funções Executivas');
      expect(strengths).not.toContain('Memória');
    });

    it('identifies challenges below 50', () => {
      const { challenges } = computeStrengthsChallenges({
        attention: 80, memory: 40, language: 60, executive: 75,
      });
      expect(challenges).toContain('Memória');
      expect(challenges).not.toContain('Atenção');
    });
  });

  describe('computeStudentProgress', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    it('computes progress deterministically', () => {
      const student = {
        id: '1', name: 'Test', birthDate: '2018-01-01',
        conditions: ['TDAH'], sessions: [
          { accuracy: 80, durationSeconds: 120, createdAt: new Date().toISOString() },
          { accuracy: 70, durationSeconds: 100, createdAt: new Date().toISOString() },
        ],
      };
      const a = computeStudentProgress(student, today);
      const b = computeStudentProgress(student, today);
      expect(a.cognitiveScores).toEqual(b.cognitiveScores); // no randomness
      expect(a.avgAccuracy).toBe(75);
    });

    it('marks inactive students as needing attention', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 14);
      const student = {
        id: '2', name: 'Inactive', birthDate: '2017-05-01',
        conditions: [], sessions: [
          { accuracy: 90, durationSeconds: 60, createdAt: oldDate.toISOString() },
        ],
      };
      const result = computeStudentProgress(student, today);
      expect(result.needsAttention).toBe(true);
    });
  });

  describe('computeClassStats', () => {
    it('aggregates correctly', () => {
      const students = [
        { id: '1', name: 'A', age: 6, conditions: [], sessionsCount: 10,
          avgAccuracy: 80, totalPlayTime: 600, trend: 'up' as const,
          needsAttention: false, strengths: ['Atenção'], challenges: [],
          cognitiveScores: { attention: 80, memory: 70, language: 60, executive: 75 },
          isActiveToday: true },
        { id: '2', name: 'B', age: 7, conditions: [], sessionsCount: 5,
          avgAccuracy: 60, totalPlayTime: 300, trend: 'stable' as const,
          needsAttention: true, strengths: [], challenges: ['Memória'],
          cognitiveScores: { attention: 60, memory: 40, language: 50, executive: 55 },
          isActiveToday: false },
      ];
      const stats = computeClassStats(students);
      expect(stats.totalStudents).toBe(2);
      expect(stats.activeToday).toBe(1);
      expect(stats.studentsNeedingAttention).toBe(1);
      expect(stats.cognitiveScores.attention).toBe(70);
    });

    it('handles empty class', () => {
      const stats = computeClassStats([]);
      expect(stats.totalStudents).toBe(0);
      expect(stats.cognitiveScores.attention).toBe(0);
    });
  });
});
