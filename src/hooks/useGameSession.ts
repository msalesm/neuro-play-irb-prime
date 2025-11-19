import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface GameMetric {
  event_type: 'attempt' | 'correct' | 'incorrect' | 'pause' | 'resume' | 'hint' | 'frustration';
  reaction_time_ms?: number;
  event_data?: any;
}

export interface GameSessionData {
  score: number;
  max_possible_score: number;
  accuracy_percentage: number;
  total_attempts: number;
  correct_attempts: number;
  incorrect_attempts: number;
  avg_reaction_time_ms: number;
  session_data?: any;
}

export const useGameSession = (gameId: string, childProfileId?: string) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const sessionStartTime = useRef<number>(0);
  const metricsBuffer = useRef<GameMetric[]>([]);
  const reactionTimes = useRef<number[]>([]);

  // Buscar dificuldade recomendada
  useEffect(() => {
    if (!childProfileId || !gameId) return;

    const fetchRecommendedDifficulty = async () => {
      const { data: game } = await supabase
        .from('cognitive_games')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (!game) return;

      const { data: progress } = await supabase
        .from('adaptive_progress')
        .select('recommended_next_difficulty, current_difficulty')
        .eq('child_profile_id', childProfileId)
        .eq('game_id', game.id)
        .maybeSingle();

      if (progress) {
        setCurrentDifficulty(progress.recommended_next_difficulty || progress.current_difficulty || 1);
      }
    };

    fetchRecommendedDifficulty();
  }, [gameId, childProfileId]);

  // Iniciar sessão
  const startSession = useCallback(async () => {
    if (!user || !childProfileId) {
      toast.error('É necessário estar autenticado e ter um perfil de criança selecionado');
      return null;
    }

    try {
      // Buscar ID do jogo
      const { data: game, error: gameError } = await supabase
        .from('cognitive_games')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (gameError) throw gameError;

      // Criar sessão
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          child_profile_id: childProfileId,
          game_id: game.id,
          difficulty_level: currentDifficulty,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(session.id);
      setIsActive(true);
      sessionStartTime.current = Date.now();
      metricsBuffer.current = [];
      reactionTimes.current = [];

      console.log('✅ Sessão iniciada:', session.id, 'Dificuldade:', currentDifficulty);
      return session.id;
    } catch (error: any) {
      console.error('❌ Erro ao iniciar sessão:', error);
      toast.error('Erro ao iniciar jogo');
      return null;
    }
  }, [user, childProfileId, gameId, currentDifficulty]);

  // Registrar métrica
  const recordMetric = useCallback((metric: GameMetric) => {
    if (!sessionId || !isActive) return;

    const timestamp_ms = Date.now() - sessionStartTime.current;
    
    metricsBuffer.current.push({
      ...metric,
      timestamp_ms,
    });

    if (metric.reaction_time_ms) {
      reactionTimes.current.push(metric.reaction_time_ms);
    }

    // Flush buffer a cada 10 métricas
    if (metricsBuffer.current.length >= 10) {
      flushMetrics();
    }
  }, [sessionId, isActive]);

  // Flush métricas para o banco
  const flushMetrics = useCallback(async () => {
    if (!sessionId || metricsBuffer.current.length === 0) return;

    const metricsToSend = metricsBuffer.current.map(m => ({
      session_id: sessionId,
      timestamp_ms: m.timestamp_ms,
      event_type: m.event_type,
      event_data: m.event_data || {},
      reaction_time_ms: m.reaction_time_ms,
      difficulty_at_event: currentDifficulty,
    }));

    metricsBuffer.current = [];

    try {
      const { error } = await supabase
        .from('game_metrics')
        .insert(metricsToSend);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
    }
  }, [sessionId, currentDifficulty]);

  // Finalizar sessão
  const endSession = useCallback(async (sessionData: GameSessionData) => {
    if (!sessionId || !isActive) return;

    // Flush métricas pendentes
    await flushMetrics();

    const duration_seconds = Math.floor((Date.now() - sessionStartTime.current) / 1000);

    // Calcular tempo de reação médio
    const avgReactionTime = reactionTimes.current.length > 0
      ? Math.floor(reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length)
      : null;

    const fastestReactionTime = reactionTimes.current.length > 0
      ? Math.min(...reactionTimes.current)
      : null;

    const slowestReactionTime = reactionTimes.current.length > 0
      ? Math.max(...reactionTimes.current)
      : null;

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          completed_at: new Date().toISOString(),
          completed: true,
          duration_seconds,
          score: sessionData.score,
          max_possible_score: sessionData.max_possible_score,
          accuracy_percentage: sessionData.accuracy_percentage,
          total_attempts: sessionData.total_attempts,
          correct_attempts: sessionData.correct_attempts,
          incorrect_attempts: sessionData.incorrect_attempts,
          avg_reaction_time_ms: avgReactionTime,
          fastest_reaction_time_ms: fastestReactionTime,
          slowest_reaction_time_ms: slowestReactionTime,
          session_data: sessionData.session_data || {},
        })
        .eq('id', sessionId);

      if (error) throw error;

      console.log('✅ Sessão finalizada:', sessionId);
      
      setIsActive(false);
      setSessionId(null);

      // Ajustar dificuldade para próxima sessão
      if (sessionData.accuracy_percentage >= 80) {
        setCurrentDifficulty(prev => Math.min(10, prev + 1));
        toast.success('🎯 Excelente! Próximo nível mais desafiador!');
      } else if (sessionData.accuracy_percentage < 50) {
        setCurrentDifficulty(prev => Math.max(1, prev - 1));
        toast.info('💪 Continue praticando! Próximo nível mais fácil.');
      } else {
        toast.success('✨ Ótimo trabalho! Continue assim!');
      }

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao finalizar sessão:', error);
      toast.error('Erro ao salvar progresso');
      return false;
    }
  }, [sessionId, isActive, flushMetrics]);

  // Pausar/Retomar sessão
  const pauseSession = useCallback(() => {
    if (!isActive) return;
    recordMetric({ event_type: 'pause' });
    setIsActive(false);
  }, [isActive, recordMetric]);

  const resumeSession = useCallback(() => {
    if (isActive) return;
    recordMetric({ event_type: 'resume' });
    setIsActive(true);
  }, [isActive, recordMetric]);

  return {
    sessionId,
    isActive,
    currentDifficulty,
    startSession,
    endSession,
    recordMetric,
    pauseSession,
    resumeSession,
  };
};
