import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, Crown, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  requirement: {
    type: 'level' | 'score' | 'streak' | 'accuracy' | 'perfect';
    value: number;
  };
}

interface SimonAchievementsProps {
  stats: {
    level: number;
    score: number;
    bestStreak: number;
    accuracy: number;
    perfectRounds: number;
  };
}

export function SimonAchievements({ stats }: SimonAchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: 'first_success',
      name: 'Primeiro Sucesso',
      description: 'Complete o nível 5',
      icon: <Star className="w-5 h-5" />,
      unlocked: stats.level >= 5,
      requirement: { type: 'level', value: 5 }
    },
    {
      id: 'memory_master',
      name: 'Memória de Elefante',
      description: 'Complete o nível 10',
      icon: <Trophy className="w-5 h-5" />,
      unlocked: stats.level >= 10,
      requirement: { type: 'level', value: 10 }
    },
    {
      id: 'simon_master',
      name: 'Mestre Simon',
      description: 'Complete o nível 15',
      icon: <Crown className="w-5 h-5" />,
      unlocked: stats.level >= 15,
      requirement: { type: 'level', value: 15 }
    },
    {
      id: 'speed_demon',
      name: 'Relâmpago',
      description: 'Sequência perfeita de 10',
      icon: <Zap className="w-5 h-5" />,
      unlocked: stats.bestStreak >= 10,
      requirement: { type: 'streak', value: 10 }
    },
    {
      id: 'sharpshooter',
      name: 'Precisão Absoluta',
      description: '95% de precisão',
      icon: <Target className="w-5 h-5" />,
      unlocked: stats.accuracy >= 95,
      requirement: { type: 'accuracy', value: 95 }
    },
    {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description: '5 rodadas perfeitas',
      icon: <Award className="w-5 h-5" />,
      unlocked: stats.perfectRounds >= 5,
      requirement: { type: 'perfect', value: 5 }
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Conquistas
          </h3>
          <Badge variant="outline">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={cn(
                'p-3 rounded-lg border-2 transition-all duration-300',
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50 shadow-lg'
                  : 'bg-muted/50 border-muted grayscale opacity-60'
              )}
            >
              <div className={cn(
                'flex flex-col items-center text-center gap-2',
                achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
              )}>
                <div className={cn(
                  'p-2 rounded-full',
                  achievement.unlocked
                    ? 'bg-yellow-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {achievement.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{achievement.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
                {achievement.unlocked && (
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-700 border-green-500/50">
                    ✓ Desbloqueada
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
