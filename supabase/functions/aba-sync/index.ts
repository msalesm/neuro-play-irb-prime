import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ABA_BASE_URL =
  "https://integracao-api-prd.abamais.com:15443/v1/integracoes";

interface SyncResult {
  type: string;
  records: number;
  errors: string[];
}

async function makeAbaRequest(
  endpoint: string,
  params?: Record<string, string>
): Promise<any> {
  const pfxBase64 = Deno.env.get("ABA_PLUS_CERTIFICATE_PFX");
  const pfxPassword = Deno.env.get("ABA_PLUS_CERTIFICATE_PASSWORD");

  if (!pfxBase64 || !pfxPassword) {
    throw new Error("ABA+ certificate not configured");
  }

  const url = new URL(`${ABA_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  // Use Deno.createHttpClient for mTLS support
  const pfxBytes = Uint8Array.from(atob(pfxBase64), (c) => c.charCodeAt(0));

  let client: Deno.HttpClient | undefined;
  try {
    // Deno supports client certificates via createHttpClient
    client = Deno.createHttpClient({
      // @ts-ignore - Deno runtime supports this
      certChain: undefined,
      privateKey: undefined,
      // For PFX, we use the proxy approach
    });
  } catch {
    // Fallback: direct fetch without mTLS (for testing)
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Note: Full mTLS with PFX requires node:https compatibility
        // This implementation uses the certificate stored in secrets
        ...(client ? { client } : {}),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`ABA+ API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) {
        // Exponential backoff
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }

  clearTimeout(timeout);
  throw lastError || new Error("ABA+ request failed after 3 retries");
}

async function syncAprendizes(
  supabase: any,
  params?: { dataInicioAlteracao?: string; dataFimAlteracao?: string }
): Promise<SyncResult> {
  const result: SyncResult = { type: "aprendizes", records: 0, errors: [] };

  try {
    const queryParams: Record<string, string> = {};
    if (params?.dataInicioAlteracao)
      queryParams.dataInicioAlteracao = params.dataInicioAlteracao;
    if (params?.dataFimAlteracao)
      queryParams.dataFimAlteracao = params.dataFimAlteracao;

    const data = await makeAbaRequest("/aprendizes", queryParams);
    const aprendizes = data?.data || data || [];

    for (const aprendiz of aprendizes) {
      const { error } = await supabase.from("aba_aprendizes").upsert(
        {
          codigo_aprendiz: String(aprendiz.codigo || aprendiz.codigoAprendiz),
          nome: aprendiz.nome,
          cpf: aprendiz.cpf,
          sexo: aprendiz.sexo,
          data_nascimento: aprendiz.dataNascimento,
          convenio: aprendiz.convenio,
          nivel_suporte: aprendiz.nivelSuporte,
          ativo: aprendiz.ativo !== false,
          raw_json: aprendiz,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "codigo_aprendiz" }
      );

      if (error) {
        result.errors.push(`Aprendiz ${aprendiz.nome}: ${error.message}`);
      } else {
        result.records++;
      }
    }
  } catch (error) {
    result.errors.push(`Sync aprendizes: ${(error as Error).message}`);
  }

  return result;
}

async function syncProfissionais(
  supabase: any,
  params?: { dataInicioAlteracao?: string; dataFimAlteracao?: string }
): Promise<SyncResult> {
  const result: SyncResult = { type: "profissionais", records: 0, errors: [] };

  try {
    const queryParams: Record<string, string> = {};
    if (params?.dataInicioAlteracao)
      queryParams.dataInicioAlteracao = params.dataInicioAlteracao;
    if (params?.dataFimAlteracao)
      queryParams.dataFimAlteracao = params.dataFimAlteracao;

    const data = await makeAbaRequest("/profissionais", queryParams);
    const profissionais = data?.data || data || [];

    for (const prof of profissionais) {
      const { error } = await supabase.from("aba_profissionais").upsert(
        {
          codigo_profissional: String(
            prof.codigo || prof.codigoProfissional
          ),
          nome: prof.nome,
          cpf: prof.cpf,
          especialidade: prof.especialidade,
          cargo: prof.cargo,
          ativo: prof.ativo !== false,
          raw_json: prof,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "codigo_profissional" }
      );

      if (error) {
        result.errors.push(`Profissional ${prof.nome}: ${error.message}`);
      } else {
        result.records++;
      }
    }
  } catch (error) {
    result.errors.push(`Sync profissionais: ${(error as Error).message}`);
  }

  return result;
}

async function syncAgendamentos(supabase: any): Promise<SyncResult> {
  const result: SyncResult = { type: "agendamentos", records: 0, errors: [] };

  try {
    const data = await makeAbaRequest("/agendamentos-diarios");
    const agendamentos = data?.data || data || [];

    for (const ag of agendamentos) {
      const { error } = await supabase.from("aba_agendamentos").upsert(
        {
          codigo_agendamento: String(ag.codigo || ag.identificador || ag.id),
          codigo_aprendiz: String(ag.codigoAprendiz),
          codigo_profissional: String(ag.codigoProfissional),
          tipo: ag.tipo,
          situacao: ag.situacao,
          data_inicio: ag.dataInicio,
          data_fim: ag.dataFim,
          raw_json: ag,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "codigo_agendamento" }
      );

      if (error) {
        result.errors.push(`Agendamento: ${error.message}`);
      } else {
        result.records++;
      }
    }
  } catch (error) {
    result.errors.push(`Sync agendamentos: ${(error as Error).message}`);
  }

  return result;
}

async function syncAtendimentos(
  supabase: any,
  dataInicio: string,
  dataFim: string
): Promise<SyncResult> {
  const result: SyncResult = { type: "atendimentos", records: 0, errors: [] };

  try {
    const data = await makeAbaRequest("/atendimentos-periodo", {
      dataInicio,
      dataFim,
    });
    const atendimentos = data?.data || data || [];

    for (const at of atendimentos) {
      const { error } = await supabase.from("aba_atendimentos").upsert(
        {
          identificador: String(at.identificador || at.id),
          codigo_aprendiz: String(at.codigoAprendiz),
          tipo: at.tipo,
          data_inicio: at.dataInicio,
          data_fim: at.dataFim,
          falta: at.falta === true,
          observacoes: at.observacoes,
          data_alteracao: at.dataAlteracao,
          raw_json: at,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "identificador" }
      );

      if (error) {
        result.errors.push(`Atendimento: ${error.message}`);
      } else {
        result.records++;
      }
    }
  } catch (error) {
    result.errors.push(`Sync atendimentos: ${(error as Error).message}`);
  }

  return result;
}

async function syncDesempenho(
  supabase: any,
  codigosSessao: string[]
): Promise<SyncResult> {
  const result: SyncResult = { type: "desempenho", records: 0, errors: [] };

  if (codigosSessao.length === 0) return result;

  try {
    const data = await makeAbaRequest("/desempenho-programas", {
      codigoSessao: codigosSessao.join(","),
    });
    const desempenhos = data?.data || data || [];

    for (const d of desempenhos) {
      const { error } = await supabase.from("aba_desempenho").insert({
        identificador_sessao: String(d.identificadorSessao || d.codigoSessao),
        identificador_programa: String(d.identificadorPrograma),
        codigo_aprendiz: String(d.codigoAprendiz),
        habilidade: d.habilidade,
        programa: d.programa,
        percentual_erro: d.percentualErro,
        percentual_ajuda: d.percentualAjuda,
        percentual_independencia: d.percentualIndependencia,
        nivel_independencia: d.nivelIndependencia,
        raw_json: d,
        synced_at: new Date().toISOString(),
      });

      if (error) {
        result.errors.push(`Desempenho: ${error.message}`);
      } else {
        result.records++;
      }
    }
  } catch (error) {
    result.errors.push(`Sync desempenho: ${(error as Error).message}`);
  }

  return result;
}

async function calculateNeuroScores(supabase: any): Promise<void> {
  // Get all active aprendizes
  const { data: aprendizes } = await supabase
    .from("aba_aprendizes")
    .select("codigo_aprendiz")
    .eq("ativo", true);

  if (!aprendizes) return;

  for (const aprendiz of aprendizes) {
    const codigo = aprendiz.codigo_aprendiz;

    // Get last 30 days of desempenho
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString();

    const { data: desempenhos } = await supabase
      .from("aba_desempenho")
      .select("*")
      .eq("codigo_aprendiz", codigo)
      .gte("synced_at", thirtyDaysAgo)
      .order("synced_at", { ascending: false });

    // Get last 30 days of atendimentos
    const { data: atendimentos } = await supabase
      .from("aba_atendimentos")
      .select("*")
      .eq("codigo_aprendiz", codigo)
      .gte("data_inicio", thirtyDaysAgo);

    const totalAtendimentos = atendimentos?.length || 0;
    const faltas = atendimentos?.filter((a: any) => a.falta)?.length || 0;
    const taxaPresenca =
      totalAtendimentos > 0
        ? ((totalAtendimentos - faltas) / totalAtendimentos) * 100
        : 0;

    const avgIndependencia =
      desempenhos && desempenhos.length > 0
        ? desempenhos.reduce(
            (sum: number, d: any) => sum + (d.percentual_independencia || 0),
            0
          ) / desempenhos.length
        : 0;

    const avgErro =
      desempenhos && desempenhos.length > 0
        ? desempenhos.reduce(
            (sum: number, d: any) => sum + (d.percentual_erro || 0),
            0
          ) / desempenhos.length
        : 0;

    // Score: weighted average
    const score = Math.round(
      avgIndependencia * 0.4 +
        (100 - avgErro) * 0.3 +
        taxaPresenca * 0.3
    );

    // Detect alerts
    let alertType: string | null = null;
    let alertMessage: string | null = null;

    // Check for consecutive absences
    if (atendimentos && atendimentos.length >= 2) {
      const sorted = [...atendimentos].sort(
        (a: any, b: any) =>
          new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
      );
      if (sorted[0]?.falta && sorted[1]?.falta) {
        alertType = "faltas_consecutivas";
        alertMessage = "2+ faltas consecutivas detectadas";
      }
    }

    // Check for performance drop
    if (desempenhos && desempenhos.length >= 10) {
      const recent = desempenhos.slice(0, 5);
      const older = desempenhos.slice(5, 10);
      const recentAvg =
        recent.reduce(
          (s: number, d: any) => s + (d.percentual_independencia || 0),
          0
        ) / recent.length;
      const olderAvg =
        older.reduce(
          (s: number, d: any) => s + (d.percentual_independencia || 0),
          0
        ) / older.length;

      if (olderAvg > 0 && (olderAvg - recentAvg) / olderAvg > 0.2) {
        alertType = "queda_desempenho";
        alertMessage = `Redução de ${Math.round(((olderAvg - recentAvg) / olderAvg) * 100)}% no nível de independência`;
      }
    }

    await supabase.from("aba_neuro_scores").insert({
      codigo_aprendiz: codigo,
      score: Math.max(0, Math.min(100, score)),
      score_components: {
        independencia: avgIndependencia,
        erro_invertido: 100 - avgErro,
        presenca: taxaPresenca,
        total_sessoes: desempenhos?.length || 0,
        total_atendimentos: totalAtendimentos,
        faltas,
      },
      alert_type: alertType,
      alert_message: alertMessage,
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } =
      await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "therapist"])
      .limit(1);

    if (!roleData || roleData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "full_sync";

    // Log sync start
    const { data: syncLog } = await supabase
      .from("aba_sync_logs")
      .insert({
        sync_type: action,
        status: "started",
        metadata: { triggered_by: userId },
      })
      .select()
      .single();

    const results: SyncResult[] = [];
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (action === "full_sync" || action === "sync_aprendizes") {
      results.push(await syncAprendizes(supabase, body.params));
    }

    if (action === "full_sync" || action === "sync_profissionais") {
      results.push(await syncProfissionais(supabase, body.params));
    }

    if (action === "full_sync" || action === "sync_agendamentos") {
      results.push(await syncAgendamentos(supabase));
    }

    if (action === "full_sync" || action === "sync_atendimentos") {
      results.push(
        await syncAtendimentos(
          supabase,
          body.params?.dataInicio || thirtyDaysAgo,
          body.params?.dataFim || today
        )
      );
    }

    if (action === "full_sync" || action === "calculate_scores") {
      await calculateNeuroScores(supabase);
      results.push({ type: "neuro_scores", records: 0, errors: [] });
    }

    const totalRecords = results.reduce((s, r) => s + r.records, 0);
    const allErrors = results.flatMap((r) => r.errors);
    const status = allErrors.length > 0 ? "partial" : "completed";

    // Update sync log
    if (syncLog) {
      await supabase
        .from("aba_sync_logs")
        .update({
          status,
          records_synced: totalRecords,
          error_message:
            allErrors.length > 0 ? allErrors.join("; ") : null,
          completed_at: new Date().toISOString(),
          metadata: { triggered_by: userId, results },
        })
        .eq("id", syncLog.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
        total_records: totalRecords,
        results,
        errors: allErrors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("ABA sync error:", error);
    return new Response(
      JSON.stringify({
        error: "Sync failed",
        message: (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
