import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Search, Users, TrendingUp, Plus, BarChart3, MessageSquare, FileText } from 'lucide-react';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { TeacherClassStats } from '@/components/teacher/TeacherClassStats';
import { ParentCommunicationPanel } from '@/components/teacher/ParentCommunicationPanel';
import { ClassPedagogicalReport } from '@/components/teacher/ClassPedagogicalReport';
import { AddStudentToClassModal } from '@/components/teacher/AddStudentToClassModal';
import { useClassProgress } from '@/hooks/useClassProgress';

interface ClassInfo {
  name: string;
  grade_level?: string;
  school_year?: string;
}

export default function TeacherClassView() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { students, stats, loading: progressLoading, reload } = useClassProgress(classId);

  const filteredStudents = searchQuery
    ? students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : students;

  useEffect(() => {
    if (user && classId) {
      loadClassInfo();
    }
  }, [user, classId]);

  const loadClassInfo = async () => {
    try {
      setLoading(true);

      const { data: classData, error: classError } = await supabase
        .from('school_classes')
        .select('*')
        .eq('id', classId)
        .eq('teacher_id', user?.id)
        .single();

      if (classError) throw classError;

      setClassInfo({
        name: classData.name,
        grade_level: classData.grade_level,
        school_year: classData.school_year,
      });
    } catch (error) {
      console.error('Error loading class info:', error);
      toast.error('Erro ao carregar dados da turma');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend?: 'up' | 'stable' | 'down') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'stable': return <div className="w-4 h-4 border-t-2 border-yellow-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return null;
    }
  };

  if (loading || progressLoading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/classes')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Turmas
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{classInfo?.name}</h1>
            <div className="flex gap-2">
              {classInfo?.grade_level && (
                <Badge variant="secondary">{classInfo.grade_level}</Badge>
              )}
              {classInfo?.school_year && (
                <Badge variant="outline">{classInfo.school_year}</Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {stats.totalStudents} alunos
              </Badge>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Aluno
          </Button>
        </div>

        {/* Class Stats */}
        <TeacherClassStats stats={stats} className="mb-8" />

        {/* Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatório
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comunicação
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar aluno..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Students Grid */}
            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                      student.needsAttention ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''
                    }`}
                    onClick={() => navigate(`/teacher/student/${student.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <ChildAvatarDisplay
                            avatar={student.avatar_url}
                            name={student.name}
                            size="md"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.age} anos</p>
                          </div>
                        </div>
                        {getTrendIcon(student.trend)}
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="bg-muted rounded p-2">
                          <p className="text-muted-foreground text-xs">Sessões</p>
                          <p className="font-semibold">{student.sessionsCount}</p>
                        </div>
                        <div className="bg-muted rounded p-2">
                          <p className="text-muted-foreground text-xs">Precisão</p>
                          <p className="font-semibold">{student.avgAccuracy.toFixed(0)}%</p>
                        </div>
                      </div>

                      {student.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {student.conditions.slice(0, 2).map((condition, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                          {student.conditions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.conditions.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {student.needsAttention && (
                        <Badge className="mt-2 bg-amber-500/10 text-amber-700 text-xs">
                          Precisa de atenção
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum aluno encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Tente buscar com outros termos' : 'Adicione alunos a esta turma'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Aluno
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report">
            <ClassPedagogicalReport
              classId={classId || ''}
              className={classInfo?.name || ''}
              students={students}
              classStats={{
                totalSessions: stats.totalSessions,
                avgAccuracy: stats.averageAccuracy,
                activeStudents: stats.activeToday,
                totalStudents: stats.totalStudents,
              }}
            />
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <ParentCommunicationPanel
              classId={classId}
              students={students.map(s => ({ id: s.id, name: s.name }))}
            />
          </TabsContent>
        </Tabs>

        {/* Add Student Modal */}
        <AddStudentToClassModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          classId={classId || ''}
          onStudentAdded={() => {
            reload();
            setShowAddModal(false);
          }}
          existingStudentIds={students.map(s => s.id)}
        />
      </div>
    </ModernPageLayout>
  );
}
