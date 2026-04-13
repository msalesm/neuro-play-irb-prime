import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import forge from "https://esm.sh/node-forge@1.3.1";

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

function normalizePfxBase64(secret: string): string {
  let normalized = secret.trim();

  if (normalized.startsWith("data:")) {
    const commaIndex = normalized.indexOf(",");
    if (commaIndex >= 0) {
      normalized = normalized.slice(commaIndex + 1);
    }
  }

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    try {
      normalized = JSON.parse(normalized);
    } catch {
      normalized = normalized.slice(1, -1);
    }
  }

  normalized = normalized
    .replace(/\\r/g, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  if (normalized.startsWith("-----BEGIN")) {
    throw new Error(
      "ABA_PLUS_CERTIFICATE_PFX deve conter o base64 bruto do arquivo .pfx, não um PEM"
    );
  }

  const remainder = normalized.length % 4;
  if (remainder > 0) {
    normalized = normalized.padEnd(normalized.length + (4 - remainder), "=");
  }

  return normalized;
}

/**
 * Creates a Deno HTTP client configured with mTLS.
 * Uses node-forge to parse PFX in pure JS (no subprocess needed).
 */
function createMtlsClient(): Deno.HttpClient {
  const pfxBase64 = Deno.env.get("ABA_PLUS_CERTIFICATE_PFX");
  const pfxPassword = Deno.env.get("ABA_PLUS_CERTIFICATE_PASSWORD");

  if (!pfxBase64 || !pfxPassword) {
    throw new Error("ABA+ certificate not configured (PFX or password missing)");
  }

  try {
    const normalizedPfx = normalizePfxBase64(pfxBase64);
    const pfxDer = forge.util.decode64(normalizedPfx);
    const pfxAsn1 = forge.asn1.fromDer(pfxDer);
    const p12 = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, pfxPassword);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = certBags[forge.pki.oids.certBag];
    if (!certBag || certBag.length === 0 || !certBag[0].cert) {
      throw new Error("Nenhum certificado encontrado no PFX");
    }

    const shroudedKeyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const plainKeyBags = p12.getBags({ bagType: forge.pki.oids.keyBag });
    const keyBag = [
      ...(shroudedKeyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || []),
      ...(plainKeyBags[forge.pki.oids.keyBag] || []),
    ][0];

    if (!keyBag?.key) {
      throw new Error("Nenhuma chave privada encontrada no PFX");
    }

    const certPem = forge.pki.certificateToPem(certBag[0].cert);
    const keyPem = forge.pki.privateKeyToPem(keyBag.key);

    return Deno.createHttpClient({
      certChain: certPem,
      privateKey: keyPem,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("ABA+ certificate parse failed:", message);
    throw new Error(
      `Certificado ABA+ inválido. Salve ABA_PLUS_CERTIFICATE_PFX como o base64 bruto do arquivo .pfx em uma única linha. Detalhe: ${message}`
    );
  }
}

async function makeAbaRequest(
  endpoint: string,
  params?: Record<string, string>,
  httpClient?: Deno.HttpClient
): Promise<any> {
  const url = new URL(`${ABA_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const apiKey = Deno.env.get("ABA_PLUS_API_KEY");
  const apiToken = Deno.env.get("ABA_PLUS_API_TOKEN");

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      // GET requests use mTLS + optional token; POST/PUT use Abm-Api-Key
      if (apiKey) {
        headers["Abm-Api-Key"] = apiKey;
      }
      if (apiToken) {
        headers["Authorization"] = `Bearer ${apiToken}`;
      }

      const fetchOptions: RequestInit & { client?: Deno.HttpClient } = {
        signal: controller.signal,
        headers,
      };
      if (httpClient) {
        fetchOptions.client = httpClient;
      }

      const response = await fetch(url.toString(), fetchOptions);
      clearTimeout(timeout);

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`ABA+ API error: ${response.status} ${response.statusText} - ${body}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      lastError = error as Error;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error("ABA+ request failed after 3 retries");
}

// ─── Sync Functions ──────────────────────────────────────────────

async function syncAprendizes(
  supabase: any,
  httpClient: Deno.HttpClient,
  params?: { dataInicioAlteracao?: string; dataFimAlteracao?: string }
): Promise<SyncResult> {
  const result: SyncResult = { type: "aprendizes", records: 0, errors: [] };

  try {
    const queryParams: Record<string, string> = {};
    if (params?.dataInicioAlteracao) queryParams.dataInicioAlteracao = params.dataInicioAlteracao;
    if (params?.dataFimAlteracao) queryParams.dataFimAlteracao = params.dataFimAlteracao;

    const data = await makeAbaRequest("/aprendizes", queryParams, httpClient);
    const aprendizes = Array.isArray(data) ? data : data?.data || [];

    for (const ap of aprendizes) {
      const { error } = await supabase.from("aba_aprendizes").upsert(
        {
          codigo_aprendiz: String(ap.codigoAprendiz),
          nome: ap.aprendiz || ap.nome,
          cpf: ap.cpf,
          sexo: ap.sexo,
          data_nascimento: ap.dataNascimento,
          convenio: ap.convenio,
          nivel_suporte: ap.nivelSuporte ? String(ap.nivelSuporte) : null,
          ativo: ap.ativo !== false,
          raw_json: ap,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "codigo_aprendiz" }
      );

      if (error) {
        result.errors.push(`Aprendiz ${ap.aprendiz || ap.codigoAprendiz}: ${error.message}`);
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
  httpClient: Deno.HttpClient,
  params?: { dataInicioAlteracao?: string; dataFimAlteracao?: string }
): Promise<SyncResult> {
  const result: SyncResult = { type: "profissionais", records: 0, errors: [] };

  try {
    const queryParams: Record<string, string> = {};
    if (params?.dataInicioAlteracao) queryParams.dataInicioAlteracao = params.dataInicioAlteracao;
    if (params?.dataFimAlteracao) queryParams.dataFimAlteracao = params.dataFimAlteracao;

    const data = await makeAbaRequest("/profissionais", queryParams, httpClient);
    const profissionais = Array.isArray(data) ? data : data?.data || [];

    for (const prof of profissionais) {
      const { error } = await supabase.from("aba_profissionais").upsert(
        {
          codigo_profissional: String(prof.codigoProfissional),
          nome: prof.profissional || prof.nome,
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
        result.errors.push(`Profissional ${prof.profissional || prof.codigoProfissional}: ${error.message}`);
      } else {
        result.records++;
      }
    }
  } catch (error) {
    result.errors.push(`Sync profissionais: ${(error as Error).message}`);
  }

  return result;
}

async function syncAgendamentos(supabase: any, httpClient: Deno.HttpClient): Promise<SyncResult> {
  const result: SyncResult = { type: "agendamentos", records: 0, errors: [] };

  try {
    const data = await makeAbaRequest("/agendamentos-diarios", undefined, httpClient);
    const agendamentos = Array.isArray(data) ? data : data?.data || [];

    for (const ag of agendamentos) {
      const codigoAg = String(ag.codigo || ag.identificador || `${ag.codigoAprendiz}-${ag.dataInicio}`);
      const { error } = await supabase.from("aba_agendamentos").upsert(
        {
          codigo_agendamento: codigoAg,
          codigo_aprendiz: String(ag.codigoAprendiz),
          codigo_profissional: ag.codigoProfissional ? String(ag.codigoProfissional) : null,
          tipo: ag.tipoAgendamento || ag.tipo,
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
        result.errors.push(`Agendamento ${codigoAg}: ${error.message}`);
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
  httpClient: Deno.HttpClient,
  dataInicio: string,
  dataFim: string
): Promise<SyncResult> {
  const result: SyncResult = { type: "atendimentos", records: 0, errors: [] };

  try {
    const data = await makeAbaRequest("/atendimentos-periodo", { dataInicio, dataFim }, httpClient);
    const atendimentos = Array.isArray(data) ? data : data?.data || [];

    for (const at of atendimentos) {
      const { error } = await supabase.from("aba_atendimentos").upsert(
        {
          identificador: String(at.identificador),
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
        result.errors.push(`Atendimento ${at.identificador}: ${error.message}`);
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
  httpClient: Deno.HttpClient,
  codigosSessao: string[]
): Promise<SyncResult> {
  const result: SyncResult = { type: "desempenho", records: 0, errors: [] };
  if (codigosSessao.length === 0) return result;

  try {
    const chunks: string[][] = [];
    for (let i = 0; i < codigosSessao.length; i += 30) {
      chunks.push(codigosSessao.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      const data = await makeAbaRequest(
        "/desempenho-programas",
        { codigoSessao: chunk.join(",") },
        httpClient
      );
      const desempenhos = Array.isArray(data) ? data : data?.data || [];

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
    }
  } catch (error) {
    result.errors.push(`Sync desempenho: ${(error as Error).message}`);
  }

  return result;
}

// ─── NeuroScore Calculation ──────────────────────────────────────

async function calculateNeuroScores(supabase: any): Promise<void> {
  const { data: aprendizes } = await supabase
    .from("aba_aprendizes")
    .select("codigo_aprendiz")
    .eq("ativo", true);

  if (!aprendizes) return;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  for (const aprendiz of aprendizes) {
    const codigo = aprendiz.codigo_aprendiz;

    const [{ data: desempenhos }, { data: atendimentos }] = await Promise.all([
      supabase
        .from("aba_desempenho")
        .select("*")
        .eq("codigo_aprendiz", codigo)
        .gte("synced_at", thirtyDaysAgo)
        .order("synced_at", { ascending: false }),
      supabase
        .from("aba_atendimentos")
        .select("*")
        .eq("codigo_aprendiz", codigo)
        .gte("data_inicio", thirtyDaysAgo),
    ]);

    const totalAtendimentos = atendimentos?.length || 0;
    const faltas = atendimentos?.filter((a: any) => a.falta)?.length || 0;
    const taxaPresenca = totalAtendimentos > 0
      ? ((totalAtendimentos - faltas) / totalAtendimentos) * 100
      : 0;

    const avgIndependencia = desempenhos?.length > 0
      ? desempenhos.reduce((s: number, d: any) => s + (d.percentual_independencia || 0), 0) / desempenhos.length
      : 0;

    const avgErro = desempenhos?.length > 0
      ? desempenhos.reduce((s: number, d: any) => s + (d.percentual_erro || 0), 0) / desempenhos.length
      : 0;

    const score = Math.round(
      avgIndependencia * 0.4 + (100 - avgErro) * 0.3 + taxaPresenca * 0.3
    );

    let alertType: string | null = null;
    let alertMessage: string | null = null;

    if (atendimentos && atendimentos.length >= 2) {
      const sorted = [...atendimentos].sort(
        (a: any, b: any) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
      );
      if (sorted[0]?.falta && sorted[1]?.falta) {
        alertType = "faltas_consecutivas";
        alertMessage = "2+ faltas consecutivas detectadas";
      }
    }

    if (desempenhos && desempenhos.length >= 10) {
      const recent = desempenhos.slice(0, 5);
      const older = desempenhos.slice(5, 10);
      const recentAvg = recent.reduce((s: number, d: any) => s + (d.percentual_independencia || 0), 0) / recent.length;
      const olderAvg = older.reduce((s: number, d: any) => s + (d.percentual_independencia || 0), 0) / older.length;

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

// ─── Main Handler ────────────────────────────────────────────────

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

    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "therapist"])
      .limit(1);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create mTLS client if certificate is available; otherwise proceed without it
    let httpClient: Deno.HttpClient | undefined;
    try {
      httpClient = createMtlsClient();
    } catch (certError) {
      console.warn("mTLS não disponível, usando apenas API key + token:", (certError as Error).message);
      // Continue without mTLS — API key + Bearer token may still work
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "full_sync";

    const { data: syncLog } = await supabase
      .from("aba_sync_logs")
      .insert({ sync_type: action, status: "started", metadata: { triggered_by: userId } })
      .select()
      .single();

    const results: SyncResult[] = [];
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    if (action === "full_sync" || action === "sync_aprendizes") {
      results.push(await syncAprendizes(supabase, httpClient, body.params));
    }
    if (action === "full_sync" || action === "sync_profissionais") {
      results.push(await syncProfissionais(supabase, httpClient, body.params));
    }
    if (action === "full_sync" || action === "sync_agendamentos") {
      results.push(await syncAgendamentos(supabase, httpClient));
    }
    if (action === "full_sync" || action === "sync_atendimentos") {
      results.push(await syncAtendimentos(supabase, httpClient, body.params?.dataInicio || thirtyDaysAgo, body.params?.dataFim || today));
    }
    if (action === "full_sync" || action === "calculate_scores") {
      await calculateNeuroScores(supabase);
      results.push({ type: "neuro_scores", records: 0, errors: [] });
    }

    if (httpClient) httpClient.close();

    const totalRecords = results.reduce((s, r) => s + r.records, 0);
    const allErrors = results.flatMap((r) => r.errors);
    const status = allErrors.length > 0 ? "partial" : "completed";

    if (syncLog) {
      await supabase
        .from("aba_sync_logs")
        .update({
          status,
          records_synced: totalRecords,
          error_message: allErrors.length > 0 ? allErrors.join("; ") : null,
          completed_at: new Date().toISOString(),
          metadata: { triggered_by: userId, results },
        })
        .eq("id", syncLog.id);
    }

    return new Response(
      JSON.stringify({ success: true, status, total_records: totalRecords, results, errors: allErrors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ABA sync error:", error);
    return new Response(
      JSON.stringify({ error: "Sync failed", message: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
