import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock } from "lucide-react";

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

interface FocusForestAchievementsProps {
  achievements: Achievement[];
  currentSession?: {
    hits: number;
    accuracy: number;
    level: number;
    duration_seconds: number;
  };
}

export function FocusForestAchievements({ achievements, currentSession }: FocusForestAchievementsProps) {
  const getProgressForAchievement = (achievement: Achievement) => {
    if (!currentSession) return 0;
    
    const req = achievement.requirement_value;
    
    switch (achievement.requirement_type) {
      case 'level':
        return Math.min((currentSession.level / req.level) * 100, 100);
      
      case 'precision':
        if (req.min_accuracy) {
          return Math.min((currentSession.accuracy / req.min_accuracy) * 100, 100);
        }
        return 0;
      
      case 'speed':
        if (req.min_hits && req.max_time_seconds) {
          const hitsProgress = (currentSession.hits / req.min_hits) * 50;
          const timeProgress = currentSession.duration_seconds <= req.max_time_seconds ? 50 : 0;
          return Math.min(hitsProgress + timeProgress, 100);
        }
        return 0;
      
      case 'endurance':
        const durationProgress = Math.min((currentSession.duration_seconds / req.min_duration_seconds) * 50, 50);
        const accuracyProgress = currentSession.accuracy >= req.min_accuracy ? 50 : 0;
        return durationProgress + accuracyProgress;
      
      default:
        return 0;
    }
  };

  const getRequirementText = (achievement: Achievement) => {
    const req = achievement.requirement_value;
    
    switch (achievement.requirement_type) {
      case 'level':
        return `Chegue ao nível ${req.level} com ${req.min_hits}+ acertos`;
      
      case 'precision':
        if (req.min_accuracy) {
          return `Alcance ${req.min_accuracy}% de precisão`;
        }
        if (req.consecutive_hits) {
          return `${req.consecutive_hits} acertos consecutivos`;
        }
        return '';
      
      case 'speed':
        return `${req.min_hits} acertos em ${req.max_time_seconds}s`;
      
      case 'endurance':
        return `${req.min_duration_seconds}s com ${req.min_accuracy}%+ precisão`;
      
      case 'trees':
        return `Cultive ${req.total_trees} árvores no total`;
      
      default:
        return achievement.description;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {achievements.map((achievement) => {
          const progress = getProgressForAchievement(achievement);
          const isNearCompletion = progress > 80 && !achievement.unlocked;
          
          return (
            <div 
              key={achievement.name}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm' 
                  : isNearCompletion
                  ? 'bg-blue-50 border-blue-200 animate-pulse'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {achievement.title}
                      {achievement.unlocked ? (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          ✓ Completo
                        </Badge>
                      ) : (
                        <Lock className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getRequirementText(achievement)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-yellow-600">★</span>
                  <span className="font-medium">{achievement.stars_reward}</span>
                </div>
              </div>
              
              {!achievement.unlocked && currentSession && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              {achievement.unlocked && achievement.unlocked_at && (
                <div className="text-xs text-muted-foreground mt-1">
                  Desbloqueado em {new Date(achievement.unlocked_at).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}