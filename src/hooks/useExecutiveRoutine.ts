import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RoutineExecution {
  id: string;
  routine_id: string;
  child_id: string | null;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
  total_steps: number;
  completed_steps: number;
  planned_duration_minutes: number | null;
  actual_duration_minutes: number | null;
  autonomy_score: number;
  reminders_needed: number;
  interruptions: number;
  notes: string | null;
}

export interface StepExecution {
  id: string;
  execution_id: string;
  step_id: string;
  started_at: string | null;
  completed_at: string | null;
  skipped: boolean;
  latency_seconds: number | null;
  duration_seconds: number | null;
  needed_reminder: boolean;
  needed_help: boolean;
}

export interface ExecutiveMetrics {
  organizationIndex: number; // 0-100
  autonomyScore: number; // 0-100
  completionRate: number; // 0-100
  avgLatencySeconds: number;
  avgDurationSeconds: number;
  consistencyScore: number; // 0-100
  abandonmentRate: number; // 0-100
  reminderDependency: number; // 0-100 (lower = more autonomous)
  totalExecutions: number;
}

export function useExecutiveRoutine() {
  const { user } = useAuth();
  const [currentExecution, setCurrentExecution] = useState<RoutineExecution | null>(null);
  const [stepTimers, setStepTimers] = useState<Record<string, number>>({});

  const startExecution = useCallback(async (
    routineId: string, 
    totalSteps: number, 
    childId?: string,
    plannedMinutes?: number
  ) => {
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('routine_executions')
      .insert({
        routine_id: routineId,
        user_id: user.id,
        child_id: childId || null,
        total_steps: totalSteps,
        planned_duration_minutes: plannedMinutes || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    setCurrentExecution(data as RoutineExecution);
    return data as RoutineExecution;
  }, [user]);

  const startStep = useCallback((stepId: string) => {
    setStepTimers(prev => ({ ...prev, [stepId]: Date.now() }));
  }, []);

  const completeStep = useCallback(async (
    executionId: string, 
    stepId: string, 
    options?: { neededReminder?: boolean; neededHelp?: boolean }
  ) => {
    const stepStartTime = stepTimers[stepId];
    const now = Date.now();
    const latency = stepStartTime ? (stepStartTime - (stepTimers['__step_shown'] || stepStartTime)) / 1000 : null;
    const duration = stepStartTime ? (now - stepStartTime) / 1000 : null;

    const { error } = await supabase
      .from('routine_step_executions')
      .insert({
        execution_id: executionId,
        step_id: stepId,
        started_at: stepStartTime ? new Date(stepStartTime).toISOString() : null,
        completed_at: new Date().toISOString(),
        latency_seconds: latency,
        duration_seconds: duration,
        needed_reminder: options?.neededReminder || false,
        needed_help: options?.neededHelp || false,
      });

    if (error) throw error;

    // Update execution completed_steps count
    await supabase
      .from('routine_executions')
      .update({ completed_steps: (currentExecution?.completed_steps || 0) + 1 })
      .eq('id', executionId);

    setCurrentExecution(prev => prev ? { ...prev, completed_steps: prev.completed_steps + 1 } : null);
  }, [stepTimers, currentExecution]);

  const skipStep = useCallback(async (executionId: string, stepId: string) => {
    const { error } = await supabase
      .from('routine_step_executions')
      .insert({
        execution_id: executionId,
        step_id: stepId,
        skipped: true,
      });
    if (error) throw error;
  }, []);

  const completeExecution = useCallback(async (executionId: string, reminders?: number, interruptions?: number) => {
    const startedAt = currentExecution?.started_at ? new Date(currentExecution.started_at).getTime() : Date.now();
    const actualMinutes = (Date.now() - startedAt) / 60000;
    const totalSteps = currentExecution?.total_steps || 1;
    const completedSteps = currentExecution?.completed_steps || 0;
    const remindersCount = reminders || 0;

    // Calculate autonomy: 100 - (reminders penalty + help penalty)
    const reminderPenalty = Math.min(50, remindersCount * 10);
    const completionBonus = (completedSteps / totalSteps) * 50;
    const autonomyScore = Math.max(0, completionBonus + 50 - reminderPenalty);

    const { error } = await supabase
      .from('routine_executions')
      .update({
        completed_at: new Date().toISOString(),
        actual_duration_minutes: Math.round(actualMinutes * 10) / 10,
        autonomy_score: Math.round(autonomyScore),
        reminders_needed: remindersCount,
        interruptions: interruptions || 0,
      })
      .eq('id', executionId);

    if (error) throw error;
    setCurrentExecution(null);
  }, [currentExecution]);

  const abandonExecution = useCallback(async (executionId: string) => {
    const { error } = await supabase
      .from('routine_executions')
      .update({ abandoned_at: new Date().toISOString() })
      .eq('id', executionId);

    if (error) throw error;
    setCurrentExecution(null);
  }, []);

  const getMetrics = useCallback(async (childId?: string): Promise<ExecutiveMetrics> => {
    if (!user) return defaultMetrics();

    let query = supabase
      .from('routine_executions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (childId) query = query.eq('child_id', childId);

    const { data: executions, error } = await query;
    if (error || !executions?.length) return defaultMetrics();

    const completed = executions.filter(e => e.completed_at);
    const abandoned = executions.filter(e => e.abandoned_at);
    const total = executions.length;

    const completionRate = total > 0 ? (completed.length / total) * 100 : 0;
    const abandonmentRate = total > 0 ? (abandoned.length / total) * 100 : 0;

    const avgAutonomy = completed.length > 0
      ? completed.reduce((sum, e) => sum + (Number(e.autonomy_score) || 0), 0) / completed.length
      : 0;

    const totalReminders = executions.reduce((sum, e) => sum + (e.reminders_needed || 0), 0);
    const reminderDependency = total > 0 ? Math.min(100, (totalReminders / total) * 20) : 0;

    // Organization Index = weighted average
    const organizationIndex = Math.round(
      completionRate * 0.3 + avgAutonomy * 0.3 + (100 - abandonmentRate) * 0.2 + (100 - reminderDependency) * 0.2
    );

    // Consistency: how many days in last 7 had executions
    const last7Days = new Set(
      executions
        .filter(e => {
          const d = new Date(e.created_at);
          return d > new Date(Date.now() - 7 * 86400000);
        })
        .map(e => new Date(e.created_at).toDateString())
    );
    const consistencyScore = Math.round((last7Days.size / 7) * 100);

    return {
      organizationIndex,
      autonomyScore: Math.round(avgAutonomy),
      completionRate: Math.round(completionRate),
      avgLatencySeconds: 0, // would need step executions join
      avgDurationSeconds: 0,
      consistencyScore,
      abandonmentRate: Math.round(abandonmentRate),
      reminderDependency: Math.round(reminderDependency),
      totalExecutions: total,
    };
  }, [user]);

  return {
    currentExecution,
    startExecution,
    startStep,
    completeStep,
    skipStep,
    completeExecution,
    abandonExecution,
    getMetrics,
  };
}

function defaultMetrics(): ExecutiveMetrics {
  return {
    organizationIndex: 0,
    autonomyScore: 0,
    completionRate: 0,
    avgLatencySeconds: 0,
    avgDurationSeconds: 0,
    consistencyScore: 0,
    abandonmentRate: 0,
    reminderDependency: 0,
    totalExecutions: 0,
  };
}
