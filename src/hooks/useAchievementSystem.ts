import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type AvatarStage = 1 | 2 | 3 | 4 | 5;

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: string;
  required_value: number;
}

interface UserAchievement {
  id: string;
  achievement_key: string;
  progress: number;
  completed: boolean;
  unlocked_at: string | null;
}

interface BadgeProgress {
  level: BadgeLevel;
  current: number;
  required: number;
  percentage: number;
}

interface AvatarEvolution {
  stage: AvatarStage;
  xp: number;
  nextStageXp: number;
  unlockedAccessories: string[];
}

export function useAchievementSystem(userId?: string) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress>({
    level: 'bronze',
    current: 0,
    required: 10,
    percentage: 0
  });
  const [avatarEvolution, setAvatarEvolution] = useState<AvatarEvolution>({
    stage: 1,
    xp: 0,
    nextStageXp: 100,
    unlockedAccessories: []
  });
  const [loading, setLoading] = useState(true);

  // Badge level thresholds
  const badgeLevels: Record<BadgeLevel, number> = {
    bronze: 0,
    silver: 10,
    gold: 25,
    platinum: 50,
    diamond: 100
  };

  // Avatar stage thresholds
  const avatarStages: Record<AvatarStage, number> = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000
  };

  // Accessory unlocks per planet/achievement category
  const accessories: Record<string, string[]> = {
    cognitive: ['🎓', '🧠', '⚡', '🔬', '🎯'],
    emotional: ['❤️', '😊', '🌟', '💫', '✨'],
    social: ['👥', '🤝', '💬', '🎭', '🌈'],
    behavioral: ['⭐', '🏆', '👑', '💎', '🎖️'],
    performance: ['🚀', '🔥', '💪', '⚔️', '🛡️']
  };

  useEffect(() => {
    if (userId) {
      loadAchievements();
      loadUserProgress();
    }
  }, [userId]);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('required_value', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadUserProgress = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Load user achievements
      const { data: userAchievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (achievementsError) throw achievementsError;
      setUserAchievements(userAchievementsData || []);

      // Calculate badge progress
      const completedCount = (userAchievementsData || []).filter(a => a.completed).length;
      const badgeLevel = calculateBadgeLevel(completedCount);
      const nextLevel = getNextBadgeLevel(badgeLevel);
      const required = nextLevel ? badgeLevels[nextLevel] : 100;
      
      setBadgeProgress({
        level: badgeLevel,
        current: completedCount,
        required,
        percentage: (completedCount / required) * 100
      });

      // Calculate avatar evolution
      const totalXp = calculateTotalXp(userAchievementsData || []);
      const avatarStage = calculateAvatarStage(totalXp);
      const nextStage = avatarStage < 5 ? (avatarStage + 1) as AvatarStage : 5;
      const unlockedAccessories = getUnlockedAccessories(userAchievementsData || []);

      setAvatarEvolution({
        stage: avatarStage,
        xp: totalXp,
        nextStageXp: avatarStages[nextStage],
        unlockedAccessories
      });

    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBadgeLevel = (achievementCount: number): BadgeLevel => {
    if (achievementCount >= badgeLevels.diamond) return 'diamond';
    if (achievementCount >= badgeLevels.platinum) return 'platinum';
    if (achievementCount >= badgeLevels.gold) return 'gold';
    if (achievementCount >= badgeLevels.silver) return 'silver';
    return 'bronze';
  };

  const getNextBadgeLevel = (currentLevel: BadgeLevel): BadgeLevel | null => {
    const levels: BadgeLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const calculateTotalXp = (userAchievements: UserAchievement[]): number => {
    return userAchievements.reduce((total, ua) => {
      if (ua.completed) {
        const achievement = achievements.find(a => a.key === ua.achievement_key);
        return total + (achievement?.required_value || 0) * 10; // 10 XP per required value
      }
      return total;
    }, 0);
  };

  const calculateAvatarStage = (xp: number): AvatarStage => {
    if (xp >= avatarStages[5]) return 5;
    if (xp >= avatarStages[4]) return 4;
    if (xp >= avatarStages[3]) return 3;
    if (xp >= avatarStages[2]) return 2;
    return 1;
  };

  const getUnlockedAccessories = (userAchievements: UserAchievement[]): string[] => {
    const unlocked: string[] = [];
    
    userAchievements.forEach(ua => {
      if (ua.completed) {
        const achievement = achievements.find(a => a.key === ua.achievement_key);
        if (achievement && accessories[achievement.category]) {
          // Unlock accessory based on category
          const categoryAccessories = accessories[achievement.category];
          const index = Math.min(unlocked.filter(a => categoryAccessories.includes(a)).length, categoryAccessories.length - 1);
          if (categoryAccessories[index] && !unlocked.includes(categoryAccessories[index])) {
            unlocked.push(categoryAccessories[index]);
          }
        }
      }
    });

    return unlocked;
  };

  const unlockAchievement = async (achievementKey: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_key: achievementKey,
          progress: 1,
          completed: true,
          unlocked_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,achievement_key'
        });

      if (error) throw error;

      // Reload progress
      await loadUserProgress();

      // Show celebration
      const achievement = achievements.find(a => a.key === achievementKey);
      if (achievement) {
        toast.success(`🎉 Conquista desbloqueada: ${achievement.name}!`, {
          description: achievement.description,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const updateAchievementProgress = async (achievementKey: string, progress: number) => {
    if (!userId) return;

    try {
      const achievement = achievements.find(a => a.key === achievementKey);
      if (!achievement) return;

      const completed = progress >= achievement.required_value;

      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_key: achievementKey,
          progress,
          completed,
          unlocked_at: completed ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,achievement_key'
        });

      if (error) throw error;

      if (completed) {
        toast.success(`🎉 Conquista desbloqueada: ${achievement.name}!`, {
          description: achievement.description,
          duration: 5000
        });
      }

      await loadUserProgress();
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  };

  const getBadgeIcon = (level: BadgeLevel): string => {
    const icons: Record<BadgeLevel, string> = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '👑'
    };
    return icons[level];
  };

  const getBadgeColor = (level: BadgeLevel): string => {
    const colors: Record<BadgeLevel, string> = {
      bronze: 'from-amber-600 to-amber-800',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-cyan-400 to-blue-600',
      diamond: 'from-purple-500 to-pink-600'
    };
    return colors[level];
  };

  return {
    achievements,
    userAchievements,
    badgeProgress,
    avatarEvolution,
    loading,
    unlockAchievement,
    updateAchievementProgress,
    getBadgeIcon,
    getBadgeColor,
    reloadProgress: loadUserProgress
  };
}
