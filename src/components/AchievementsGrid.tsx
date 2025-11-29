import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  achievement_key: string;
  progress: number;
  completed: boolean;
  unlocked_at: string | null;
}

interface AchievementsGridProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

const rarityColors: Record<string, string> = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-orange-400 to-orange-600'
};

export function AchievementsGrid({ achievements, userAchievements }: AchievementsGridProps) {
  const getUserProgress = (achievementKey: string) => {
    return userAchievements.find(ua => ua.achievement_key === achievementKey);
  };

  const sortedAchievements = [...achievements].sort((a, b) => {
    const aProgress = getUserProgress(a.key);
    const bProgress = getUserProgress(b.key);
    
    // Completed last
    if (aProgress?.completed && !bProgress?.completed) return 1;
    if (!aProgress?.completed && bProgress?.completed) return -1;
    
    // In progress first
    const aInProgress = aProgress && aProgress.progress > 0 && !aProgress.completed;
    const bInProgress = bProgress && bProgress.progress > 0 && !bProgress.completed;
    if (aInProgress && !bInProgress) return -1;
    if (!aInProgress && bInProgress) return 1;
    
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedAchievements.map((achievement, index) => {
        const userProgress = getUserProgress(achievement.key);
        const progress = userProgress?.progress || 0;
        const completed = userProgress?.completed || false;
        const percentage = (progress / achievement.required_value) * 100;
        const locked = !userProgress || progress === 0;

        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg",
                completed && "border-2 border-primary",
                locked && "opacity-60"
              )}
            >
              {completed && (
                <div className="absolute top-2 right-2 z-10">
                  <CheckCircle className="w-6 h-6 text-green-500 fill-green-100" />
                </div>
              )}
              
              <div className={cn(
                "h-2 bg-gradient-to-r",
                rarityColors[achievement.rarity] || rarityColors.common
              )} />
              
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
                    completed ? "bg-gradient-to-br from-primary/20 to-primary/30" : "bg-muted"
                  )}>
                    {locked ? <Lock className="w-6 h-6 text-muted-foreground" /> : achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      `bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white`
                    )}
                  >
                    {achievement.rarity}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {achievement.category}
                  </Badge>
                </div>

                {!locked && !completed && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Progresso
                      </span>
                      <span className="font-medium">{progress} / {achievement.required_value}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )}

                {completed && userProgress?.unlocked_at && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Desbloqueado em {new Date(userProgress.unlocked_at).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
