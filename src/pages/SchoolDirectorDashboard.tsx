import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  School, Users, Brain, TrendingUp, AlertTriangle, 
  Activity, BarChart3, GraduationCap, Target, Stethoscope, Shield
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from 'recharts';
import { calculateClassNCI, getNCIColor, getNCILabel } from '@/modules/cognitive-index';
import { NCIDisplay } from '@/components/educacao/NCIDisplay';
import { InterventionRecommendations } from '@/components/educacao/InterventionRecommendations';
import { generateClassInterventions } from '@/modules/intervention-protocols';

export default function SchoolDirectorDashboard() {
  const { user } = useAuth();

  // Fetch all classes
  const { data: classes = [] } = useQuery({
    queryKey: ['director-classes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: membership } = await supabase
        .from('institution_members')
        .select('institution_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      const instId = membership?.[0]?.institution_id;

      if (!instId) {
        const { data } = await supabase
          .from('school_classes')
          .select('id, name, grade_level, school_year, teacher_id') as any;
        return data || [];
      }

      const schoolsResult: any = await supabase
        .from('schools' as any)
        .select('id')
        .eq('institution_id', instId);
      const schools = schoolsResult?.data;

      if (!schools?.length) return [];

      const { data } = await supabase
        .from('school_classes')
        .select('id, name, grade_level, school_year, teacher_id')
        .in('school_id', schools.map((s: any) => s.id)) as any;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch all students
  const { data: allStudents = [] } = useQuery({
    queryKey: ['director-students', classes.map(c => c.id)],
    queryFn: async () => {
      if (!classes.length) return [];
      const { data } = await supabase
        .from('class_students')
        .select('id, child_id, class_id')
        .in('class_id', classes.map(c => c.id))
        .eq('is_active', true) as any;
      return (data || []) as Array<{ id: string; child_id: string; class_id: string }>;
    },
    enabled: classes.length > 0,
  });

  // Fetch scan results per class
  const { data: scanData = [] } = useQuery({
    queryKey: ['director-scan-data', classes.map(c => c.id)],
    queryFn: async () => {
      if (!classes.length) return [];
      const results: Array<{
        classId: string;
        className: string;
        results: any[];
        sessionDate: string | null;
      }> = [];

      for (const cls of classes) {
        const { data: session } = await supabase
          .from('classroom_scan_sessions')
          .select('id, completed_at')
          .eq('class_id', cls.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (session) {
          const { data: studentResults } = await supabase
            .from('scan_student_results')
            .select('attention_score, memory_score, language_score, executive_function_score, risk_flags')
            .eq('session_id', session.id)
            .eq('status', 'completed');

          results.push({
            classId: cls.id,
            className: cls.name,
            results: studentResults || [],
            sessionDate: session.completed_at,
          });
        }
      }
      return results;
    },
    enabled: classes.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch observations
  const { data: observations = [] } = useQuery({
    queryKey: ['director-observations', classes.map(c => c.id)],
    queryFn: async () => {
      if (!classes.length) return [];
      const { data } = await supabase
        .from('student_observations')
        .select('*')
        .in('class_id', classes.map(c => c.id))
        .order('observation_week', { ascending: false })
        .limit(500);
      return data || [];
    },
    enabled: classes.length > 0,
  });

  // Compute school-wide NCI
  const schoolNCI = useMemo(() => {
    const allResults = scanData.flatMap(s => s.results);
    if (!allResults.length) return null;
    return calculateClassNCI(allResults);
  }, [scanData]);

  // Compute per-class NCIs
  const classNCIs = useMemo(() => {
    return scanData.map(s => ({
      classId: s.classId,
      className: s.className,
      nci: calculateClassNCI(s.results),
      assessed: s.results.length,
      date: s.sessionDate,
    })).filter(c => c.nci !== null);
  }, [scanData]);

  // School-wide interventions
  const schoolInterventions = useMemo(() => {
    if (!schoolNCI) return [];
    return generateClassInterventions({
      attention: schoolNCI.domains.attention,
      memory: schoolNCI.domains.memory,
      language: schoolNCI.domains.language,
      executiveFunction: schoolNCI.domains.executiveFunction,
    });
  }, [schoolNCI]);

  // Stats
  const stats = useMemo(() => {
    const totalStudents = allStudents.length;
    const totalClasses = classes.length;
    const totalTeachers = new Set(classes.map(c => c.teacher_id).filter(Boolean)).size;
    const assessedStudents = scanData.reduce((s, c) => s + c.results.length, 0);

    const recentObs = observations.slice(0, 200);
    const highRisk = recentObs.filter((o: any) => o.risk_level === 'high').length;
    const moderateRisk = recentObs.filter((o: any) => o.risk_level === 'moderate').length;

    // Risk from scans
    let riskReading = 0, riskAttention = 0, riskSocial = 0;
    for (const s of scanData) {
      for (const r of s.results) {
        const flags = r.risk_flags as any[];
        if (Array.isArray(flags)) {
          if (flags.some((f: any) => f.type === 'reading')) riskReading++;
          if (flags.some((f: any) => f.type === 'attention')) riskAttention++;
          if (flags.some((f: any) => f.type === 'social')) riskSocial++;
        }
      }
    }

    return {
      totalStudents, totalClasses, totalTeachers, assessedStudents,
      highRisk, moderateRisk,
      riskReading, riskAttention, riskSocial,
      screeningCoverage: totalStudents > 0 ? Math.round((assessedStudents / totalStudents) * 100) : 0,
    };
  }, [allStudents, classes, observations, scanData]);

  // Class comparison chart data
  const classComparison = useMemo(() => {
    return classNCIs.map(c => ({
      name: c.className,
      nci: c.nci?.score ?? 0,
      alunos: c.assessed,
    }));
  }, [classNCIs]);

  // Radar data
  const radarData = useMemo(() => {
    if (!schoolNCI) return [];
    return [
      { domain: 'Atenção', value: schoolNCI.domains.attention },
      { domain: 'Memória', value: schoolNCI.domains.memory },
      { domain: 'Linguagem', value: schoolNCI.domains.language },
      { domain: 'F. Executiva', value: schoolNCI.domains.executiveFunction },
      { domain: 'C. Social', value: schoolNCI.domains.socialCognition ?? 0 },
    ];
  }, [schoolNCI]);

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <School className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Institucional</h1>
            <p className="text-sm text-muted-foreground">Visão macro do neurodesenvolvimento escolar</p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-[10px] text-muted-foreground">Alunos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
                <p className="text-[10px] text-muted-foreground">Turmas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-chart-3/10 rounded-lg">
                <Shield className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.screeningCoverage}%</p>
                <p className="text-[10px] text-muted-foreground">Triados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${schoolNCI ? getNCIColor(schoolNCI.score) : ''}`}>
                  {schoolNCI ? schoolNCI.score : '—'}
                </p>
                <p className="text-[10px] text-muted-foreground">NCI Escola</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highRisk + stats.riskReading + stats.riskAttention}</p>
                <p className="text-[10px] text-muted-foreground">Alertas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="nci" className="gap-1.5">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">NCI</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Riscos</span>
            </TabsTrigger>
            <TabsTrigger value="interventions" className="gap-1.5">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Intervenções</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Radar */}
              {radarData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Perfil Cognitivo da Escola
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="domain" className="text-xs" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Escola"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Class comparison */}
              {classComparison.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      NCI por Turma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={classComparison}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="nci" fill="hsl(var(--primary))" name="NCI" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* NCI Tab */}
          <TabsContent value="nci" className="mt-4 space-y-6">
            <NCIDisplay nci={schoolNCI} title="NCI da Escola" />

            {classNCIs.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">NCI por Turma</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {classNCIs.map(c => (
                    <div key={c.classId} className="flex items-center gap-4 rounded-xl bg-muted/30 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.className}</p>
                        <p className="text-xs text-muted-foreground">{c.assessed} alunos · {c.date ? new Date(c.date).toLocaleDateString('pt-BR') : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getNCIColor(c.nci!.score)}`}>{c.nci!.score}</p>
                        <Badge variant="outline" className={`text-[10px] ${getNCIColor(c.nci!.score)}`}>
                          {getNCILabel(c.nci!.score)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Risco Leitura', count: stats.riskReading, emoji: '📖', color: 'text-destructive' },
                { label: 'Risco Atenção', count: stats.riskAttention, emoji: '🎯', color: 'text-chart-4' },
                { label: 'Risco Social', count: stats.riskSocial, emoji: '🤝', color: 'text-chart-2' },
              ].map(r => (
                <Card key={r.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl mb-1">{r.emoji}</p>
                    <p className={`text-2xl font-bold ${r.color}`}>{r.count}</p>
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {stats.totalStudents > 0 ? Math.round((r.count / stats.totalStudents) * 100) : 0}% da escola
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(stats.highRisk > 0 || stats.moderateRisk > 0) && (
              <Card className="border-destructive/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Alertas Comportamentais (Observações)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-sm"><strong>{stats.highRisk}</strong> prioridade alta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-4" />
                      <span className="text-sm"><strong>{stats.moderateRisk}</strong> atenção</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions" className="mt-4">
            <InterventionRecommendations recommendations={schoolInterventions} context="class" />
          </TabsContent>
        </Tabs>

        {/* Empty state */}
        {stats.totalStudents === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <School className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhum dado disponível</h3>
              <p className="text-muted-foreground">
                Cadastre turmas e alunos para visualizar os indicadores da escola.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernPageLayout>
  );
}
