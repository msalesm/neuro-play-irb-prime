import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify user authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Use service role for data queries (RLS will handle access control)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sessionId, childProfileId, gameId, timeRange } = await req.json();

    // Verify user has access to the child profile
    if (childProfileId) {
      const { data: hasAccess } = await supabase
        .rpc('has_child_access', { _user_id: user.id, _child_id: childProfileId });
      
      if (!hasAccess) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this child profile' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Aggregating metrics for:', { sessionId, childProfileId, gameId, timeRange });

    let query = supabase
      .from('game_metrics')
      .select(`
        *,
        game_sessions!inner(
          child_profile_id,
          game_id,
          difficulty_level,
          completed_at
        )
      `);

    // Filter by specific session
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    } 
    // Or filter by child profile and game
    else if (childProfileId && gameId) {
      query = query
        .eq('game_sessions.child_profile_id', childProfileId)
        .eq('game_sessions.game_id', gameId);
      
      // Apply time range if provided
      if (timeRange) {
        const cutoffDate = new Date();
        switch (timeRange) {
          case 'week':
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            break;
        }
        query = query.gte('game_sessions.completed_at', cutoffDate.toISOString());
      }
    } else {
      throw new Error('Either sessionId or (childProfileId + gameId) must be provided');
    }

    const { data: metrics, error } = await query;

    if (error) throw error;

    // Aggregate metrics
    const aggregated = {
      totalEvents: metrics?.length || 0,
      eventTypes: {} as Record<string, number>,
      reactionTimes: [] as number[],
      avgReactionTime: 0,
      minReactionTime: null as number | null,
      maxReactionTime: null as number | null,
      difficultyDistribution: {} as Record<number, number>,
      timeDistribution: [] as Array<{ hour: number; count: number }>,
      errorPatterns: [] as any[],
      performanceTrend: [] as Array<{ timestamp: number; accuracy: number }>,
    };

    if (metrics && metrics.length > 0) {
      // Count event types
      metrics.forEach(metric => {
        aggregated.eventTypes[metric.event_type] = 
          (aggregated.eventTypes[metric.event_type] || 0) + 1;
        
        // Collect reaction times
        if (metric.reaction_time_ms) {
          aggregated.reactionTimes.push(metric.reaction_time_ms);
        }

        // Track difficulty distribution
        if (metric.difficulty_at_event) {
          aggregated.difficultyDistribution[metric.difficulty_at_event] = 
            (aggregated.difficultyDistribution[metric.difficulty_at_event] || 0) + 1;
        }

        // Track time distribution (by hour)
        const hour = new Date(metric.timestamp_ms).getHours();
        const hourEntry = aggregated.timeDistribution.find(t => t.hour === hour);
        if (hourEntry) {
          hourEntry.count++;
        } else {
          aggregated.timeDistribution.push({ hour, count: 1 });
        }

        // Collect error patterns
        if (metric.event_type === 'error' && metric.event_data) {
          aggregated.errorPatterns.push({
            timestamp: metric.timestamp_ms,
            difficulty: metric.difficulty_at_event,
            data: metric.event_data
          });
        }
      });

      // Calculate reaction time statistics
      if (aggregated.reactionTimes.length > 0) {
        const sum = aggregated.reactionTimes.reduce((a, b) => a + b, 0);
        aggregated.avgReactionTime = Math.round(sum / aggregated.reactionTimes.length);
        aggregated.minReactionTime = Math.min(...aggregated.reactionTimes);
        aggregated.maxReactionTime = Math.max(...aggregated.reactionTimes);
      }

      // Sort time distribution
      aggregated.timeDistribution.sort((a, b) => a.hour - b.hour);
    }

    // Calculate performance insights
    const insights = {
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: [] as string[],
    };

    if (aggregated.avgReactionTime > 0) {
      if (aggregated.avgReactionTime < 500) {
        insights.strengths.push('Tempo de reação excelente');
      } else if (aggregated.avgReactionTime > 1500) {
        insights.weaknesses.push('Tempo de reação precisa melhorar');
        insights.recommendations.push('Pratique jogos de atenção rápida');
      }
    }

    if (aggregated.errorPatterns.length > 0) {
      const errorRate = aggregated.errorPatterns.length / aggregated.totalEvents;
      if (errorRate > 0.3) {
        insights.weaknesses.push('Alta taxa de erros detectada');
        insights.recommendations.push('Considere reduzir a dificuldade temporariamente');
      }
    }

    const result = {
      aggregated,
      insights,
      sessionCount: sessionId ? 1 : new Set(metrics?.map(m => m.session_id)).size,
      dateRange: {
        start: metrics && metrics.length > 0 
          ? new Date(Math.min(...metrics.map(m => m.timestamp_ms))).toISOString()
          : null,
        end: metrics && metrics.length > 0
          ? new Date(Math.max(...metrics.map(m => m.timestamp_ms))).toISOString()
          : null,
      }
    };

    console.log('Aggregation complete:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error aggregating metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to aggregate game metrics'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
