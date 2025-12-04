import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface SessionData {
  score?: number;
  accuracy?: number;
  timeSpent?: number;
  correctMoves?: number;
  totalMoves?: number;
  reactionTimes?: number[];
  hintsUsed?: number;
  errors?: any[];
  quitReason?: string;
  pauseCount?: number;
  [key: string]: any;
}

export function useGameSession(gameId: string, childProfileId?: string, isTestMode: boolean = false) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [recoveredSession, setRecoveredSession] = useState<any>(null);

  // Check for interrupted sessions on mount
  useEffect(() => {
    if (user && gameId) {
      checkForInterruptedSession();
    }
  }, [user, gameId]);

  useEffect(() => {
    if (childProfileId && gameId) {
      loadRecommendedDifficulty();
    }
  }, [childProfileId, gameId]);

  const checkForInterruptedSession = async () => {
    try {
      const { data: gameData } = await supabase
        .from('cognitive_games')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (!gameData) return;

      let profileId = childProfileId;
      if (!profileId && user) {
        const { data: profiles } = await supabase
          .from('child_profiles')
          .select('id')
          .eq('parent_user_id', user.id)
          .limit(1)
          .single();
        profileId = profiles?.id;
      }

      if (!profileId) return;

      // Find incomplete sessions from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: incompleteSessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', profileId)
        .eq('game_id', gameData.id)
        .eq('completed', false)
        .gte('started_at', oneDayAgo)
        .order('started_at', { ascending: false })
        .limit(1);

      if (incompleteSessions && incompleteSessions.length > 0) {
        setRecoveredSession(incompleteSessions[0]);
      }
    } catch (error) {
      console.error('Error checking for interrupted session:', error);
    }
  };

  const resumeSession = useCallback((session: any) => {
    setSessionId(session.id);
    setIsActive(true);
    setCurrentDifficulty(session.difficulty_level || 1);
    setRecoveredSession(null);
    
    toast({
      title: "Sessão Recuperada",
      description: "Continuando de onde você parou",
    });
    
    return session.session_data || {};
  }, [toast]);

  const discardRecoveredSession = useCallback(async () => {
    if (recoveredSession) {
      try {
        await supabase
          .from('game_sessions')
          .update({
            completed: true,
            quit_reason: 'session_abandoned',
            completed_at: new Date().toISOString()
          })
          .eq('id', recoveredSession.id);
        
        setRecoveredSession(null);
      } catch (error) {
        console.error('Error discarding session:', error);
      }
    }
  }, [recoveredSession]);

  const loadRecommendedDifficulty = async () => {
    try {
      const { data: gameData } = await supabase
        .from('cognitive_games')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (!gameData) return;

      const { data: progress } = await supabase
        .from('adaptive_progress')
        .select('recommended_next_difficulty, current_difficulty')
        .eq('child_profile_id', childProfileId!)
        .eq('game_id', gameData.id)
        .maybeSingle();

      if (progress) {
        setCurrentDifficulty(progress.recommended_next_difficulty || progress.current_difficulty || 1);
      }
    } catch (error) {
      console.error('Error loading difficulty:', error);
    }
  };

  const startSession = useCallback(async (data?: SessionData, initialDifficulty?: number) => {
    // Test mode: skip database operations
    if (isTestMode) {
      setSessionId('test-session');
      setIsActive(true);
      return { success: true, sessionId: 'test-session' };
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para jogar",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { data: gameData, error: gameError } = await supabase
        .from('cognitive_games')
        .select('id')
        .eq('game_id', gameId)
        .maybeSingle();

      if (gameError) {
        throw new Error(`Erro ao buscar jogo: ${gameError.message}`);
      }

      if (!gameData) {
        throw new Error(`Jogo "${gameId}" não encontrado no sistema`);
      }

      let profileId = childProfileId;
      if (!profileId) {
        const { data: profiles } = await supabase
          .from('child_profiles')
          .select('id')
          .eq('parent_user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        profileId = profiles?.id;
      }

      // Se não há perfil, ativar modo teste automaticamente
      if (!profileId) {
        console.warn('Sem perfil - ativando modo teste');
        setSessionId('test-session');
        setIsActive(true);
        return { success: true, sessionId: 'test-session', testMode: true };
      }

      const { count } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('child_profile_id', profileId)
        .eq('game_id', gameData.id);

      const difficulty = initialDifficulty || currentDifficulty;

      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert({
          child_profile_id: profileId,
          game_id: gameData.id,
          session_number: (count || 0) + 1,
          difficulty_level: difficulty,
          started_at: new Date().toISOString(),
          score: data?.score || 0,
          session_data: data || {}
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(session.id);
      setIsActive(true);
      setCurrentDifficulty(difficulty);

      return { success: true, sessionId: session.id };
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast({
        title: "Erro ao iniciar sessão",
        description: error.message,
        variant: "destructive"
      });
      return { success: false };
    }
  }, [user, gameId, childProfileId, currentDifficulty, toast]);

  const endSession = useCallback(async (data?: SessionData) => {
    // Test mode: skip database operations
    if (isTestMode) {
      setIsActive(false);
      setSessionId(null);
      return { success: true };
    }

    if (!sessionId || !isActive) {
      return { success: false };
    }

    try {
      const completedAt = new Date().toISOString();
      const startedAt = new Date();

      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single();

      if (sessionData?.started_at) {
        startedAt.setTime(new Date(sessionData.started_at).getTime());
      }

      const durationSeconds = Math.floor((new Date().getTime() - startedAt.getTime()) / 1000);
      
      const totalAttempts = (data?.correctMoves || 0) + ((data?.totalMoves || 0) - (data?.correctMoves || 0));
      const accuracy = totalAttempts > 0 ? ((data?.correctMoves || 0) / totalAttempts) * 100 : 0;
      const reactionTimes = data?.reactionTimes || [];
      const avgReactionTime = reactionTimes.length > 0 
        ? Math.floor(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : null;

      const { error } = await supabase
        .from('game_sessions')
        .update({
          completed: true,
          completed_at: completedAt,
          duration_seconds: data?.timeSpent || durationSeconds,
          score: data?.score || 0,
          accuracy_percentage: accuracy,
          correct_attempts: data?.correctMoves || 0,
          incorrect_attempts: (data?.totalMoves || 0) - (data?.correctMoves || 0),
          total_attempts: totalAttempts,
          avg_reaction_time_ms: avgReactionTime,
          fastest_reaction_time_ms: reactionTimes.length > 0 ? Math.min(...reactionTimes) : null,
          slowest_reaction_time_ms: reactionTimes.length > 0 ? Math.max(...reactionTimes) : null,
          help_requests: data?.hintsUsed || 0,
          error_pattern: data?.errors || null,
          quit_reason: data?.quitReason,
          pause_count: data?.pauseCount || 0,
          session_data: data || {}
        })
        .eq('id', sessionId);

      if (error) throw error;

      setIsActive(false);
      setSessionId(null);

      supabase.functions.invoke('cognitive-analysis', {
        body: { sessionId }
      }).catch(err => console.error('Analysis error:', err));

      return { success: true };
    } catch (error: any) {
      console.error('Error ending session:', error);
      toast({
        title: "Erro ao finalizar sessão",
        description: error.message,
        variant: "destructive"
      });
      return { success: false };
    }
  }, [sessionId, isActive, toast]);

  const updateSession = useCallback(async (data: SessionData) => {
    // Test mode: skip database operations
    if (isTestMode) {
      return { success: true };
    }

    if (!sessionId || !isActive) {
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          score: data.score,
          session_data: data
        })
        .eq('id', sessionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating session:', error);
      return { success: false };
    }
  }, [sessionId, isActive]);

  const recordMetric = useCallback(async (metricData: {
    eventType: string;
    eventData?: any;
    reactionTimeMs?: number;
  }) => {
    if (!sessionId || !isActive) {
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('game_metrics')
        .insert({
          session_id: sessionId,
          event_type: metricData.eventType,
          event_data: metricData.eventData || {},
          reaction_time_ms: metricData.reactionTimeMs,
          timestamp_ms: Date.now(),
          difficulty_at_event: currentDifficulty
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error recording metric:', error);
      return { success: false };
    }
  }, [sessionId, isActive, currentDifficulty]);

  return {
    sessionId,
    startSession,
    endSession,
    updateSession,
    isActive,
    currentDifficulty,
    recordMetric,
    recoveredSession,
    resumeSession,
    discardRecoveredSession
  };
}
