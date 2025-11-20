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

export function useGameSession(gameId: string, childProfileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);

  useEffect(() => {
    if (childProfileId && gameId) {
      loadRecommendedDifficulty();
    }
  }, [childProfileId, gameId]);

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
        .single();

      if (gameError || !gameData) {
        throw new Error('Jogo não encontrado');
      }

      let profileId = childProfileId;
      if (!profileId) {
        const { data: profiles } = await supabase
          .from('child_profiles')
          .select('id')
          .eq('parent_user_id', user.id)
          .limit(1)
          .single();
        
        profileId = profiles?.id;
      }

      if (!profileId) {
        throw new Error('Perfil da criança não encontrado');
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
    recordMetric
  };
}
