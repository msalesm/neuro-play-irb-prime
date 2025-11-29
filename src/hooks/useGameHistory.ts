import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface HistoricalSession {
  id: string;
  game_id: string;
  score: number;
  accuracy_percentage: number;
  duration_seconds: number;
  difficulty_level: number;
  completed_at: string;
  avg_reaction_time_ms: number | null;
  correct_attempts: number;
  total_attempts: number;
}

interface GameEvolution {
  dates: string[];
  scores: number[];
  accuracies: number[];
  reactionTimes: number[];
  difficulties: number[];
}

export function useGameHistory(gameId: string, childProfileId: string | null) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoricalSession[]>([]);
  const [evolution, setEvolution] = useState<GameEvolution>({
    dates: [],
    scores: [],
    accuracies: [],
    reactionTimes: [],
    difficulties: []
  });

  useEffect(() => {
    if (!childProfileId || !gameId) return;
    loadHistory();
  }, [childProfileId, gameId]);

  const loadHistory = async () => {
    if (!childProfileId) return;
    
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .eq('game_id', gameId)
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (sessions && sessions.length > 0) {
        setHistory(sessions as unknown as HistoricalSession[]);
        
        // Process evolution data (reverse to show oldest to newest in charts)
        const reversed = [...sessions].reverse();
        setEvolution({
          dates: reversed.map(s => new Date(s.completed_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
          scores: reversed.map(s => s.score || 0),
          accuracies: reversed.map(s => s.accuracy_percentage || 0),
          reactionTimes: reversed.map(s => s.avg_reaction_time_ms || 0),
          difficulties: reversed.map(s => s.difficulty_level || 1)
        });
      }
    } catch (error) {
      console.error('Error loading game history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentAverage = (metric: 'score' | 'accuracy' | 'reactionTime', lastN: number = 5) => {
    if (history.length === 0) return 0;
    
    const recent = history.slice(0, Math.min(lastN, history.length));
    const sum = recent.reduce((acc, session) => {
      if (metric === 'score') return acc + (session.score || 0);
      if (metric === 'accuracy') return acc + (session.accuracy_percentage || 0);
      if (metric === 'reactionTime') return acc + (session.avg_reaction_time_ms || 0);
      return acc;
    }, 0);
    
    return sum / recent.length;
  };

  const getTrend = (metric: 'score' | 'accuracy' | 'reactionTime'): 'improving' | 'stable' | 'declining' => {
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(0, 3);
    const older = history.slice(3, 6);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, s) => {
      if (metric === 'score') return acc + (s.score || 0);
      if (metric === 'accuracy') return acc + (s.accuracy_percentage || 0);
      if (metric === 'reactionTime') return acc + (s.avg_reaction_time_ms || 0);
      return acc;
    }, 0) / recent.length;
    
    const olderAvg = older.reduce((acc, s) => {
      if (metric === 'score') return acc + (s.score || 0);
      if (metric === 'accuracy') return acc + (s.accuracy_percentage || 0);
      if (metric === 'reactionTime') return acc + (s.avg_reaction_time_ms || 0);
      return acc;
    }, 0) / older.length;
    
    const threshold = metric === 'reactionTime' ? -50 : 5; // For reaction time, lower is better
    const diff = metric === 'reactionTime' ? olderAvg - recentAvg : recentAvg - olderAvg;
    
    if (diff > threshold) return 'improving';
    if (diff < -threshold) return 'declining';
    return 'stable';
  };

  const getPersonalBest = (metric: 'score' | 'accuracy' | 'reactionTime') => {
    if (history.length === 0) return 0;
    
    if (metric === 'score') {
      return Math.max(...history.map(s => s.score || 0));
    }
    if (metric === 'accuracy') {
      return Math.max(...history.map(s => s.accuracy_percentage || 0));
    }
    if (metric === 'reactionTime') {
      const times = history.map(s => s.avg_reaction_time_ms || Infinity).filter(t => t < Infinity);
      return times.length > 0 ? Math.min(...times) : 0;
    }
    return 0;
  };

  return {
    loading,
    history,
    evolution,
    getRecentAverage,
    getTrend,
    getPersonalBest,
    totalSessions: history.length
  };
}
