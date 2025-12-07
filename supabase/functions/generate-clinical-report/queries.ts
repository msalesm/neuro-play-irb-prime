import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";
import { SessionsQueryResult, NeurodiversityProfile } from "./types.ts";

export async function fetchSessionsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  // Fetch learning sessions (without trail_id which doesn't exist)
  const { data: sessions, error: sessionsError } = await supabase
    .from('learning_sessions')
    .select(`
      id,
      user_id,
      game_type,
      created_at,
      completed,
      session_duration_seconds,
      performance_data
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
    // Try to fetch from game_sessions as fallback
    return fetchGameSessionsData(supabase, userId, startDate, endDate);
  }

  // Transform sessions to expected format
  const enrichedSessions = sessions.map(session => ({
    id: session.id,
    user_id: session.user_id,
    trail_id: null,
    created_at: session.created_at,
    completed_at: session.created_at,
    cognitive_category: session.game_type || 'general',
    current_level: 1,
    total_xp: session.session_duration_seconds ? Math.round(session.session_duration_seconds / 10) : 0,
    performance_data: session.performance_data || {},
    struggles_detected: []
  }));

  // Create trails data summary
  const trailsData: { [category: string]: any } = {};
  const categories = [...new Set(enrichedSessions.map(s => s.cognitive_category))];
  
  categories.forEach(category => {
    const categorySessions = enrichedSessions.filter(s => s.cognitive_category === category);
    trailsData[category] = {
      initialLevel: 1,
      currentLevel: Math.min(Math.ceil(categorySessions.length / 5) + 1, 10),
      totalXP: categorySessions.reduce((sum, s) => sum + s.total_xp, 0)
    };
  });

  return {
    sessions: enrichedSessions,
    trailsData
  };
}

async function fetchGameSessionsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  console.log('📊 Fallback: Fetching game_sessions data...');

  // First get child profiles for this user
  const { data: childProfiles } = await supabase
    .from('child_profiles')
    .select('id')
    .eq('parent_user_id', userId);

  const childIds = childProfiles?.map(c => c.id) || [];

  if (childIds.length === 0) {
    console.log('No child profiles found, returning empty');
    return { sessions: [], trailsData: {} };
  }

  // Fetch game sessions for child profiles
  const { data: gameSessions, error } = await supabase
    .from('game_sessions')
    .select(`
      id,
      child_profile_id,
      game_id,
      created_at,
      completed_at,
      completed,
      score,
      accuracy_percentage,
      duration_seconds,
      difficulty_level
    `)
    .in('child_profile_id', childIds)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching game sessions:', error);
    return { sessions: [], trailsData: {} };
  }

  if (!gameSessions || gameSessions.length === 0) {
    console.log('No game sessions found');
    return { sessions: [], trailsData: {} };
  }

  console.log(`✅ Found ${gameSessions.length} game sessions`);

  // Transform to expected format
  const enrichedSessions = gameSessions.map(session => ({
    id: session.id,
    user_id: userId,
    trail_id: null,
    created_at: session.created_at,
    completed_at: session.completed_at || session.created_at,
    cognitive_category: session.game_id || 'general',
    current_level: session.difficulty_level || 1,
    total_xp: session.score || 0,
    performance_data: {
      accuracy: session.accuracy_percentage || 0,
      score: session.score || 0,
      duration: session.duration_seconds || 0
    },
    struggles_detected: (session.accuracy_percentage || 0) < 60 ? ['low_accuracy'] : []
  }));

  // Create trails data summary
  const trailsData: { [category: string]: any } = {};
  const categories = [...new Set(enrichedSessions.map(s => s.cognitive_category))];
  
  categories.forEach(category => {
    const categorySessions = enrichedSessions.filter(s => s.cognitive_category === category);
    const avgAccuracy = categorySessions.reduce((sum, s) => sum + (s.performance_data.accuracy || 0), 0) / categorySessions.length;
    trailsData[category] = {
      initialLevel: 1,
      currentLevel: Math.min(Math.ceil(avgAccuracy / 20) + 1, 10),
      totalXP: categorySessions.reduce((sum, s) => sum + s.total_xp, 0)
    };
  });

  return {
    sessions: enrichedSessions,
    trailsData
  };
}

export async function fetchBehavioralInsightsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  console.log('📊 Fallback: Fetching behavioral_insights data...');
  
  // Fetch behavioral insights (correct table name)
  const { data: insights, error: insightsError } = await supabase
    .from('behavioral_insights')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (insightsError) {
    console.error('Error fetching behavioral insights:', insightsError);
    // Don't throw, just return empty - this is a fallback
    return { sessions: [], trailsData: {} };
  }

  if (!insights || insights.length === 0) {
    console.log('No behavioral insights found');
    return { sessions: [], trailsData: {} };
  }

  console.log(`✅ Found ${insights.length} behavioral insights`);

  // Group insights by type and transform to session format
  const sessionsByCategory = new Map<string, any[]>();
  
  insights.forEach(insight => {
    const category = insight.insight_type || 'general';
    if (!sessionsByCategory.has(category)) {
      sessionsByCategory.set(category, []);
    }
    
    // Map severity to a numeric value
    const severityValue = insight.severity === 'high' ? 0.3 : 
                          insight.severity === 'medium' ? 0.6 : 0.8;
    
    sessionsByCategory.get(category)!.push({
      id: insight.id,
      user_id: insight.user_id,
      trail_id: null,
      created_at: insight.created_at,
      completed_at: insight.created_at,
      cognitive_category: category,
      current_level: 1,
      total_xp: Math.round(severityValue * 100),
      performance_data: {
        accuracy: severityValue * 100,
        score: Math.round(severityValue * 100),
        insightType: insight.insight_type,
        title: insight.title,
        description: insight.description
      },
      struggles_detected: insight.severity === 'high' ? [insight.insight_type] : []
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
      currentLevel: Math.min(Math.floor(avgAccuracy / 20) + 1, 10),
      totalXP: Math.round(avgAccuracy * sessions.length)
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
