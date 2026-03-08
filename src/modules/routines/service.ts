/**
 * Routines Service
 * 
 * Data access for executive routines and task analytics.
 */

import { supabase } from '@/integrations/supabase/client';

export async function fetchRoutines(userId: string) {
  const { data, error } = await supabase
    .from('routines')
    .select('*, routine_tasks(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchRoutineExecutions(routineId: string, limit = 30) {
  const { data, error } = await supabase
    .from('routine_executions')
    .select('*, routine_task_executions(*)')
    .eq('routine_id', routineId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function saveRoutineExecution(params: {
  routineId: string;
  userId: string;
  completedTasks: number;
  totalTasks: number;
  durationSeconds: number;
  interruptions: number;
}) {
  const { error } = await supabase
    .from('routine_executions')
    .insert({
      routine_id: params.routineId,
      user_id: params.userId,
      completed_tasks: params.completedTasks,
      total_tasks: params.totalTasks,
      duration_seconds: params.durationSeconds,
      interruptions: params.interruptions,
      completed: params.completedTasks === params.totalTasks,
    });
  if (error) throw error;
}
