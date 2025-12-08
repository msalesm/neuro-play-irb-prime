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
    // CRITICAL: Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's token to verify authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    const { childId, analysisType } = await req.json();
    
    if (!childId) {
      return new Response(JSON.stringify({ error: 'childId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role for data access after authentication verified
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SECURITY: Verify user has access to this child
    const { data: accessCheck } = await supabase
      .from('children')
      .select('id, parent_id')
      .eq('id', childId)
      .single();

    if (!accessCheck) {
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is parent, professional with access, or admin
    const isParent = accessCheck.parent_id === user.id;
    
    const { data: professionalAccess } = await supabase
      .from('child_access')
      .select('id')
      .eq('child_id', childId)
      .eq('professional_id', user.id)
      .eq('is_active', true)
      .eq('approval_status', 'approved')
      .maybeSingle();

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const hasAccess = isParent || !!professionalAccess || !!userRole;

    if (!hasAccess) {
      console.error('Access denied for user:', user.id, 'to child:', childId);
      return new Response(JSON.stringify({ error: 'Access denied - You do not have permission to access this child\'s data' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Access verified for user:', user.id, 'to child:', childId);

    // Fetch recent game sessions
    const { data: gameSessions } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('child_profile_id', childId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch recent learning sessions
    const { data: learningSessions } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', childId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch behavioral insights
    const { data: insights } = await supabase
      .from('behavioral_insights')
      .select('*')
      .eq('child_profile_id', childId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch biofeedback readings if available
    const { data: biofeedback } = await supabase
      .from('biofeedback_readings')
      .select('*')
      .eq('child_id', childId)
      .order('recorded_at', { ascending: false })
      .limit(50);

    // Prepare context for AI
    const context = {
      gameSessions: gameSessions || [],
      learningSessions: learningSessions || [],
      insights: insights || [],
      biofeedback: biofeedback || [],
      analysisType: analysisType || 'emotional_state'
    };

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um especialista em análise comportamental infantil para crianças neurodivergentes.
Analise os dados fornecidos e gere insights sobre:
1. Estado emocional atual inferido dos padrões de uso
2. Padrões detectados (horários, tipos de atividade, desempenho)
3. Recomendações personalizadas de atividades
4. Alertas importantes para a família
5. Sugestões de ajuste de dificuldade

Responda em JSON com a estrutura:
{
  "emotionalState": "happy|calm|anxious|tired|frustrated|neutral",
  "confidenceScore": 0.0-1.0,
  "detectedPatterns": [{"pattern": "", "description": "", "frequency": ""}],
  "recommendations": [{"type": "", "title": "", "description": "", "priority": "high|medium|low"}],
  "alerts": [{"type": "", "message": "", "severity": "info|warning|urgent"}],
  "difficultyAdjustment": {"current": 1-10, "recommended": 1-10, "reason": ""}
}`;

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
          { role: 'user', content: `Analise os seguintes dados da criança:\n${JSON.stringify(context, null, 2)}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to get AI analysis');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      analysis = {
        emotionalState: 'neutral',
        confidenceScore: 0.5,
        detectedPatterns: [],
        recommendations: [],
        alerts: [],
        rawAnalysis: analysisText
      };
    }

    // Store analysis in database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_emotional_analysis')
      .insert({
        child_id: childId,
        analysis_date: new Date().toISOString().split('T')[0],
        emotional_state: analysis.emotionalState,
        confidence_score: analysis.confidenceScore,
        detected_patterns: analysis.detectedPatterns,
        recommendations: analysis.recommendations,
        data_sources: {
          game_sessions: gameSessions?.length || 0,
          learning_sessions: learningSessions?.length || 0,
          insights: insights?.length || 0,
          biofeedback: biofeedback?.length || 0
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
    }

    // Create smart alerts if needed
    if (analysis.alerts && analysis.alerts.length > 0) {
      const { data: child } = await supabase
        .from('children')
        .select('parent_id')
        .eq('id', childId)
        .single();

      if (child?.parent_id) {
        const alertsToCreate = analysis.alerts.map((alert: any) => ({
          user_id: child.parent_id,
          child_id: childId,
          alert_type: alert.type || 'activity_suggestion',
          title: alert.title || 'Alerta',
          message: alert.message,
          scheduled_for: new Date().toISOString()
        }));

        await supabase.from('smart_alerts').insert(alertsToCreate);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      analysis,
      savedId: savedAnalysis?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Emotional AI analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
