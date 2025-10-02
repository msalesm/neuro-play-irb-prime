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

export async function fetchBehavioralMetricsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  console.log('📊 Fallback: Fetching behavioral_metrics data...');
  
  // Fetch behavioral metrics
  const { data: metrics, error: metricsError } = await supabase
    .from('behavioral_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: true });

  if (metricsError) {
    console.error('Error fetching behavioral metrics:', metricsError);
    throw new Error('Failed to fetch behavioral metrics');
  }

  if (!metrics || metrics.length === 0) {
    return { sessions: [], trailsData: {} };
  }

  console.log(`✅ Found ${metrics.length} behavioral metrics`);

  // Group metrics by category and transform to session format
  const sessionsByCategory = new Map<string, any[]>();
  
  metrics.forEach(metric => {
    const category = metric.category || 'general';
    if (!sessionsByCategory.has(category)) {
      sessionsByCategory.set(category, []);
    }
    
    sessionsByCategory.get(category)!.push({
      id: metric.id,
      user_id: metric.user_id,
      trail_id: null,
      created_at: metric.timestamp,
      completed_at: metric.timestamp,
      cognitive_category: category,
      current_level: 1,
      total_xp: Math.round(metric.value * 100),
      performance_data: {
        accuracy: metric.value,
        score: Math.round(metric.value * 100),
        metricType: metric.metric_type,
        contextData: metric.context_data
      },
      struggles_detected: metric.value < 0.6 ? [metric.metric_type] : []
    });
  });

  // Flatten sessions
  const enrichedSessions = Array.from(sessionsByCategory.values()).flat();

  // Create trails data summary
  const trailsData: { [category: string]: any } = {};
  sessionsByCategory.forEach((sessions, category) => {
    const avgAccuracy = sessions.reduce((sum, s) => sum + s.performance_data.accuracy, 0) / sessions.length;
    trailsData[category] = {
      initialLevel: 1,
      currentLevel: Math.min(Math.floor(avgAccuracy * 5) + 1, 10),
      totalXP: Math.round(avgAccuracy * 100 * sessions.length)
    };
  });

  console.log(`📈 Transformed to ${enrichedSessions.length} sessions across ${sessionsByCategory.size} categories`);

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
