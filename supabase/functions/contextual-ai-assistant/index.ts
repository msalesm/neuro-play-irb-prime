import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  context: {
    currentPage: string;
    userId?: string;
  };
  history: Message[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Autenticação necessária" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "User not found");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const { message, context, history }: RequestBody = await req.json();

    if (!message) {
      throw new Error("Mensagem é obrigatória");
    }

    // Build contextual system prompt based on current page
    const contextualPrompt = buildContextualPrompt(context.currentPage);

    const messages = [
      { role: "system", content: contextualPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Erro no serviço de IA");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Contextual AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildContextualPrompt(currentPage: string): string {
  const basePrompt = `Você é o assistente IA do Neuro IRB Prime, uma plataforma clínico-terapêutica para crianças neurodivergentes (TEA, TDAH, Dislexia).

REGRAS IMPORTANTES:
- Seja conciso e direto (máximo 3 parágrafos)
- Use linguagem acessível para pais e profissionais
- Forneça orientações práticas e baseadas em evidências
- NUNCA faça diagnósticos - apenas triagem e orientação
- Seja empático e acolhedor
- Quando apropriado, sugira ações específicas na plataforma

FUNCIONALIDADES DA PLATAFORMA:
- Planeta Azul: 5 planetas temáticos (TEA, TDAH, Dislexia, Regulação Emocional, Funções Executivas)
- Jogos cognitivos terapêuticos com métricas em tempo real
- Rotinas e histórias sociais ilustradas
- Chat terapêutico com check-ins emocionais
- Relatórios clínicos gerados por IA
- Painel para pais, terapeutas e escolas
- Central de IA Contextual com recomendações personalizadas
- Análise preditiva de comportamento e detecção de riscos`;

  // Add page-specific context
  if (currentPage.includes('dashboard-pais')) {
    return `${basePrompt}

CONTEXTO ATUAL: Dashboard dos Pais
- Foco: ajudar pais a entender o progresso do filho
- Explique métricas de forma simples
- Sugira próximos passos baseado no histórico
- Indique quando procurar ajuda profissional
- Recomende jogos específicos baseado no perfil da criança`;
  }
  
  if (currentPage.includes('contextual-ai') || currentPage.includes('ia-contextual')) {
    return `${basePrompt}

CONTEXTO ATUAL: Central de IA Contextual
- Foco: explicar como funcionam as recomendações e análises
- Descreva os tipos de análise preditiva disponíveis
- Explique como interpretar insights gerados
- Sugira quando usar cada tipo de análise
- Ajude a entender métricas de confiança`;
  }
  
  if (currentPage.includes('sistema-planeta-azul') || currentPage.includes('planeta')) {
    return `${basePrompt}

CONTEXTO ATUAL: Planeta Azul
- Foco: explicar o sistema de gamificação terapêutica
- TEA: memória visual, padrões, sequências, cognição social
- TDAH: atenção, controle inibitório, timing
- Dislexia: consciência fonológica, leitura
- Regulação Emocional: respiração, mindfulness
- Funções Executivas: planejamento, organização
- Sugira o planeta mais adequado baseado nas necessidades`;
  }
  
  if (currentPage.includes('rotinas') || currentPage.includes('historias')) {
    return `${basePrompt}

CONTEXTO ATUAL: Rotinas e Histórias Sociais
- Foco: orientar sobre estruturação de rotinas
- Explique benefícios das histórias sociais para TEA
- Sugira como manter consistência
- Dê dicas de personalização
- Recomende histórias específicas para situações comuns`;
  }
  
  if (currentPage.includes('games') || currentPage.includes('jogo')) {
    return `${basePrompt}

CONTEXTO ATUAL: Jogos Cognitivos
- Foco: explicar mecânicas e benefícios terapêuticos
- Descreva como a dificuldade adaptativa funciona
- Explique as métricas coletadas
- Relacione jogos com habilidades cognitivas
- Sugira jogos baseado no perfil e objetivos terapêuticos`;
  }
  
  if (currentPage.includes('therapist') || currentPage.includes('terapeuta')) {
    return `${basePrompt}

CONTEXTO ATUAL: Painel do Terapeuta
- Foco: suporte clínico para profissionais
- Ajude a interpretar dados e relatórios
- Sugira intervenções baseadas em evidências
- Oriente sobre configuração de PEI
- Explique como usar análises preditivas para prevenção`;
  }
  
  if (currentPage.includes('teacher') || currentPage.includes('professor')) {
    return `${basePrompt}

CONTEXTO ATUAL: Painel do Professor
- Foco: suporte pedagógico inclusivo
- Sugira adaptações curriculares
- Explique indicadores de aprendizagem
- Oriente sobre comunicação com pais
- Ajude a interpretar relatórios pedagógicos`;
  }
  
  if (currentPage.includes('intelligent-reports') || currentPage.includes('relatorios')) {
    return `${basePrompt}

CONTEXTO ATUAL: Relatórios Inteligentes
- Foco: ajudar a interpretar e gerar relatórios
- Explique os diferentes tipos de relatório (clínico, pedagógico, familiar)
- Descreva métricas e indicadores
- Oriente sobre exportação e compartilhamento
- Sugira como usar relatórios para acompanhamento`;
  }

  return basePrompt;
}
