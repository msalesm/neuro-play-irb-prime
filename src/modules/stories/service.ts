/**
 * Stories Service
 * 
 * Data access for social stories and socioemotional tracking.
 */

import { supabase } from '@/integrations/supabase/client';

export async function fetchSocialStories(status?: string) {
  let query = supabase
    .from('social_stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchStoryProgress(userId: string, storyId: string) {
  const { data, error } = await supabase
    .from('story_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveStoryDecision(params: {
  userId: string;
  storyId: string;
  sceneId: string;
  choiceId: string;
  decisionTimeMs: number;
}) {
  const { error } = await supabase
    .from('story_decisions')
    .insert({
      user_id: params.userId,
      story_id: params.storyId,
      scene_id: params.sceneId,
      choice_id: params.choiceId,
      decision_time_ms: params.decisionTimeMs,
    });
  if (error) throw error;
}
