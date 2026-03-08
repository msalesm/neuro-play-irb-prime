import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  COGNITIVE_WORLDS, 
  getLevelInfo, 
  getNextLevelInfo, 
  getLevelProgress,
  type CognitiveWorld 
} from '@/data/gamification';
import { Lock, ChevronRight, Sparkles, Map } from 'lucide-react';

export default function WorldMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  const loadProgress = async () => {
    try {
      const { data } = await supabase
        .from('user_gamification')
        .select('experience_points, level')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (data) {
        setUserXP(data.experience_points || 0);
        setUserLevel(data.level || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const levelInfo = getLevelInfo(userXP);
  const nextLevel = getNextLevelInfo(userXP);
  const progress = getLevelProgress(userXP);

  const isWorldUnlocked = (world: CognitiveWorld) => userLevel >= world.requiredLevel;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent p-6 pb-10 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-5 w-5" />
            <h1 className="text-xl font-bold">Mapa NeuroPlay</h1>
          </div>

          {/* Level indicator */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{levelInfo.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-lg">{levelInfo.title}</p>
                <p className="text-white/70 text-xs">Nível {levelInfo.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{userXP} XP</p>
                {nextLevel && (
                  <p className="text-xs text-white/60">{nextLevel.xpRequired - userXP} para próximo</p>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Worlds */}
      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {COGNITIVE_WORLDS.map((world, idx) => {
          const unlocked = isWorldUnlocked(world);
          return (
            <motion.div
              key={world.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={`overflow-hidden border transition-all ${
                  unlocked 
                    ? 'cursor-pointer hover:shadow-lg border-border' 
                    : 'opacity-60 border-muted'
                }`}
                onClick={() => unlocked && navigate(`/sistema-planeta-azul`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* World icon area */}
                    <div className={`w-24 bg-gradient-to-br ${world.gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-4xl">{world.icon}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 flex items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground">{world.name}</h3>
                          {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{world.description}</p>
                        {!unlocked && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Requer nível {world.requiredLevel}
                          </p>
                        )}
                        {unlocked && (
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-[10px] h-5">
                              {world.games.length} jogos
                            </Badge>
                          </div>
                        )}
                      </div>
                      {unlocked && (
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
