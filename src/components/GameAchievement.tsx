import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'instant' | 'progress' | 'milestone';
  value?: number;
  maxValue?: number;
  unlocked: boolean;
  justUnlocked?: boolean;
}

interface GameAchievementProps {
  achievement: Achievement;
  onAnimationComplete?: (achievementId: string) => void;
}

export const GameAchievement: React.FC<GameAchievementProps> = ({
  achievement,
  onAnimationComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement.justUnlocked) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onAnimationComplete?.(achievement.id);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement.justUnlocked, onAnimationComplete, achievement.id]);

  // Achievement popup for just unlocked
  if (achievement.justUnlocked && isVisible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="shadow-glow animate-scale-in bg-gradient-to-br from-background to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center max-w-sm">
            <div className="text-4xl mb-3 animate-bounce">
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              {achievement.icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-foreground">
              Conquista Desbloqueada!
            </h3>
            <h4 className="font-semibold text-primary mb-2">
              {achievement.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {achievement.description}
            </p>
            <Badge variant="default" className="gap-1">
              <Star className="w-3 h-3" />
              +50 XP
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular achievement display
  return (
    <Card className={`transition-all duration-200 ${achievement.unlocked ? 'shadow-soft' : 'opacity-60'}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {achievement.unlocked ? achievement.icon : '🔒'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {achievement.title}
              </h4>
              {achievement.unlocked && (
                <Badge variant="secondary" className="text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  Desbloqueado
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {achievement.description}
            </p>
            
            {achievement.type === 'progress' && achievement.maxValue && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{achievement.value}/{achievement.maxValue}</span>
                  <span>{Math.round(((achievement.value || 0) / achievement.maxValue) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${((achievement.value || 0) / achievement.maxValue) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface GameAchievementsProps {
  achievements: Achievement[];
  className?: string;
  onAchievementComplete?: (achievementId: string) => void;
}

export const GameAchievements: React.FC<GameAchievementsProps> = ({
  achievements,
  className = "",
  onAchievementComplete
}) => {
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const justUnlocked = achievements.find(a => a.justUnlocked && !activeAchievement);
    if (justUnlocked) {
      setActiveAchievement(justUnlocked);
    }
  }, [achievements, activeAchievement]);

  const handleAnimationComplete = (achievementId: string) => {
    setActiveAchievement(null);
    onAchievementComplete?.(achievementId);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {activeAchievement && (
        <GameAchievement 
          achievement={activeAchievement}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      
      <div className="grid gap-2">
        {achievements.map(achievement => (
          !achievement.justUnlocked && (
            <GameAchievement 
              key={achievement.id} 
              achievement={achievement}
            />
          )
        ))}
      </div>
    </div>
  );
};