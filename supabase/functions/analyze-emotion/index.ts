import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

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
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64, childId } = await req.json();

    // Rate limit: 20 emotion analyses per 60 minutes
    const allowed = await checkRateLimit(user.id, 'analyze-emotion', 20, 60);
    if (!allowed) {
      return rateLimitResponse(corsHeaders);
    }
    
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Image base64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_CLOUD_VISION_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Vision API not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clean base64 if it has data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    console.log('Calling Google Cloud Vision API for face detection...');

    // Call Google Cloud Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: cleanBase64 },
            features: [{ type: 'FACE_DETECTION', maxResults: 1 }],
          }],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Vision API error:', errorText);
      return new Response(JSON.stringify({ error: 'Vision API error', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const visionData = await visionResponse.json();
    console.log('Vision API response received');

    const faceAnnotations = visionData.responses?.[0]?.faceAnnotations;
    
    if (!faceAnnotations || faceAnnotations.length === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'no_face_detected',
        message: 'Nenhum rosto detectado na imagem. Posicione seu rosto na câmera.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const face = faceAnnotations[0];
    
    // Map Google Vision likelihood to numeric values
    const likelihoodMap: Record<string, number> = {
      'VERY_UNLIKELY': 0,
      'UNLIKELY': 1,
      'POSSIBLE': 2,
      'LIKELY': 3,
      'VERY_LIKELY': 4,
    };

    // Extract emotion scores
    const emotions = {
      joy: likelihoodMap[face.joyLikelihood] || 0,
      sorrow: likelihoodMap[face.sorrowLikelihood] || 0,
      anger: likelihoodMap[face.angerLikelihood] || 0,
      surprise: likelihoodMap[face.surpriseLikelihood] || 0,
    };

    // Determine primary emotion
    const emotionLabels: Record<string, string> = {
      joy: 'Feliz',
      sorrow: 'Triste',
      anger: 'Irritado',
      surprise: 'Surpreso',
    };

    let primaryEmotion = 'Neutro';
    let maxScore = 0;
    let detectedEmotions: string[] = [];

    for (const [emotion, score] of Object.entries(emotions)) {
      if (score >= 2) {
        detectedEmotions.push(emotionLabels[emotion]);
      }
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotionLabels[emotion];
      }
    }

    if (maxScore < 2) {
      primaryEmotion = 'Neutro';
    }

    // Calculate mood rating (1-5)
    let moodRating = 3; // neutral
    if (emotions.joy >= 3) {
      moodRating = emotions.joy >= 4 ? 5 : 4;
    } else if (emotions.sorrow >= 3 || emotions.anger >= 3) {
      moodRating = emotions.sorrow >= 4 || emotions.anger >= 4 ? 1 : 2;
    }

    // Detection confidence
    const detectionConfidence = face.detectionConfidence || 0;

    const result = {
      success: true,
      primaryEmotion,
      detectedEmotions: detectedEmotions.length > 0 ? detectedEmotions : ['Neutro'],
      moodRating,
      confidence: Math.round(detectionConfidence * 100),
      rawScores: emotions,
    };

    console.log('Emotion analysis result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-emotion function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
