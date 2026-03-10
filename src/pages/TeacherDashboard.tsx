import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, Activity, GraduationCap, Sparkles, BookOpen,
  ArrowLeft, AlertTriangle, TrendingUp, Target,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeacherStudentSection } from '@/components/teacher/TeacherStudentSection';
import { SchoolOccurrences } from '@/components/teacher/SchoolOccurrences';
import { QuickActivities } from '@/modules/school/components/QuickActivities';
import { SchoolWeeklyEngagement } from '@/modules/school/components/SchoolWeeklyEngagement';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('alunos');

  // Fetch teacher's classes and student counts
  const { data: classData } = useQuery({
    queryKey: ['teacher-class-overview', user?.id],
    queryFn: async () => {
      if (!user) return { classes: 0, students: 0, needsSupport: 0, active7d: 0 };
      
      const { data: classes } = await supabase
        .from('school_classes')
        .select('id')
        .eq('teacher_id', user.id);
      
      const classIds = (classes || []).map(c => c.id);
      if (classIds.length === 0) return { classes: 0, students: 0, needsSupport: 0, active7d: 0 };

      const { data: students } = await supabase
        .from('class_students')
        .select('child_id')
        .in('class_id', classIds)
        .eq('is_active', true);

      const studentCount = students?.length || 0;
      
      return {
        classes: classIds.length,
        students: studentCount,
        needsSupport: Math.round(studentCount * 0.15), // Will be replaced with real data
        active7d: Math.round(studentCount * 0.72),
      };
    },
    enabled: !!user,
  });

  const stats = classData || { classes: 0, students: 0, needsSupport: 0, active7d: 0 };

  // Mock weekly engagement (will be replaced with real queries)
  const weeklyData = [
    { day: 'Seg', activeStudents: Math.round(stats.students * 0.6), totalActivities: Math.round(stats.students * 1.2), avgSessionMinutes: 4 },
    { day: 'Ter', activeStudents: Math.round(stats.students * 0.7), totalActivities: Math.round(stats.students * 1.5), avgSessionMinutes: 3 },
    { day: 'Qua', activeStudents: Math.round(stats.students * 0.65), totalActivities: Math.round(stats.students * 1.3), avgSessionMinutes: 5 },
    { day: 'Qui', activeStudents: Math.round(stats.students * 0.5), totalActivities: Math.round(stats.students * 1.0), avgSessionMinutes: 3 },
    { day: 'Sex', activeStudents: Math.round(stats.students * 0.4), totalActivities: Math.round(stats.students * 0.8), avgSessionMinutes: 4 },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel do Professor</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhamento do desenvolvimento dos alunos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/teacher/classes">
              <Users className="h-4 w-4 mr-2" />
              Turmas
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/training">
              <BookOpen className="h-4 w-4 mr-2" />
              Capacitação
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Alunos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.students}</p>
            <p className="text-[11px] text-muted-foreground">{stats.classes} turma(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Ativos (7d)</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.active7d}</p>
            <p className="text-[11px] text-muted-foreground">
              {stats.students > 0 ? Math.round((stats.active7d / stats.students) * 100) : 0}% engajamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Evoluindo</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.students - stats.needsSupport}
            </p>
            <p className="text-[11px] text-muted-foreground">progresso positivo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Necessita Apoio</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.needsSupport}</p>
            <p className="text-[11px] text-muted-foreground">atenção recomendada</p>
          </CardContent>
        </Card>
      </div>

      {stats.needsSupport > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <strong>{stats.needsSupport}</strong> aluno(s) apresentam indicadores que merecem acompanhamento.
            Verifique o progresso individual para sugestões de atividades de apoio.
          </AlertDescription>
        </Alert>
      )}

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alunos" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Alunos
          </TabsTrigger>
          <TabsTrigger value="atividades" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Atividades Rápidas
          </TabsTrigger>
          <TabsTrigger value="engajamento" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Engajamento
          </TabsTrigger>
          <TabsTrigger value="ocorrencias" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Observações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alunos" className="mt-4">
          <TeacherStudentSection 
            onViewDetails={(studentId) => navigate(`/teacher/student/${studentId}`)}
          />
        </TabsContent>

        <TabsContent value="atividades" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sessões de 3 Minutos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Atividades curtas para usar em sala de aula. Cada sessão trabalha uma habilidade específica.
                </p>
              </CardHeader>
              <CardContent>
                <QuickActivities maxItems={6} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engajamento" className="mt-4">
          <SchoolWeeklyEngagement 
            weekData={weeklyData} 
            totalStudents={stats.students}
          />
        </TabsContent>

        <TabsContent value="ocorrencias" className="mt-4">
          <SchoolOccurrences />
        </TabsContent>
      </Tabs>
    </div>
  );
}
