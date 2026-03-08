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

// ============ PROGRESS STATS ============

export async function fetchAbaProgressStats(childId: string) {
  const [programsRes, trialsRes] = await Promise.all([
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
  ]);

  if (programsRes.error) throw programsRes.error;
  if (trialsRes.error) throw trialsRes.error;

  return {
    programs: programsRes.data || [],
    trials: trialsRes.data || [],
  };
}
