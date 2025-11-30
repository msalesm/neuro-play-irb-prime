import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { JogoPlaneta, Planeta } from '@/types/planeta';
import { planetas } from '@/data/planetas';

interface DailyMission {
  jogo: JogoPlaneta;
  planeta: Planeta;
  recomendadoPorIA: boolean;
}

export const useDailyMissions = (childId: string | null) => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadDailyMissions();
    }
  }, [childId]);

  const loadDailyMissions = async () => {
    if (!childId) return;

    try {
      setLoading(true);

      // Get AI recommendation for planet
      const { data: recommendation } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('child_profile_id', childId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get completed games
      const { data: completedSessions } = await supabase
        .from('game_sessions')
        .select('game_id')
        .eq('child_profile_id', childId)
        .eq('completed', true);

      const completedGameIds = new Set(
        completedSessions?.map(s => s.game_id) || []
      );

      // Generate daily missions
      const dailyMissions: DailyMission[] = [];

      // 1. AI recommended mission (if available)
      if (recommendation?.recommended_games?.[0]) {
        const recommendedGameId = recommendation.recommended_games[0];
        const planeta = planetas.find(p => 
          p.jogos.some(j => j.id === recommendedGameId)
        );
        const jogo = planeta?.jogos.find(j => j.id === recommendedGameId);

        if (planeta && jogo) {
          dailyMissions.push({
            jogo,
            planeta,
            recomendadoPorIA: true
          });
        }
      }

      // 2. Add 2 more missions from different planets - PRIORITIZE NEW GAMES
      const availablePlanetas = planetas.filter(p => 
        p.desbloqueado && !dailyMissions.some(m => m.planeta.id === p.id)
      );

      // First try to add NEW games
      for (const planeta of availablePlanetas) {
        if (dailyMissions.length >= 3) break;
        
        // Prioritize NEW incomplete games first
        const newIncompleteGame = planeta.jogos.find(j => 
          j.novo && !completedGameIds.has(j.id)
        );
        
        if (newIncompleteGame) {
          dailyMissions.push({
            jogo: newIncompleteGame,
            planeta,
            recomendadoPorIA: false
          });
          continue;
        }
      }

      // Then fill remaining slots with regular incomplete games
      for (const planeta of availablePlanetas) {
        if (dailyMissions.length >= 3) break;
        
        // Skip if planet already has a mission
        if (dailyMissions.some(m => m.planeta.id === planeta.id)) continue;
        
        // Find first incomplete game (not necessarily new)
        const incompleteGame = planeta.jogos.find(j => !completedGameIds.has(j.id));
        if (incompleteGame) {
          dailyMissions.push({
            jogo: incompleteGame,
            planeta,
            recomendadoPorIA: false
          });
        }
      }

      setMissions(dailyMissions);
    } catch (error) {
      console.error('Error loading daily missions:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    missions,
    loading,
    reload: loadDailyMissions
  };
};