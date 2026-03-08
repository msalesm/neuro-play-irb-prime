import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BADGES, 
  getBadgeRarityColor, 
  getBadgeRarityLabel,
  getLevelInfo,
  getNextLevelInfo,
  getLevelProgress,
  type BadgeDefinition 
} from '@/data/gamification';
import { Trophy, Flame, Star, Lock } from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());
  const [userXP, setUserXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [achResult, gamResult] = await Promise.all([
        supabase
          .from('user_achievements')
          .select('achievement_key')
          .eq('user_id', user!.id)
          .eq('completed', true),
        supabase
          .from('user_gamification')
          .select('experience_points, current_streak, total_stars')
          .eq('user_id', user!.id)
          .single(),
      ]);

      if (achResult.data) {
        setUnlockedKeys(new Set(achResult.data.map(a => a.achievement_key)));
      }
      if (gamResult.data) {
        setUserXP(gamResult.data.experience_points || 0);
        setStreak(gamResult.data.current_streak || 0);
        setTotalStars(gamResult.data.total_stars || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const levelInfo = getLevelInfo(userXP);
  const progress = getLevelProgress(userXP);
  const nextLevel = getNextLevelInfo(userXP);
  const totalUnlocked = unlockedKeys.size;

  const categories = [
    { key: 'all', label: 'Todas' },
    { key: 'milestone', label: 'Marcos' },
    { key: 'performance', label: 'Performance' },
    { key: 'streak', label: 'Sequência' },
    { key: 'exploration', label: 'Exploração' },
  ];

  const renderBadge = (badge: BadgeDefinition) => {
    const unlocked = unlockedKeys.has(badge.key);
    return (
      <motion.div
        key={badge.key}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 mb-1.5 transition-all ${
            unlocked
              ? getBadgeRarityColor(badge.rarity)
              : 'border-muted bg-muted/30 grayscale'
          }`}
        >
          {unlocked ? (
            <span className="text-2xl">{badge.icon}</span>
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground/50" />
          )}
        </div>
        <p className={`text-[10px] font-medium text-center leading-tight max-w-[72px] ${
          unlocked ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {badge.name}
        </p>
        <Badge variant="outline" className="text-[8px] h-4 mt-0.5">
          {getBadgeRarityLabel(badge.rarity)}
        </Badge>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header stats */}
      <div className="bg-gradient-to-br from-[hsl(var(--neuroplay-orange))] to-[hsl(var(--neuroplay-yellow))] p-6 text-white">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5" />
            Conquistas
          </h1>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <span className="text-2xl">{levelInfo.icon}</span>
              <p className="text-xs mt-1 font-medium">Nível {levelInfo.level}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <Flame className="h-6 w-6 mx-auto" />
              <p className="text-xs mt-1 font-medium">{streak} dias</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <Star className="h-6 w-6 mx-auto" />
              <p className="text-xs mt-1 font-medium">{totalStars} ⭐</p>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4 bg-white/10 rounded-xl p-3">
            <div className="flex justify-between text-xs mb-1">
              <span>{levelInfo.title}</span>
              <span>{nextLevel ? `${nextLevel.xpRequired - userXP} XP restantes` : 'Nível máximo!'}</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>

          <p className="text-center text-sm mt-3 text-white/80">
            {totalUnlocked} / {BADGES.length} conquistas desbloqueadas
          </p>
        </div>
      </div>

      {/* Badges grid */}
      <div className="max-w-lg mx-auto px-4 -mt-2">
        <Tabs defaultValue="all">
          <TabsList className="w-full overflow-x-auto flex justify-start bg-card border border-border">
            {categories.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs flex-shrink-0">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.key} value={cat.key} className="mt-4">
              <div className="grid grid-cols-4 gap-4">
                {BADGES
                  .filter(b => cat.key === 'all' || b.category === cat.key)
                  .sort((a, b) => {
                    const aU = unlockedKeys.has(a.key) ? 0 : 1;
                    const bU = unlockedKeys.has(b.key) ? 0 : 1;
                    return aU - bU;
                  })
                  .map(badge => renderBadge(badge))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
