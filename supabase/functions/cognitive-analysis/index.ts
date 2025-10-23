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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Autenticação necessária. Faça login para continuar.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido ou expirado. Faça login novamente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { performanceData, userAge, userProfile } = await req.json();
    
    console.log('Starting cognitive analysis for user:', { userAge, userProfile, gamesCount: performanceData?.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(performanceData, userAge, userProfile);
    
    console.log('Calling Lovable AI for cognitive analysis...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um psicólogo especializado em neuropsicologia infantil e avaliação cognitiva. 
Sua especialidade é analisar dados de desempenho em jogos cognitivos e gerar relatórios diagnósticos precisos e empáticos.
Você trabalha com crianças e adolescentes neurodivergentes (TDAH, TEA, Dislexia).

IMPORTANTE: Seja sempre empático, positivo e focado nas potencialidades. Evite linguagem técnica demais.
Destaque os pontos fortes antes de mencionar áreas de desenvolvimento.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_cognitive_report",
              description: "Gera um relatório cognitivo estruturado baseado na análise dos dados de desempenho",
              parameters: {
                type: "object",
                properties: {
                  overallScore: {
                    type: "number",
                    description: "Pontuação geral de 0 a 100"
                  },
                  cognitiveProfile: {
                    type: "object",
                    properties: {
                      attention: { type: "number", description: "Score de atenção (0-100)" },
                      memory: { type: "number", description: "Score de memória (0-100)" },
                      language: { type: "number", description: "Score de linguagem (0-100)" },
                      logic: { type: "number", description: "Score de lógica (0-100)" },
                      emotion: { type: "number", description: "Score de inteligência emocional (0-100)" },
                      coordination: { type: "number", description: "Score de coordenação (0-100)" }
                    },
                    required: ["attention", "memory", "language", "logic", "emotion", "coordination"]
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 3-5 pontos fortes identificados"
                  },
                  areasForImprovement: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 2-4 áreas que precisam de atenção"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 3-5 recomendações práticas"
                  },
                  detailedAnalysis: {
                    type: "string",
                    description: "Análise detalhada em 2-3 parágrafos, empática e clara"
                  },
                  suggestedGames: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de jogos recomendados para desenvolvimento"
                  }
                },
                required: ["overallScore", "cognitiveProfile", "strengths", "areasForImprovement", "recommendations", "detailedAnalysis", "suggestedGames"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_cognitive_report" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns instantes." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos ao workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao processar análise cognitiva");
    }

    const data = await response.json();
    console.log('AI response received successfully');

    // Extract tool call result
    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI não retornou análise estruturada");
    }

    const report = JSON.parse(toolCall.function.arguments);
    console.log('Cognitive report generated:', { overallScore: report.overallScore });

    return new Response(
      JSON.stringify({ 
        success: true,
        report: {
          ...report,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in cognitive-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAnalysisPrompt(performanceData: any[], userAge?: number, userProfile?: string): string {
  let prompt = `Analise o desempenho cognitivo baseado nos seguintes dados de jogos:\n\n`;
  
  if (userAge) {
    prompt += `Idade do usuário: ${userAge} anos\n`;
  }
  
  if (userProfile) {
    prompt += `Perfil: ${userProfile}\n`;
  }
  
  prompt += `\nDados de Desempenho:\n`;
  
  performanceData.forEach((game, index) => {
    prompt += `\n${index + 1}. ${game.gameName}:\n`;
    if (game.metrics.reactionTime) {
      prompt += `   - Tempo de reação: ${game.metrics.reactionTime}ms\n`;
    }
    if (game.metrics.accuracy !== undefined) {
      prompt += `   - Precisão: ${game.metrics.accuracy}%\n`;
    }
    if (game.metrics.consistency !== undefined) {
      prompt += `   - Consistência: ${game.metrics.consistency}%\n`;
    }
    if (game.metrics.focusTime) {
      prompt += `   - Tempo de foco: ${game.metrics.focusTime}s\n`;
    }
    if (game.metrics.correctAnswers !== undefined && game.metrics.totalAttempts !== undefined) {
      prompt += `   - Acertos: ${game.metrics.correctAnswers}/${game.metrics.totalAttempts}\n`;
    }
  });

  prompt += `\n\nCom base nestes dados, gere um relatório cognitivo completo e estruturado usando a função generate_cognitive_report.
  
DIRETRIZES IMPORTANTES:
1. Seja empático e positivo
2. Destaque os pontos fortes primeiro
3. Use linguagem clara e acessível para famílias
4. Forneça recomendações práticas e específicas
5. Considere o perfil neurodivergente ao fazer sugestões
6. Os scores devem ser baseados nos dados, não arbitrários`;

  return prompt;
}
