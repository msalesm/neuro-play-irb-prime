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
    const { problemDescription, childId, childAge, childConditions } = await req.json();
    
    if (!problemDescription) {
      return new Response(JSON.stringify({ error: 'problemDescription is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um especialista em criar histórias sociais terapêuticas para crianças neurodivergentes.
Crie uma história social personalizada baseada no problema descrito.

A história deve:
1. Ter 6 passos claros e sequenciais
2. Usar linguagem simples e positiva
3. Incluir afirmações na primeira pessoa
4. Focar em comportamentos desejados
5. Ser visualmente descritiva para permitir ilustração

${childAge ? `A criança tem ${childAge} anos.` : ''}
${childConditions?.length ? `Condições: ${childConditions.join(', ')}` : ''}

Responda em JSON:
{
  "title": "Título da história",
  "description": "Breve descrição",
  "ageMin": número,
  "ageMax": número,
  "steps": [
    {
      "order": 1,
      "title": "Título do passo",
      "description": "Descrição detalhada do passo",
      "imagePrompt": "Descrição para gerar ilustração"
    }
  ],
  "targetBehavior": "Comportamento alvo",
  "therapeuticGoal": "Objetivo terapêutico"
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
          { role: 'user', content: `Crie uma história social para ajudar com: ${problemDescription}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to generate story');
    }

    const aiData = await aiResponse.json();
    const storyText = aiData.choices?.[0]?.message?.content || '';
    
    let story;
    try {
      const jsonMatch = storyText.match(/\{[\s\S]*\}/);
      story = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      throw new Error('Failed to parse generated story');
    }

    if (!story) {
      throw new Error('No story generated');
    }

    // Save to database
    const { data: savedStory, error: saveError } = await supabase
      .from('ai_generated_stories')
      .insert({
        requested_by: user.id,
        child_id: childId || null,
        problem_description: problemDescription,
        generated_story: story,
        status: 'generated'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving story:', saveError);
    }

    return new Response(JSON.stringify({
      success: true,
      story,
      savedId: savedStory?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate story error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
