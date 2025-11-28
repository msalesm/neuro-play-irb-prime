import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Search, Users, TrendingUp } from 'lucide-react';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';

interface Student {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  conditions: string[];
  progressTrend?: 'up' | 'stable' | 'down';
}

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
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user && classId) {
      loadClassData();
    }
  }, [user, classId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const loadClassData = async () => {
    try {
      setLoading(true);

      // Load class info
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

      // Load students in class
      const { data: classStudents, error: studentsError } = await supabase
        .from('class_students')
        .select(`
          child_id,
          children (
            id,
            name,
            birth_date,
            avatar_url,
            neurodevelopmental_conditions
          )
        `)
        .eq('class_id', classId);

      if (studentsError) throw studentsError;

      const studentsList: Student[] = (classStudents || []).map((cs: any) => {
        const child = cs.children;
        const birthDate = new Date(child.birth_date);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        return {
          id: child.id,
          name: child.name,
          age,
          avatar_url: child.avatar_url,
          conditions: Array.isArray(child.neurodevelopmental_conditions) 
            ? child.neurodevelopmental_conditions 
            : [],
          progressTrend: 'stable' as const,
        };
      });

      setStudents(studentsList);
      setFilteredStudents(studentsList);
    } catch (error) {
      console.error('Error loading class data:', error);
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

  if (loading) {
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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/classes')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Turmas
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{classInfo?.name}</h1>
          <div className="flex gap-2">
            {classInfo?.grade_level && (
              <Badge variant="secondary">{classInfo.grade_level}</Badge>
            )}
            {classInfo?.school_year && (
              <Badge variant="outline">{classInfo.school_year}</Badge>
            )}
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
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
                className="hover:shadow-lg transition-all cursor-pointer"
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
                    {getTrendIcon(student.progressTrend)}
                  </div>

                  {student.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {student.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
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
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente buscar com outros termos' : 'Adicione alunos a esta turma'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernPageLayout>
  );
}
