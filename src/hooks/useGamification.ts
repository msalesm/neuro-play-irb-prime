import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getLevelInfo, getNextLevelInfo, getLevelProgress } from '@/data/gamification';

interface GamificationState {
  totalXP: number;
  level: number;
  levelTitle: string;
  levelIcon: string;
  levelProgress: number;
  xpToNext: number;
  dailyStreak: number;
  longestStreak: number;
  totalGames: number;
  todayGames: number;
  unlockedBadges: string[];
  loading: boolean;
}

// XP rewards per action
const XP_REWARDS = {
  game_completed: 15,
  high_accuracy: 10, // bonus for >80%
  perfect_score: 25, // bonus for 100%
  daily_login: 5,
  story_completed: 20,
};

export function useGamification() {
  const { user } = useAuth();
  const [state, setState] = useState<GamificationState>({
    totalXP: 0, level: 1, levelTitle: 'Explorador Iniciante', levelIcon: '🌱',
    levelProgress: 0, xpToNext: 100, dailyStreak: 0, longestStreak: 0,
    totalGames: 0, todayGames: 0, unlockedBadges: [], loading: true,
  });

  const loadGamificationData = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [sessionsResult, achievementsResult] = await Promise.all([
        supabase
          .from('learning_sessions')
          .select('id, created_at, completed, performance_data')
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_achievements')
          .select('achievement_key, completed')
          .eq('user_id', user.id)
          .eq('completed', true),
      ]);

      const sessions = sessionsResult.data || [];
      const achievements = achievementsResult.data || [];

      // Calculate XP from sessions
      let totalXP = 0;
      sessions.forEach(s => {
        totalXP += XP_REWARDS.game_completed;
        const perf = s.performance_data as any;
        if (perf?.accuracy >= 80) totalXP += XP_REWARDS.high_accuracy;
        if (perf?.accuracy === 100) totalXP += XP_REWARDS.perfect_score;
      });

      // Add XP from achievements (10 XP per badge)
      totalXP += achievements.length * 10;

      // Calculate streak
      const uniqueDays = new Set(
        sessions.map(s => new Date(s.created_at).toISOString().slice(0, 10))
      );
      const sortedDays = [...uniqueDays].sort().reverse();
      
      let dailyStreak = 0;
      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      
      if (sortedDays[0] === todayStr || sortedDays[0] === yesterdayStr) {
        let checkDate = sortedDays[0] === todayStr ? new Date() : new Date(Date.now() - 86400000);
        for (const day of sortedDays) {
          if (day === checkDate.toISOString().slice(0, 10)) {
            dailyStreak++;
            checkDate = new Date(checkDate.getTime() - 86400000);
          } else {
            break;
          }
        }
      }

      // Longest streak calculation
      let longestStreak = 0;
      let currentRun = 0;
      const allDays = [...uniqueDays].sort();
      for (let i = 0; i < allDays.length; i++) {
        if (i === 0) { currentRun = 1; }
        else {
          const prev = new Date(allDays[i - 1]).getTime();
          const curr = new Date(allDays[i]).getTime();
          currentRun = (curr - prev === 86400000) ? currentRun + 1 : 1;
        }
        longestStreak = Math.max(longestStreak, currentRun);
      }

      // Today games
      const todayGames = sessions.filter(
        s => new Date(s.created_at).toISOString().slice(0, 10) === todayStr
      ).length;

      const levelInfo = getLevelInfo(totalXP);
      const nextLevel = getNextLevelInfo(totalXP);

      setState({
        totalXP,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        levelIcon: levelInfo.icon,
        levelProgress: getLevelProgress(totalXP),
        xpToNext: nextLevel?.xpRequired || totalXP,
        dailyStreak,
        longestStreak,
        totalGames: sessions.length,
        todayGames,
        unlockedBadges: achievements.map(a => a.achievement_key),
        loading: false,
      });
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  return { ...state, refresh: loadGamificationData };
}
