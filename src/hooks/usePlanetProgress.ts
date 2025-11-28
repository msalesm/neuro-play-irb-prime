import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Planeta } from '@/types/planeta';

interface PlanetProgressData {
  planetaId: string;
  jogosCompletados: string[];
  pontuacao: number;
  estrelas: number;
  badges: string[];
}

export const usePlanetProgress = (childId: string | null) => {
  const [progress, setProgress] = useState<Record<string, PlanetProgressData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadProgress();
    }
  }, [childId]);

  const loadProgress = async () => {
    if (!childId) return;

    try {
      setLoading(true);

      // Load completed game sessions
      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select('game_id, score, completed')
        .eq('child_profile_id', childId)
        .eq('completed', true);

      if (error) throw error;

      // Aggregate progress by planet
      const progressByPlanet: Record<string, PlanetProgressData> = {};
      
      sessions?.forEach(session => {
        // Map game_id to planetaId (you'll need to add this mapping)
        const planetaId = mapGameToPlanet(session.game_id);
        
        if (!progressByPlanet[planetaId]) {
          progressByPlanet[planetaId] = {
            planetaId,
            jogosCompletados: [],
            pontuacao: 0,
            estrelas: 0,
            badges: []
          };
        }

        progressByPlanet[planetaId].jogosCompletados.push(session.game_id);
        progressByPlanet[planetaId].pontuacao += session.score || 0;
      });

      setProgress(progressByPlanet);
    } catch (error) {
      console.error('Error loading planet progress:', error);
      toast.error('Erro ao carregar progresso dos planetas');
    } finally {
      setLoading(false);
    }
  };

  const updatePlanetProgress = async (planetaId: string, gameId: string, score: number) => {
    if (!childId) return;

    const currentProgress = progress[planetaId] || {
      planetaId,
      jogosCompletados: [],
      pontuacao: 0,
      estrelas: 0,
      badges: []
    };

    const updatedProgress = {
      ...currentProgress,
      jogosCompletados: [...new Set([...currentProgress.jogosCompletados, gameId])],
      pontuacao: currentProgress.pontuacao + score,
      estrelas: currentProgress.estrelas + calculateStars(score)
    };

    setProgress(prev => ({
      ...prev,
      [planetaId]: updatedProgress
    }));

    // Check for badge unlock
    const newBadges = checkBadgeUnlock(updatedProgress);
    if (newBadges.length > 0) {
      toast.success(`🏆 Novo badge desbloqueado: ${newBadges[0]}!`);
      updatedProgress.badges = [...updatedProgress.badges, ...newBadges];
    }
  };

  const calculateStars = (score: number): number => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  const checkBadgeUnlock = (progress: PlanetProgressData): string[] => {
    const newBadges: string[] = [];

    // First game completed
    if (progress.jogosCompletados.length === 1) {
      newBadges.push('Primeiro Passo');
    }

    // All games in planet completed
    if (progress.jogosCompletados.length >= 4) {
      newBadges.push('Explorador do Planeta');
    }

    // High score achieved
    if (progress.pontuacao >= 1000) {
      newBadges.push('Mestre do Planeta');
    }

    return newBadges.filter(badge => !progress.badges.includes(badge));
  };

  const mapGameToPlanet = (gameId: string): string => {
    const gameMapping: Record<string, string> = {
      'emotion-lab': 'aurora',
      'social-scenarios': 'aurora',
      'sensory-flow': 'aurora',
      'theory-of-mind': 'aurora',
      'attention-sustained': 'vortex',
      'focus-forest': 'vortex',
      'executive-processing': 'vortex',
      'foco-rapido': 'vortex',
      'phonological-processing': 'lumen',
      'caca-letras': 'lumen',
      'silaba-magica': 'lumen',
      'contador-historias': 'lumen',
      'mindful-breath': 'calm',
      'emotional-weather': 'calm',
      'balance-quest': 'calm',
      'memory-workload': 'order',
      'cognitive-flexibility': 'order',
      'quebra-cabeca-magico': 'order',
      'spatial-architect': 'order'
    };

    return gameMapping[gameId] || 'aurora';
  };

  return {
    progress,
    loading,
    updatePlanetProgress,
    reload: loadProgress
  };
};