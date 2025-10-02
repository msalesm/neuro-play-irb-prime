import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UnfinishedSession {
  id: string;
  game_type: string;
  level: number;
  performance_data: any;
  created_at: string;
  session_duration_seconds: number;
}

export function useSessionRecovery(gameType?: string) {
  const { user } = useAuth();
  const [unfinishedSessions, setUnfinishedSessions] = useState<UnfinishedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUnfinishedSessions();
    }
  }, [user, gameType]);

  const fetchUnfinishedSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Filtrar por tipo de jogo se especificado
      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar sessões recentes (últimas 24h)
      const recentSessions = (data || []).filter(session => {
        const sessionTime = new Date(session.created_at).getTime();
        const now = Date.now();
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
        return hoursDiff < 24; // Sessões das últimas 24 horas
      });

      setUnfinishedSessions(recentSessions as UnfinishedSession[]);
    } catch (error) {
      console.error('Erro ao buscar sessões não finalizadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const resumeSession = async (sessionId: string) => {
    const session = unfinishedSessions.find(s => s.id === sessionId);
    return session;
  };

  const discardSession = async (sessionId: string) => {
    try {
      // Marcar como abandonada
      const { error } = await supabase
        .from('learning_sessions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          performance_data: {
            abandoned: true
          }
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Remover da lista
      setUnfinishedSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Erro ao descartar sessão:', error);
    }
  };

  const clearOldSessions = async (olderThanHours: number = 24) => {
    try {
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('learning_sessions')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .eq('completed', false)
        .lt('created_at', cutoffTime);

      if (error) throw error;

      await fetchUnfinishedSessions();
    } catch (error) {
      console.error('Erro ao limpar sessões antigas:', error);
    }
  };

  return {
    unfinishedSessions,
    loading,
    hasUnfinishedSessions: unfinishedSessions.length > 0,
    resumeSession,
    discardSession,
    clearOldSessions,
    refresh: fetchUnfinishedSessions
  };
}
