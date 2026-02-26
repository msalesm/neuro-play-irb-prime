import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { inventoryId } = await req.json();
    if (!inventoryId) {
      return new Response(JSON.stringify({ error: 'inventoryId é obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch inventory data
    const { data: inventory, error: invError } = await supabase
      .from('skills_inventory')
      .select('*')
      .eq('id', inventoryId)
      .single();

    if (invError || !inventory) {
      return new Response(JSON.stringify({ error: 'Inventário não encontrado' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch child info if available
    let childName = 'Aluno(a)';
    if (inventory.child_id) {
      const { data: child } = await supabase
        .from('children')
        .select('name, birth_date, neurodevelopmental_conditions')
        .eq('id', inventory.child_id)
        .single();
      if (child) childName = child.name;
    }

    // Build category summaries
    const categories = [
      { key: 'identity_autonomy_literacy', name: 'Identidade, Autonomia e Leitura/Escrita', area: 'Comunicação e Representação' },
      { key: 'communication', name: 'Comunicação', area: 'Comunicação e Representação' },
      { key: 'writing_motor_coordination', name: 'Coordenação Motora na Escrita', area: 'Comunicação e Representação' },
      { key: 'math_concepts', name: 'Conceitos Matemáticos', area: 'Raciocínio Lógico' },
      { key: 'time_measurement', name: 'Tempo e Medida', area: 'Raciocínio Lógico' },
      { key: 'size_concepts', name: 'Noções de Grandeza', area: 'Raciocínio Lógico' },
      { key: 'spatial_temporal_orientation', name: 'Orientação Espacial Temporal', area: 'Representação Espacial' },
      { key: 'object_localization', name: 'Localização de Objetos', area: 'Representação Espacial' },
      { key: 'senses', name: 'Sentidos', area: 'Percepção Sensorial' },
      { key: 'arts_motor_coordination', name: 'Coordenação Motora Manual e Criação', area: 'Artes' },
      { key: 'body_image', name: 'Corpo e Imagem Corporal', area: 'Área Física e Motora' },
      { key: 'motor_independence', name: 'Independência Motora', area: 'Área Física e Motora' },
      { key: 'socialization', name: 'Socialização', area: 'Área Socioemocional' },
    ];

    const categorySummaries = categories.map(cat => {
      const items = (inventory as any)[cat.key] as any[] || [];
      const yes = items.filter((i: any) => i.response === 'yes').length;
      const no = items.filter((i: any) => i.response === 'no').length;
      const partial = items.filter((i: any) => i.response === 'partial').length;
      const total = items.length;
      const notAnswered = items.filter((i: any) => !i.response).length;

      // Collect items with observations
      const observations = items
        .filter((i: any) => i.observations)
        .map((i: any) => i.observations);

      // Collect "no" items for concern areas
      const noItems = items.filter((i: any) => i.response === 'no');
      const partialItems = items.filter((i: any) => i.response === 'partial');

      return {
        category: cat.name,
        area: cat.area,
        total,
        yes,
        no,
        partial,
        notAnswered,
        percentage: total > 0 ? Math.round((yes / total) * 100) : 0,
        observations,
        concerns: noItems.length + partialItems.length,
      };
    });

    const totalYes = inventory.yes_count || 0;
    const totalNo = inventory.no_count || 0;
    const totalPartial = inventory.partial_count || 0;
    const totalItems = inventory.total_items || 0;
    const completionPct = inventory.completion_percentage || 0;

    const prompt = `Você é um neuropsicopedagogo especialista em educação inclusiva e desenvolvimento infantil. 
Analise o Inventário de Habilidades abaixo e gere um relatório clínico-pedagógico detalhado.

## Dados do Aluno
- Nome: ${childName}
- Série: ${inventory.grade || 'Não informada'}
- Turno: ${inventory.shift || 'Não informado'}
- Laudo/Diagnóstico: ${inventory.diagnosis || 'Não informado'}
- Ano Letivo: ${inventory.school_year || 'Não informado'}
- Professor(a): ${inventory.teacher_name || 'Não informado'}
- Professor(a) AEE: ${inventory.aee_teacher_name || 'Não informado'}
- Acompanhante Terapêutico: ${(inventory as any).therapeutic_companion || 'Não informado'}

## Resumo Geral
- Total de itens avaliados: ${totalItems}
- Sim (domina): ${totalYes} (${totalItems > 0 ? Math.round((totalYes/totalItems)*100) : 0}%)
- Não (não domina): ${totalNo} (${totalItems > 0 ? Math.round((totalNo/totalItems)*100) : 0}%)
- Parcialmente: ${totalPartial} (${totalItems > 0 ? Math.round((totalPartial/totalItems)*100) : 0}%)
- Preenchimento: ${completionPct}%

## Detalhamento por Categoria
${categorySummaries.map(c => `
### ${c.category} (${c.area})
- Sim: ${c.yes}/${c.total} (${c.percentage}%)
- Não: ${c.no}/${c.total}
- Parcial: ${c.partial}/${c.total}
- Áreas de preocupação: ${c.concerns} itens
${c.observations.length > 0 ? `- Observações registradas: ${c.observations.join('; ')}` : ''}`).join('\n')}

## Observações gerais do avaliador
${inventory.notes || 'Nenhuma observação adicional.'}

---

Gere um relatório estruturado em formato JSON com os seguintes campos:
{
  "resumoExecutivo": "Parágrafo de síntese geral (3-5 frases)",
  "pontosFortes": ["lista de habilidades consolidadas"],
  "areasAtencao": ["lista de áreas que necessitam de intervenção prioritária"],
  "analiseDetalhada": {
    "comunicacaoRepresentacao": "análise da área de comunicação e representação",
    "raciocinioLogico": "análise do raciocínio lógico-matemático",
    "representacaoEspacial": "análise de orientação e percepção espacial",
    "percepcaoSensorial": "análise dos sentidos e percepção",
    "areaFisicaMotora": "análise motora e esquema corporal",
    "areaSocioemocional": "análise da socialização e comportamento"
  },
  "recomendacoes": [
    {
      "area": "nome da área",
      "objetivo": "objetivo da intervenção",
      "estrategias": ["estratégias sugeridas"],
      "prioridade": "alta|média|baixa"
    }
  ],
  "sugestoesAtividadesAEE": ["sugestões de atividades para o AEE"],
  "orientacoesEquipe": "orientações para a equipe multiprofissional",
  "conclusao": "conclusão geral e prognóstico pedagógico"
}

IMPORTANTE: 
- Responda APENAS com o JSON, sem texto adicional ou blocos de código.
- A análise deve ser clínica e técnica, adequada para uso profissional.
- Considere o diagnóstico/laudo informado na análise.
- Não faça diagnósticos clínicos, apenas análise pedagógica.`;

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'Chave de IA não configurada' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'Você é um neuropsicopedagogo especialista. Responda apenas com JSON válido, sem markdown ou blocos de código.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA esgotados.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.error('AI error:', status, await aiResponse.text());
      return new Response(JSON.stringify({ error: 'Erro ao gerar relatório com IA' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || '';
    
    // Clean markdown
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let report;
    try {
      report = JSON.parse(content);
    } catch {
      report = { resumoExecutivo: content, pontosFortes: [], areasAtencao: [], recomendacoes: [], analiseDetalhada: {}, sugestoesAtividadesAEE: [], orientacoesEquipe: '', conclusao: '' };
    }

    // Persist the AI report in the database
    const generatedAt = new Date().toISOString();
    await supabase
      .from('skills_inventory')
      .update({ 
        ai_report: report, 
        ai_report_generated_at: generatedAt 
      })
      .eq('id', inventoryId);

    return new Response(JSON.stringify({ 
      status: 'success', 
      report,
      childName,
      generatedAt,
      inventoryStats: { totalItems, totalYes, totalNo, totalPartial, completionPct },
      categorySummaries
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    if (msg.includes('Unauthorized')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
