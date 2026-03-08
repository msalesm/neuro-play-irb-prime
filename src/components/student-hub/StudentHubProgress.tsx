import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import type { DailyMission } from '@/pages/StudentHub';

interface Props {
  missions: DailyMission[];
  completedCount: number;
}

const domainLabels: Record<string, string> = {
  game: 'Cognição',
  story: 'Linguagem',
  routine: 'Autonomia',
};

export function StudentHubProgress({ missions, completedCount }: Props) {
  const pct = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Progresso do dia</span>
            <span className="text-xs font-bold text-primary">{Math.round(pct)}%</span>
          </div>

          <Progress value={pct} className="h-3" />

          <div className="flex items-center gap-4 flex-wrap">
            {missions.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5 text-xs">
                {m.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={m.completed ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {domainLabels[m.type] || m.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
