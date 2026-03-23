import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WellnessHomeHeader } from '@/components/wellness/WellnessHomeHeader';
import { WellnessDomainCards } from '@/components/wellness/WellnessDomainCards';
import { WellnessWeeklyProgress } from '@/components/wellness/WellnessWeeklyProgress';
import { WellnessAISuggestion } from '@/components/wellness/WellnessAISuggestion';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function WellnessHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('Explorador');
  const [cognitiveScore, setCognitiveScore] = useState(0);
  const [domainProgress, setDomainProgress] = useState({
    attention: 0,
    emotion: 0,
    social: 0,
    creativity: 0,
  });
  const [weekData, setWeekData] = useState<{ day: string; value: number }[]>([]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setName(user?.user_metadata?.name || user?.email?.split('@')[0] || 'Explorador');

      // Load gamification data for cognitive score
      const { data: gam } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      const xp = gam?.experience_points || 0;
      const level = gam?.level || 1;
      setCognitiveScore(Math.min(100, Math.round((xp / (level * 100)) * 100)));

      // Load learning sessions for weekly data
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('created_at, session_duration_seconds')
        .eq('user_id', user!.id)
        .gte('created_at', weekStart.toISOString());

      // Build weekly progress
      const weekMap = new Map<number, number>();
      sessions?.forEach(s => {
        const day = new Date(s.created_at!).getDay();
        weekMap.set(day, (weekMap.get(day) || 0) + Math.round((s.session_duration_seconds || 300) / 60));
      });

      const todayIndex = now.getDay();
      const wData = WEEK_DAYS.map((d, i) => ({
        day: d,
        value: weekMap.get(i) || (i <= todayIndex ? 0 : 0),
      }));
      setWeekData(wData);

      // Estimate domain progress from sessions count
      const totalMin = sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
      setDomainProgress({
        attention: Math.min(100, Math.round((totalMin / 60) * 100)),
        emotion: Math.min(100, Math.round(xp > 0 ? 45 : 0)),
        social: Math.min(100, Math.round(xp > 0 ? 30 : 0)),
        creativity: Math.min(100, Math.round(xp > 0 ? 25 : 0)),
      });

    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <WellnessHomeHeader
        name={name}
        avatarUrl={user?.user_metadata?.avatar_url}
        cognitiveScore={cognitiveScore}
      />

      <div className="space-y-5">
        <WellnessDomainCards progress={domainProgress} />

        <WellnessWeeklyProgress weekData={weekData} />

        <WellnessAISuggestion
          title="Treino de Atenção"
          description="Exercício personalizado baseado no seu desempenho recente"
          duration="3 minutos"
          route="/activity"
        />
      </div>
    </div>
  );
}
