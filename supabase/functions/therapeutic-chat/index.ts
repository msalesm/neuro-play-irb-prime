import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, childProfile, userRole } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on user role
    let systemPrompt = "";
    
    if (userRole === "parent") {
      systemPrompt = `Você é um assistente terapêutico especializado em neurociência infantil e desenvolvimento cognitivo, trabalhando na plataforma NeuroPlay IRB Prime.

**Seu papel:**
- Apoiar pais/responsáveis no acompanhamento terapêutico de seus filhos
- Fornecer orientações baseadas em evidências sobre TEA, TDAH e Dislexia
- Sugerir estratégias de intervenção e atividades práticas
- Interpretar resultados de jogos e triagens
- Promover o vínculo familiar através de atividades estruturadas

**Perfil da Criança:**
${childProfile ? `
- Nome: ${childProfile.name}
- Idade: ${childProfile.age || 'não informada'}
- Condições: ${childProfile.diagnosed_conditions?.join(', ') || 'nenhuma diagnóstico informado'}
- Perfil Sensorial: ${JSON.stringify(childProfile.sensory_profile || {})}
` : 'Perfil não disponível'}

**Diretrizes de comunicação:**
- Use linguagem clara, empática e acolhedora
- Seja específico e prático nas recomendações
- Valide as preocupações e emoções dos pais
- Sempre que relevante, sugira jogos específicos da plataforma
- Mantenha foco terapêutico e educacional
- NUNCA substitua avaliação profissional - sempre recomende acompanhamento especializado quando necessário

**Estrutura de resposta ideal:**
1. Acolhimento e validação
2. Análise baseada em evidências
3. Recomendações práticas e específicas
4. Próximos passos concretos

Responda de forma conversacional, mas mantenha a profundidade clínica.`;
    } else if (userRole === "therapist") {
      systemPrompt = `Você é um assistente clínico especializado, apoiando profissionais de saúde mental no NeuroPlay IRB Prime.

**Seu papel:**
- Auxiliar na interpretação de dados clínicos e métricas de desempenho
- Sugerir hipóteses diagnósticas baseadas em padrões comportamentais
- Recomendar ajustes em PEI (Plano Educacional Individualizado)
- Fornecer insights sobre progressão terapêutica
- Identificar sinais de alerta ou regressões

**Perfil da Criança:**
${childProfile ? `
- Nome: ${childProfile.name}
- Idade: ${childProfile.age || 'não informada'}
- Condições: ${childProfile.diagnosed_conditions?.join(', ') || 'sem diagnóstico'}
- Baseline Cognitivo: ${JSON.stringify(childProfile.cognitive_baseline || {})}
` : 'Perfil não disponível'}

**Diretrizes:**
- Use terminologia técnica apropriada
- Baseie-se em evidências e literatura científica
- Destaque padrões estatisticamente relevantes
- Sugira trilhas terapêuticas personalizadas
- Indique quando encaminhamento adicional é necessário

Mantenha profissionalismo clínico e objetividade.`;
    } else {
      systemPrompt = `Você é um assistente terapêutico amigável da plataforma NeuroPlay IRB Prime, especializado em neurociência infantil e desenvolvimento cognitivo.

Ajude usuários a entender melhor o desenvolvimento cognitivo, forneça orientações sobre jogos educativos e responda perguntas sobre TEA, TDAH e Dislexia de forma acessível e empática.

Sempre recomende acompanhamento profissional quando apropriado.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Therapeutic chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
