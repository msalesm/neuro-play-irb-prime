import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Star, 
  BookOpen, 
  Gamepad2, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  Trophy,
  Rocket,
  Sun,
  Moon,
  Backpack
} from 'lucide-react';

interface DailyMission {
  id: string;
  type: 'routine' | 'story' | 'game';
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  points: number;
  route: string;
}

interface ChildData {
  name: string;
  avatar_url?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalStars: number;
}

export default function StudentHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [childData, setChildData] = useState<ChildData>({
    name: 'Explorador',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 0,
    totalStars: 0,
  });
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'night'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('night');

    if (user) {
      loadChildData();
      loadDailyMissions();
    }
  }, [user]);

  const loadChildData = async () => {
    try {
      // Try to load from user_gamification
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (gamification) {
        setChildData({
          name: user?.email?.split('@')[0] || 'Explorador',
          level: gamification.level || 1,
          xp: gamification.experience_points || 0,
          xpToNextLevel: (gamification.level || 1) * 100,
          streak: gamification.current_streak || 0,
          totalStars: gamification.total_stars || 0,
        });
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const loadDailyMissions = async () => {
    try {
      setLoading(true);

      // Generate daily missions based on available content
      const dailyMissions: DailyMission[] = [
        {
          id: 'routine-morning',
          type: 'routine',
          title: timeOfDay === 'morning' ? 'Rotina da Manhã' : timeOfDay === 'afternoon' ? 'Rotina da Tarde' : 'Rotina da Noite',
          icon: timeOfDay === 'morning' ? <Sun className="h-6 w-6" /> : timeOfDay === 'night' ? <Moon className="h-6 w-6" /> : <Backpack className="h-6 w-6" />,
          completed: false,
          points: 50,
          route: '/routines',
        },
        {
          id: 'story-daily',
          type: 'story',
          title: 'História do Dia',
          icon: <BookOpen className="h-6 w-6" />,
          completed: false,
          points: 30,
          route: '/stories',
        },
        {
          id: 'game-daily',
          type: 'game',
          title: 'Jogo Cognitivo',
          icon: <Gamepad2 className="h-6 w-6" />,
          completed: false,
          points: 40,
          route: '/sistema-planeta-azul',
        },
      ];

      // Check completed activities today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: progress } = await supabase
        .from('story_progress')
        .select('*')
        .eq('user_id', user?.id)
        .gte('completed_at', today.toISOString());

      const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today.toISOString());

      // Mark completed missions
      if (progress && progress.length > 0) {
        const storyMission = dailyMissions.find(m => m.type === 'story');
        if (storyMission) storyMission.completed = true;
      }

      if (sessions && sessions.length > 0) {
        const gameMission = dailyMissions.find(m => m.type === 'game');
        if (gameMission) gameMission.completed = true;
      }

      setMissions(dailyMissions);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = missions.filter(m => m.completed).length;
  const totalPoints = missions.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0);

  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning': return 'Bom dia';
      case 'afternoon': return 'Boa tarde';
      case 'night': return 'Boa noite';
    }
  };

  const getBackgroundGradient = () => {
    switch (timeOfDay) {
      case 'morning': return 'from-amber-100 via-orange-50 to-yellow-100';
      case 'afternoon': return 'from-sky-100 via-blue-50 to-cyan-100';
      case 'night': return 'from-indigo-200 via-purple-100 to-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getBackgroundGradient()} pb-24`}>
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header with Avatar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {childData.name.charAt(0).toUpperCase()}
            </motion.div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500">
              Nível {childData.level}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {getGreeting()}, {childData.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Vamos aprender algo novo hoje?
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <span className="font-medium">Progresso do Dia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="font-bold text-amber-600">{totalPoints} pts</span>
                </div>
              </div>
              <Progress value={(completedCount / missions.length) * 100} className="h-4" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {completedCount} de {missions.length} missões completas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-1" />
                <p className="text-2xl font-bold">{childData.totalStars}</p>
                <p className="text-xs opacity-90">Estrelas</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-1" />
                <p className="text-2xl font-bold">{childData.streak}</p>
                <p className="text-xs opacity-90">Dias Seguidos</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-1" />
                <p className="text-2xl font-bold">{childData.level}</p>
                <p className="text-xs opacity-90">Nível</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Daily Missions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Missões do Dia
          </h2>
          
          <div className="space-y-3">
            {missions.map((mission, idx) => (
              <motion.div
                key={mission.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    mission.completed 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-white hover:bg-primary/5'
                  }`}
                  onClick={() => navigate(mission.route)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        mission.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {mission.completed ? <CheckCircle2 className="h-6 w-6" /> : mission.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{mission.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span>+{mission.points} pontos</span>
                        </div>
                      </div>
                      {mission.completed ? (
                        <Badge className="bg-green-500">Feito!</Badge>
                      ) : (
                        <Button size="sm" className="rounded-full">
                          Começar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold mb-4">Acesso Rápido</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-blue-100 to-cyan-100"
              onClick={() => navigate('/stories')}
            >
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <p className="font-semibold">Histórias</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-purple-100 to-pink-100"
              onClick={() => navigate('/routines')}
            >
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                <p className="font-semibold">Rotinas</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-green-100 to-emerald-100"
              onClick={() => navigate('/sistema-planeta-azul')}
            >
              <CardContent className="p-6 text-center">
                <Gamepad2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p className="font-semibold">Jogos</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-amber-100 to-orange-100"
              onClick={() => navigate('/achievements')}
            >
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-amber-600" />
                <p className="font-semibold">Conquistas</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
