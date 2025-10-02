import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";
import { SessionsQueryResult, NeurodiversityProfile } from "./types.ts";

export async function fetchSessionsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  // Fetch learning sessions with trail data
  const { data: sessions, error: sessionsError } = await supabase
    .from('learning_sessions')
    .select(`
      id,
      user_id,
      trail_id,
      created_at,
      completed_at,
      performance_data,
      struggles_detected
    `)
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    throw new Error('Failed to fetch learning sessions');
  }

  if (!sessions || sessions.length === 0) {
    return { sessions: [], trailsData: {} };
  }

  // Get unique trail IDs
  const trailIds = [...new Set(sessions.map(s => s.trail_id))];

  // Fetch trails data
  const { data: trails, error: trailsError } = await supabase
    .from('learning_trails')
    .select('id, cognitive_category, current_level, total_xp')
    .in('id', trailIds);

  if (trailsError) {
    console.error('Error fetching trails:', trailsError);
    throw new Error('Failed to fetch learning trails');
  }

  // Create a map of trail_id to trail data
  const trailsMap = new Map(trails?.map(t => [t.id, t]) || []);

  // Enrich sessions with cognitive category
  const enrichedSessions = sessions.map(session => ({
    ...session,
    cognitive_category: trailsMap.get(session.trail_id)?.cognitive_category || 'unknown',
    current_level: trailsMap.get(session.trail_id)?.current_level || 1,
    total_xp: trailsMap.get(session.trail_id)?.total_xp || 0
  }));

  // Calculate initial levels (first session level per category)
  const trailsData: { [category: string]: any } = {};
  
  trails?.forEach(trail => {
    const categorySessions = enrichedSessions.filter(
      s => s.trail_id === trail.id
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (categorySessions.length > 0) {
      trailsData[trail.cognitive_category] = {
        initialLevel: categorySessions[0].current_level || 1,
        currentLevel: trail.current_level,
        totalXP: trail.total_xp
      };
    }
  });

  return {
    sessions: enrichedSessions,
    trailsData
  };
}

export async function fetchNeurodiversityProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<NeurodiversityProfile | null> {
  const { data, error } = await supabase
    .from('neurodiversity_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.warn('No neurodiversity profile found:', error.message);
    return null;
  }

  return data;
}
