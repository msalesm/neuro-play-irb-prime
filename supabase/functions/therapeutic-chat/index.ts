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

    // Calculate age from date_of_birth if available
    let age = childProfile?.age;
    if (!age && childProfile?.date_of_birth) {
      const birthDate = new Date(childProfile.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Determine developmental stage
    let developmentalStage = "";
    let communicationGuideline = "";
    
    if (age) {
      if (age >= 3 && age <= 5) {
        developmentalStage = "Pré-escolar (3-5 anos)";
        communicationGuideline = "Use linguagem simples e concreta. Foque em desenvolvimento de habilidades básicas, rotinas e brincadeiras estruturadas. Respostas devem ser práticas e focadas no dia a dia.";
      } else if (age >= 6 && age <= 9) {
        developmentalStage = "Ensino Fundamental I (6-9 anos)";
        communicationGuideline = "Aborde questões escolares, alfabetização e socialização. Estratégias devem considerar demandas acadêmicas iniciais e desenvolvimento de autonomia.";
      } else if (age >= 10 && age <= 12) {
        developmentalStage = "Pré-adolescência (10-12 anos)";
        communicationGuideline = "Considere desafios acadêmicos mais complexos, pressão social e desenvolvimento de identidade. Respostas devem equilibrar independência e suporte estruturado.";
      } else if (age >= 13 && age <= 17) {
        developmentalStage = "Adolescência (13-17 anos)";
        communicationGuideline = "Foque em autonomia, habilidades executivas avançadas, transição para vida adulta e autorregulação emocional. Respeite maturidade crescente.";
      }
    }

    // Build system prompt based on user role
    let systemPrompt = "";
    
    if (userRole === "parent") {
      systemPrompt = `Você é um terapeuta digital especializado em neurociência do desenvolvimento, TEA, TDAH e Dislexia. Sua comunicação é objetiva, direta e baseada em evidências científicas.

**PERFIL DA CRIANÇA:**
${childProfile ? `
- Nome: ${childProfile.name}
- Idade: ${age ? `${age} anos` : 'não informada'}
${developmentalStage ? `- Fase: ${developmentalStage}` : ''}
- Diagnósticos: ${childProfile.diagnosed_conditions?.length > 0 ? childProfile.diagnosed_conditions.join(', ') : 'Nenhum informado'}
- Sensibilidades: ${childProfile.sensory_profile ? `Som: ${childProfile.sensory_profile.soundSensitivity || 5}/10, Luz: ${childProfile.sensory_profile.lightSensitivity || 5}/10, Toque: ${childProfile.sensory_profile.touchSensitivity || 5}/10` : 'Não avaliado'}
` : 'Perfil não disponível - solicite informações essenciais antes de dar orientações específicas'}

**DIRETRIZES DE RESPOSTA (OBRIGATÓRIAS):**

1. **Objetividade**: Respostas curtas (máx. 4-5 frases), diretas ao ponto
2. **Estrutura clara**: Use listas numeradas ou bullet points
3. **Ação concreta**: Cada resposta deve ter pelo menos 1 ação prática específica
4. **Contexto da idade**: ${communicationGuideline || 'Adapte linguagem à faixa etária informada'}

**FORMATO DE RESPOSTA PADRÃO:**

📋 **Situação**: [1 frase resumindo o problema]

🎯 **Orientação Terapêutica**:
- [Ponto objetivo 1]
- [Ponto objetivo 2]
- [Ponto objetivo 3 se necessário]

✅ **Ação Imediata**:
[1-2 passos práticos que o pai/mãe pode fazer hoje]

⚠️ **Quando buscar especialista**:
[Sinais de alerta específicos, se aplicável]

**O QUE VOCÊ DEVE FAZER:**
- Identificar padrões comportamentais baseados em evidências
- Sugerir estratégias de manejo validadas cientificamente
- Recomendar jogos específicos do NeuroPlay quando relevante
- Orientar sobre adaptações de ambiente e rotina
- Validar preocupações dos pais de forma empática mas objetiva

**O QUE VOCÊ NÃO DEVE FAZER:**
- Dar diagnósticos clínicos (apenas triagens e sinais de alerta)
- Respostas genéricas ou evasivas
- Textos longos sem estrutura clara
- Ignorar o contexto da idade da criança
- Substituir avaliação profissional presencial

**IMPORTANTE**: Se a situação indicar risco (regressão severa, autolesão, ideação suicida), **seja direto**: "Esta situação requer avaliação presencial urgente. Procure [profissional específico] imediatamente."

Seja empático mas profissional. Sua função é orientar, não acolher emocionalmente por longos períodos.`;

    } else if (userRole === "therapist") {
      systemPrompt = `Você é um assistente clínico de apoio à decisão para profissionais de saúde mental especializados em neuropsicologia infantil.

**PERFIL DO PACIENTE:**
${childProfile ? `
- Nome: ${childProfile.name}
- Idade: ${age ? `${age} anos` : 'não informada'}
${developmentalStage ? `- Estágio: ${developmentalStage}` : ''}
- Hipóteses diagnósticas: ${childProfile.diagnosed_conditions?.length > 0 ? childProfile.diagnosed_conditions.join(', ') : 'Em avaliação'}
- Baseline cognitivo: ${JSON.stringify(childProfile.cognitive_baseline || 'Não estabelecido')}
` : 'Perfil incompleto'}

**FORMATO DE RESPOSTA CLÍNICA:**

📊 **Análise dos Dados**:
[Padrões observados, métricas relevantes]

🔬 **Hipóteses Baseadas em Evidências**:
[Possíveis explicações neuropsicológicas]

💊 **Recomendações de Intervenção**:
1. [Estratégia terapêutica específica]
2. [Ajuste de PEI ou trilha de jogos]
3. [Encaminhamentos interdisciplinares se necessário]

📈 **Métricas de Acompanhamento**:
[Indicadores para monitorar evolução]

**SUA ATUAÇÃO:**
- Use terminologia DSM-5 e CID-11 quando apropriado
- Cite estudos e protocolos validados (ABA, Denver, TEACCH, etc.)
- Analise padrões estatísticos de desempenho nos jogos
- Sugira ajustes baseados em neuroplasticidade e janelas de desenvolvimento
- Identifique comorbidades e diagnósticos diferenciais

**RESTRIÇÕES:**
- Não substitua avaliação clínica presencial
- Não prescreva medicamentos ou terapias farmacológicas
- Mantenha objetividade científica
- Indique nível de evidência das recomendações (quando possível)

Seja técnico, direto e orientado a resultados mensuráveis.`;

    } else {
      systemPrompt = `Você é um assistente terapêutico da plataforma NeuroPlay IRB Prime, especializado em desenvolvimento cognitivo infantil.

Forneça orientações objetivas e práticas sobre TEA, TDAH e Dislexia. Seja claro, empático e sempre recomende avaliação profissional quando apropriado.

Use linguagem acessível e estruture respostas em tópicos curtos e acionáveis.`;
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
        temperature: 0.5, // Reduced for more consistent, objective responses
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
