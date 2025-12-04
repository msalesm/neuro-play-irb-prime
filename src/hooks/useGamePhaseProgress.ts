import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GamePhase, GamePhaseProgress } from '@/types/game-phase';
import { toast } from 'sonner';

export function useGamePhaseProgress(gameId: string, childProfileId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<GamePhaseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [user, gameId, childProfileId]);

  const loadProgress = async () => {
    try {
      // Universal test mode - works with or without user
      const storageKey = `game_phase_progress_${gameId}_${childProfileId || user?.id || 'guest'}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        setProgress(JSON.parse(stored));
      } else {
        // Initialize default progress
        const defaultProgress: GamePhaseProgress = {
          gameId,
          childProfileId: childProfileId || user?.id || 'guest',
          phases: {},
          currentPhase: '1',
          totalStars: 0,
          totalXP: 0
        };
        setProgress(defaultProgress);
      }
    } catch (error) {
      console.error('Error loading phase progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (updatedProgress: GamePhaseProgress) => {
    try {
      const storageKey = `game_phase_progress_${gameId}_${childProfileId || user?.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error saving phase progress:', error);
      toast.error('Erro ao salvar progresso');
    }
  };

  const completePhase = async (
    phaseId: string,
    stars: number,
    score: number,
    earnedXP: number
  ) => {
    if (!progress) return;

    const updatedProgress: GamePhaseProgress = {
      ...progress,
      phases: {
        ...progress.phases,
        [phaseId]: {
          completed: true,
          stars: Math.max(progress.phases[phaseId]?.stars || 0, stars),
          bestScore: Math.max(progress.phases[phaseId]?.bestScore || 0, score),
          attempts: (progress.phases[phaseId]?.attempts || 0) + 1,
          lastPlayedAt: new Date().toISOString()
        }
      },
      totalStars: progress.totalStars + stars,
      totalXP: progress.totalXP + earnedXP
    };

    await saveProgress(updatedProgress);
    
    toast.success(`Fase concluída! ${stars} ⭐ | +${earnedXP} XP`, {
      duration: 3000
    });

    return updatedProgress;
  };

  const unlockPhase = (phases: GamePhase[]): GamePhase[] => {
    if (!progress) return phases;

    return phases.map((phase) => {
      if (!phase.unlockRequirement) {
        return { ...phase, isLocked: false };
      }

      const { previousPhase, minStars, minAccuracy } = phase.unlockRequirement;
      
      if (previousPhase) {
        const prevProgress = progress.phases[previousPhase];
        
        if (!prevProgress?.completed) {
          return phase;
        }

        if (minStars && prevProgress.stars < minStars) {
          return phase;
        }

        // If all requirements met, unlock
        return { ...phase, isLocked: false };
      }

      return phase;
    });
  };

  const getPhaseProgress = (phaseId: string) => {
    return progress?.phases[phaseId] || null;
  };

  return {
    progress,
    isLoading,
    completePhase,
    unlockPhase,
    getPhaseProgress,
    saveProgress
  };
}
