/**
 * Behavioral Service
 * 
 * Data access for behavioral profiles, insights, and analysis.
 */

import { supabase } from '@/integrations/supabase/client';

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

export async function fetchScreenings(childId: string) {
  const { data, error } = await supabase
    .from('screenings' as any)
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as any[]) || [];
}

export async function fetchEmotionalCheckins(childId: string, limit = 30) {
  const { data, error } = await supabase
    .from('emotional_checkins' as any)
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as any[]) || [];
}
