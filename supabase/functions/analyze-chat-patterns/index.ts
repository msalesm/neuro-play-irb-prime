import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, userId, childProfileId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch conversation messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    // Fetch recent conversations for context (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentConversations, error: conversationsError } = await supabase
      .from('chat_conversations')
      .select('id, title, context_type, behavioral_tags, sentiment_score, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (conversationsError) throw conversationsError;

    // Prepare analysis prompt
    const analysisPrompt = `Analise esta conversa terapêutica e o histórico recente para identificar padrões comportamentais, preocupações e oportunidades de intervenção.

**Conversa Atual:**
${messages.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}

**Histórico Recente (últimas conversas):**
${recentConversations.map(c => `- ${c.title} (${c.context_type}) - Tags: ${c.behavioral_tags?.join(', ') || 'nenhuma'} - Sentimento: ${c.sentiment_score || 'não analisado'}`).join('\n')}

**Sua tarefa:**
1. Identificar padrões comportamentais recorrentes
2. Detectar possíveis preocupações ou sinais de alerta
3. Reconhecer progressos e conquistas
4. Sugerir recomendações personalizadas

Retorne sua análise estruturada usando as ferramentas disponíveis.`;

    // Call AI with structured output via tool calling
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise comportamental infantil, focado em TEA, TDAH e Dislexia. Analise conversas para identificar padrões, preocupações e oportunidades de intervenção."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_behavioral_insights",
              description: "Relatar insights comportamentais detectados na análise",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["pattern", "concern", "progress", "recommendation"],
                          description: "Tipo do insight"
                        },
                        severity: {
                          type: "string",
                          enum: ["low", "medium", "high", "urgent"],
                          description: "Severidade do insight"
                        },
                        title: {
                          type: "string",
                          description: "Título conciso do insight"
                        },
                        description: {
                          type: "string",
                          description: "Descrição detalhada do insight"
                        },
                        recommendedActions: {
                          type: "array",
                          items: { type: "string" },
                          description: "Ações recomendadas"
                        }
                      },
                      required: ["type", "severity", "title", "description"]
                    }
                  },
                  overallSentiment: {
                    type: "number",
                    description: "Score de sentimento geral (-1 a 1)",
                    minimum: -1,
                    maximum: 1
                  },
                  behavioralTags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags comportamentais identificadas"
                  }
                },
                required: ["insights", "overallSentiment", "behavioralTags"]
              }
            }
          }
        ],
        tool_choice: {
          type: "function",
          function: { name: "report_behavioral_insights" }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI analysis error:", response.status, errorText);
      throw new Error("Failed to analyze conversation");
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call received from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Update conversation with analysis results
    await supabase
      .from('chat_conversations')
      .update({
        sentiment_score: analysis.overallSentiment,
        behavioral_tags: analysis.behavioralTags,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    // Insert behavioral insights
    const insightsToInsert = analysis.insights.map((insight: any) => ({
      user_id: userId,
      child_profile_id: childProfileId,
      insight_type: insight.type,
      severity: insight.severity,
      title: insight.title,
      description: insight.description,
      supporting_data: {
        conversation_id: conversationId,
        recommended_actions: insight.recommendedActions || [],
        detected_at: new Date().toISOString()
      }
    }));

    if (insightsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('behavioral_insights')
        .insert(insightsToInsert);

      if (insertError) {
        console.error("Error inserting insights:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          sentiment: analysis.overallSentiment,
          tags: analysis.behavioralTags,
          insights: analysis.insights
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Pattern analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
