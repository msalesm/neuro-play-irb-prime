import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childId, context } = await req.json();
    
    if (!childId) {
      return new Response(JSON.stringify({ error: 'childId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch child profile
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    // Fetch recent emotional analysis
    const { data: emotionalAnalysis } = await supabase
      .from('ai_emotional_analysis')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch recent game performance
    const { data: recentGames } = await supabase
      .from('game_sessions')
      .select('game_id, accuracy_percentage, completed, difficulty_level')
      .eq('child_profile_id', childId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch available cognitive games
    const { data: games } = await supabase
      .from('cognitive_games')
      .select('*')
      .eq('active', true);

    // Fetch available social stories
    const { data: stories } = await supabase
      .from('social_stories')
      .select('*')
      .eq('is_active', true);

    // Fetch biofeedback data
    const { data: biofeedback } = await supabase
      .from('biofeedback_readings')
      .select('*')
      .eq('child_id', childId)
      .order('recorded_at', { ascending: false })
      .limit(10);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um sistema de recomendação terapêutica inteligente para crianças neurodivergentes.
Baseado no perfil da criança, estado emocional e desempenho recente, recomende:
1. Jogos cognitivos apropriados
2. Histórias sociais relevantes
3. Rotinas sugeridas
4. Ajustes de dificuldade
5. Alertas para os pais

Considere:
- Estado emocional atual
- Padrões de sono/atividade (se disponíveis)
- Desempenho recente nos jogos
- Condições neurodivergentes
- Horário do dia e contexto

Responda em JSON:
{
  "recommendedGames": [{"gameId": "", "reason": "", "suggestedDifficulty": 1-10, "priority": "high|medium|low"}],
  "recommendedStories": [{"storyId": "", "reason": "", "priority": "high|medium|low"}],
  "suggestedRoutine": {"name": "", "activities": [], "reason": ""},
  "parentAlerts": [{"type": "", "message": "", "actionUrl": ""}],
  "modeRecommendation": "normal|calm|focus",
  "overallInsight": ""
}`;

    const contextData = {
      child: child ? {
        age: child.birth_date ? Math.floor((Date.now() - new Date(child.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        conditions: child.neurodevelopmental_conditions
      } : null,
      emotionalState: emotionalAnalysis?.emotional_state || 'neutral',
      recentPerformance: recentGames?.map(g => ({
        gameId: g.game_id,
        accuracy: g.accuracy_percentage,
        completed: g.completed,
        difficulty: g.difficulty_level
      })) || [],
      availableGames: games?.map(g => ({ id: g.id, name: g.name, domains: g.cognitive_domains })) || [],
      availableStories: stories?.map(s => ({ id: s.id, title: s.title })) || [],
      biofeedback: biofeedback?.length ? {
        latestHeartRate: biofeedback.find(b => b.reading_type === 'heart_rate')?.value,
        latestStress: biofeedback.find(b => b.reading_type === 'stress')?.value,
        sleepQuality: biofeedback.find(b => b.reading_type === 'sleep')?.value
      } : null,
      currentHour: new Date().getHours(),
      additionalContext: context || {}
    };

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Gere recomendações personalizadas:\n${JSON.stringify(contextData, null, 2)}` }
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to get recommendations');
    }

    const aiData = await aiResponse.json();
    const recommendationsText = aiData.choices?.[0]?.message?.content || '';
    
    let recommendations;
    try {
      const jsonMatch = recommendationsText.match(/\{[\s\S]*\}/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      recommendations = {
        recommendedGames: [],
        recommendedStories: [],
        modeRecommendation: 'normal',
        overallInsight: recommendationsText
      };
    }

    // Create smart alerts if parent alerts exist
    if (recommendations.parentAlerts?.length && child?.parent_id) {
      const alertsToCreate = recommendations.parentAlerts.map((alert: any) => ({
        user_id: child.parent_id,
        child_id: childId,
        alert_type: alert.type || 'activity_suggestion',
        title: 'Recomendação Inteligente',
        message: alert.message,
        action_url: alert.actionUrl,
        scheduled_for: new Date().toISOString()
      }));

      await supabase.from('smart_alerts').insert(alertsToCreate);
    }

    return new Response(JSON.stringify({
      success: true,
      recommendations,
      contextUsed: {
        emotionalState: contextData.emotionalState,
        gamesAnalyzed: contextData.recentPerformance.length,
        hasBiofeedback: !!contextData.biofeedback
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Smart recommendations error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
