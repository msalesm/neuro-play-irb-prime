import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Rocket, Flame } from 'lucide-react';
import type { ChildData } from '@/pages/StudentHub';

interface Props {
  childData: ChildData;
}

export function StudentHubAchievements({ childData }: Props) {
  const achievements = [
    {
      id: 'streak',
      icon: Flame,
      label: `${childData.streak} dias seguidos`,
      color: 'text-[hsl(var(--neuroplay-orange))]',
      bg: 'bg-[hsl(var(--neuroplay-orange))]/10',
      show: childData.streak > 0,
    },
    {
      id: 'stars',
      icon: Star,
      label: `${childData.totalStars} estrelas`,
      color: 'text-[hsl(var(--neuroplay-yellow))]',
      bg: 'bg-[hsl(var(--neuroplay-yellow))]/10',
      show: true,
    },
    {
      id: 'level',
      icon: Rocket,
      label: `Nível ${childData.level}`,
      color: 'text-primary',
      bg: 'bg-primary/10',
      show: true,
    },
  ].filter(a => a.show);

  if (achievements.length === 0) return null;

  return (
    <motion.section
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.55 }}
    >
      <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[hsl(var(--neuroplay-orange))]" />
        Conquistas
      </h2>

      <div className="flex gap-3">
        {achievements.map((ach) => {
          const Icon = ach.icon;
          return (
            <Card key={ach.id} className="flex-1 border-border bg-card">
              <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ach.bg}`}>
                  <Icon className={`h-5 w-5 ${ach.color}`} />
                </div>
                <span className="text-xs font-medium text-foreground leading-tight">{ach.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.section>
  );
}
