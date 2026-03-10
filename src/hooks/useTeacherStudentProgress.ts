import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export interface StudentProgress {
  id: string;
  childId: string;
  classId: string;
  className: string;
  name: string;
  birthDate: string;
  age: number;
  conditions: string[];
  enrolledAt: string;
  notes: string | null;
  totalSessions: number;
  avgAccuracy: number;
  totalPlayTime: number;
  lastActivity: string | null;
  recentGames: {
    game_name: string;
    score: number;
    accuracy: number;
    date: string;
  }[];
  cognitiveScores: {
    attention: number;
    memory: number;
    language: number;
    executive: number;
  };
}

export interface ClassWithStudents {
  id: string;
  name: string;
  gradeLevel: string | null;
  schoolYear: string | null;
  studentCount: number;
  students: StudentProgress[];
}

export function useTeacherStudentProgress() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user, isAdmin]);

  const resolveChildProfileId = async (child: { id: string; name: string; parent_id?: string | null }): Promise<string | null> => {
    // 1) Try by child_id FK on child_profiles
    const { data: byChildId } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('child_id' as any, child.id)
      .maybeSingle();
    if (byChildId) return byChildId.id;

    // 2) Fallback: match by name + parent
    if (child.parent_id) {
      const { data: byParent } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', child.parent_id)
        .eq('name', child.name)
        .maybeSingle();
      if (byParent) return byParent.id;
    }

    return null;
  };

  const computeCognitiveScores = (gameSessions: any[]) => {
    const domainScores: Record<string, number[]> = {
      attention: [], memory: [], language: [], executive: []
    };

    gameSessions.forEach(session => {
      const domains = session.cognitive_games?.cognitive_domains || [];
      const accuracy = session.accuracy_percentage || 0;
      domains.forEach((domain: string) => {
        const d = domain.toLowerCase();
        if (d.includes('attention') || d.includes('atenção')) domainScores.attention.push(accuracy);
        if (d.includes('memory') || d.includes('memória')) domainScores.memory.push(accuracy);
        if (d.includes('language') || d.includes('linguagem') || d.includes('phonological')) domainScores.language.push(accuracy);
        if (d.includes('executive') || d.includes('planning') || d.includes('flexibility')) domainScores.executive.push(accuracy);
      });
    });

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    return {
      attention: avg(domainScores.attention),
      memory: avg(domainScores.memory),
      language: avg(domainScores.language),
      executive: avg(domainScores.executive),
    };
  };

  const loadStudents = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('school_classes')
        .select(`
          id, name, grade_level, school_year,
          class_students (
            id, child_id, enrolled_at, notes,
            children ( id, name, birth_date, parent_id, neurodevelopmental_conditions )
          )
        `);
      
      if (!isAdmin) {
        query = query.eq('teacher_id', user.id);
      }
      
      const { data: classesData, error: classesError } = await query;

      if (classesError || !classesData || classesData.length === 0) {
        setClasses([]);
        setAllStudents([]);
        setLoading(false);
        return;
      }

      const processedClasses: ClassWithStudents[] = await Promise.all(
        classesData.map(async (cls: any) => {
          const studentsWithProgress: (StudentProgress | null)[] = await Promise.all(
            (cls.class_students || []).map(async (enrollment: any) => {
              const child = enrollment.children;
              if (!child) return null;

              const birthDate = new Date(child.birth_date);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();

              const profileId = await resolveChildProfileId(child);

              let gameSessions: any[] = [];
              if (profileId) {
                const { data: sessions } = await supabase
                  .from('game_sessions')
                  .select(`id, score, accuracy_percentage, duration_seconds, created_at, completed, cognitive_games (name, cognitive_domains)`)
                  .eq('child_profile_id', profileId)
                  .eq('completed', true)
                  .order('created_at', { ascending: false })
                  .limit(20);
                gameSessions = sessions || [];
              }

              const totalSessions = gameSessions.length;
              const totalPlayTime = gameSessions.reduce((acc: number, s: any) => acc + (s.duration_seconds || 0), 0);
              const avgAccuracy = totalSessions > 0
                ? Math.round(gameSessions.reduce((acc: number, s: any) => acc + (s.accuracy_percentage || 0), 0) / totalSessions)
                : 0;
              const lastActivity = totalSessions > 0 ? gameSessions[0].created_at : null;

              const conditions = Array.isArray(child.neurodevelopmental_conditions)
                ? child.neurodevelopmental_conditions
                : [];

              return {
                id: enrollment.id,
                childId: child.id,
                classId: cls.id,
                className: cls.name,
                name: child.name,
                birthDate: child.birth_date,
                age,
                conditions,
                enrolledAt: enrollment.enrolled_at,
                notes: enrollment.notes,
                totalSessions,
                avgAccuracy,
                totalPlayTime,
                lastActivity,
                recentGames: gameSessions.slice(0, 5).map((s: any) => ({
                  game_name: s.cognitive_games?.name || 'Jogo',
                  score: s.score || 0,
                  accuracy: s.accuracy_percentage || 0,
                  date: s.created_at
                })),
                cognitiveScores: computeCognitiveScores(gameSessions),
              } as StudentProgress;
            })
          );

          const validStudents = studentsWithProgress.filter((s): s is StudentProgress => s !== null);

          return {
            id: cls.id,
            name: cls.name,
            gradeLevel: cls.grade_level,
            schoolYear: cls.school_year,
            studentCount: validStudents.length,
            students: validStudents
          };
        })
      );

      setClasses(processedClasses);
      setAllStudents(processedClasses.flatMap(c => c.students));
    } catch (error) {
      console.error('Error loading student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudentToClass = async (childId: string, classId: string, notes?: string) => {
    if (!user) return { success: false, error: 'Não autenticado' };

    try {
      const { error } = await supabase
        .from('class_students')
        .insert({ child_id: childId, class_id: classId, notes });

      if (error) {
        if (error.code === '23505') return { success: false, error: 'Aluno já matriculado nesta turma' };
        return { success: false, error: error.message };
      }

      await loadStudents();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return { classes, allStudents, loading, reload: loadStudents, addStudentToClass };
}
