import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";
import { ReportRequest, ReportResponse } from "./types.ts";
import { fetchSessionsData, fetchBehavioralInsightsData, fetchNeurodiversityProfile } from "./queries.ts";
import { calculateMetrics, analyzeTemporalEvolution, analyzeBehavioralPatterns } from "./metrics.ts";
import { generateAIPrompt } from "./ai-prompts.ts";
import { buildReport } from "./report-builder.ts";
import { validateReportRequest } from "./validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse and validate request body
    const requestBody: ReportRequest = await req.json();
    
    // Server-side validation
    const validationResult = validateReportRequest(requestBody, user.id);
    if (!validationResult.valid) {
      console.error('Validation errors:', validationResult.errors);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Validation failed',
          errors: validationResult.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { userId, startDate, endDate, reportType } = requestBody;

    console.log(`Generating ${reportType} report for user ${userId} from ${startDate} to ${endDate}`);

    // Step 1: Fetch all necessary data
    let sessionsData;
    let dataSource = 'learning_sessions';
    
    // Try learning_sessions first
    console.log('🔍 Attempting to fetch learning_sessions...');
    sessionsData = await fetchSessionsData(supabase, userId, startDate, endDate);

    // If no learning_sessions, fallback to behavioral_insights
    if (!sessionsData.sessions || sessionsData.sessions.length === 0) {
      console.log('⚠️  No learning_sessions found, trying behavioral_insights fallback...');
      sessionsData = await fetchBehavioralInsightsData(supabase, userId, startDate, endDate);
      dataSource = 'behavioral_insights';
    }

    // If still no data, return informative error
    if (!sessionsData.sessions || sessionsData.sessions.length === 0) {
      console.log('❌ No data found in either learning_sessions or behavioral_insights');
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Nenhum dado encontrado para gerar relatório. Complete alguns jogos de diagnóstico primeiro!',
          suggestion: 'Jogue pelo menos 5 sessões de jogos diferentes para gerar um relatório completo.'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Using ${dataSource} as data source (${sessionsData.sessions.length} sessions found)`);
    
    const neurodiversityProfile = await fetchNeurodiversityProfile(supabase, userId);

    // Step 2: Calculate metrics
    const generalMetrics = calculateMetrics(sessionsData);
    const temporalEvolution = analyzeTemporalEvolution(sessionsData.sessions);
    const behavioralPatterns = analyzeBehavioralPatterns(sessionsData.sessions);

    // Step 3: Generate AI insights
    let aiAnalysis = null;
    try {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) {
        console.warn('LOVABLE_API_KEY not configured, skipping AI analysis');
      } else {
        const aiPrompt = generateAIPrompt({
          startDate,
          endDate,
          neurodiversityProfile,
          generalMetrics,
          cognitiveScores: generalMetrics.cognitiveScores,
          temporalEvolution,
          behavioralPatterns
        });

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: aiPrompt.system },
              { role: 'user', content: aiPrompt.user }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices?.[0]?.message?.content;
          
          if (aiContent) {
            try {
              // Try to parse as JSON
              aiAnalysis = JSON.parse(aiContent);
            } catch {
              // If not JSON, create structured response
              aiAnalysis = {
                executiveSummary: aiContent,
                domainAnalysis: {},
                strengths: [],
                areasOfConcern: [],
                recommendations: [],
                diagnosticIndicators: []
              };
            }
          }
        } else {
          console.error('AI API error:', await aiResponse.text());
        }
      }
    } catch (aiError) {
      console.error('Error calling AI:', aiError);
    }

    // Step 4: Build complete report
    const reportData = buildReport({
      userId,
      startDate,
      endDate,
      reportType,
      generalMetrics,
      temporalEvolution,
      behavioralPatterns,
      aiAnalysis,
      neurodiversityProfile
    });

    // Step 5: Save report metadata to database
    const { data: savedReport, error: saveError } = await supabase
      .from('clinical_reports')
      .insert({
        user_id: userId,
        report_type: reportType,
        generated_date: new Date().toISOString().split('T')[0],
        report_period_start: startDate,
        report_period_end: endDate,
        summary_insights: aiAnalysis?.executiveSummary || 
          `Relatório gerado com ${generalMetrics.totalSessions} sessões. Acurácia média: ${generalMetrics.avgAccuracy?.toFixed(1)}%.`,
        detailed_analysis: {
          dataSource: dataSource,
          sessionsAnalyzed: sessionsData.sessions.length,
          totalSessions: generalMetrics.totalSessions,
          avgAccuracy: generalMetrics.avgAccuracy,
          avgReactionTime: generalMetrics.avgReactionTime,
          cognitiveScores: generalMetrics.cognitiveScores,
          behavioralPatterns: behavioralPatterns,
          temporalEvolution: temporalEvolution,
          aiAnalysis: aiAnalysis
        },
        progress_indicators: {
          strengths: aiAnalysis?.strengths || [],
          areasOfConcern: aiAnalysis?.areasOfConcern || [],
          cognitiveImprovements: generalMetrics.cognitiveScores
        },
        intervention_recommendations: aiAnalysis?.recommendations || [],
        alert_flags: aiAnalysis?.areasOfConcern || [],
        generated_by_ai: aiAnalysis !== null,
        reviewed_by_professional: false
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
      throw new Error('Failed to save report');
    }

    // Step 6: Return complete report
    const response: ReportResponse = {
      reportId: savedReport.id,
      status: aiAnalysis ? 'success' : 'partial',
      data: reportData,
      generatedAt: new Date().toISOString(),
      warning: aiAnalysis ? undefined : 'AI analysis unavailable'
    };

    console.log(`✅ Report ${savedReport.id} generated successfully using ${dataSource}`);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-clinical-report:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle different error types
    if (errorMessage.includes('Unauthorized')) {
      return new Response(
        JSON.stringify({ status: 'error', error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'error',
        error: 'Internal server error',
        details: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
