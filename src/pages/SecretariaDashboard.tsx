import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Building2, TrendingUp, AlertTriangle, Download, Users, Shield } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RISK_COLORS = {
  low: 'hsl(var(--chart-3))',
  moderate: 'hsl(var(--chart-4))',
  high: 'hsl(var(--chart-5))',
};

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [filterGrade, setFilterGrade] = useState<string>('all');

  // Fetch all classes (admin only)
  const { data: classes = [] } = useQuery({
    queryKey: ['secretary-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_classes')
        .select('id, name, grade_level, school_year, institution_id, institutions(name)')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAdmin,
  });

  // Fetch all observations
  const { data: allObservations = [] } = useQuery({
    queryKey: ['secretary-observations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_observations')
        .select('*, school_classes!inner(name, grade_level, institution_id, institutions(name))')
        .order('observation_week', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAdmin,
  });

  // Fetch student counts per class
  const { data: studentCounts = [] } = useQuery({
    queryKey: ['secretary-student-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_students')
        .select('class_id')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAdmin,
  });

  const grades = useMemo(() => {
    const unique = new Set(classes.map((c: any) => c.grade_level).filter(Boolean));
    return Array.from(unique).sort();
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (filterGrade === 'all') return classes;
    return classes.filter((c: any) => c.grade_level === filterGrade);
  }, [classes, filterGrade]);

  const filteredClassIds = new Set(filteredClasses.map((c: any) => c.id));

  const filteredObs = useMemo(() => {
    return allObservations.filter((o: any) => filteredClassIds.has(o.class_id));
  }, [allObservations, filteredClassIds]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalStudents = studentCounts.filter((s: any) => filteredClassIds.has(s.class_id)).length;
    const totalObs = filteredObs.length;
    const high = filteredObs.filter((o: any) => o.risk_level === 'high').length;
    const moderate = filteredObs.filter((o: any) => o.risk_level === 'moderate').length;
    const low = filteredObs.filter((o: any) => o.risk_level === 'low').length;

    const emotionalRisk = filteredObs.filter(
      (o: any) => o.persistent_sadness >= 2 || o.social_isolation >= 2
    ).length;
    const learningRisk = filteredObs.filter(
      (o: any) => o.focus_difficulty >= 2 || o.performance_drop >= 2
    ).length;
    const socialRisk = filteredObs.filter(
      (o: any) => o.aggressiveness >= 2 || o.behavior_change >= 2
    ).length;

    return {
      totalClasses: filteredClasses.length,
      totalStudents,
      totalObs,
      high, moderate, low,
      emotionalPct: totalObs > 0 ? Math.round((emotionalRisk / totalObs) * 100) : 0,
      learningPct: totalObs > 0 ? Math.round((learningRisk / totalObs) * 100) : 0,
      socialPct: totalObs > 0 ? Math.round((socialRisk / totalObs) * 100) : 0,
    };
  }, [filteredObs, filteredClasses, studentCounts, filteredClassIds]);

  const riskPieData = [
    { name: 'Adequado', value: metrics.low, color: RISK_COLORS.low },
    { name: 'Atenção', value: metrics.moderate, color: RISK_COLORS.moderate },
    { name: 'Prioridade', value: metrics.high, color: RISK_COLORS.high },
  ].filter(d => d.value > 0);

  const vulnerabilityBarData = [
    { name: 'Emocional', value: metrics.emotionalPct },
    { name: 'Aprendizagem', value: metrics.learningPct },
    { name: 'Social', value: metrics.socialPct },
  ];

  // Per-class breakdown
  const classBreakdown = useMemo(() => {
    return filteredClasses.map((c: any) => {
      const classObs = filteredObs.filter((o: any) => o.class_id === c.id);
      const total = classObs.length;
      const high = classObs.filter((o: any) => o.risk_level === 'high').length;
      const moderate = classObs.filter((o: any) => o.risk_level === 'moderate').length;
      return {
        name: c.name,
        grade: c.grade_level,
        institution: (c as any).institutions?.name || '-',
        total,
        high,
        moderate,
        low: total - high - moderate,
      };
    }).sort((a: any, b: any) => b.high - a.high);
  }, [filteredClasses, filteredObs]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const now = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });

    doc.setFontSize(18);
    doc.text('Relatório da Secretaria Municipal', 20, 25);
    doc.setFontSize(11);
    doc.text(`Gerado em: ${now}`, 20, 33);
    doc.text(`Filtro: ${filterGrade === 'all' ? 'Todas as séries' : filterGrade}`, 20, 40);

    doc.setFontSize(12);
    doc.text('Indicadores Gerais', 20, 55);
    doc.setFontSize(10);
    doc.text(`Turmas: ${metrics.totalClasses}`, 25, 63);
    doc.text(`Alunos: ${metrics.totalStudents}`, 25, 70);
    doc.text(`Observações registradas: ${metrics.totalObs}`, 25, 77);
    doc.text(`Vulnerabilidade emocional: ${metrics.emotionalPct}%`, 25, 84);
    doc.text(`Dificuldade de aprendizagem: ${metrics.learningPct}%`, 25, 91);
    doc.text(`Risco social: ${metrics.socialPct}%`, 25, 98);

    doc.setFontSize(12);
    doc.text('Distribuição de Risco', 20, 113);
    doc.setFontSize(10);
    doc.text(`Adequado: ${metrics.low}`, 25, 121);
    doc.text(`Atenção: ${metrics.moderate}`, 25, 128);
    doc.text(`Prioridade: ${metrics.high}`, 25, 135);

    let y = 150;
    doc.setFontSize(12);
    doc.text('Turmas por Risco', 20, y);
    y += 8;
    doc.setFontSize(9);
    classBreakdown.forEach((c: any) => {
      doc.text(`${c.name} (${c.grade}) — Prioridade: ${c.high} | Atenção: ${c.moderate} | Adequado: ${c.low}`, 25, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.setFontSize(8);
    doc.text('Dados anonimizados para uso institucional. Não contém informações individuais.', 20, 285);

    doc.save(`secretaria-educacao-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Acesso restrito</p>
            <p className="text-sm text-muted-foreground mt-1">Apenas administradores podem acessar o painel da secretaria.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Secretaria Municipal</h1>
            </div>
            <p className="text-sm text-muted-foreground">Indicadores agregados e anonimizados</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Série" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as séries</SelectItem>
                {grades.map(g => (
                  <SelectItem key={g as string} value={g as string}>{g as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2" onClick={exportPDF}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{metrics.totalClasses}</p>
              <p className="text-xs text-muted-foreground">Turmas</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{metrics.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Alunos</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">{metrics.high}</p>
              <p className="text-xs text-muted-foreground">Prioridade</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{metrics.totalObs}</p>
              <p className="text-xs text-muted-foreground">Observações</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribuição de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              {riskPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {riskPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12 text-sm">Sem dados</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Índice de Vulnerabilidade (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={vulnerabilityBarData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Class breakdown table */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Turmas por Risco
            </CardTitle>
            <CardDescription>Ranking das turmas com maior índice de alunos em prioridade</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {classBreakdown.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma turma encontrada.</div>
            ) : (
              <div className="divide-y divide-border">
                {classBreakdown.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.grade} • {c.institution}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.high > 0 && (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                          {c.high} prioridade
                        </Badge>
                      )}
                      {c.moderate > 0 && (
                        <Badge variant="outline" className="text-chart-4 border-chart-4/30 bg-chart-4/10">
                          {c.moderate} atenção
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-chart-3 border-chart-3/30 bg-chart-3/10">
                        {c.low} ok
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center pb-4">
          Dados anonimizados. Ferramenta de apoio educacional — não substitui avaliação clínica.
        </p>
      </div>
    </div>
  );
}
