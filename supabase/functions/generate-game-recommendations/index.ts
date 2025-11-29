import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameSession {
  game_id: string;
  difficulty_level: number;
  score: number;
  accuracy_percentage: number;
  completed_at: string;
  duration_seconds: number;
}

interface AdaptiveProgress {
  game_id: string;
  current_difficulty: number;
  avg_accuracy: number;
  sessions_completed: number;
  mastery_level: number;
  recommended_next_difficulty: number;
}

interface CognitiveGame {
  id: string;
  game_id: string;
  name: string;
  cognitive_domains: string[];
  target_conditions: string[];
  difficulty_levels: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { child_profile_id } = await req.json();
    
    if (!child_profile_id) {
      return new Response(
        JSON.stringify({ error: 'child_profile_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Recommendations] Starting generation for child:', child_profile_id);

    // 1. Buscar perfil da criança
    const { data: childProfile, error: profileError } = await supabase
      .from('child_profiles')
      .select('name, date_of_birth, diagnosed_conditions, cognitive_baseline')
      .eq('id', child_profile_id)
      .single();

    if (profileError || !childProfile) {
      console.error('[Recommendations] Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Child profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Buscar últimas 20 sessões de jogo
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('game_id, difficulty_level, score, accuracy_percentage, completed_at, duration_seconds')
      .eq('child_profile_id', child_profile_id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (sessionsError) {
      console.error('[Recommendations] Sessions error:', sessionsError);
    }

    // 3. Buscar progresso adaptativo
    const { data: adaptiveProgress, error: progressError } = await supabase
      .from('adaptive_progress')
      .select('game_id, current_difficulty, avg_accuracy, sessions_completed, mastery_level, recommended_next_difficulty')
      .eq('child_profile_id', child_profile_id);

    if (progressError) {
      console.error('[Recommendations] Progress error:', progressError);
    }

    // 4. Buscar todos os jogos disponíveis
    const { data: allGames, error: gamesError } = await supabase
      .from('cognitive_games')
      .select('id, game_id, name, cognitive_domains, target_conditions, difficulty_levels')
      .eq('active', true);

    if (gamesError) {
      console.error('[Recommendations] Games error:', gamesError);
    }

    // 5. Buscar última análise cognitiva (se existir)
    const { data: latestReport } = await supabase
      .from('clinical_reports')
      .select('detailed_analysis, summary_insights')
      .eq('user_id', child_profile_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 6. Preparar contexto para IA
    const age = new Date().getFullYear() - new Date(childProfile.date_of_birth).getFullYear();
    const sessions = recentSessions || [];
    const progress = adaptiveProgress || [];
    const games = allGames || [];

    // Calcular estatísticas gerais
    const avgAccuracy = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / sessions.length 
      : 0;
    
    const gamesPlayed = new Set(sessions.map(s => s.game_id)).size;
    const totalSessions = sessions.length;

    // Identificar domínios cognitivos com melhor e pior desempenho
    const domainPerformance: { [key: string]: { accuracy: number, count: number } } = {};
    
    sessions.forEach(session => {
      const game = games.find(g => g.id === session.game_id);
      if (game && game.cognitive_domains) {
        game.cognitive_domains.forEach((domain: string) => {
          if (!domainPerformance[domain]) {
            domainPerformance[domain] = { accuracy: 0, count: 0 };
          }
          domainPerformance[domain].accuracy += session.accuracy_percentage || 0;
          domainPerformance[domain].count += 1;
        });
      }
    });

    const domainStats = Object.entries(domainPerformance).map(([domain, stats]) => ({
      domain,
      avgAccuracy: stats.accuracy / stats.count,
      sessions: stats.count
    })).sort((a, b) => b.avgAccuracy - a.avgAccuracy);

    const strongDomains = domainStats.slice(0, 2).map(d => d.domain);
    const weakDomains = domainStats.slice(-2).map(d => d.domain);

    console.log('[Recommendations] Domain stats:', { strongDomains, weakDomains });

    // 7. Chamar Lovable AI com tool calling para gerar recomendações estruturadas
    const systemPrompt = `Você é um assistente terapêutico especializado em neuroplasticidade infantil e reabilitação cognitiva.
Sua função é analisar o desempenho de uma criança em jogos cognitivos e recomendar os próximos jogos mais apropriados.

IMPORTANTE: Baseie suas recomendações em:
1. Progressão gradual de dificuldade (não pule níveis muito altos)
2. Equilíbrio entre desafio e sucesso (zona de desenvolvimento proximal)
3. Fortalecimento de áreas fracas SEM desencorajar
4. Manutenção de áreas fortes
5. Variação de domínios cognitivos para engajamento

Seja específico, terapêutico e motivacional.`;

    const userPrompt = `Analise o perfil e desempenho desta criança e recomende 3-5 jogos:

PERFIL DA CRIANÇA:
- Nome: ${childProfile.name}
- Idade: ${age} anos
- Condições diagnosticadas: ${childProfile.diagnosed_conditions?.join(', ') || 'Nenhuma'}

ESTATÍSTICAS DE DESEMPENHO:
- Jogos jogados: ${gamesPlayed}
- Total de sessões: ${totalSessions}
- Precisão média: ${avgAccuracy.toFixed(1)}%
- Domínios fortes: ${strongDomains.join(', ') || 'A definir'}
- Domínios a fortalecer: ${weakDomains.join(', ') || 'A definir'}

PROGRESSO POR JOGO:
${progress.map(p => {
  const game = games.find(g => g.id === p.game_id);
  return `- ${game?.name || p.game_id}: Nível ${p.current_difficulty}, ${p.avg_accuracy.toFixed(1)}% precisão, ${p.sessions_completed} sessões, maestria ${(p.mastery_level * 100).toFixed(0)}%`;
}).join('\n')}

${latestReport ? `ANÁLISE COGNITIVA RECENTE:\n${latestReport.summary_insights}\n` : ''}

JOGOS DISPONÍVEIS:
${games.map(g => `- ${g.name} (${g.game_id}): Domínios [${g.cognitive_domains?.join(', ')}], Condições-alvo [${g.target_conditions?.join(', ') || 'Todas'}]`).join('\n')}

Recomende 3-5 jogos com justificativa terapêutica.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'recommend_games',
              description: 'Retorna recomendações estruturadas de jogos cognitivos',
              parameters: {
                type: 'object',
                properties: {
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        game_id: { 
                          type: 'string',
                          description: 'ID do jogo recomendado (usar game_id da lista)'
                        },
                        title: { 
                          type: 'string',
                          description: 'Título claro e motivador'
                        },
                        reasoning: { 
                          type: 'string',
                          description: 'Justificativa terapêutica detalhada'
                        },
                        priority: { 
                          type: 'string',
                          enum: ['high', 'medium', 'low'],
                          description: 'Prioridade baseada nas necessidades atuais'
                        },
                        target_domains: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Domínios cognitivos que este jogo fortalece'
                        },
                        suggested_difficulty: {
                          type: 'integer',
                          description: 'Nível de dificuldade sugerido (1-10)'
                        }
                      },
                      required: ['game_id', 'title', 'reasoning', 'priority', 'target_domains', 'suggested_difficulty']
                    }
                  },
                  overall_strategy: {
                    type: 'string',
                    description: 'Estratégia terapêutica geral (2-3 frases)'
                  }
                },
                required: ['recommendations', 'overall_strategy']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'recommend_games' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[Recommendations] AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('[Recommendations] AI response:', JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('[Recommendations] No tool call in response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recommendationsData = JSON.parse(toolCall.function.arguments);
    const { recommendations, overall_strategy } = recommendationsData;

    console.log('[Recommendations] Parsed recommendations:', recommendations.length);

    // 8. Salvar recomendações na tabela ai_recommendations
    const savedRecommendations = [];
    
    for (const rec of recommendations) {
      // Buscar o ID interno do jogo
      const game = games.find(g => g.game_id === rec.game_id);
      if (!game) {
        console.warn('[Recommendations] Game not found:', rec.game_id);
        continue;
      }

      const priorityMap: { [key: string]: number } = { high: 1, medium: 2, low: 3 };
      
      const { data: savedRec, error: saveError } = await supabase
        .from('ai_recommendations')
        .insert({
          child_profile_id,
          recommendation_type: 'game_suggestion',
          title: rec.title,
          description: rec.reasoning,
          reasoning: rec.reasoning,
          priority: priorityMap[rec.priority as string] || 2,
          recommended_games: [game.id],
          suggested_actions: {
            game_id: game.id,
            game_name: game.name,
            suggested_difficulty: rec.suggested_difficulty,
            target_domains: rec.target_domains,
            overall_strategy
          },
          status: 'active',
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        })
        .select()
        .single();

      if (saveError) {
        console.error('[Recommendations] Save error:', saveError);
      } else {
        savedRecommendations.push(savedRec);
      }
    }

    console.log('[Recommendations] Saved:', savedRecommendations.length, 'recommendations');

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: savedRecommendations,
        overall_strategy,
        metadata: {
          child_name: childProfile.name,
          analyzed_sessions: sessions.length,
          games_analyzed: gamesPlayed
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Recommendations] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
