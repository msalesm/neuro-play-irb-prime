import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictiveAnalysisRequest {
  childProfileId: string;
  analysisType: 'crisis_detection' | 'behavioral_trend' | 'intervention_recommendation';
  timeRangeDays?: number;
}

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Verify user authentication
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { childProfileId, analysisType, timeRangeDays = 30 } = await req.json() as PredictiveAnalysisRequest;

    if (!childProfileId || !analysisType) {
      return new Response(
        JSON.stringify({ error: 'childProfileId and analysisType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to the child profile
    const { data: hasAccess } = await supabase
      .rpc('has_child_access', { _user_id: user.id, _child_id: childProfileId });
    
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this child profile' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting predictive analysis:', { childProfileId, analysisType, timeRangeDays });

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRangeDays);

    // Gather comprehensive behavioral data
    const [gameSessions, emotionalCheckins, chatConversations, behavioralInsights] = await Promise.all([
      // Game sessions with performance metrics
      supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false }),

      // Emotional check-ins
      supabase
        .from('emotional_checkins')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false }),

      // Chat conversations with sentiment
      supabase
        .from('chat_conversations')
        .select('*, chat_messages(*)')
        .eq('child_profile_id', childProfileId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false }),

      // Existing behavioral insights
      supabase
        .from('behavioral_insights')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
    ]);

    if (gameSessions.error) throw gameSessions.error;
    if (emotionalCheckins.error) throw emotionalCheckins.error;
    if (chatConversations.error) throw chatConversations.error;
    if (behavioralInsights.error) throw behavioralInsights.error;

    // Get child profile for context
    const { data: childProfile, error: profileError } = await supabase
      .from('child_profiles')
      .select('*, children(*)')
      .eq('id', childProfileId)
      .single();

    if (profileError) throw profileError;

    // Calculate child's age
    const birthDate = new Date(childProfile.date_of_birth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Prepare data summary for AI analysis
    const dataSummary = {
      childAge: age,
      diagnosedConditions: childProfile.diagnosed_conditions || [],
      timeRangeDays,
      
      gamePerformance: {
        totalSessions: gameSessions.data?.length || 0,
        averageAccuracy: gameSessions.data?.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / (gameSessions.data?.length || 1),
        averageReactionTime: gameSessions.data?.reduce((sum, s) => sum + (s.avg_reaction_time_ms || 0), 0) / (gameSessions.data?.length || 1),
        completionRate: (gameSessions.data?.filter(s => s.completed).length || 0) / (gameSessions.data?.length || 1) * 100,
        recentTrend: calculatePerformanceTrend(gameSessions.data || []),
        frustrationEvents: gameSessions.data?.reduce((sum, s) => sum + (s.frustration_events || 0), 0) || 0,
        helpRequests: gameSessions.data?.reduce((sum, s) => sum + (s.help_requests || 0), 0) || 0,
      },
      
      emotionalState: {
        totalCheckins: emotionalCheckins.data?.length || 0,
        averageMoodRating: emotionalCheckins.data?.reduce((sum, c) => sum + (c.mood_rating || 0), 0) / (emotionalCheckins.data?.length || 1),
        emotionFrequency: aggregateEmotions(emotionalCheckins.data || []),
        recentMoodTrend: calculateMoodTrend(emotionalCheckins.data || []),
      },
      
      communicationPatterns: {
        totalConversations: chatConversations.data?.length || 0,
        averageSentiment: chatConversations.data?.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) / (chatConversations.data?.length || 1),
        behavioralTags: aggregateBehavioralTags(chatConversations.data || []),
        concernTopics: extractConcernTopics(chatConversations.data || []),
      },
      
      existingInsights: {
        totalInsights: behavioralInsights.data?.length || 0,
        severityDistribution: aggregateSeverity(behavioralInsights.data || []),
        insightTypes: aggregateInsightTypes(behavioralInsights.data || []),
      },
      
      recentSessions: gameSessions.data?.slice(0, 10).map(s => ({
        date: s.created_at,
        accuracy: s.accuracy_percentage,
        frustration: s.frustration_events,
        completed: s.completed,
      })) || [],
      
      recentEmotions: emotionalCheckins.data?.slice(0, 5).map(e => ({
        date: e.created_at,
        mood: e.mood_rating,
        emotions: e.emotions_detected,
      })) || [],
    };

    // Construct AI prompt based on analysis type
    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'crisis_detection') {
      systemPrompt = `Você é um sistema especializado em análise preditiva de comportamento infantil para detecção precoce de crises. 
Analise dados longitudinais de jogos cognitivos, check-ins emocionais e conversas terapêuticas para identificar padrões que indicam risco iminente de crise comportamental ou emocional.

Foque em:
- Declínios súbitos em desempenho cognitivo
- Aumento de eventos de frustração
- Mudanças abruptas no humor
- Padrões de isolamento ou comunicação reduzida
- Correlações entre múltiplos indicadores

Retorne análise estruturada com:
1. Nível de risco (baixo/médio/alto/crítico)
2. Indicadores específicos detectados
3. Probabilidade de crise (0-100%)
4. Timeline estimado (horas/dias)
5. Recomendações urgentes de intervenção`;

      userPrompt = `Analise os seguintes dados comportamentais de uma criança de ${age} anos com diagnóstico de ${dataSummary.diagnosedConditions.join(', ') || 'não especificado'}:

DESEMPENHO EM JOGOS (últimos ${timeRangeDays} dias):
- ${dataSummary.gamePerformance.totalSessions} sessões completas
- Acurácia média: ${dataSummary.gamePerformance.averageAccuracy.toFixed(1)}%
- Taxa de conclusão: ${dataSummary.gamePerformance.completionRate.toFixed(1)}%
- Eventos de frustração: ${dataSummary.gamePerformance.frustrationEvents}
- Pedidos de ajuda: ${dataSummary.gamePerformance.helpRequests}
- Tendência recente: ${dataSummary.gamePerformance.recentTrend}

ESTADO EMOCIONAL:
- ${dataSummary.emotionalState.totalCheckins} check-ins emocionais
- Humor médio: ${dataSummary.emotionalState.averageMoodRating.toFixed(1)}/10
- Tendência de humor: ${dataSummary.emotionalState.recentMoodTrend}
- Emoções frequentes: ${JSON.stringify(dataSummary.emotionalState.emotionFrequency)}

COMUNICAÇÃO:
- ${dataSummary.communicationPatterns.totalConversations} conversas
- Sentimento médio: ${dataSummary.communicationPatterns.averageSentiment.toFixed(2)}
- Tags comportamentais: ${dataSummary.communicationPatterns.behavioralTags.join(', ')}
- Tópicos de preocupação: ${dataSummary.communicationPatterns.concernTopics.join(', ')}

SESSÕES RECENTES:
${dataSummary.recentSessions.map(s => `- ${new Date(s.date).toLocaleDateString()}: ${s.accuracy}% acurácia, ${s.frustration} frustrações, ${s.completed ? 'completado' : 'abandonado'}`).join('\n')}

EMOÇÕES RECENTES:
${dataSummary.recentEmotions.map(e => `- ${new Date(e.date).toLocaleDateString()}: humor ${e.mood}/10, emoções: ${e.emotions?.join(', ') || 'não detectadas'}`).join('\n')}

Identifique padrões de risco e forneça análise preditiva detalhada.`;

    } else if (analysisType === 'behavioral_trend') {
      systemPrompt = `Você é um analista de tendências comportamentais infantis especializado em desenvolvimento cognitivo e emocional.
Analise dados longitudinais para identificar padrões evolutivos, progressos e regressões no comportamento da criança.

Retorne análise com:
1. Tendências principais identificadas
2. Áreas de progresso significativo
3. Áreas de preocupação ou regressão
4. Fatores contributivos
5. Previsões para próximas 2-4 semanas`;

      userPrompt = `Analise as tendências comportamentais dos últimos ${timeRangeDays} dias para criança de ${age} anos:

${JSON.stringify(dataSummary, null, 2)}

Identifique padrões evolutivos e forneça insights sobre trajetória de desenvolvimento.`;

    } else if (analysisType === 'intervention_recommendation') {
      systemPrompt = `Você é um especialista em intervenções terapêuticas preventivas para crianças neurodivergentes.
Com base em dados comportamentais, recomende intervenções específicas, acionáveis e baseadas em evidências.

Retorne recomendações estruturadas com:
1. Intervenções prioritárias (top 3-5)
2. Justificativa baseada em dados
3. Passos específicos de implementação
4. Timeline sugerido
5. Métricas de sucesso para acompanhamento`;

      userPrompt = `Com base nos seguintes dados de uma criança de ${age} anos (diagnóstico: ${dataSummary.diagnosedConditions.join(', ') || 'não especificado'}):

${JSON.stringify(dataSummary, null, 2)}

Recomende intervenções preventivas personalizadas e acionáveis para os pais.`;
    }

    // Call Lovable AI for predictive analysis
    console.log('Calling Lovable AI for predictive analysis...');
    
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
        temperature: 0.3, // Lower temperature for more consistent analysis
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    console.log('Predictive analysis completed');

    // Store analysis result in behavioral_insights
    const { error: insertError } = await supabase
      .from('behavioral_insights')
      .insert({
        child_profile_id: childProfileId,
        user_id: childProfile.parent_user_id,
        insight_type: `predictive_${analysisType}`,
        title: getTitleForAnalysisType(analysisType),
        description: analysis.substring(0, 500), // First 500 chars for description
        severity: extractSeverityFromAnalysis(analysis, analysisType),
        supporting_data: {
          fullAnalysis: analysis,
          dataSummary,
          analysisDate: new Date().toISOString(),
          timeRangeDays,
        },
      });

    if (insertError) {
      console.error('Error storing analysis:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        dataSummary,
        analysisType,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in predictive-analysis function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper functions
function calculatePerformanceTrend(sessions: any[]): string {
  if (sessions.length < 3) return 'dados insuficientes';
  
  const recent = sessions.slice(0, Math.floor(sessions.length / 3));
  const older = sessions.slice(-Math.floor(sessions.length / 3));
  
  const recentAvg = recent.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  if (diff > 10) return 'melhora significativa';
  if (diff > 5) return 'melhora leve';
  if (diff < -10) return 'declínio significativo';
  if (diff < -5) return 'declínio leve';
  return 'estável';
}

function calculateMoodTrend(checkins: any[]): string {
  if (checkins.length < 3) return 'dados insuficientes';
  
  const recent = checkins.slice(0, Math.floor(checkins.length / 2));
  const older = checkins.slice(-Math.floor(checkins.length / 2));
  
  const recentAvg = recent.reduce((sum, c) => sum + (c.mood_rating || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, c) => sum + (c.mood_rating || 0), 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  if (diff > 2) return 'melhora significativa';
  if (diff > 1) return 'melhora leve';
  if (diff < -2) return 'piora significativa';
  if (diff < -1) return 'piora leve';
  return 'estável';
}

function aggregateEmotions(checkins: any[]): Record<string, number> {
  const emotions: Record<string, number> = {};
  checkins.forEach(c => {
    (c.emotions_detected || []).forEach((emotion: string) => {
      emotions[emotion] = (emotions[emotion] || 0) + 1;
    });
  });
  return emotions;
}

function aggregateBehavioralTags(conversations: any[]): string[] {
  const tags = new Set<string>();
  conversations.forEach(c => {
    (c.behavioral_tags || []).forEach((tag: string) => tags.add(tag));
  });
  return Array.from(tags);
}

function extractConcernTopics(conversations: any[]): string[] {
  const concerns: string[] = [];
  conversations.forEach(c => {
    if (c.sentiment_score && c.sentiment_score < -0.3) {
      concerns.push(c.title || 'conversa sem título');
    }
  });
  return concerns.slice(0, 5);
}

function aggregateSeverity(insights: any[]): Record<string, number> {
  const severity: Record<string, number> = {};
  insights.forEach(i => {
    severity[i.severity] = (severity[i.severity] || 0) + 1;
  });
  return severity;
}

function aggregateInsightTypes(insights: any[]): Record<string, number> {
  const types: Record<string, number> = {};
  insights.forEach(i => {
    types[i.insight_type] = (types[i.insight_type] || 0) + 1;
  });
  return types;
}

function getTitleForAnalysisType(type: string): string {
  switch (type) {
    case 'crisis_detection':
      return 'Análise Preditiva: Detecção de Risco de Crise';
    case 'behavioral_trend':
      return 'Análise de Tendências Comportamentais';
    case 'intervention_recommendation':
      return 'Recomendações de Intervenção Preventiva';
    default:
      return 'Análise Preditiva';
  }
}

function extractSeverityFromAnalysis(analysis: string, type: string): string {
  const lowerAnalysis = analysis.toLowerCase();
  
  if (type === 'crisis_detection') {
    if (lowerAnalysis.includes('crítico') || lowerAnalysis.includes('alto risco') || lowerAnalysis.includes('urgente')) {
      return 'high';
    }
    if (lowerAnalysis.includes('médio') || lowerAnalysis.includes('atenção')) {
      return 'medium';
    }
    return 'low';
  }
  
  if (lowerAnalysis.includes('preocupante') || lowerAnalysis.includes('declínio')) {
    return 'medium';
  }
  
  return 'low';
}
