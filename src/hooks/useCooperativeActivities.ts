import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CooperativeActivity {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  ageRange: string;
  bondingFocus: string;
  difficulty: number;
  game_id: string;
}

interface CooperativeSession {
  id: string;
  game_id: string;
  status: string;
  completed_at: string | null;
  session_data: any;
}

export const useCooperativeActivities = (userId?: string) => {
  const [activities, setActivities] = useState<CooperativeActivity[]>([]);
  const [sessions, setSessions] = useState<CooperativeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadActivities();
      loadSessions();
    }
  }, [userId]);

  const loadActivities = async () => {
    try {
      setLoading(true);

      // Fetch cooperative games from cognitive_games
      const { data: games, error } = await supabase
        .from('cognitive_games')
        .select('*')
        .eq('active', true)
        .contains('cognitive_domains', ['social_skills']);

      if (error) throw error;

      // Map games to cooperative activities
      const mappedActivities: CooperativeActivity[] = (games || []).map(game => ({
        id: game.id,
        name: game.name,
        description: game.description || 'Atividade cooperativa para desenvolver habilidades sociais',
        category: determineCategoryFromDomains(game.cognitive_domains || []),
        duration: game.avg_duration_minutes || 15,
        ageRange: `${game.age_min || 5}-${game.age_max || 15} anos`,
        bondingFocus: 'Comunicação e colaboração',
        difficulty: Math.floor((game.difficulty_levels || 5) / 2),
        game_id: game.game_id
      }));

      setActivities(mappedActivities);
    } catch (error: any) {
      console.error('Error loading activities:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!userId) return;

    try {
      // Get child profiles for the user
      const { data: childProfiles, error: profilesError } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', userId);

      if (profilesError) throw profilesError;

      const childIds = childProfiles?.map(p => p.id) || [];

      if (childIds.length === 0) {
        setSessions([]);
        return;
      }

      // Fetch cooperative sessions
      const { data: cooperativeSessions, error: sessionsError } = await supabase
        .from('cooperative_sessions')
        .select('*')
        .in('host_profile_id', childIds)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      setSessions(cooperativeSessions || []);
    } catch (error: any) {
      console.error('Error loading sessions:', error);
    }
  };

  const determineCategoryFromDomains = (domains: string[]): string => {
    if (domains.includes('attention')) return 'Cognitivo';
    if (domains.includes('memory')) return 'Memória';
    if (domains.includes('language')) return 'Linguagem';
    if (domains.includes('social_skills')) return 'Social';
    if (domains.includes('emotional_regulation')) return 'Emocional';
    return 'Criatividade';
  };

  const isActivityCompleted = (gameId: string): boolean => {
    return sessions.some(s => s.game_id === gameId && s.status === 'completed');
  };

  const getActivityStars = (gameId: string): number => {
    const completedSessions = sessions.filter(
      s => s.game_id === gameId && s.status === 'completed'
    );
    
    if (completedSessions.length === 0) return 0;
    
    // Calculate average performance (mock for now)
    return Math.min(5, Math.floor(completedSessions.length / 2) + 3);
  };

  return {
    activities,
    sessions,
    loading,
    isActivityCompleted,
    getActivityStars,
    reload: () => {
      loadActivities();
      loadSessions();
    }
  };
};
