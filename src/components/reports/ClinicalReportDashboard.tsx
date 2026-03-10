import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { generateClinicalPDF } from '@/lib/clinicalPdfExport';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { format, subMonths, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface LongitudinalData {
  date: string;
  attention: number;
  memory: number;
  language: number;
  executive: number;
  accuracy: number;
}

interface ReportDashboardProps {
  childId?: string;
  childName?: string;
}

export function ClinicalReportDashboard({ childId, childName }: ReportDashboardProps) {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [period, setPeriod] = useState('30');
  const [longitudinalData, setLongitudinalData] = useState<LongitudinalData[]>([]);
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({});
  const [previousScores, setPreviousScores] = useState<Record<string, number>>({});
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && childId) fetchData();
  }, [user, childId, period]);

  const resolveProfileId = async (cId: string): Promise<string> => {
    // Check if it's a child_profile_id directly
    const { data: directProfile } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', cId)
      .maybeSingle();
    if (directProfile) return directProfile.id;

    // Look up by name from children table
    const { data: childRow } = await supabase
      .from('children')
      .select('name')
      .eq('id', cId)
      .maybeSingle();
    if (childRow?.name) {
      const { data: profileByName } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('name', childRow.name)
        .limit(1)
        .maybeSingle();
      if (profileByName) return profileByName.id;
    }
    return cId;
  };

  const fetchData = async () => {
    if (!user || !childId) return;
    setLoading(true);

    try {
      const periodDays = parseInt(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
      const previousStart = new Date(Date.now() - periodDays * 2 * 24 * 60 * 60 * 1000).toISOString();

      // Resolve children.id to child_profiles.id
      const profileId = await resolveProfileId(childId);

      // Fetch game sessions for the period
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('completed_at, accuracy_percentage, score, game_id, cognitive_games(cognitive_domains)')
        .eq('child_profile_id', profileId)
        .eq('completed', true)
        .gte('completed_at', startDate)
        .order('completed_at', { ascending: true });

      // Fetch previous period for comparison
      const { data: prevSessions } = await supabase
        .from('game_sessions')
        .select('accuracy_percentage, cognitive_games(cognitive_domains)')
        .eq('child_profile_id', profileId)
        .eq('completed', true)
        .gte('completed_at', previousStart)
        .lt('completed_at', startDate);

      setSessionCount(sessions?.length || 0);

      // Calculate current scores by domain
      const domainScores: Record<string, number[]> = {};
      sessions?.forEach((s: any) => {
        const domain = (s.cognitive_games?.cognitive_domains as string[] || [])[0] || 'general';
        if (!domainScores[domain]) domainScores[domain] = [];
        domainScores[domain].push(s.accuracy_percentage || 0);
      });

      const current: Record<string, number> = {};
      Object.entries(domainScores).forEach(([domain, scores]) => {
        current[domain] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      });
      setCurrentScores(current);

      // Previous period scores
      const prevDomainScores: Record<string, number[]> = {};
      prevSessions?.forEach((s: any) => {
        const domain = (s.cognitive_games?.cognitive_domains as string[] || [])[0] || 'general';
        if (!prevDomainScores[domain]) prevDomainScores[domain] = [];
        prevDomainScores[domain].push(s.accuracy_percentage || 0);
      });

      const prev: Record<string, number> = {};
      Object.entries(prevDomainScores).forEach(([domain, scores]) => {
        prev[domain] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      });
      setPreviousScores(prev);

      // Build longitudinal data (group by week)
      const weeklyData: Record<string, { scores: number[]; domains: Record<string, number[]> }> = {};
      sessions?.forEach((s: any) => {
        const weekKey = format(new Date(s.completed_at), 'yyyy-ww');
        if (!weeklyData[weekKey]) weeklyData[weekKey] = { scores: [], domains: {} };
        weeklyData[weekKey].scores.push(s.accuracy_percentage || 0);
        const domain = (s.cognitive_games?.cognitive_domains as string[] || [])[0] || 'general';
        if (!weeklyData[weekKey].domains[domain]) weeklyData[weekKey].domains[domain] = [];
        weeklyData[weekKey].domains[domain].push(s.accuracy_percentage || 0);
      });

      const longitudinal = Object.entries(weeklyData).map(([week, data]) => {
        const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
        return {
          date: `Sem ${week.split('-')[1]}`,
          attention: avg(data.domains['attention'] || []),
          memory: avg(data.domains['memory'] || []),
          language: avg(data.domains['language'] || []),
          executive: avg(data.domains['executive_function'] || []),
          accuracy: avg(data.scores),
        };
      });
      setLongitudinalData(longitudinal);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrend = (domain: string) => {
    const curr = currentScores[domain] || 0;
    const prev = previousScores[domain] || 0;
    const diff = curr - prev;
    if (diff > 5) return { icon: TrendingUp, color: 'text-success', label: `+${diff}%` };
    if (diff < -5) return { icon: TrendingDown, color: 'text-destructive', label: `${diff}%` };
    return { icon: Minus, color: 'text-muted-foreground', label: 'Estável' };
  };

  const radarData = [
    { domain: 'Atenção', value: currentScores['attention'] || 0, prev: previousScores['attention'] || 0 },
    { domain: 'Memória', value: currentScores['memory'] || 0, prev: previousScores['memory'] || 0 },
    { domain: 'Linguagem', value: currentScores['language'] || 0, prev: previousScores['language'] || 0 },
    { domain: 'Executivo', value: currentScores['executive_function'] || 0, prev: previousScores['executive_function'] || 0 },
    { domain: 'Geral', value: currentScores['general'] || 0, prev: previousScores['general'] || 0 },
  ];

  const handleExportPDF = () => {
    const reportType = role === 'therapist' ? 'clinical' : role === 'teacher' ? 'pedagogical' : 'family';
    generateClinicalPDF({
      childName: childName || 'Paciente',
      reportType,
      period: { start: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000), end: new Date() },
      cognitiveScores: currentScores,
      gameSessions: sessionCount,
      recommendations: Object.entries(currentScores)
        .filter(([, v]) => v < 60)
        .map(([d]) => `Reforçar atividades de ${d} — desempenho abaixo de 60%`),
      alerts: Object.entries(currentScores)
        .filter(([, v]) => v < 40)
        .map(([d, v]) => `${d}: ${v}% — desempenho crítico`),
    });
    toast.success('PDF exportado!');
  };

  const domainLabels: Record<string, string> = {
    attention: 'Atenção',
    memory: 'Memória',
    language: 'Linguagem',
    executive_function: 'Função Executiva',
    general: 'Geral',
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análise Longitudinal
          </h2>
          <p className="text-sm text-muted-foreground">
            {childName && `${childName} — `}{sessionCount} sessões no período
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">3 meses</SelectItem>
              <SelectItem value="180">6 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Domain Comparison Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(currentScores).map(([domain, score]) => {
          const trend = getTrend(domain);
          const TrendIcon = trend.icon;
          return (
            <Card key={domain}>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {domainLabels[domain] || domain}
                </p>
                <p className="text-2xl font-bold">{score}%</p>
                <div className={`flex items-center justify-center gap-1 text-xs mt-1 ${trend.color}`}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{trend.label}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Perfil Cognitivo Comparativo</CardTitle>
            <CardDescription className="text-xs">Período atual vs. anterior</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Atual" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Radar name="Anterior" dataKey="prev" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} strokeDasharray="5 5" />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evolução Semanal</CardTitle>
            <CardDescription className="text-xs">Precisão média por semana</CardDescription>
          </CardHeader>
          <CardContent>
            {longitudinalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={longitudinalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" name="Precisão" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="attention" stroke="hsl(var(--info))" name="Atenção" strokeWidth={1.5} />
                  <Line type="monotone" dataKey="memory" stroke="hsl(var(--success))" name="Memória" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                Dados insuficientes para gráfico
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
