import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAbaInterventions } from '@/hooks/useAbaNeuroPlay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp, Target, BarChart3, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  programId: string;
  childId: string;
}

function useAllProgramTrials(programId: string, childId: string) {
  const { data: interventions } = useAbaInterventions(programId);
  
  // Fetch all trials for this child in one query, then filter by intervention
  const { data: allTrialsRaw, isLoading } = useQuery({
    queryKey: ['aba-np-all-trials', childId, programId],
    queryFn: async () => {
      const interventionIds = interventions?.map((i: any) => i.id) || [];
      if (!interventionIds.length) return [];
      const { data, error } = await supabase
        .from('aba_np_trials')
        .select('*')
        .in('intervention_id', interventionIds)
        .order('recorded_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!interventions?.length,
  });

  const allTrials = useMemo(() => {
    if (!allTrialsRaw || !interventions) return [];
    const interventionMap = new Map(interventions.map((i: any) => [i.id, i.aba_np_skills?.skill_name || 'Habilidade']));
    return allTrialsRaw.map(t => ({
      ...t,
      skillName: interventionMap.get(t.intervention_id) || 'Habilidade',
    }));
  }, [allTrialsRaw, interventions]);

  return { allTrials, interventions, isLoading };
}

const PROMPT_LEVELS: Record<string, number> = {
  fisico_total: 1, fisico_parcial: 2, gestual: 3, verbal: 4, visual: 5, independente: 6,
};

const PROMPT_LABELS: Record<string, string> = {
  fisico_total: 'Físico Total', fisico_parcial: 'Físico Parcial', gestual: 'Gestual',
  verbal: 'Verbal', visual: 'Visual', independente: 'Independente',
};

export function AbaProgramEvolution({ programId, childId }: Props) {
  const { allTrials, interventions, isLoading } = useAllProgramTrials(programId);

  const { dailyData, promptDistribution, skillComparison } = useMemo(() => {
    if (!allTrials.length) return { dailyData: [], promptDistribution: [], skillComparison: [] };

    // Group by day
    const dayMap = new Map<string, { correct: number; total: number; independent: number; promptSum: number }>();
    for (const t of allTrials) {
      const day = format(new Date(t.recorded_at), 'yyyy-MM-dd');
      const entry = dayMap.get(day) || { correct: 0, total: 0, independent: 0, promptSum: 0 };
      entry.total++;
      if (t.correct) entry.correct++;
      if (t.prompt_level === 'independente') entry.independent++;
      entry.promptSum += PROMPT_LEVELS[t.prompt_level] || 3;
      dayMap.set(day, entry);
    }

    const dailyData = Array.from(dayMap.entries()).map(([day, d]) => ({
      date: format(new Date(day), 'dd/MM', { locale: ptBR }),
      rawDate: day,
      acerto: Math.round((d.correct / d.total) * 100),
      independencia: Math.round((d.independent / d.total) * 100),
      nivelPrompt: parseFloat((d.promptSum / d.total).toFixed(1)),
    }));

    // Prompt distribution
    const promptCount: Record<string, number> = {};
    for (const t of allTrials) {
      const key = t.prompt_level || 'unknown';
      promptCount[key] = (promptCount[key] || 0) + 1;
    }
    const promptDistribution = Object.entries(promptCount)
      .map(([level, count]) => ({
        name: PROMPT_LABELS[level] || level,
        value: count,
        pct: Math.round((count / allTrials.length) * 100),
      }))
      .sort((a, b) => (PROMPT_LEVELS[a.name] || 0) - (PROMPT_LEVELS[b.name] || 0));

    // Skill comparison
    const skillMap = new Map<string, { correct: number; total: number; independent: number }>();
    for (const t of allTrials) {
      const key = t.skillName;
      const entry = skillMap.get(key) || { correct: 0, total: 0, independent: 0 };
      entry.total++;
      if (t.correct) entry.correct++;
      if (t.prompt_level === 'independente') entry.independent++;
      skillMap.set(key, entry);
    }
    const skillComparison = Array.from(skillMap.entries()).map(([name, d]) => ({
      name: name.length > 20 ? name.slice(0, 20) + '…' : name,
      acerto: Math.round((d.correct / d.total) * 100),
      independencia: Math.round((d.independent / d.total) * 100),
      tentativas: d.total,
    }));

    return { dailyData, promptDistribution, skillComparison };
  }, [allTrials]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando dados de evolução...
        </CardContent>
      </Card>
    );
  }

  if (!allTrials.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma tentativa registrada ainda</p>
          <p className="text-sm mt-1">Registre tentativas nas habilidades para ver a evolução</p>
        </CardContent>
      </Card>
    );
  }

  // KPI totals
  const totalTrials = allTrials.length;
  const accuracy = Math.round((allTrials.filter(t => t.correct).length / totalTrials) * 100);
  const independence = Math.round((allTrials.filter(t => t.prompt_level === 'independente').length / totalTrials) * 100);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <Target className="h-7 w-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Acurácia Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{independence}%</p>
                <p className="text-xs text-muted-foreground">Independência</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalTrials}</p>
                <p className="text-xs text-muted-foreground">Total de Tentativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution over time */}
      {dailyData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evolução ao Longo do Tempo</CardTitle>
            <CardDescription>Acurácia e independência por dia de coleta</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="gradAcerto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradIndep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'acerto' ? 'Acurácia' : 'Independência',
                  ]}
                />
                <ReferenceLine y={80} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: 'Meta 80%', fontSize: 10 }} />
                <Area type="monotone" dataKey="acerto" stroke="hsl(var(--primary))" fill="url(#gradAcerto)" strokeWidth={2} name="acerto" />
                <Area type="monotone" dataKey="independencia" stroke="hsl(142 76% 36%)" fill="url(#gradIndep)" strokeWidth={2} name="independencia" />
                <Legend formatter={(v) => v === 'acerto' ? 'Acurácia' : 'Independência'} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Skill comparison */}
      {skillComparison.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Comparativo por Habilidade</CardTitle>
            <CardDescription>Acurácia e independência de cada habilidade treinada</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(180, skillComparison.length * 50)}>
              <BarChart data={skillComparison} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
                <Bar dataKey="acerto" fill="hsl(var(--primary))" name="Acurácia" radius={[0, 4, 4, 0]} />
                <Bar dataKey="independencia" fill="hsl(142 76% 36%)" name="Independência" radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Prompt distribution */}
      {promptDistribution.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição de Prompts</CardTitle>
            <CardDescription>Tipos de apoio utilizados nas tentativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {promptDistribution.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-sm w-28 shrink-0">{p.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">{p.value} ({p.pct}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
