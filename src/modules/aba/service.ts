/**
 * ABA Service
 * 
 * Centralizes all ABA-related data access operations.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AbaTeachingMethod = Database['public']['Enums']['aba_teaching_method'];
type AbaPromptLevel = Database['public']['Enums']['aba_prompt_level'];

// ============ SKILLS ============

export async function fetchAbaSkills() {
  const { data, error } = await supabase
    .from('aba_np_skills')
    .select('*')
    .eq('is_active', true)
    .order('skill_category');
  if (error) throw error;
  return data;
}

// ============ PROGRAMS ============

export async function fetchAbaPrograms(childId?: string) {
  let query = supabase
    .from('aba_np_programs')
    .select('*, profiles!aba_np_programs_created_by_fkey(full_name)')
    .order('created_at', { ascending: false });
  if (childId) query = query.eq('child_id', childId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createAbaProgram(program: {
  child_id: string;
  program_name: string;
  notes?: string;
  created_by: string;
}) {
  const { data, error } = await supabase
    .from('aba_np_programs')
    .insert(program)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ INTERVENTIONS ============

export async function fetchAbaInterventions(programId: string) {
  const { data, error } = await supabase
    .from('aba_np_interventions')
    .select('*, aba_np_skills(skill_name, skill_category, description)')
    .eq('program_id', programId)
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function createAbaIntervention(intervention: {
  program_id: string;
  skill_id: string;
  baseline_level?: number;
  target_level?: number;
  teaching_method?: AbaTeachingMethod;
  prompting_strategy?: string;
  reinforcement_type?: string;
  success_criteria?: string;
}) {
  const { data, error } = await supabase
    .from('aba_np_interventions')
    .insert(intervention)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ TRIALS ============

export async function fetchAbaTrials(interventionId: string, limit = 100) {
  const { data, error } = await supabase
    .from('aba_np_trials')
    .select('*')
    .eq('intervention_id', interventionId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function recordAbaTrial(trial: {
  child_id: string;
  intervention_id: string;
  correct: boolean;
  prompt_level: AbaPromptLevel;
  latency_ms?: number;
  notes?: string;
  reinforcement_given?: boolean;
  reinforcement_type?: string;
  response?: string;
  session_number?: number;
  recorded_by: string;
}) {
  const { data, error } = await supabase
    .from('aba_np_trials')
    .insert(trial)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ REINFORCEMENTS ============

export async function fetchAbaReinforcements() {
  const { data, error } = await supabase
    .from('aba_np_reinforcements')
    .select('*')
    .order('category');
  if (error) throw error;
  return data;
}

// ============ SESSIONS ============

export async function createAbaSession(session: {
  program_id: string;
  child_id: string;
  therapist_id: string;
  session_number?: number;
  environment?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('aba_np_sessions')
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAbaSessions(programId: string) {
  const { data, error } = await supabase
    .from('aba_np_sessions')
    .select('*')
    .eq('program_id', programId)
    .order('session_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function completeAbaSession(sessionId: string, durationMinutes: number, notes?: string) {
  const { data, error } = await supabase
    .from('aba_np_sessions')
    .update({ status: 'completed', duration_minutes: durationMinutes, notes })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ GOALS ============

export async function fetchAbaGoals(programId: string) {
  const { data, error } = await supabase
    .from('aba_np_goals')
    .select('*')
    .eq('program_id', programId)
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function createAbaGoal(goal: {
  program_id: string;
  intervention_id?: string;
  goal_description: string;
  success_criteria?: string;
  target_date?: string;
}) {
  const { data, error } = await supabase
    .from('aba_np_goals')
    .insert(goal)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAbaGoalStatus(goalId: string, status: string) {
  const updates: Record<string, any> = { status };
  if (status === 'achieved') updates.achieved_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('aba_np_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ CLINICAL NOTES ============

export async function fetchAbaClinicalNotes(childId: string, sessionId?: string) {
  let query = supabase
    .from('aba_np_clinical_notes')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });
  if (sessionId) query = query.eq('session_id', sessionId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createAbaClinicalNote(note: {
  session_id?: string;
  program_id?: string;
  child_id: string;
  therapist_id: string;
  note_type?: string;
  content: string;
  tags?: string[];
}) {
  const { data, error } = await supabase
    .from('aba_np_clinical_notes')
    .insert(note)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ PROGRESS ============

export async function fetchAbaProgress(programId: string) {
  const { data, error } = await supabase
    .from('aba_np_progress')
    .select('*')
    .eq('program_id', programId)
    .order('period_end', { ascending: false });
  if (error) throw error;
  return data;
}

// ============ GAME MAPPING ============

export async function fetchAbaGameMapping(programId?: string, skillId?: string) {
  let query = supabase
    .from('aba_np_game_mapping')
    .select('*, cognitive_games(id, title, category)')
    .eq('is_recommended', true);
  if (programId) query = query.eq('program_id', programId);
  if (skillId) query = query.eq('skill_id', skillId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createAbaGameMapping(mapping: {
  program_id?: string;
  skill_id?: string;
  game_id: string;
  recommendation_reason?: string;
}) {
  const { data, error } = await supabase
    .from('aba_np_game_mapping')
    .insert(mapping)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ PROGRESS STATS (aggregate) ============

export async function fetchAbaProgressStats(childId: string) {
  const [programsRes, trialsRes, sessionsRes] = await Promise.all([
    supabase
      .from('aba_np_programs')
      .select('id, program_name, status')
      .eq('child_id', childId),
    supabase
      .from('aba_np_trials')
      .select('correct, prompt_level, recorded_at')
      .eq('child_id', childId)
      .order('recorded_at', { ascending: false })
      .limit(500),
    supabase
      .from('aba_np_sessions')
      .select('id, status, duration_minutes, session_date')
      .eq('child_id', childId)
      .order('session_date', { ascending: false })
      .limit(100),
  ]);

  if (programsRes.error) throw programsRes.error;
  if (trialsRes.error) throw trialsRes.error;

  return {
    programs: programsRes.data || [],
    trials: trialsRes.data || [],
    sessions: sessionsRes.data || [],
  };
}
