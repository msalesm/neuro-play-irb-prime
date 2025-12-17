import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";
import { SessionsQueryResult, NeurodiversityProfile } from "./types.ts";

export async function fetchSessionsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  // Fetch learning sessions
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
  }

  // Filter sessions that have actual performance data with accuracy
  const validSessions = (sessions || []).filter(session => {
    const pd = session.performance_data || {};
    const accuracy = pd.accuracy ?? pd.accuracy_percentage ?? pd.accuracyPercentage ?? null;
    return typeof accuracy === 'number' && accuracy > 0;
  });

  console.log(`✅ Found ${sessions?.length || 0} learning_sessions, ${validSessions.length} with valid accuracy`);

  if (validSessions.length > 0) {
    // Transform sessions to expected format
    const enrichedSessions = validSessions.map(session => {
      const pd = session.performance_data || {};
      const accuracy = pd.accuracy ?? pd.accuracy_percentage ?? pd.accuracyPercentage ?? 0;
      const reactionTime = pd.avg_reaction_time_ms ?? pd.reaction_time ?? pd.reactionTime ?? 0;
      
      return {
        id: session.id,
        user_id: session.user_id,
        trail_id: null,
        created_at: session.created_at,
        completed_at: pd.completed_at || session.created_at,
        cognitive_category: session.game_type || 'general',
        current_level: pd.difficulty || 1,
        total_xp: pd.score || (session.session_duration_seconds ? Math.round(session.session_duration_seconds / 10) : 0),
        performance_data: {
          accuracy: accuracy,
          score: pd.score || 0,
          reaction_time: reactionTime,
        },
        struggles_detected: accuracy < 60 ? ['low_accuracy'] : []
      };
    });

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

    return { sessions: enrichedSessions, trailsData };
  }

  // Fallback to game_sessions if no valid learning_sessions
  return fetchGameSessionsData(supabase, userId, startDate, endDate);
}

async function fetchGameSessionsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  console.log('📊 Fallback: Fetching game_sessions data...');

  // Get child profiles for this user
  const { data: childProfiles } = await supabase
    .from('child_profiles')
    .select('id')
    .eq('parent_user_id', userId);

  // Also check children table
  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('parent_id', userId);

  const childProfileIds = childProfiles?.map(c => c.id) || [];
  const childrenIds = children?.map(c => c.id) || [];

  console.log(`Found ${childProfileIds.length} child_profiles and ${childrenIds.length} children`);

  if (childProfileIds.length === 0 && childrenIds.length === 0) {
    console.log('No child profiles found for user, trying direct game_sessions...');
    
    // Try direct game_sessions with no filter (for test users)
    const { data: allGameSessions } = await supabase
      .from('game_sessions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true })
      .limit(50);

    if (allGameSessions && allGameSessions.length > 0) {
      console.log(`✅ Found ${allGameSessions.length} game_sessions (global)`);
      return transformGameSessions(allGameSessions, userId);
    }
    
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
      difficulty_level,
      avg_reaction_time_ms
    `)
    .in('child_profile_id', childProfileIds)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching game sessions:', error);
  }

  if (gameSessions && gameSessions.length > 0) {
    console.log(`✅ Found ${gameSessions.length} game_sessions`);
    return transformGameSessions(gameSessions, userId);
  }

  console.log('No game sessions found');
  return { sessions: [], trailsData: {} };
}

function transformGameSessions(gameSessions: any[], userId: string): SessionsQueryResult {
  // Filter sessions with actual accuracy data
  const validSessions = gameSessions.filter(session => {
    const accuracy = session.accuracy_percentage ?? session.session_data?.accuracy ?? null;
    return typeof accuracy === 'number';
  });

  console.log(`📊 transformGameSessions: ${gameSessions.length} total, ${validSessions.length} with accuracy`);

  const enrichedSessions = validSessions.map(session => {
    // Get accuracy from multiple possible sources
    const accuracy = session.accuracy_percentage ?? session.session_data?.accuracy ?? 0;
    const reactionTime = session.avg_reaction_time_ms ?? session.session_data?.reactionTime ?? 0;
    const score = session.score ?? session.session_data?.score ?? 0;

    return {
      id: session.id,
      user_id: userId,
      trail_id: null,
      created_at: session.created_at,
      completed_at: session.completed_at || session.created_at,
      cognitive_category: session.game_id || 'general',
      current_level: session.difficulty_level || 1,
      total_xp: score,
      performance_data: {
        accuracy: accuracy,
        score: score,
        duration: session.duration_seconds || 0,
        reaction_time: reactionTime
      },
      struggles_detected: accuracy < 60 ? ['low_accuracy'] : []
    };
  });

  // Create trails data summary
  const trailsData: { [category: string]: any } = {};
  const categories = [...new Set(enrichedSessions.map(s => s.cognitive_category))];
  
  categories.forEach(category => {
    const categorySessions = enrichedSessions.filter(s => s.cognitive_category === category);
    const avgAccuracy = categorySessions.length > 0 
      ? categorySessions.reduce((sum, s) => sum + (s.performance_data.accuracy || 0), 0) / categorySessions.length
      : 0;
    trailsData[category] = {
      initialLevel: 1,
      currentLevel: Math.min(Math.ceil(avgAccuracy / 20) + 1, 10),
      totalXP: categorySessions.reduce((sum, s) => sum + s.total_xp, 0),
      avgAccuracy: Math.round(avgAccuracy * 100) / 100
    };
  });

  return { sessions: enrichedSessions, trailsData };
}

export async function fetchScreeningsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  console.log('📊 Fetching screenings data...');
  
  const { data: screenings, error } = await supabase
    .from('screenings')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching screenings:', error);
    return { sessions: [], trailsData: {} };
  }

  if (!screenings || screenings.length === 0) {
    console.log('No screenings found');
    return { sessions: [], trailsData: {} };
  }

  console.log(`✅ Found ${screenings.length} screenings`);

  // Transform screenings to session format
  const enrichedSessions = screenings.map(screening => ({
    id: screening.id,
    user_id: screening.user_id,
    trail_id: null,
    created_at: screening.created_at,
    completed_at: screening.completed_at || screening.created_at,
    cognitive_category: `screening_${screening.type}`,
    current_level: 1,
    total_xp: screening.score || 0,
    performance_data: {
      accuracy: screening.score || 0,
      score: screening.score || 0,
      type: screening.type,
      riskLevel: screening.risk_level,
      responses: screening.responses
    },
    struggles_detected: screening.risk_level === 'high' ? [screening.type] : []
  }));

  // Create trails data summary by screening type
  const trailsData: { [category: string]: any } = {};
  const types = [...new Set(screenings.map(s => s.type))];
  
  types.forEach(type => {
    const typeScreenings = screenings.filter(s => s.type === type);
    const avgScore = typeScreenings.reduce((sum, s) => sum + (s.score || 0), 0) / typeScreenings.length;
    trailsData[`screening_${type}`] = {
      initialLevel: 1,
      currentLevel: Math.min(Math.ceil(avgScore / 20) + 1, 10),
      totalXP: Math.round(avgScore * typeScreenings.length),
      count: typeScreenings.length,
      avgScore: avgScore
    };
  });

  return { sessions: enrichedSessions, trailsData };
}

export async function fetchBehavioralInsightsData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SessionsQueryResult> {
  console.log('📊 Fallback: Fetching behavioral_insights data...');
  
  const { data: insights, error: insightsError } = await supabase
    .from('behavioral_insights')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (insightsError) {
    console.error('Error fetching behavioral insights:', insightsError);
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

  const enrichedSessions = Array.from(sessionsByCategory.values()).flat();

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

  return { sessions: enrichedSessions, trailsData };
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

// Aggregate all data sources for comprehensive reporting
export async function fetchAllAvailableData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ sessions: SessionsQueryResult; screenings: SessionsQueryResult; insights: SessionsQueryResult }> {
  console.log('🔍 Fetching all available data sources...');
  
  const [sessions, screenings, insights] = await Promise.all([
    fetchSessionsData(supabase, userId, startDate, endDate),
    fetchScreeningsData(supabase, userId, startDate, endDate),
    fetchBehavioralInsightsData(supabase, userId, startDate, endDate)
  ]);

  console.log(`📊 Data summary: ${sessions.sessions.length} sessions, ${screenings.sessions.length} screenings, ${insights.sessions.length} insights`);
  
  return { sessions, screenings, insights };
}
