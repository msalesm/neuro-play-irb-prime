import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RoutineEntry {
  id: string;
  date: string;
  sleep_hours: number | null;
  sleep_quality: string | null;
  mood: string | null;
  stress_level: number | null;
  physical_activity: boolean;
  school_event: string | null;
  notes: string | null;
}

interface RoutineInsight {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  correlation: number;
  factor: string;
}

interface RoutineAnalysis {
  entries: RoutineEntry[];
  insights: RoutineInsight[];
  avgSleepHours: number;
  avgStressLevel: number;
  moodDistribution: Record<string, number>;
  sleepImpact: number;
  stressImpact: number;
}

export const useRoutineData = (childId: string) => {
  return useQuery({
    queryKey: ['routine-data', childId],
    queryFn: async (): Promise<RoutineAnalysis> => {
      // Fetch emotional check-ins for this child as proxy for routine data
      const { data: checkIns, error: checkInsError } = await supabase
        .from('emotional_checkins')
        .select('*')
        .eq('child_profile_id', childId)
        .order('scheduled_for', { ascending: false })
        .limit(30);

      if (checkInsError) throw checkInsError;

      // Fetch game sessions to correlate with routine for this child
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', childId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      // Transform check-ins into routine entries
      const entries: RoutineEntry[] = (checkIns || []).map(ci => ({
        id: ci.id,
        date: ci.scheduled_for,
        sleep_hours: null,
        sleep_quality: null,
        mood: ci.emotions_detected?.[0] || null,
        stress_level: ci.mood_rating ? 5 - ci.mood_rating : null,
        physical_activity: false,
        school_event: null,
        notes: ci.notes
      }));

      // Calculate mood distribution
      const moodDistribution: Record<string, number> = {};
      entries.forEach(e => {
        if (e.mood) {
          moodDistribution[e.mood] = (moodDistribution[e.mood] || 0) + 1;
        }
      });

      // Calculate averages
      const stressLevels = entries.filter(e => e.stress_level !== null).map(e => e.stress_level!);
      const avgStressLevel = stressLevels.length > 0 
        ? stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length 
        : 0;

      // Generate insights based on correlations
      const insights: RoutineInsight[] = [];

      // Analyze mood impact on performance
      const goodMoodSessions = sessions?.filter(s => {
        const sessionDate = new Date(s.created_at || '').toDateString();
        const matchingEntry = entries.find(e => new Date(e.date).toDateString() === sessionDate);
        return matchingEntry?.mood === 'feliz' || matchingEntry?.mood === 'calmo';
      }) || [];

      const badMoodSessions = sessions?.filter(s => {
        const sessionDate = new Date(s.created_at || '').toDateString();
        const matchingEntry = entries.find(e => new Date(e.date).toDateString() === sessionDate);
        return matchingEntry?.mood === 'triste' || matchingEntry?.mood === 'ansioso';
      }) || [];

      if (goodMoodSessions.length > 0 && badMoodSessions.length > 0) {
        const goodAvg = goodMoodSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / goodMoodSessions.length;
        const badAvg = badMoodSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / badMoodSessions.length;
        const diff = goodAvg - badAvg;

        if (diff > 10) {
          insights.push({
            type: 'positive',
            message: `Humor positivo aumenta precisão em ${diff.toFixed(0)}%`,
            correlation: diff / 100,
            factor: 'mood'
          });
        }
      }

      // Stress impact insight
      if (avgStressLevel > 3) {
        insights.push({
          type: 'negative',
          message: 'Níveis elevados de estresse detectados - considere atividades de relaxamento',
          correlation: avgStressLevel / 5,
          factor: 'stress'
        });
      }

      // Consistency insight
      if (entries.length >= 7) {
        insights.push({
          type: 'positive',
          message: 'Registro consistente de rotina permite análises mais precisas',
          correlation: 0.8,
          factor: 'consistency'
        });
      }

      return {
        entries,
        insights,
        avgSleepHours: 8, // Placeholder - would need actual sleep data
        avgStressLevel,
        moodDistribution,
        sleepImpact: 0.15,
        stressImpact: avgStressLevel > 3 ? -0.2 : 0
      };
    },
    enabled: !!childId
  });
};
