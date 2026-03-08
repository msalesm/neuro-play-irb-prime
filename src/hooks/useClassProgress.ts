/**
 * useClassProgress — Thin Hook
 * 
 * Data fetching + delegates computation to class-analytics-engine.
 * NO business logic here.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  computeStudentProgress,
  computeClassStats,
  type RawStudentData,
  type ComputedStudentProgress,
  type ComputedClassStats,
} from '@/modules/school/class-analytics-engine';

export function useClassProgress(classId: string | undefined) {
  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['class-progress', classId],
    queryFn: async () => {
      if (!classId) return { students: [] as ComputedStudentProgress[], stats: emptyStats() };

      // Fetch students in class
      const { data: classStudents, error } = await supabase
        .from('class_students')
        .select(`
          child_id,
          children (
            id, name, birth_date, avatar_url, neurodevelopmental_conditions
          )
        `)
        .eq('class_id', classId)
        .eq('is_active', true);

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch sessions for all children in parallel
      const studentsRaw: RawStudentData[] = [];
      
      await Promise.all(
        (classStudents || []).map(async (cs) => {
          const child = cs.children as any;
          if (!child) return;

          const { data: sessions } = await supabase
            .from('learning_sessions')
            .select('performance_data, session_duration_seconds, created_at')
            .eq('user_id', child.parent_id || child.id)
            .order('created_at', { ascending: false })
            .limit(50);

          studentsRaw.push({
            id: child.id,
            name: child.name,
            birthDate: child.birth_date,
            avatarUrl: child.avatar_url,
            conditions: Array.isArray(child.neurodevelopmental_conditions)
              ? (child.neurodevelopmental_conditions as unknown[]).filter((c): c is string => typeof c === 'string')
              : [],
            sessions: (sessions || []).map(s => ({
              accuracy: (s.performance_data as any)?.accuracy ?? (s.performance_data as any)?.score ?? null,
              durationSeconds: s.session_duration_seconds || 0,
              createdAt: s.created_at || '',
              performanceData: s.performance_data as Record<string, any> | null,
            })),
          });
        })
      );

      // Pure computation — no React dependency
      const students = studentsRaw.map(s => computeStudentProgress(s, today));
      const stats = computeClassStats(students);

      return { students, stats };
    },
    enabled: !!classId,
    staleTime: 2 * 60 * 1000, // 2 min cache
  });

  return {
    students: data?.students ?? [],
    stats: data?.stats ?? emptyStats(),
    loading,
    reload: refetch,
  };
}

function emptyStats(): ComputedClassStats {
  return {
    totalStudents: 0, activeToday: 0, averageAccuracy: 0,
    totalSessions: 0, studentsNeedingAttention: 0, avgPlayTimeMinutes: 0,
    cognitiveScores: { attention: 0, memory: 0, language: 0, executive: 0 },
  };
}
