import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  School, Users, Brain, TrendingUp, AlertTriangle, 
  Activity, BarChart3, GraduationCap, Target, BookOpen 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line 
} from 'recharts';

export default function SchoolDirectorDashboard() {
  const { user } = useAuth();

  // Fetch all classes for this school (admin sees all)
  const { data: classes = [] } = useQuery({
    queryKey: ['director-classes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get institution membership
      const { data: membership } = await supabase
        .from('institution_members')
        .select('institution_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      const instId = membership?.[0]?.institution_id;

      if (!instId) {
        // Fallback: get all classes for demo
        const { data } = await supabase
          .from('school_classes')
          .select('id, name, grade_level, school_year, teacher_id') as any;
        return data || [];
      }

      const { data: schools } = await (supabase
        .from('schools')
        .select('id')
        .eq('institution_id', instId) as any);

      if (!schools?.length) return [];

      const { data } = await supabase
        .from('school_classes')
        .select('id, name, grade_level, school_year, teacher_id')
        .in('school_id', schools.map((s: any) => s.id)) as any;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch all students across classes
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

  // Fetch observations for cognitive metrics
  const { data: observations = [] } = useQuery({
    queryKey: ['director-observations', classes.map(c => c.id)],
    queryFn: async () => {
      if (!classes.length) return [];
      const { data } = await supabase
        .from('student_observations')
        .select('*')
        .in('class_id', classes.map(c => c.id))
        .order('observation_week', { ascending: false });
      return data || [];
    },
    enabled: classes.length > 0,
  });

  // Fetch game sessions for engagement metrics
  const { data: sessions = [] } = useQuery({
    queryKey: ['director-sessions', allStudents.map(s => s.child_id)],
    queryFn: async () => {
      if (!allStudents.length) return [];
      const childIds = [...new Set(allStudents.map(s => s.child_id))];
      const { data } = await supabase
        .from('game_sessions')
        .select('child_profile_id, accuracy_percentage, completed, game_id, completed_at')
        .in('child_profile_id', childIds.slice(0, 50))
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(500);
      return data || [];
    },
    enabled: allStudents.length > 0,
  });

  const stats = useMemo(() => {
    const totalStudents = allStudents.length;
    const totalClasses = classes.length;
    const totalTeachers = new Set(classes.map(c => c.teacher_id).filter(Boolean)).size;

    // Calculate average cognitive indicators from observations
    const recentObs = observations.slice(0, 200);
    const avgAttention = recentObs.length > 0
      ? recentObs.reduce((sum, o: any) => sum + (4 - (o.focus_difficulty || 1)), 0) / recentObs.length * 33.33
      : 0;
    const avgMemory = sessions.length > 0
      ? sessions.reduce((sum, s: any) => sum + (s.accuracy_percentage || 0), 0) / sessions.length
      : 0;
    const avgPersistence = recentObs.length > 0
      ? recentObs.reduce((sum, o: any) => sum + (o.participation || 1), 0) / recentObs.length * 33.33
      : 0;

    const highRisk = recentObs.filter((o: any) => o.risk_level === 'high').length;
    const moderateRisk = recentObs.filter((o: any) => o.risk_level === 'moderate').length;
    
    const engagementRate = totalStudents > 0 
      ? Math.min(100, (sessions.length / Math.max(1, totalStudents)) * 10)
      : 0;

    return {
      totalStudents,
      totalClasses,
      totalTeachers,
      avgAttention: Math.round(avgAttention),
      avgMemory: Math.round(avgMemory),
      avgPersistence: Math.round(avgPersistence),
      highRisk,
      moderateRisk,
      engagementRate: Math.round(engagementRate),
      totalSessions: sessions.length,
    };
  }, [allStudents, classes, observations, sessions]);

  const cognitiveRadarData = [
    { domain: 'Atenção', value: stats.avgAttention, fullMark: 100 },
    { domain: 'Memória', value: stats.avgMemory, fullMark: 100 },
    { domain: 'Persistência', value: stats.avgPersistence, fullMark: 100 },
    { domain: 'Engajamento', value: stats.engagementRate, fullMark: 100 },
  ];

  const classComparison = classes.slice(0, 8).map(cls => {
    const classObs = observations.filter((o: any) => o.class_id === cls.id);
    const classStudents = allStudents.filter(s => s.class_id === cls.id);
    const avgScore = classObs.length > 0
      ? classObs.reduce((sum, o: any) => sum + (4 - (o.focus_difficulty || 1)), 0) / classObs.length * 33.33
      : 0;
    return {
      name: cls.name,
      alunos: classStudents.length,
      atencao: Math.round(avgScore),
      observacoes: classObs.length,
    };
  });

  const getIndicatorColor = (value: number) => {
    if (value >= 70) return 'text-emerald-600';
    if (value >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getIndicatorLabel = (value: number) => {
    if (value >= 70) return 'Bom';
    if (value >= 40) return 'Atenção';
    return 'Crítico';
  };

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <School className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard da Escola</h1>
            <p className="text-sm text-muted-foreground">Visão macro do desenvolvimento cognitivo e socioemocional</p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Alunos Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
                <p className="text-xs text-muted-foreground">Turmas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.engagementRate}%</p>
                <p className="text-xs text-muted-foreground">Engajamento</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highRisk}</p>
                <p className="text-xs text-muted-foreground">Alertas Ativos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cognitive Averages */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" />
                Indicadores Cognitivos Médios
              </CardTitle>
              <CardDescription>Média geral da escola baseada em atividades e observações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: 'Atenção', value: stats.avgAttention, icon: '🎯' },
                { label: 'Memória', value: stats.avgMemory, icon: '🧠' },
                { label: 'Persistência', value: stats.avgPersistence, icon: '💪' },
                { label: 'Engajamento', value: stats.engagementRate, icon: '⚡' },
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {item.icon} {item.label}
                    </span>
                    <span className={`text-sm font-bold ${getIndicatorColor(item.value)}`}>
                      {item.value}% · {getIndicatorLabel(item.value)}
                    </span>
                  </div>
                  <Progress 
                    value={item.value} 
                    className="h-2" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Perfil Cognitivo da Escola
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={cognitiveRadarData}>
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
        </div>

        {/* Class Comparison */}
        {classComparison.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Comparativo por Turma
              </CardTitle>
              <CardDescription>Alunos e indicadores de atenção por turma</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classComparison}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="alunos" fill="hsl(var(--primary))" name="Alunos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atencao" fill="hsl(var(--chart-3))" name="Atenção %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Risk Summary */}
        {(stats.highRisk > 0 || stats.moderateRisk > 0) && (
          <Card className="border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alunos que Precisam de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm"><strong>{stats.highRisk}</strong> prioridade alta</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm"><strong>{stats.moderateRisk}</strong> atenção moderada</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Baseado nos check-ins semanais dos professores. Consulte os painéis de turma para detalhes.
              </p>
            </CardContent>
          </Card>
        )}

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
