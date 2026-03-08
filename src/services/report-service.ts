/**
 * Report Service
 * 
 * Centralizes all report-related data access operations.
 */

import { supabase } from '@/integrations/supabase/client';

// ============ CLINICAL REPORTS ============

export async function fetchClinicalReports(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('clinical_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function insertClinicalReport(params: {
  userId: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  summaryInsights?: string;
  detailedAnalysis?: Record<string, any>;
  progressIndicators?: Record<string, any>;
  interventionRecommendations?: any[];
  alertFlags?: any[];
  generatedByAi?: boolean;
}) {
  const { data, error } = await supabase.rpc('insert_clinical_report', {
    p_user_id: params.userId,
    p_report_type: params.reportType,
    p_report_period_start: params.periodStart,
    p_report_period_end: params.periodEnd,
    p_summary_insights: params.summaryInsights || null,
    p_detailed_analysis: params.detailedAnalysis || {},
    p_progress_indicators: params.progressIndicators || {},
    p_intervention_recommendations: params.interventionRecommendations || [],
    p_alert_flags: params.alertFlags || [],
    p_generated_by_ai: params.generatedByAi ?? true,
  });
  if (error) throw error;
  return data;
}

// ============ BEHAVIORAL INSIGHTS ============

export async function fetchBehavioralInsights(userId: string, childProfileId?: string) {
  let query = supabase
    .from('behavioral_insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (childProfileId) {
    query = query.eq('child_profile_id', childProfileId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ============ LEARNING SESSIONS (for reports) ============

export async function fetchLearningSessionsForReport(userId: string, periodStart: string, periodEnd: string) {
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', periodStart)
    .lte('completed_at', periodEnd)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ GAME SESSIONS (for reports) ============

export async function fetchGameSessionsForReport(childProfileId: string, periodStart: string, periodEnd: string) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*, cognitive_games(game_id, name, cognitive_domains)')
    .eq('child_profile_id', childProfileId)
    .eq('completed', true)
    .gte('completed_at', periodStart)
    .lte('completed_at', periodEnd)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
