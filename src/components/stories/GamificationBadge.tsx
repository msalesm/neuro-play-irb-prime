import { Star, Trophy, Flame, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface GamificationBadgeProps {
  points: number;
  completedCount: number;
  streak?: number;
}

export function GamificationBadge({ points, completedCount, streak = 0 }: GamificationBadgeProps) {
  const level = Math.floor(points / 100) + 1;
  const progressToNextLevel = points % 100;

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Points */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 rounded-full bg-amber-500/20">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pontos</p>
              <p className="text-lg font-bold text-foreground">{points}</p>
            </div>
          </motion.div>

          {/* Level */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 rounded-full bg-purple-500/20">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nível</p>
              <p className="text-lg font-bold text-foreground">{level}</p>
            </div>
          </motion.div>

          {/* Completed */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 rounded-full bg-green-500/20">
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
              <p className="text-lg font-bold text-foreground">{completedCount}</p>
            </div>
          </motion.div>

          {/* Streak */}
          {streak > 0 && (
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="p-2 rounded-full bg-orange-500/20">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sequência</p>
                <p className="text-lg font-bold text-foreground">{streak} dias</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Progress bar to next level */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso para Nível {level + 1}</span>
            <span>{progressToNextLevel}/100</span>
          </div>
          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
