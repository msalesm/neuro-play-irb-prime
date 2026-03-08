/**
 * Analytics Service
 * 
 * Service layer for analytics snapshots and aggregated metrics.
 * Dashboards should use snapshots, NOT live calculations.
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Snapshot Queries ─────────────────────────────────────

export async function fetchLatestSnapshot(institutionId: string) {
  const { data, error } = await supabase
    .from('analytics_snapshot')
    .select('*')
    .eq('institution_id', institutionId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchSnapshotHistory(institutionId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const { data, error } = await supabase
    .from('analytics_snapshot')
    .select('*')
    .eq('institution_id', institutionId)
    .gte('calculated_at', since.toISOString())
    .order('calculated_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── Game Session Metrics ─────────────────────────────────

export async function fetchGameSessionMetrics(childProfileId: string, limit = 50) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('game_id, score, accuracy_percentage, avg_reaction_time_ms, difficulty_level, completed_at')
    .eq('child_profile_id', childProfileId)
    .eq('completed', true)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ─── Adaptive Progress ────────────────────────────────────

export async function fetchAdaptiveProgress(childProfileId: string) {
  const { data, error } = await supabase
    .from('adaptive_progress')
    .select('*')
    .eq('child_profile_id', childProfileId);
  if (error) throw error;
  return data ?? [];
}

// ─── Behavioral Insights ─────────────────────────────────

export async function fetchBehavioralInsights(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('behavioral_insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ─── Clinical Reports ────────────────────────────────────

export async function fetchClinicalReports(userId: string) {
  const { data, error } = await supabase
    .from('clinical_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Queue Performance ───────────────────────────────────

export async function fetchQueuePerformance(institutionId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('queue_performance_metrics')
    .select('*')
    .eq('institution_id', institutionId)
    .gte('metric_date', since.toISOString().split('T')[0])
    .order('metric_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
