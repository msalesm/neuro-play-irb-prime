import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Routine {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  routine_type: 'manha' | 'escola' | 'noite' | 'custom';
  is_template: boolean;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineStep {
  id: string;
  routine_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  audio_url: string | null;
  order_number: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadRoutines = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('routines')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (queryError) throw queryError;
      setRoutines((data || []) as Routine[]);
    } catch (err) {
      setError('Erro ao carregar rotinas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoutine = async (routine: Partial<Routine>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    const { data, error } = await supabase
      .from('routines')
      .insert({
        title: routine.title || 'Nova Rotina',
        description: routine.description,
        routine_type: routine.routine_type || 'custom',
        is_template: routine.is_template || false,
        icon: routine.icon || 'settings',
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    await loadRoutines();
    return data as Routine;
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    const { error } = await supabase
      .from('routines')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    await loadRoutines();
  };

  const deleteRoutine = async (id: string) => {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadRoutines();
  };

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  return { 
    routines, 
    loading, 
    error, 
    refresh: loadRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine
  };
}

export function useRoutineSteps(routineId: string | null) {
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSteps = useCallback(async () => {
    if (!routineId) {
      setSteps([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('routine_steps')
        .select('*')
        .eq('routine_id', routineId)
        .order('order_number', { ascending: true });
      
      if (queryError) throw queryError;
      setSteps((data || []) as RoutineStep[]);
    } catch (err) {
      setError('Erro ao carregar passos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  const toggleStepComplete = async (stepId: string, completed: boolean) => {
    const { error } = await supabase
      .from('routine_steps')
      .update({ 
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', stepId);
    
    if (error) throw error;
    await loadSteps();
  };

  const addStep = async (step: Partial<RoutineStep>) => {
    if (!routineId) throw new Error('Rotina não selecionada');
    
    const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.order_number)) : 0;
    
    const { data, error } = await supabase
      .from('routine_steps')
      .insert({
        title: step.title || 'Novo Passo',
        description: step.description,
        image_url: step.image_url,
        audio_url: step.audio_url,
        routine_id: routineId,
        order_number: step.order_number ?? maxOrder + 1,
        is_completed: false,
      })
      .select()
      .single();
    
    if (error) throw error;
    await loadSteps();
    return data as RoutineStep;
  };

  const updateStep = async (stepId: string, updates: Partial<RoutineStep>) => {
    const { error } = await supabase
      .from('routine_steps')
      .update(updates)
      .eq('id', stepId);
    
    if (error) throw error;
    await loadSteps();
  };

  const deleteStep = async (stepId: string) => {
    const { error } = await supabase
      .from('routine_steps')
      .delete()
      .eq('id', stepId);
    
    if (error) throw error;
    await loadSteps();
  };

  const resetAllSteps = async () => {
    if (!routineId) return;
    
    const { error } = await supabase
      .from('routine_steps')
      .update({ is_completed: false, completed_at: null })
      .eq('routine_id', routineId);
    
    if (error) throw error;
    await loadSteps();
  };

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  return { 
    steps, 
    loading, 
    error, 
    refresh: loadSteps,
    toggleStepComplete,
    addStep,
    updateStep,
    deleteStep,
    resetAllSteps
  };
}

export function useStoryProgress() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('story_progress')
        .select('points_earned')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const totalPoints = (data || []).reduce((sum, p) => sum + (p.points_earned || 0), 0);
      setPoints(totalPoints);
      setCompletedCount(data?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
    }
  }, [user]);

  const recordProgress = async (type: 'story' | 'routine', id: string, pointsEarned: number = 10) => {
    if (!user) return;
    
    const progressData = {
      user_id: user.id,
      points_earned: pointsEarned,
      completed_at: new Date().toISOString(),
      ...(type === 'story' ? { story_id: id } : { routine_id: id })
    };
    
    const { error } = await supabase
      .from('story_progress')
      .insert(progressData);
    
    if (error) throw error;
    await loadProgress();
  };

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return { points, completedCount, recordProgress, refresh: loadProgress };
}
