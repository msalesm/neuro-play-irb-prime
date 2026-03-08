import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, CheckCircle2, Star } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { BADGES, getBadgeRarityColor, getBadgeRarityLabel } from '@/data/gamification';

// ─── Daily Streak ───
export function DuolingoStreak() {
  const { dailyStreak, longestStreak, todayGames } = useGamification();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${dailyStreak > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
              <Flame className={`h-6 w-6 ${dailyStreak > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{dailyStreak}</p>
              <p className="text-xs text-muted-foreground">dias seguidos</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Recorde: <span className="font-semibold text-foreground">{longestStreak}</span></p>
            <p className="text-muted-foreground">Hoje: <span className="font-semibold text-foreground">{todayGames} jogos</span></p>
          </div>
        </div>
        {dailyStreak >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-center text-destructive font-medium">
            🔥 Sequência de fogo! Continue assim!
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Daily Missions ───
export function DailyMissionSection() {
  const { todayGames } = useGamification();

  const missions = [
    { title: 'Jogue 3 partidas', target: 3, current: todayGames, xp: 30, icon: '🎮' },
    { title: 'Alcance 80% em um jogo', target: 1, current: todayGames > 0 ? 1 : 0, xp: 20, icon: '🎯' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Missões Diárias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.map((m, i) => {
          const completed = m.current >= m.target;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{m.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className={completed ? 'line-through text-muted-foreground' : ''}>{m.title}</span>
                  <Badge variant={completed ? 'default' : 'outline'} className="text-xs">
                    {completed ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                    +{m.xp} XP
                  </Badge>
                </div>
                <Progress value={(m.current / m.target) * 100} className="h-1.5" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Achievements List ───
export function AchievementsList() {
  const { unlockedBadges } = useGamification();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Insígnias ({unlockedBadges.length}/{BADGES.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map(badge => {
            const unlocked = unlockedBadges.includes(badge.key);
            return (
              <div
                key={badge.key}
                className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                  unlocked ? getBadgeRarityColor(badge.rarity) : 'opacity-30 grayscale border-border bg-muted/20'
                }`}
                title={`${badge.name} - ${badge.description}`}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-[10px] font-medium leading-tight truncate w-full">{badge.name}</span>
                {unlocked && (
                  <span className="text-[9px] text-muted-foreground">{getBadgeRarityLabel(badge.rarity)}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Badge Unlock Modal ───
export function BadgeUnlockModal({ badgeKey, onClose }: { badgeKey?: string; onClose?: () => void }) {
  const [show, setShow] = useState(!!badgeKey);
  const badge = BADGES.find(b => b.key === badgeKey);

  useEffect(() => { setShow(!!badgeKey); }, [badgeKey]);

  if (!badge || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={() => { setShow(false); onClose?.(); }}
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 50 }}
          className={`p-8 rounded-2xl border-2 text-center max-w-xs ${getBadgeRarityColor(badge.rarity)}`}
          onClick={e => e.stopPropagation()}
        >
          <motion.span
            className="text-6xl block mb-4"
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8 }}
          >
            {badge.icon}
          </motion.span>
          <h3 className="text-xl font-bold mb-1">{badge.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
          <Badge className="mb-4">{getBadgeRarityLabel(badge.rarity)}</Badge>
          <p className="text-xs text-muted-foreground mt-3">Toque para fechar</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
