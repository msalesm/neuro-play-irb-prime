import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GameState {
  gameType: string;
  level: number;
  score: number;
  moves: number;
  correctMoves: number;
  startTime: Date;
  lastSaveTime: Date;
  sessionId?: string;
  isCompleted: boolean;
  additionalData?: any;
}

interface AutoSaveOptions {
  saveInterval?: number; // ms between auto-saves (default: 10000 = 10s)
  saveOnAction?: boolean; // save after each action (default: false)
  saveOnUnload?: boolean; // save when page closes (default: true)
}

export function useAutoSave(options: AutoSaveOptions = {}) {
  const { user } = useAuth();
  const {
    saveInterval = 10000,
    saveOnAction = false,
    saveOnUnload = true
  } = options;

  const [currentSession, setCurrentSession] = useState<GameState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveSuccess, setLastSaveSuccess] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const hasPendingChangesRef = useRef(false);

  // Iniciar nova sessão
  const startSession = useCallback(async (gameType: string, level: number = 1, additionalData?: any) => {
    if (!user) return null;

    const newSession: GameState = {
      gameType,
      level,
      score: 0,
      moves: 0,
      correctMoves: 0,
      startTime: new Date(),
      lastSaveTime: new Date(),
      isCompleted: false,
      additionalData
    };

    // Criar sessão no banco imediatamente
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          trail_id: additionalData?.trailId || null,
          game_type: gameType,
          level: level,
          performance_data: {
            score: 0,
            moves: 0,
            accuracy: 0,
            startTime: newSession.startTime.toISOString()
          },
          completed: false,
          session_duration_seconds: 0
        })
        .select()
        .single();

      if (error) throw error;

      newSession.sessionId = data.id;
      setCurrentSession(newSession);
      hasPendingChangesRef.current = false;

      console.log('✅ Nova sessão criada:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      setCurrentSession(newSession); // Continua mesmo com erro
      return null;
    }
  }, [user]);

  // Atualizar estado da sessão
  const updateSession = useCallback((updates: Partial<GameState>) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      hasPendingChangesRef.current = true;
      return { ...prev, ...updates };
    });

    // Se saveOnAction está ativo, salvar imediatamente
    if (saveOnAction && hasPendingChangesRef.current) {
      saveSession();
    }
  }, [saveOnAction]);

  // Salvar sessão no banco
  const saveSession = useCallback(async (forceComplete: boolean = false) => {
    if (!currentSession || !user || isSaving) return;

    setIsSaving(true);

    try {
      const now = new Date();
      const durationSeconds = Math.round((now.getTime() - currentSession.startTime.getTime()) / 1000);
      const accuracy = currentSession.moves > 0 
        ? (currentSession.correctMoves / currentSession.moves) * 100 
        : 0;

      const performanceData = {
        score: currentSession.score,
        moves: currentSession.moves,
        correctMoves: currentSession.correctMoves,
        accuracy: accuracy,
        startTime: currentSession.startTime.toISOString(),
        lastUpdate: now.toISOString(),
        ...currentSession.additionalData
      };

      if (currentSession.sessionId) {
        // Atualizar sessão existente
        const { error } = await supabase
          .from('learning_sessions')
          .update({
            performance_data: performanceData,
            completed: forceComplete || currentSession.isCompleted,
            completed_at: forceComplete || currentSession.isCompleted ? now.toISOString() : null,
            session_duration_seconds: durationSeconds
          })
          .eq('id', currentSession.sessionId);

        if (error) throw error;

        console.log('💾 Sessão auto-salva:', currentSession.sessionId, {
          moves: currentSession.moves,
          score: currentSession.score,
          completed: forceComplete || currentSession.isCompleted
        });
      } else {
        // Criar nova sessão se não existe ID (fallback)
        const { data, error } = await supabase
          .from('learning_sessions')
          .insert({
            user_id: user.id,
            trail_id: currentSession.additionalData?.trailId || null,
            game_type: currentSession.gameType,
            level: currentSession.level,
            performance_data: performanceData,
            completed: forceComplete || currentSession.isCompleted,
            completed_at: forceComplete || currentSession.isCompleted ? now.toISOString() : null,
            session_duration_seconds: durationSeconds
          })
          .select()
          .single();

        if (error) throw error;

        setCurrentSession(prev => prev ? { ...prev, sessionId: data.id } : prev);
        console.log('💾 Nova sessão criada no fallback:', data.id);
      }

      setCurrentSession(prev => prev ? { ...prev, lastSaveTime: now } : prev);
      hasPendingChangesRef.current = false;
      setLastSaveSuccess(true);
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      setLastSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }, [currentSession, user, isSaving]);

  // Completar sessão
  const completeSession = useCallback(async (finalData?: any) => {
    if (!currentSession) return null;

    // Atualizar com dados finais
    if (finalData) {
      setCurrentSession(prev => prev ? {
        ...prev,
        ...finalData,
        isCompleted: true
      } : prev);
    }

    // Salvar como completa
    await saveSession(true);

    const completedSession = { ...currentSession, ...finalData, isCompleted: true };
    setCurrentSession(null);
    
    return completedSession;
  }, [currentSession, saveSession]);

  // Cancelar/abandonar sessão (mas ainda salvar o progresso)
  const abandonSession = useCallback(async () => {
    if (currentSession && hasPendingChangesRef.current) {
      console.log('⚠️ Sessão abandonada, salvando progresso...');
      await saveSession(false);
    }
    setCurrentSession(null);
  }, [currentSession, saveSession]);

  // Auto-save periódico
  useEffect(() => {
    if (!currentSession || currentSession.isCompleted) return;

    saveTimeoutRef.current = setInterval(() => {
      if (hasPendingChangesRef.current) {
        console.log('⏰ Auto-save periódico...');
        saveSession();
      }
    }, saveInterval);

    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
      }
    };
  }, [currentSession, saveInterval, saveSession]);

  // Save on page unload
  useEffect(() => {
    if (!saveOnUnload) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (currentSession && hasPendingChangesRef.current) {
        e.preventDefault();
        
        // Tentar salvar síncronamente
        await saveSession(false);
        
        // Mostrar aviso se há mudanças não salvas
        if (hasPendingChangesRef.current) {
          e.returnValue = 'Você tem progresso não salvo. Tem certeza que deseja sair?';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSession, saveOnUnload, saveSession]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (currentSession && hasPendingChangesRef.current) {
        console.log('🧹 Componente desmontando, salvando sessão...');
        saveSession(false);
      }
    };
  }, [currentSession, saveSession]);

  return {
    currentSession,
    isSaving,
    lastSaveSuccess,
    hasPendingChanges: hasPendingChangesRef.current,
    startSession,
    updateSession,
    saveSession,
    completeSession,
    abandonSession
  };
}
