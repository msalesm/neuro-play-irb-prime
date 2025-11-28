import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AvatarEvolution, AVATAR_LEVELS, AVATAR_ACCESSORIES } from '@/types/avatar';
import { toast } from 'sonner';

export const useAvatarEvolution = (childId: string | null) => {
  const [evolution, setEvolution] = useState<AvatarEvolution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadAvatarEvolution();
    }
  }, [childId]);

  const loadAvatarEvolution = async () => {
    if (!childId) return;

    try {
      setLoading(true);

      // Load child data
      const { data: child, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (childError) throw childError;

      // Parse avatar
      let baseAvatar = null;
      if (child.avatar_url) {
        try {
          baseAvatar = JSON.parse(child.avatar_url);
        } catch {
          baseAvatar = null;
        }
      }

      if (!baseAvatar) {
        baseAvatar = {
          id: 'default',
          name: 'Explorador',
          emoji: '👤',
          category: 'animals'
        };
      }

      // Calculate progress (mock data for now - would come from game_sessions)
      const totalPlanetsCompleted = 0; // TODO: Calculate from game sessions
      const totalMissionsCompleted = 0;
      const totalScore = 0;

      // Calculate level based on planets completed
      let currentLevel = 1;
      for (const level of AVATAR_LEVELS) {
        if (totalPlanetsCompleted >= level.planetsRequired) {
          currentLevel = level.level;
        }
      }

      // Determine unlocked accessories
      const unlockedAccessories = AVATAR_ACCESSORIES
        .filter(acc => {
          if (acc.unlockCondition.type === 'planets_completed') {
            return totalPlanetsCompleted >= acc.unlockCondition.value;
          }
          return false;
        })
        .map(acc => acc.id);

      // Get equipped accessories (from user preferences or default)
      const equippedAccessories = unlockedAccessories.slice(0, 4); // Max 4 equipped

      const avatarEvolution: AvatarEvolution = {
        childId,
        baseAvatar,
        currentLevel,
        equippedAccessories,
        unlockedAccessories,
        totalPlanetsCompleted,
        totalMissionsCompleted,
        totalScore,
        evolutionHistory: []
      };

      setEvolution(avatarEvolution);
    } catch (error) {
      console.error('Error loading avatar evolution:', error);
      toast.error('Erro ao carregar evolução do avatar');
    } finally {
      setLoading(false);
    }
  };

  const equipAccessory = async (accessoryId: string) => {
    if (!evolution) return;

    const newEquipped = evolution.equippedAccessories.includes(accessoryId)
      ? evolution.equippedAccessories.filter(id => id !== accessoryId)
      : [...evolution.equippedAccessories, accessoryId].slice(0, 4); // Max 4

    setEvolution({
      ...evolution,
      equippedAccessories: newEquipped
    });

    // TODO: Save to database
    toast.success(
      evolution.equippedAccessories.includes(accessoryId)
        ? 'Acessório removido'
        : 'Acessório equipado'
    );
  };

  const checkLevelUp = (newPlanetsCompleted: number) => {
    if (!evolution) return false;

    let newLevel = 1;
    for (const level of AVATAR_LEVELS) {
      if (newPlanetsCompleted >= level.planetsRequired) {
        newLevel = level.level;
      }
    }

    if (newLevel > evolution.currentLevel) {
      const levelData = AVATAR_LEVELS.find(l => l.level === newLevel);
      toast.success(`🎉 Nível ${newLevel} desbloqueado!`, {
        description: levelData?.name
      });
      return true;
    }

    return false;
  };

  return {
    evolution,
    loading,
    equipAccessory,
    checkLevelUp,
    reload: loadAvatarEvolution
  };
};
