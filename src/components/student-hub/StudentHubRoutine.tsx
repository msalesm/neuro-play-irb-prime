import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, ChevronRight, Gamepad2, BookOpen, Sun, Moon, Backpack } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DailyMission } from '@/pages/StudentHub';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2,
  BookOpen,
  Sun,
  Moon,
  Backpack,
};

interface Props {
  missions: DailyMission[];
}

export function StudentHubRoutine({ missions }: Props) {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-base font-bold text-foreground mb-3">Rotina de hoje</h2>

      <div className="space-y-2">
        {missions.map((mission, idx) => {
          const Icon = iconMap[mission.iconName] || Gamepad2;
          return (
            <motion.div
              key={mission.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.45 + idx * 0.08 }}
            >
              <Card
                className={`cursor-pointer transition-all border ${
                  mission.completed
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
                }`}
                onClick={() => navigate(mission.route)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mission.completed
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {mission.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${mission.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {mission.title}
                    </p>
                    <p className="text-xs text-muted-foreground">+{mission.points} pontos</p>
                  </div>

                  {!mission.completed && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
