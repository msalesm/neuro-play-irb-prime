import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";
import { ReportRequest, ReportResponse } from "./types.ts";
import { fetchAllAvailableData, fetchNeurodiversityProfile } from "./queries.ts";
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

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = userRole?.role === 'admin';
    console.log(`User ${user.id} isAdmin: ${isAdmin}`);

    // Parse and validate request body
    const requestBody: ReportRequest = await req.json();
    
    // Server-side validation (allow admins to generate for any user)
    const validationResult = validateReportRequest(requestBody, user.id, isAdmin);
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

    // Step 1: Fetch all necessary data from all sources
    console.log('🔍 Fetching data from all sources...');
    const allData = await fetchAllAvailableData(supabase, userId, startDate, endDate);
    
    // Combine all sessions from different sources
    const combinedSessions = [
      ...allData.sessions.sessions,
      ...allData.screenings.sessions,
      ...allData.insights.sessions
    ];
    
    // Merge trails data
    const combinedTrailsData = {
      ...allData.sessions.trailsData,
      ...allData.screenings.trailsData,
      ...allData.insights.trailsData
    };
    
    const sessionsData = {
      sessions: combinedSessions,
      trailsData: combinedTrailsData
    };

    const dataSources = [];
    if (allData.sessions.sessions.length > 0) dataSources.push('game_sessions');
    if (allData.screenings.sessions.length > 0) dataSources.push('screenings');
    if (allData.insights.sessions.length > 0) dataSources.push('behavioral_insights');
    const dataSource = dataSources.join(', ') || 'none';

    // If no data from any source, return informative error
    if (combinedSessions.length === 0) {
      console.log('❌ No data found in any source');
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Nenhum dado encontrado para gerar relatório. Complete alguns jogos ou testes de diagnóstico primeiro!',
          suggestion: 'Jogue alguns jogos cognitivos ou complete testes de triagem (TEA, TDAH, Dislexia) para gerar um relatório.',
          dataSources: {
            sessions: 0,
            screenings: 0,
            insights: 0
          }
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Combined ${combinedSessions.length} total records from: ${dataSource}`);
    
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
