import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";
import { ReportRequest, ReportResponse } from "./types.ts";
import { fetchSessionsData, fetchNeurodiversityProfile } from "./queries.ts";
import { calculateMetrics, analyzeTemporalEvolution, analyzeBehavioralPatterns } from "./metrics.ts";
import { generateAIPrompt } from "./ai-prompts.ts";
import { buildReport } from "./report-builder.ts";

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

    // Parse request body
    const requestBody: ReportRequest = await req.json();
    const { userId, startDate, endDate, reportType } = requestBody;

    // Validate that user can only generate their own reports
    if (userId !== user.id) {
      throw new Error('Unauthorized: Cannot generate reports for other users');
    }

    console.log(`Generating ${reportType} report for user ${userId} from ${startDate} to ${endDate}`);

    // Step 1: Fetch all necessary data
    const [sessionsData, neurodiversityProfile] = await Promise.all([
      fetchSessionsData(supabase, userId, startDate, endDate),
      fetchNeurodiversityProfile(supabase, userId)
    ]);

    if (!sessionsData.sessions || sessionsData.sessions.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'No learning sessions found for the specified period'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
        date_range_start: startDate,
        date_range_end: endDate,
        total_sessions: generalMetrics.totalSessions,
        avg_accuracy: generalMetrics.avgAccuracy,
        avg_reaction_time: generalMetrics.avgReactionTime,
        cognitive_improvements: generalMetrics.cognitiveScores,
        behavioral_patterns: behavioralPatterns,
        ai_insights: aiAnalysis?.executiveSummary || null,
        ai_recommendations: aiAnalysis?.recommendations || null,
        risk_indicators: aiAnalysis?.areasOfConcern || null,
        strengths_identified: aiAnalysis?.strengths || null,
        status: 'finalized'
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

    console.log(`Report ${savedReport.id} generated successfully`);

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
