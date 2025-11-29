import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BondingMetrics {
  qualityScore: number; // 0-100
  collaborationRate: number;
  communicationScore: number;
  totalActivitiesCompleted: number;
  totalTimeSpent: number; // minutes
  averageDuration: number;
  recentTrend: 'improving' | 'stable' | 'declining';
  strengths: string[];
  improvements: string[];
}

export const useBondingMetrics = (userId?: string) => {
  const [metrics, setMetrics] = useState<BondingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadBondingMetrics();
    }
  }, [userId]);

  const loadBondingMetrics = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Get child profiles
      const { data: childProfiles, error: profilesError } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', userId);

      if (profilesError) throw profilesError;

      const childIds = childProfiles?.map(p => p.id) || [];
      if (childIds.length === 0) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      // Get completed cooperative sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('cooperative_sessions')
        .select('*')
        .in('host_profile_id', childIds)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        setMetrics({
          qualityScore: 0,
          collaborationRate: 0,
          communicationScore: 0,
          totalActivitiesCompleted: 0,
          totalTimeSpent: 0,
          averageDuration: 0,
          recentTrend: 'stable',
          strengths: [],
          improvements: ['Começar atividades cooperativas']
        });
        setLoading(false);
        return;
      }

      // Calculate metrics
      const totalActivities = sessions.length;
      const totalTime = sessions.reduce((sum, s) => {
        const started = s.started_at ? new Date(s.started_at).getTime() : 0;
        const completed = s.completed_at ? new Date(s.completed_at).getTime() : 0;
        return sum + (completed - started) / 60000; // minutes
      }, 0);

      // Analyze session data for quality metrics
      const qualityScores: number[] = [];
      const collaborationScores: number[] = [];
      const communicationScores: number[] = [];

      sessions.forEach(session => {
        const data = session.session_data as any || {};
        
        // Extract metrics from session data
        const quality = data.bondingQuality || calculateQualityFromSession(session);
        const collaboration = data.collaborationScore || 75;
        const communication = data.communicationScore || 75;

        qualityScores.push(quality);
        collaborationScores.push(collaboration);
        communicationScores.push(communication);
      });

      const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
      const avgCollaboration = collaborationScores.reduce((a, b) => a + b, 0) / collaborationScores.length;
      const avgCommunication = communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length;

      // Determine trend
      const recentSessions = sessions.slice(0, 5);
      const olderSessions = sessions.slice(5, 10);
      
      const recentAvg = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + ((s.session_data as any)?.bondingQuality || 80), 0) / recentSessions.length
        : avgQuality;
      
      const olderAvg = olderSessions.length > 0
        ? olderSessions.reduce((sum, s) => sum + ((s.session_data as any)?.bondingQuality || 75), 0) / olderSessions.length
        : avgQuality;

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentAvg > olderAvg + 5) trend = 'improving';
      if (recentAvg < olderAvg - 5) trend = 'declining';

      // Identify strengths and improvements
      const strengths: string[] = [];
      const improvements: string[] = [];

      if (avgCollaboration >= 80) strengths.push('Excelente trabalho em equipe');
      if (avgCommunication >= 80) strengths.push('Comunicação clara e efetiva');
      if (totalActivities >= 10) strengths.push('Consistência nas atividades');
      if (avgQuality >= 85) strengths.push('Forte vínculo emocional');

      if (avgCollaboration < 70) improvements.push('Praticar mais atividades colaborativas');
      if (avgCommunication < 70) improvements.push('Focar em comunicação durante jogos');
      if (totalActivities < 5) improvements.push('Aumentar frequência de atividades');

      setMetrics({
        qualityScore: Math.round(avgQuality),
        collaborationRate: Math.round(avgCollaboration),
        communicationScore: Math.round(avgCommunication),
        totalActivitiesCompleted: totalActivities,
        totalTimeSpent: Math.round(totalTime),
        averageDuration: Math.round(totalTime / totalActivities),
        recentTrend: trend,
        strengths,
        improvements: improvements.length > 0 ? improvements : ['Continue o ótimo trabalho!']
      });

    } catch (error) {
      console.error('Error loading bonding metrics:', error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateQualityFromSession = (session: any): number => {
    // Base quality on completion time and interaction
    const started = session.started_at ? new Date(session.started_at).getTime() : 0;
    const completed = session.completed_at ? new Date(session.completed_at).getTime() : 0;
    const duration = (completed - started) / 60000; // minutes

    // Ideal duration: 15-30 minutes
    let durationScore = 100;
    if (duration < 10) durationScore = 70;
    else if (duration > 40) durationScore = 80;

    return durationScore;
  };

  return { metrics, loading, reload: loadBondingMetrics };
};
