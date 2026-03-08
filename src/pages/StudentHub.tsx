import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StudentHubHeader } from '@/components/student-hub/StudentHubHeader';
import { StudentHubGreeting } from '@/components/student-hub/StudentHubGreeting';
import { StudentHubCTA } from '@/components/student-hub/StudentHubCTA';
import { StudentHubProgress } from '@/components/student-hub/StudentHubProgress';
import { StudentHubRecommended } from '@/components/student-hub/StudentHubRecommended';
import { StudentHubRoutine } from '@/components/student-hub/StudentHubRoutine';
import { StudentHubAchievements } from '@/components/student-hub/StudentHubAchievements';
import { LevelProgressBar } from '@/components/gamification/LevelProgressBar';
import { WeeklyMissionsCard } from '@/components/gamification/WeeklyMissionsCard';
import { StudentHubWorlds } from '@/components/student-hub/StudentHubWorlds';
import { Sparkles } from 'lucide-react';

export interface DailyMission {
  id: string;
  type: 'routine' | 'story' | 'game';
  title: string;
  iconName: string;
  completed: boolean;
  inProgress?: boolean;
  points: number;
  route: string;
}

export interface ChildData {
  name: string;
  avatar_url?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalStars: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'night';

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
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

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
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (gamification) {
        setChildData({
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Explorador',
          level: gamification.level || 1,
          xp: gamification.experience_points || 0,
          xpToNextLevel: (gamification.level || 1) * 100,
          streak: gamification.current_streak || 0,
          totalStars: gamification.total_stars || 0,
        });
      } else {
        setChildData(prev => ({
          ...prev,
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Explorador',
        }));
      }
    } catch (error) {
      console.error('Error loading child data:', error);
      setChildData(prev => ({
        ...prev,
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Explorador',
      }));
    }
  };

  const loadDailyMissions = async () => {
    try {
      setLoading(true);

      const dailyMissions: DailyMission[] = [
        {
          id: 'game-daily',
          type: 'game',
          title: 'Jogo Cognitivo',
          iconName: 'Gamepad2',
          completed: false,
          points: 40,
          route: '/sistema-planeta-azul',
        },
        {
          id: 'story-daily',
          type: 'story',
          title: 'História do Dia',
          iconName: 'BookOpen',
          completed: false,
          points: 30,
          route: '/stories',
        },
        {
          id: 'routine-daily',
          type: 'routine',
          title: timeOfDay === 'morning' ? 'Rotina da Manhã' : timeOfDay === 'afternoon' ? 'Rotina da Tarde' : 'Rotina da Noite',
          iconName: timeOfDay === 'morning' ? 'Sun' : timeOfDay === 'night' ? 'Moon' : 'Backpack',
          completed: false,
          points: 50,
          route: '/routines',
        },
      ];

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
  const nextActivity = missions.find(m => !m.completed);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <StudentHubHeader childData={childData} />
      
      <div className="max-w-lg mx-auto px-4 space-y-6">
        <StudentHubGreeting 
          childData={childData} 
          timeOfDay={timeOfDay} 
        />

        <LevelProgressBar childData={childData} />
        
        <StudentHubCTA 
          nextActivity={nextActivity} 
          allCompleted={completedCount === missions.length && missions.length > 0}
        />
        
        <StudentHubProgress 
          missions={missions} 
          completedCount={completedCount} 
        />
        
        <StudentHubRecommended />

        <StudentHubWorlds currentLevel={childData.level} />
        
        <StudentHubRoutine 
          missions={missions} 
        />

        <WeeklyMissionsCard />
        
        <StudentHubAchievements 
          childData={childData} 
        />
      </div>
    </div>
  );
}
