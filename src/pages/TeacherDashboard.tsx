import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Activity, GraduationCap, Sparkles, BookOpen,
  AlertTriangle, TrendingUp, Target, Scan, Brain,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeacherStudentSection } from '@/components/teacher/TeacherStudentSection';
import { SchoolOccurrences } from '@/components/teacher/SchoolOccurrences';
import { QuickActivities } from '@/modules/school/components/QuickActivities';
import { SchoolWeeklyEngagement } from '@/modules/school/components/SchoolWeeklyEngagement';
import { ClassCognitiveProfile } from '@/components/educacao/ClassCognitiveProfile';
import { ClassEvolutionChart } from '@/components/educacao/ClassEvolutionChart';
import { ClassroomScan } from '@/components/educacao/ClassroomScan';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<string>('alunos');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Fetch classes list
  const { data: classesList = [] } = useQuery({
    queryKey: ['teacher-classes-list', user?.id, isAdmin],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from('school_classes').select('id, name, grade_level, school_year');
      if (!isAdmin) query = query.eq('teacher_id', user.id);
      const { data } = await query;
      return data || [];
    },
    enabled: !!user,
  });

  // Auto-select first class
  React.useEffect(() => {
    if (classesList.length > 0 && !selectedClassId) {
      setSelectedClassId(classesList[0].id);
    }
  }, [classesList, selectedClassId]);

  // Fetch students for selected class (for scan)
  const { data: classStudents = [] } = useQuery({
    queryKey: ['class-students-for-scan', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      const { data } = await supabase
        .from('class_students')
        .select('id, child_id, children!class_students_child_id_fkey(id, name)')
        .eq('class_id', selectedClassId)
        .eq('is_active', true);
      return (data || []).map((d: any) => ({ ...d, children: d.children }));
    },
    enabled: !!selectedClassId,
  });

  const { data: classData, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-dashboard-stats', user?.id, isAdmin],
    queryFn: async () => {
      if (!user) return { classes: 0, students: 0, needsSupport: 0, active7d: 0, childProfileIds: [] };

      // Get teacher's classes
      let query = supabase.from('school_classes').select('id');
      if (!isAdmin) query = query.eq('teacher_id', user.id);
      const { data: classes } = await query;
      const classIds = (classes || []).map(c => c.id);
      if (classIds.length === 0) return { classes: 0, students: 0, needsSupport: 0, active7d: 0, childProfileIds: [] };

      // Get students in those classes
      const { data: students } = await supabase
        .from('class_students')
        .select('child_id, children ( id, name, parent_id )')
        .in('class_id', classIds)
        .eq('is_active', true);

      const studentList = (students || []).filter((s: any) => s.children);
      const studentCount = studentList.length;

      // Resolve child_profile_ids for all students
      const childProfileIds: string[] = [];
      await Promise.all(
        studentList.map(async (s: any) => {
          const child = s.children as any;
          // Try child_id FK first
          const { data: byId } = await (supabase
            .from('child_profiles')
            .select('id') as any)
            .eq('child_id', child.id)
            .maybeSingle();
          if (byId) { childProfileIds.push(byId.id); return; }
          // Fallback: parent + name
          if (child.parent_id) {
            const { data: byParent } = await supabase
              .from('child_profiles')
              .select('id')
              .eq('parent_user_id', child.parent_id)
              .eq('name', child.name)
              .maybeSingle();
            if (byParent) childProfileIds.push(byParent.id);
          }
        })
      );

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      let active7d = 0;
      let needsSupport = 0;

      if (childProfileIds.length > 0) {
        // Active in last 7 days
        const { data: recentSessions } = await supabase
          .from('game_sessions')
          .select('child_profile_id')
          .in('child_profile_id', childProfileIds)
          .eq('completed', true)
          .gte('created_at', sevenDaysAgoISO);

        const activeIds = new Set((recentSessions || []).map((s: any) => s.child_profile_id));
        active7d = activeIds.size;

        // Needs support: low accuracy or inactive
        const inactiveCount = childProfileIds.length - activeIds.size;
        
        // Check low accuracy among active students
        let lowAccuracyCount = 0;
        for (const cpId of activeIds) {
          const { data: latestSession } = await supabase
            .from('game_sessions')
            .select('accuracy_percentage')
            .eq('child_profile_id', cpId)
            .eq('completed', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (latestSession && (latestSession.accuracy_percentage || 0) < 50) {
            lowAccuracyCount++;
          }
        }
        needsSupport = inactiveCount + lowAccuracyCount;
      } else {
        needsSupport = studentCount;
      }

      return { classes: classIds.length, students: studentCount, needsSupport, active7d, childProfileIds };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const stats = classData || { classes: 0, students: 0, needsSupport: 0, active7d: 0, childProfileIds: [] };

  // Real weekly engagement data
  const { data: weeklyData = [] } = useQuery({
    queryKey: ['teacher-weekly-engagement', classData?.childProfileIds],
    queryFn: async () => {
      const cpIds = classData?.childProfileIds || [];
      if (cpIds.length === 0) return [];

      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const result = [];
      const today = new Date();

      // Last 5 weekdays
      let count = 0;
      const d = new Date(today);
      while (count < 5) {
        d.setDate(d.getDate() - (count === 0 ? 0 : 1));
        const dow = d.getDay();
        if (dow === 0 || dow === 6) { d.setDate(d.getDate() - 1); continue; }
        
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const { data: sessions } = await supabase
          .from('game_sessions')
          .select('child_profile_id, duration_seconds')
          .in('child_profile_id', cpIds)
          .eq('completed', true)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        const uniqueStudents = new Set((sessions || []).map((s: any) => s.child_profile_id));
        const totalDuration = (sessions || []).reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);
        const avgMinutes = sessions && sessions.length > 0 ? Math.round(totalDuration / sessions.length / 60) : 0;

        result.unshift({
          day: days[dow],
          activeStudents: uniqueStudents.size,
          totalActivities: sessions?.length || 0,
          avgSessionMinutes: avgMinutes,
        });
        count++;
      }

      return result;
    },
    enabled: !!classData && (classData.childProfileIds?.length || 0) > 0,
    staleTime: 2 * 60 * 1000,
  });

  if (!user) return null;

  const StatSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );

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
        {statsLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {!statsLoading && stats.needsSupport > 0 && (
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
