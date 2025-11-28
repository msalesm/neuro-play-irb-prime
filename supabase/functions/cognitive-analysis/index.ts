import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GamePerformanceData {
  gameId: string;
  gameName: string;
  sessionDate: string;
  metrics: {
    reactionTime?: number;
    accuracy?: number;
    consistency?: number;
    persistence?: number;
    focusTime?: number;
    errorsCount?: number;
    correctAnswers?: number;
    totalAttempts?: number;
  };
}

interface AnalysisRequest {
  performanceData: GamePerformanceData[];
  userAge?: number;
  userProfile?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { performanceData, userAge, userProfile }: AnalysisRequest = await req.json();
    
    console.log('Starting cognitive analysis:', {
      gamesCount: performanceData?.length,
      userAge,
      userProfile
    });

    if (!performanceData || performanceData.length === 0) {
      throw new Error('Performance data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build comprehensive context for AI analysis
    const performanceSummary = performanceData.map(game => {
      const m = game.metrics;
      return `
Jogo: ${game.gameName} (${game.gameId})
Data: ${game.sessionDate}
Métricas:
- Tempo de Reação: ${m.reactionTime ? `${m.reactionTime}ms` : 'N/A'}
- Acurácia: ${m.accuracy ? `${m.accuracy.toFixed(1)}%` : 'N/A'}
- Consistência: ${m.consistency ? `${m.consistency.toFixed(1)}%` : 'N/A'}
- Persistência: ${m.persistence || 'N/A'}
- Tempo de Foco: ${m.focusTime ? `${m.focusTime}s` : 'N/A'}
- Erros: ${m.errorsCount ?? 'N/A'}
- Acertos: ${m.correctAnswers ?? 'N/A'}
- Total de Tentativas: ${m.totalAttempts ?? 'N/A'}
`;
    }).join('\n---\n');

    const systemPrompt = `Você é um especialista em neuropsicologia infantil e análise cognitiva. Sua função é analisar dados de performance em jogos cognitivos terapêuticos e gerar um diagnóstico detalhado do perfil cognitivo da criança.

Analise os dados de performance considerando:
- Padrões de desempenho em diferentes domínios cognitivos
- Pontos fortes e áreas que precisam de desenvolvimento
- Recomendações específicas e personalizadas
- Contexto da idade (${userAge || 'não informada'}) e perfil (${userProfile || 'não informado'})

Retorne uma análise completa, empática e orientada a ação para pais e terapeutas.`;

    const userPrompt = `Analise os seguintes dados de performance de jogos cognitivos e gere um relatório diagnóstico completo:

${performanceSummary}

Idade da criança: ${userAge || 'Não informada'}
Perfil neurodivergente: ${userProfile || 'Não informado'}

Gere uma análise cognitiva abrangente incluindo:
1. Perfil cognitivo com scores (0-100) para: atenção, memória, linguagem, lógica, emoção, coordenação
2. Lista de 3-5 pontos fortes identificados
3. Lista de 3-5 áreas para desenvolvimento
4. Análise detalhada (2-3 parágrafos) explicando padrões observados
5. Lista de 5-7 recomendações práticas e específicas
6. Score geral (0-100) representando o desempenho global
7. Lista de 3-5 jogos sugeridos para próximas sessões`;

    // Use tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_cognitive_report',
            description: 'Generate a comprehensive cognitive analysis report',
            parameters: {
              type: 'object',
              properties: {
                overallScore: {
                  type: 'number',
                  description: 'Overall cognitive performance score from 0-100'
                },
                cognitiveProfile: {
                  type: 'object',
                  properties: {
                    attention: { type: 'number', description: 'Attention score 0-100' },
                    memory: { type: 'number', description: 'Memory score 0-100' },
                    language: { type: 'number', description: 'Language score 0-100' },
                    logic: { type: 'number', description: 'Logic score 0-100' },
                    emotion: { type: 'number', description: 'Emotion regulation score 0-100' },
                    coordination: { type: 'number', description: 'Coordination score 0-100' }
                  },
                  required: ['attention', 'memory', 'language', 'logic', 'emotion', 'coordination']
                },
                strengths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '3-5 identified strengths'
                },
                areasForImprovement: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '3-5 areas needing development'
                },
                detailedAnalysis: {
                  type: 'string',
                  description: 'Detailed 2-3 paragraph analysis of cognitive patterns'
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '5-7 practical, specific recommendations'
                },
                suggestedGames: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '3-5 suggested game IDs for next sessions'
                }
              },
              required: ['overallScore', 'cognitiveProfile', 'strengths', 'areasForImprovement', 'detailedAnalysis', 'recommendations', 'suggestedGames'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_cognitive_report' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Credits exhausted. Please add credits to continue.');
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract structured data from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_cognitive_report') {
      throw new Error('Invalid AI response format');
    }

    const reportData = JSON.parse(toolCall.function.arguments);
    
    // Build final report
    const report = {
      userId: 'current-user', // Will be set by client
      generatedAt: new Date().toISOString(),
      overallScore: reportData.overallScore,
      cognitiveProfile: reportData.cognitiveProfile,
      strengths: reportData.strengths,
      areasForImprovement: reportData.areasForImprovement,
      detailedAnalysis: reportData.detailedAnalysis,
      recommendations: reportData.recommendations,
      suggestedGames: reportData.suggestedGames
    };

    console.log('Cognitive analysis complete:', {
      overallScore: report.overallScore,
      strengthsCount: report.strengths.length,
      recommendationsCount: report.recommendations.length
    });

    return new Response(JSON.stringify({ 
      success: true,
      report
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in cognitive-analysis:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: error.message.includes('Rate limit') ? 429 : 
             error.message.includes('Credits') ? 402 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});