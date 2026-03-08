/**
 * Game Service
 * 
 * Centralizes all game-related data access operations.
 * Hooks should consume these services instead of calling Supabase directly.
 */

import { supabase } from '@/integrations/supabase/client';

// ============ GAME LOOKUP ============

export async function findGameBySlug(gameId: string) {
  const { data, error } = await supabase
    .from('cognitive_games')
    .select('id')
    .eq('game_id', gameId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============ PROFILES ============

export async function getChildProfile(userId: string) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id')
    .eq('parent_user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function verifyChildProfile(profileId: string, userId: string) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id')
    .eq('id', profileId)
    .eq('parent_user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============ SESSIONS ============

export async function getIncompleteSessions(profileId: string, gameDbId: string, since: string) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('child_profile_id', profileId)
    .eq('game_id', gameDbId)
    .eq('completed', false)
    .gte('started_at', since)
    .order('started_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data;
}

export async function getRecommendedDifficulty(profileId: string, gameDbId: string) {
  const { data, error } = await supabase
    .from('adaptive_progress')
    .select('recommended_next_difficulty, current_difficulty')
    .eq('child_profile_id', profileId)
    .eq('game_id', gameDbId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createGameSession(params: {
  childProfileId: string;
  gameDbId: string;
  difficulty: number;
}) {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      child_profile_id: params.childProfileId,
      game_id: params.gameDbId,
      difficulty_level: params.difficulty,
      started_at: new Date().toISOString(),
      completed: false,
      score: 0,
      accuracy_percentage: 0,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function completeGameSession(sessionId: string, data: {
  score: number;
  accuracy_percentage: number;
  duration_seconds: number;
  difficulty_level: number;
  correct_attempts: number;
  total_attempts: number;
  avg_reaction_time_ms: number | null;
  performance_data: Record<string, any>;
}) {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      ...data,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function abandonGameSession(sessionId: string, performanceData: Record<string, any>) {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      completed: false,
      performance_data: performanceData,
    })
    .eq('id', sessionId);
  if (error) throw error;
}

// ============ HISTORY ============

export async function getSessionHistory(profileId: string, gameId: string, limit = 30) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('child_profile_id', profileId)
    .eq('game_id', gameId)
    .eq('completed', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ============ LEARNING SESSIONS (universal persistence) ============

export async function saveLearningSession(params: {
  userId: string;
  gameType: string;
  sessionDurationSeconds: number;
  performanceData: Record<string, any>;
}) {
  const { error } = await supabase
    .from('learning_sessions')
    .insert({
      user_id: params.userId,
      game_type: params.gameType,
      session_duration_seconds: params.sessionDurationSeconds,
      performance_data: params.performanceData,
      completed: true,
    });
  if (error) console.error('Error saving learning session:', error);
}
