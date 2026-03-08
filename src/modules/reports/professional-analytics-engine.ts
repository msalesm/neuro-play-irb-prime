/**
 * Professional Analytics Engine
 * 
 * Pure computation — no React, no hooks, no state.
 * Receives raw session/profile data, returns computed analytics.
 */

// ─── Types ────────────────────────────────────────────────

export interface RawSessionData {
  child_profile_id: string;
  game_id: string;
  score: number | null;
  accuracy_percentage: number | null;
  duration_seconds: number | null;
  completed: boolean;
  created_at: string;
}

export interface RawLearningSession {
  user_id: string;
  created_at: string;
}

export interface GameInfo {
  id: string;
  name: string;
}

export interface ProfileCondition {
  id: string;
  diagnosed_conditions: string[] | null;
}

export interface ComputedAnalytics {
  totalSessions: number;
  totalUsers: number;
  avgAccuracy: number;
  avgSessionDuration: number;
  completionRate: number;
  activeUsersToday: number;
  sessionsThisWeek: number;
  topGames: { name: string; sessions: number; avgScore: number }[];
  dailyActivity: { date: string; sessions: number; users: number }[];
  performanceByCondition: { condition: string; avgAccuracy: number; avgProgress: number }[];
}

// ─── Pure Computation ─────────────────────────────────────

export function computeAnalytics(
  sessions: RawSessionData[],
  learningSessions: RawLearningSession[],
  games: GameInfo[],
  profiles: ProfileCondition[],
): ComputedAnalytics {
  const totalSessions = sessions.length + learningSessions.length;

  const uniqueUsers = new Set([
    ...sessions.map(s => s.child_profile_id),
    ...learningSessions.map(s => s.user_id),
  ]).size;

  const completedSessions = sessions.filter(s => s.completed);
  const avgAccuracy = completedSessions.length > 0
    ? completedSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / completedSessions.length
    : 0;

  const avgDuration = completedSessions.length > 0
    ? completedSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / completedSessions.length
    : 0;

  const completionRate = sessions.length > 0
    ? (completedSessions.length / sessions.length) * 100
    : 0;

  // Today's active users
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.created_at?.startsWith(today));
  const activeUsersToday = new Set(todaySessions.map(s => s.child_profile_id)).size;

  // Sessions this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const sessionsThisWeek = sessions.filter(s => new Date(s.created_at || '') > weekAgo).length;

  // Top games
  const gameMap = new Map<string, { sessions: number; totalScore: number }>();
  for (const s of sessions) {
    const current = gameMap.get(s.game_id) || { sessions: 0, totalScore: 0 };
    gameMap.set(s.game_id, {
      sessions: current.sessions + 1,
      totalScore: current.totalScore + (s.score || 0),
    });
  }

  const topGames = Array.from(gameMap.entries())
    .map(([gameId, data]) => ({
      name: games.find(g => g.id === gameId)?.name || 'Jogo',
      sessions: data.sessions,
      avgScore: data.sessions > 0 ? Math.round(data.totalScore / data.sessions) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  // Daily activity (last 7 days)
  const dailyActivity: { date: string; sessions: number; users: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = sessions.filter(s => s.created_at?.startsWith(dateStr));
    dailyActivity.push({
      date: dateStr,
      sessions: daySessions.length,
      users: new Set(daySessions.map(s => s.child_profile_id)).size,
    });
  }

  // Performance by condition — NO Math.random()
  const conditionMap = new Map<string, { count: number; totalAccuracy: number }>();
  for (const s of sessions) {
    const profile = profiles.find(p => p.id === s.child_profile_id);
    const conditions = profile?.diagnosed_conditions || [];
    for (const condition of conditions) {
      const current = conditionMap.get(condition) || { count: 0, totalAccuracy: 0 };
      conditionMap.set(condition, {
        count: current.count + 1,
        totalAccuracy: current.totalAccuracy + (s.accuracy_percentage || 0),
      });
    }
  }

  const performanceByCondition = Array.from(conditionMap.entries())
    .map(([condition, data]) => ({
      condition,
      avgAccuracy: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0,
      avgProgress: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0, // derived, not random
    }));

  return {
    totalSessions,
    totalUsers: uniqueUsers,
    avgAccuracy: Math.round(avgAccuracy),
    avgSessionDuration: Math.round(avgDuration / 60),
    completionRate: Math.round(completionRate),
    activeUsersToday,
    sessionsThisWeek,
    topGames,
    dailyActivity,
    performanceByCondition,
  };
}
