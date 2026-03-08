import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, CheckCircle2, Star } from 'lucide-react';
import { useTourAchievements } from '@/hooks/useTourAchievements';
import { cn } from '@/lib/utils';

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-amber-500 to-amber-600',
};

const rarityLabels = {
  common: 'Comum',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Lendária',
};

export const TourAchievementsPanel = () => {
  const { achievements, loading, getProgress } = useTourAchievements();
  const progress = getProgress();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Conquistas de Exploração
          </CardTitle>
          <Badge variant="secondary" className="text-lg">
            {progress.completed}/{progress.total}
          </Badge>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Progresso Total
            </span>
            <span className="text-sm font-medium">
              {Math.round(progress.percentage)}%
            </span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={cn(
              'relative overflow-hidden transition-all duration-300',
              achievement.unlocked
                ? 'border-2 hover:shadow-lg cursor-default'
                : 'opacity-60 border-dashed',
              achievement.unlocked && achievement.rarity === 'legendary' && 'border-amber-500/50',
              achievement.unlocked && achievement.rarity === 'epic' && 'border-purple-500/50',
              achievement.unlocked && achievement.rarity === 'rare' && 'border-blue-500/50',
              achievement.unlocked && achievement.rarity === 'common' && 'border-gray-500/50'
            )}>
              {achievement.unlocked && (
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-5',
                  rarityColors[achievement.rarity as keyof typeof rarityColors]
                )} />
              )}

              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0',
                    achievement.unlocked
                      ? cn('bg-gradient-to-br shadow-lg', rarityColors[achievement.rarity as keyof typeof rarityColors])
                      : 'bg-muted'
                  )}>
                    {achievement.unlocked ? (
                      <span className="text-2xl">{achievement.icon}</span>
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn(
                        'font-semibold',
                        !achievement.unlocked && 'text-muted-foreground'
                      )}>
                        {achievement.unlocked ? achievement.name : '???'}
                      </h3>
                      {achievement.unlocked && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    <p className={cn(
                      'text-sm mb-2',
                      achievement.unlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    )}>
                      {achievement.unlocked ? achievement.description : 'Complete o tour para desbloquear'}
                    </p>

                    <div className="flex items-center gap-2">
                      {achievement.unlocked && (
                        <Badge className={cn(
                          'text-white text-xs border-0',
                          `bg-gradient-to-r ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`
                        )}>
                          <Star className="w-3 h-3 mr-1" />
                          {rarityLabels[achievement.rarity as keyof typeof rarityLabels]}
                        </Badge>
                      )}
                      
                      {achievement.progress !== undefined && achievement.required_value && (
                        <Badge variant="outline" className="text-xs">
                          {achievement.progress}/{achievement.required_value}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {achievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma conquista disponível ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
