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
    const { sessionId } = await req.json();
    console.log('Analyzing session:', sessionId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*, cognitive_games(*), child_profiles(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Session fetch error:', sessionError);
      throw sessionError;
    }

    console.log('Session data loaded:', session.id);

    const analysis = {
      attention_score: calculateAttentionScore(session),
      memory_score: calculateMemoryScore(session),
      processing_speed: session.avg_reaction_time_ms,
      accuracy: session.accuracy_percentage,
      consistency: calculateConsistency(session),
      improvement_areas: identifyImprovementAreas(session),
      strengths: identifyStrengths(session),
      timestamp: new Date().toISOString()
    };

    console.log('Analysis computed:', analysis);

    const { error: progressError } = await supabase
      .from('adaptive_progress')
      .update({
        ai_insights: analysis,
        updated_at: new Date().toISOString()
      })
      .eq('child_profile_id', session.child_profile_id)
      .eq('game_id', session.game_id);

    if (progressError) {
      console.error('Progress update error:', progressError);
    }

    const recommendations = generateRecommendations(session, analysis);
    
    if (recommendations.length > 0) {
      console.log('Creating recommendations:', recommendations.length);
      
      for (const rec of recommendations) {
        await supabase.from('ai_recommendations').insert({
          child_profile_id: session.child_profile_id,
          title: rec.title,
          description: rec.description,
          recommendation_type: rec.type,
          reasoning: rec.reasoning,
          priority: rec.priority,
          status: 'pending',
          recommended_games: rec.games || [],
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    console.log('Analysis complete');

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      recommendations: recommendations.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in cognitive-analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateAttentionScore(session: any): number {
  const baseScore = session.accuracy_percentage || 0;
  const durationFactor = Math.min(session.duration_seconds / 300, 1);
  const pausePenalty = Math.max(0, 1 - (session.pause_count || 0) * 0.05);
  return Math.round(baseScore * durationFactor * pausePenalty);
}

function calculateMemoryScore(session: any): number {
  if (!session.total_attempts) return 0;
  const accuracyScore = (session.correct_attempts / session.total_attempts) * 100;
  const consistencyBonus = calculateConsistency(session) / 100;
  return Math.round(accuracyScore * (0.8 + consistencyBonus * 0.2));
}

function calculateConsistency(session: any): number {
  if (!session.fastest_reaction_time_ms || !session.slowest_reaction_time_ms) return 50;
  const variance = session.slowest_reaction_time_ms - session.fastest_reaction_time_ms;
  const avgReaction = session.avg_reaction_time_ms || 1000;
  const consistencyScore = Math.max(0, 100 - (variance / avgReaction) * 100);
  return Math.round(consistencyScore);
}

function identifyImprovementAreas(session: any): string[] {
  const areas: string[] = [];
  
  if ((session.accuracy_percentage || 0) < 70) {
    areas.push('Precisão - praticar mais para melhorar a taxa de acerto');
  }
  
  if ((session.avg_reaction_time_ms || 0) > 2000) {
    areas.push('Velocidade de processamento - treinar para respostas mais rápidas');
  }
  
  if ((session.help_requests || 0) > 3) {
    areas.push('Autonomia - reduzir dependência de ajuda');
  }

  if ((session.pause_count || 0) > 5) {
    areas.push('Atenção sustentada - trabalhar foco prolongado');
  }

  return areas;
}

function identifyStrengths(session: any): string[] {
  const strengths: string[] = [];
  
  if ((session.accuracy_percentage || 0) >= 85) {
    strengths.push('Excelente precisão nas respostas');
  }
  
  if ((session.avg_reaction_time_ms || 0) < 1000) {
    strengths.push('Velocidade de processamento acima da média');
  }
  
  if ((session.help_requests || 0) === 0) {
    strengths.push('Alta autonomia - completou sem ajuda');
  }

  if ((session.pause_count || 0) <= 1) {
    strengths.push('Ótima atenção sustentada');
  }

  return strengths;
}

function generateRecommendations(session: any, analysis: any): any[] {
  const recommendations = [];
  
  if ((session.accuracy_percentage || 0) < 60) {
    recommendations.push({
      title: 'Praticar Fundamentos',
      description: 'Recomendado repetir este jogo em nível mais fácil para reforçar conceitos básicos',
      type: 'difficulty_adjustment',
      reasoning: `Precisão de ${Math.round(session.accuracy_percentage || 0)}% indica necessidade de reforço`,
      priority: 8,
      games: [session.cognitive_games?.game_id]
    });
  }
  
  if ((session.accuracy_percentage || 0) >= 85 && (session.avg_reaction_time_ms || 9999) < 1500) {
    recommendations.push({
      title: 'Avançar para Próximo Nível',
      description: 'Performance excelente! Recomendado aumentar dificuldade para continuar progredindo',
      type: 'difficulty_advancement',
      reasoning: `Precisão de ${Math.round(session.accuracy_percentage || 0)}% e tempo médio de ${session.avg_reaction_time_ms}ms`,
      priority: 7,
      games: [session.cognitive_games?.game_id]
    });
  }
  
  if ((session.pause_count || 0) > 5 || (session.duration_seconds || 0) > 900) {
    recommendations.push({
      title: 'Sessões Mais Curtas',
      description: 'Recomendado fazer sessões de 5-10 minutos para manter o foco',
      type: 'session_duration',
      reasoning: `${session.pause_count || 0} pausas em ${Math.round((session.duration_seconds || 0) / 60)} minutos indica fadiga`,
      priority: 6
    });
  }

  return recommendations;
}
