import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FocusForestStats {
  totalSessions: number;
  bestAccuracy: number;
  totalTreesGrown: number;
  currentStreak: number;
  bestAccuracyPerLevel: Record<number, number>;
  recentSessions: any[];
}

interface Achievement {
  name: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: any;
  stars_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export function useFocusForestStats() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<FocusForestStats>({
    totalSessions: 0,
    bestAccuracy: 0,
    totalTreesGrown: 0,
    currentStreak: 0,
    bestAccuracyPerLevel: {},
    recentSessions: []
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchAchievements();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Buscar estatísticas gerais
      const { data: statsData } = await supabase
        .from('focus_forest_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (statsData) {
        const totalSessions = statsData.length;
        const bestAccuracy = Math.max(...statsData.map(s => s.accuracy), 0);
        const totalTreesGrown = statsData.reduce((sum, s) => sum + s.trees_grown, 0);
        
        // Calcular melhor precisão por nível
        const bestAccuracyPerLevel: Record<number, number> = {};
        statsData.forEach(session => {
          const level = session.level;
          if (!bestAccuracyPerLevel[level] || session.accuracy > bestAccuracyPerLevel[level]) {
            bestAccuracyPerLevel[level] = session.accuracy;
          }
        });

        setStats({
          totalSessions,
          bestAccuracy,
          totalTreesGrown,
          currentStreak: 0, // Calcular streak real baseado em dias consecutivos
          bestAccuracyPerLevel,
          recentSessions: statsData
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Buscar todos os achievements disponíveis
      const { data: allAchievements } = await supabase
        .from('focus_forest_achievements')
        .select('*');

      // Buscar achievements desbloqueados pelo usuário
      const { data: unlockedAchievements } = await supabase
        .from('user_focus_forest_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (allAchievements) {
        const achievementsWithStatus = allAchievements.map(achievement => {
          const unlocked = unlockedAchievements?.find(u => u.achievement_name === achievement.name);
          return {
            ...achievement,
            unlocked: !!unlocked,
            unlocked_at: unlocked?.unlocked_at
          };
        });

        setAchievements(achievementsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const saveGameSession = async (sessionData: {
    level: number;
    score: number;
    hits: number;
    misses: number;
    accuracy: number;
    duration_seconds: number;
    trees_grown: number;
    targets_hit_sequence: number[];
    difficulty_modifier?: string;
  }) => {
    if (!user) return;

    try {
      // Salvar estatísticas da sessão
      const { data: sessionStats } = await supabase
        .from('focus_forest_stats')
        .insert({
          user_id: user.id,
          level: sessionData.level,
          score: sessionData.score,
          hits: sessionData.hits,
          misses: sessionData.misses,
          accuracy: sessionData.accuracy,
          duration_seconds: sessionData.duration_seconds,
          trees_grown: sessionData.trees_grown,
          targets_hit_sequence: sessionData.targets_hit_sequence,
          difficulty_modifier: sessionData.difficulty_modifier || 'normal',
          best_accuracy_per_level: { [sessionData.level]: sessionData.accuracy }
        })
        .select()
        .single();

      // Verificar e desbloquear achievements
      if (sessionStats) {
        await checkAndUnlockAchievements(sessionData);
      }

      // Atualizar gamificação
      await updateGamification(sessionData);

      // Salvar na tabela de therapy_sessions para manter compatibilidade
      await supabase.from('therapy_sessions').insert({
        user_id: user.id,
        session_type: 'focus_training',
        title: `Sessão Focus Forest - Nível ${sessionData.level}`,
        content: sessionData,
        duration_minutes: Math.round(sessionData.duration_seconds / 60),
        completion_status: 'completed'
      });

      // Salvar atividade
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'focus_game',
        topic_name: 'Focus Forest',
        content: `Nível ${sessionData.level}: ${sessionData.hits} acertos, ${sessionData.accuracy.toFixed(1)}% precisão`
      });

      // Atualizar estatísticas locais
      await fetchStats();
      await fetchAchievements();

    } catch (error) {
      console.error('Error saving game session:', error);
      throw error;
    }
  };

  const checkAndUnlockAchievements = async (sessionData: any) => {
    if (!user) return;

    const newUnlocks: string[] = [];

    // Verificar cada achievement
    for (const achievement of achievements) {
      if (achievement.unlocked) continue;

      let shouldUnlock = false;

      switch (achievement.requirement_type) {
        case 'level':
          const levelReq = achievement.requirement_value;
          shouldUnlock = sessionData.level >= levelReq.level && 
                        sessionData.hits >= levelReq.min_hits;
          break;

        case 'precision':
          const precisionReq = achievement.requirement_value;
          if (precisionReq.min_accuracy) {
            shouldUnlock = sessionData.accuracy >= precisionReq.min_accuracy;
          }
          if (precisionReq.consecutive_hits) {
            // Verificar se teve X acertos consecutivos sem erro
            const maxConsecutive = getMaxConsecutiveHits(sessionData.targets_hit_sequence);
            shouldUnlock = maxConsecutive >= precisionReq.consecutive_hits;
          }
          break;

        case 'speed':
          const speedReq = achievement.requirement_value;
          shouldUnlock = sessionData.hits >= speedReq.min_hits && 
                        sessionData.duration_seconds <= speedReq.max_time_seconds;
          break;

        case 'endurance':
          const enduranceReq = achievement.requirement_value;
          shouldUnlock = sessionData.duration_seconds >= enduranceReq.min_duration_seconds && 
                        sessionData.accuracy >= enduranceReq.min_accuracy;
          break;

        case 'trees':
          // Precisa verificar total de árvores de todas as sessões
          shouldUnlock = stats.totalTreesGrown + sessionData.trees_grown >= 
                        achievement.requirement_value.total_trees;
          break;
      }

      if (shouldUnlock) {
        try {
          await supabase
            .from('user_focus_forest_achievements')
            .insert({
              user_id: user.id,
              achievement_name: achievement.name,
              session_stats: sessionData
            });

          newUnlocks.push(achievement.title);

          toast({
            title: `🏆 Achievement Desbloqueado!`,
            description: `${achievement.icon} ${achievement.title}`,
          });
        } catch (error) {
          console.error('Error unlocking achievement:', error);
        }
      }
    }

    return newUnlocks;
  };

  const updateGamification = async (sessionData: any) => {
    if (!user) return;

    try {
      // Calcular estrelas baseado na precisão
      let starsEarned = 1; // Base
      if (sessionData.accuracy >= 90) starsEarned = 3;
      else if (sessionData.accuracy >= 75) starsEarned = 2;

      // Adicionar bonus por nível completado
      if (sessionData.level >= 3) starsEarned += 1;

      // Atualizar gamificação geral
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'game_completion',
        topic_name: 'Focus Forest',
        content: `${sessionData.hits} acertos`,
        stars_earned: starsEarned,
        activity_date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Error updating gamification:', error);
    }
  };

  const getMaxConsecutiveHits = (sequence: number[]): number => {
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    sequence.forEach(hit => {
      if (hit === 1) { // 1 = acerto, 0 = erro
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    });

    return maxConsecutive;
  };

  return {
    stats,
    achievements,
    loading,
    saveGameSession,
    refreshStats: fetchStats,
    refreshAchievements: fetchAchievements
  };
}