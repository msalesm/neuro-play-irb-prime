import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { getLevelInfo, getNextLevelInfo, getLevelProgress } from '@/data/gamification';
import { Flame, Star } from 'lucide-react';
import type { ChildData } from '@/pages/StudentHub';

interface Props {
  childData: ChildData;
}

export function LevelProgressBar({ childData }: Props) {
  const levelInfo = getLevelInfo(childData.xp);
  const nextLevel = getNextLevelInfo(childData.xp);
  const progress = getLevelProgress(childData.xp);

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-2xl border border-border p-3"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{levelInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{levelInfo.title}</p>
            <p className="text-xs text-primary font-semibold">{childData.xp} XP</p>
          </div>
          <Progress value={progress} className="h-2 mt-1" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Nível {levelInfo.level}</span>
        {nextLevel ? (
          <span>{nextLevel.xpRequired - childData.xp} XP para {nextLevel.title}</span>
        ) : (
          <span>Nível máximo! 🌟</span>
        )}
      </div>

      {/* Streak + Stars mini stats */}
      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs">
          <Flame className="h-4 w-4 text-[hsl(var(--neuroplay-orange))]" />
          <span className="font-medium text-foreground">{childData.streak} dias</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="h-4 w-4 text-[hsl(var(--neuroplay-yellow))]" />
          <span className="font-medium text-foreground">{childData.totalStars} estrelas</span>
        </div>
      </div>
    </motion.div>
  );
}
