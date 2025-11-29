import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TourCompletion {
  id: string;
  tour_name: string;
  completed_at: string;
}

interface TourAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  unlocked: boolean;
  progress?: number;
  required_value?: number;
}

export const useTourAchievements = () => {
  const { user } = useAuth();
  const [completedTours, setCompletedTours] = useState<TourCompletion[]>([]);
  const [achievements, setAchievements] = useState<TourAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTourProgress();
    }
  }, [user]);

  const loadTourProgress = async () => {
    if (!user) return;

    try {
      // Carregar tours completados
      const { data: tours, error: toursError } = await supabase
        .from('tour_completions')
        .select('*')
        .eq('user_id', user.id);

      if (toursError) throw toursError;
      setCompletedTours(tours || []);

      // Carregar conquistas de exploração
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', 'exploration');

      if (achievementsError) throw achievementsError;

      // Carregar conquistas desbloqueadas do usuário
      const { data: userAchievements, error: userAchError } = await supabase
        .from('user_achievements')
        .select('achievement_key, progress, completed')
        .eq('user_id', user.id);

      if (userAchError) throw userAchError;

      // Mapear conquistas com status de desbloqueio
      const achievementsWithStatus = allAchievements?.map(achievement => {
        const userAch = userAchievements?.find(
          ua => ua.achievement_key === achievement.key
        );
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          unlocked: userAch?.completed || false,
          progress: userAch?.progress || 0,
          required_value: achievement.required_value,
        };
      }) || [];

      setAchievements(achievementsWithStatus);
    } catch (error) {
      console.error('Error loading tour progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTour = async (tourName: string) => {
    if (!user) return;

    try {
      // Inserir conclusão do tour
      const { error } = await supabase
        .from('tour_completions')
        .insert({
          user_id: user.id,
          tour_name: tourName,
        });

      if (error && error.code !== '23505') { // Ignora erro de duplicação
        throw error;
      }

      // Recarregar progresso
      await loadTourProgress();
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const isTourCompleted = (tourName: string): boolean => {
    return completedTours.some(tour => tour.tour_name === tourName);
  };

  const getProgress = (): { completed: number; total: number; percentage: number } => {
    const total = 7; // Total de tours disponíveis
    const completed = completedTours.length;
    const percentage = (completed / total) * 100;
    return { completed, total, percentage };
  };

  return {
    completedTours,
    achievements,
    loading,
    completeTour,
    isTourCompleted,
    getProgress,
    refreshProgress: loadTourProgress,
  };
};
