import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WEEKLY_MISSION_TEMPLATES, type WeeklyMission } from '@/data/gamification';
import { Target, CheckCircle2, Clock } from 'lucide-react';

export function WeeklyMissionsCard() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<WeeklyMission[]>([]);

  useEffect(() => {
    if (user) loadWeeklyProgress();
  }, [user]);

  const loadWeeklyProgress = async () => {
    try {
      // Get start of current week (Monday)
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);

      const [sessionsResult, storiesResult] = await Promise.all([
        supabase
          .from('learning_sessions')
          .select('id')
          .eq('user_id', user!.id)
          .gte('created_at', weekStart.toISOString()),
        supabase
          .from('story_progress')
          .select('id')
          .eq('user_id', user!.id)
          .gte('completed_at', weekStart.toISOString()),
      ]);

      const gamesPlayed = sessionsResult.data?.length || 0;
      const storiesCompleted = storiesResult.data?.length || 0;

      setMissions(
        WEEKLY_MISSION_TEMPLATES.map(t => ({
          ...t,
          current: t.id === 'weekly-games-10' ? gamesPlayed
            : t.id === 'weekly-stories-3' ? storiesCompleted
            : 0,
        }))
      );
    } catch (e) {
      console.error(e);
      setMissions(WEEKLY_MISSION_TEMPLATES.map(t => ({ ...t, current: 0 })));
    }
  };

  if (missions.length === 0) return null;

  return (
    <motion.section
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.35 }}
    >
      <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-secondary" />
        Missões da Semana
      </h2>

      <Card className="border-border bg-card">
        <CardContent className="p-3 space-y-3">
          {missions.map(m => {
            const pct = Math.min(100, (m.current / m.target) * 100);
            const done = m.current >= m.target;
            return (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {m.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{m.current}/{m.target}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                ) : (
                  <Badge variant="outline" className="text-[10px] h-5 flex-shrink-0">
                    +{m.xpReward} XP
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.section>
  );
}
