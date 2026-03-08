/**
 * Stories Service
 * 
 * Data access for social stories and socioemotional tracking.
 */

import { supabase } from '@/integrations/supabase/client';

export async function fetchSocialStories(status?: string) {
  const base = supabase
    .from('social_stories')
    .select('*')
    .order('created_at', { ascending: false });

  const { data, error } = await base;
  if (error) throw error;
  const results = (data as any[]) || [];
  return status ? results.filter((s: any) => s.status === status) : results;
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
    .insert([{
      user_id: params.userId,
      story_id: params.storyId,
      decision_point_id: params.sceneId,
      decision_text: params.choiceId,
      decision_time_ms: params.decisionTimeMs,
      selected_option_index: 0,
    }]);
  if (error) throw error;
}
