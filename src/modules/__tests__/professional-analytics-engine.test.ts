import { describe, it, expect } from 'vitest';
import { computeAnalytics } from '@/modules/reports/professional-analytics-engine';

describe('professional-analytics-engine', () => {
  const today = new Date().toISOString().split('T')[0];

  const sessions = [
    { child_profile_id: 'c1', game_id: 'g1', score: 80, accuracy_percentage: 85,
      duration_seconds: 120, completed: true, created_at: `${today}T10:00:00Z` },
    { child_profile_id: 'c1', game_id: 'g2', score: 60, accuracy_percentage: 70,
      duration_seconds: 90, completed: true, created_at: `${today}T11:00:00Z` },
    { child_profile_id: 'c2', game_id: 'g1', score: 50, accuracy_percentage: null,
      duration_seconds: 60, completed: false, created_at: `${today}T12:00:00Z` },
  ];

  const learningSessions = [
    { user_id: 'c3', created_at: `${today}T09:00:00Z` },
  ];

  const games = [
    { id: 'g1', name: 'Memória Espacial' },
    { id: 'g2', name: 'Caça ao Intruso' },
  ];

  const profiles = [
    { id: 'c1', diagnosed_conditions: ['TDAH'] },
    { id: 'c2', diagnosed_conditions: ['TEA', 'TDAH'] },
  ];

  it('computes deterministic analytics (no Math.random)', () => {
    const a = computeAnalytics(sessions, learningSessions, games, profiles);
    const b = computeAnalytics(sessions, learningSessions, games, profiles);
    expect(a).toEqual(b);
  });

  it('calculates correct totals', () => {
    const result = computeAnalytics(sessions, learningSessions, games, profiles);
    expect(result.totalSessions).toBe(4); // 3 game + 1 learning
    expect(result.totalUsers).toBe(3);
  });

  it('calculates accuracy from completed sessions only', () => {
    const result = computeAnalytics(sessions, learningSessions, games, profiles);
    // (85 + 70) / 2 = 77.5 → 78
    expect(result.avgAccuracy).toBe(78);
  });

  it('computes completion rate', () => {
    const result = computeAnalytics(sessions, learningSessions, games, profiles);
    // 2 completed / 3 total = 66.67 → 67
    expect(result.completionRate).toBe(67);
  });

  it('computes performanceByCondition without randomness', () => {
    const result = computeAnalytics(sessions, learningSessions, games, profiles);
    const tdah = result.performanceByCondition.find(p => p.condition === 'TDAH');
    expect(tdah).toBeDefined();
    // avgAccuracy = avgProgress (derived, not random)
    expect(tdah!.avgAccuracy).toBe(tdah!.avgProgress);
  });

  it('identifies top games', () => {
    const result = computeAnalytics(sessions, learningSessions, games, profiles);
    expect(result.topGames.length).toBe(2);
    expect(result.topGames[0].name).toBe('Memória Espacial');
  });
});
