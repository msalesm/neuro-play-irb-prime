import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  required_value: number;
  rarity: string;
}

interface UserAchievement {
  achievement_key: string;
  unlocked_at: string;
  progress: number;
  completed: boolean;
}

interface AchievementsListProps {
  userId: string;
}

export function AchievementsList({ userId }: AchievementsListProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('rarity', { ascending: true })
        .order('category');

      if (achievementsError) throw achievementsError;

      const { data: userProgress, error: progressError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      setAchievements(allAchievements || []);
      setUserAchievements(userProgress || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500 text-yellow-900';
      case 'epic':
        return 'from-purple-400 to-pink-500 text-purple-900';
      case 'rare':
        return 'from-blue-400 to-cyan-500 text-blue-900';
      default:
        return 'from-gray-400 to-gray-500 text-gray-900';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      performance: 'Desempenho',
      consistency: 'Consistência',
      milestone: 'Marco',
      streak: 'Sequência'
    };
    return labels[category] || category;
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Carregando conquistas...
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = userAchievements.filter(ua => ua.completed).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Conquistas
        </CardTitle>
        <CardDescription>
          {completedCount} de {totalCount} desbloqueadas
        </CardDescription>
        <Progress value={completionPercentage} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {getCategoryLabel(category)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryAchievements.map((achievement) => {
                const userProgress = userAchievements.find(
                  ua => ua.achievement_key === achievement.key
                );
                const isUnlocked = userProgress?.completed || false;
                const progress = userProgress?.progress || 0;

                return (
                  <Card
                    key={achievement.id}
                    className={cn(
                      "transition-all duration-300",
                      isUnlocked
                        ? "border-2 shadow-lg"
                        : "opacity-60 grayscale"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                            isUnlocked
                              ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)}`
                              : "bg-muted"
                          )}
                        >
                          {isUnlocked ? achievement.icon : <Lock className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm leading-tight">
                              {achievement.name}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                isUnlocked && `bg-gradient-to-r ${getRarityColor(achievement.rarity)}`
                              )}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                          {!isUnlocked && userProgress && (
                            <div className="space-y-1 pt-2">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progresso</span>
                                <span>
                                  {progress}/{achievement.required_value}
                                </span>
                              </div>
                              <Progress
                                value={(progress / achievement.required_value) * 100}
                                className="h-1"
                              />
                            </div>
                          )}
                          {isUnlocked && userProgress && (
                            <p className="text-xs text-muted-foreground pt-1">
                              Desbloqueado em{' '}
                              {new Date(userProgress.unlocked_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
