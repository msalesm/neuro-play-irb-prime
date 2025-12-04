import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  // Progress data
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
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get teacher's classes with students
      const { data: classesData, error: classesError } = await supabase
        .from('school_classes')
        .select(`
          id,
          name,
          grade_level,
          school_year,
          class_students (
            id,
            child_id,
            enrolled_at,
            notes,
            children (
              id,
              name,
              birth_date,
              neurodevelopmental_conditions
            )
          )
        `)
        .eq('teacher_id', user.id);

      if (classesError) {
        console.error('Error loading classes:', classesError);
        setLoading(false);
        return;
      }

      if (!classesData || classesData.length === 0) {
        setClasses([]);
        setAllStudents([]);
        setLoading(false);
        return;
      }

      // Process each class and its students
      const processedClasses: ClassWithStudents[] = await Promise.all(
        classesData.map(async (cls: any) => {
          const studentsWithProgress: StudentProgress[] = await Promise.all(
            (cls.class_students || []).map(async (enrollment: any) => {
              const child = enrollment.children;
              if (!child) return null;

              // Calculate age
              const birthDate = new Date(child.birth_date);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();

              // Get child_profile linked to this child
              const { data: childProfile } = await supabase
                .from('child_profiles')
                .select('id')
                .eq('name', child.name)
                .maybeSingle();

              let gameSessions: any[] = [];
              if (childProfile) {
                const { data: sessions } = await supabase
                  .from('game_sessions')
                  .select(`
                    id,
                    score,
                    accuracy_percentage,
                    duration_seconds,
                    created_at,
                    completed,
                    cognitive_games (name, cognitive_domains)
                  `)
                  .eq('child_profile_id', childProfile.id)
                  .eq('completed', true)
                  .order('created_at', { ascending: false })
                  .limit(20);
                
                gameSessions = sessions || [];
              }

              // Calculate metrics
              const totalSessions = gameSessions.length;
              const totalPlayTime = gameSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
              const avgAccuracy = gameSessions.length > 0
                ? Math.round(gameSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / gameSessions.length)
                : 0;
              
              const lastActivity = gameSessions.length > 0 ? gameSessions[0].created_at : null;

              // Calculate cognitive scores
              const domainScores: Record<string, number[]> = {
                attention: [],
                memory: [],
                language: [],
                executive: []
              };

              gameSessions.forEach(session => {
                const domains = session.cognitive_games?.cognitive_domains || [];
                const accuracy = session.accuracy_percentage || 0;
                
                domains.forEach((domain: string) => {
                  const d = domain.toLowerCase();
                  if (d.includes('attention') || d.includes('atenção')) {
                    domainScores.attention.push(accuracy);
                  }
                  if (d.includes('memory') || d.includes('memória')) {
                    domainScores.memory.push(accuracy);
                  }
                  if (d.includes('language') || d.includes('linguagem') || d.includes('phonological')) {
                    domainScores.language.push(accuracy);
                  }
                  if (d.includes('executive') || d.includes('planning') || d.includes('flexibility')) {
                    domainScores.executive.push(accuracy);
                  }
                });
              });

              const cognitiveScores = {
                attention: domainScores.attention.length > 0
                  ? Math.round(domainScores.attention.reduce((a, b) => a + b, 0) / domainScores.attention.length)
                  : 0,
                memory: domainScores.memory.length > 0
                  ? Math.round(domainScores.memory.reduce((a, b) => a + b, 0) / domainScores.memory.length)
                  : 0,
                language: domainScores.language.length > 0
                  ? Math.round(domainScores.language.reduce((a, b) => a + b, 0) / domainScores.language.length)
                  : 0,
                executive: domainScores.executive.length > 0
                  ? Math.round(domainScores.executive.reduce((a, b) => a + b, 0) / domainScores.executive.length)
                  : 0
              };

              const recentGames = gameSessions.slice(0, 5).map(s => ({
                game_name: s.cognitive_games?.name || 'Jogo',
                score: s.score || 0,
                accuracy: s.accuracy_percentage || 0,
                date: s.created_at
              }));

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
                recentGames,
                cognitiveScores
              };
            })
          );

          const validStudents = studentsWithProgress.filter(s => s !== null) as StudentProgress[];

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
        .insert({
          child_id: childId,
          class_id: classId,
          notes
        });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Aluno já matriculado nesta turma' };
        }
        return { success: false, error: error.message };
      }

      await loadStudents();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    classes,
    allStudents,
    loading,
    reload: loadStudents,
    addStudentToClass
  };
}
