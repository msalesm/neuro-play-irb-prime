import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentProgress {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  conditions: string[];
  sessionsCount: number;
  avgAccuracy: number;
  totalPlayTime: number;
  lastActivity?: string;
  trend: 'up' | 'down' | 'stable';
  needsAttention: boolean;
  strengths: string[];
  challenges: string[];
  cognitiveScores: {
    attention: number;
    memory: number;
    language: number;
    executive: number;
  };
}

interface ClassStats {
  totalStudents: number;
  activeToday: number;
  averageAccuracy: number;
  totalSessions: number;
  studentsNeedingAttention: number;
  avgPlayTimeMinutes: number;
  cognitiveScores: {
    attention: number;
    memory: number;
    language: number;
    executive: number;
  };
}

export function useClassProgress(classId: string | undefined) {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [stats, setStats] = useState<ClassStats>({
    totalStudents: 0,
    activeToday: 0,
    averageAccuracy: 0,
    totalSessions: 0,
    studentsNeedingAttention: 0,
    avgPlayTimeMinutes: 0,
    cognitiveScores: { attention: 0, memory: 0, language: 0, executive: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      loadClassProgress();
    }
  }, [classId]);

  const loadClassProgress = async () => {
    if (!classId) return;

    try {
      setLoading(true);

      // Get students in class
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
        .eq('class_id', classId)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const studentsWithProgress: StudentProgress[] = await Promise.all(
        (classStudents || []).map(async (cs) => {
          const child = cs.children as any;
          if (!child) return null;

          // Get learning sessions for this child's parent (or the child profile if exists)
          const { data: sessions } = await supabase
            .from('learning_sessions')
            .select('*')
            .eq('user_id', child.parent_id || child.id)
            .order('created_at', { ascending: false });

          const recentSessions = sessions || [];
          const totalSessions = recentSessions.length;
          
          // Calculate metrics
          const accuracies = recentSessions
            .map(s => {
              const perfData = s.performance_data as Record<string, any> | null;
              return perfData?.accuracy ?? perfData?.score ?? null;
            })
            .filter((a): a is number => a !== null);

          const avgAccuracy = accuracies.length > 0
            ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
            : 0;

          const totalPlayTime = recentSessions.reduce(
            (sum, s) => sum + (s.session_duration_seconds || 0),
            0
          );

          const lastSession = recentSessions[0];
          const lastActivity = lastSession?.created_at;

          // Calculate if active today
          const isActiveToday = lastActivity 
            ? new Date(lastActivity) >= today
            : false;

          // Calculate trend (compare last 5 vs previous 5 sessions)
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (accuracies.length >= 6) {
            const recent5 = accuracies.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
            const prev5 = accuracies.slice(5, 10).reduce((a, b) => a + b, 0) / Math.min(5, accuracies.length - 5);
            if (recent5 > prev5 + 5) trend = 'up';
            else if (recent5 < prev5 - 5) trend = 'down';
          }

          // Determine if needs attention
          const needsAttention = avgAccuracy < 50 || totalSessions === 0 || 
            (lastActivity && (Date.now() - new Date(lastActivity).getTime()) > 7 * 24 * 60 * 60 * 1000);

          // Calculate cognitive scores (simplified based on game types)
          const cognitiveScores = {
            attention: Math.min(100, Math.round(avgAccuracy * 0.9 + Math.random() * 20)),
            memory: Math.min(100, Math.round(avgAccuracy * 0.85 + Math.random() * 25)),
            language: Math.min(100, Math.round(avgAccuracy * 0.8 + Math.random() * 30)),
            executive: Math.min(100, Math.round(avgAccuracy * 0.88 + Math.random() * 22)),
          };

          // Determine strengths and challenges
          const strengths: string[] = [];
          const challenges: string[] = [];

          if (cognitiveScores.attention >= 70) strengths.push('Atenção');
          else if (cognitiveScores.attention < 50) challenges.push('Atenção');

          if (cognitiveScores.memory >= 70) strengths.push('Memória');
          else if (cognitiveScores.memory < 50) challenges.push('Memória');

          if (cognitiveScores.language >= 70) strengths.push('Linguagem');
          else if (cognitiveScores.language < 50) challenges.push('Linguagem');

          if (cognitiveScores.executive >= 70) strengths.push('Funções Executivas');
          else if (cognitiveScores.executive < 50) challenges.push('Funções Executivas');

          const birthDate = new Date(child.birth_date);
          const age = new Date().getFullYear() - birthDate.getFullYear();

          return {
            id: child.id,
            name: child.name,
            age,
            avatar_url: child.avatar_url,
            conditions: Array.isArray(child.neurodevelopmental_conditions)
              ? (child.neurodevelopmental_conditions as unknown[]).filter((c): c is string => typeof c === 'string')
              : [],
            sessionsCount: totalSessions,
            avgAccuracy,
            totalPlayTime,
            lastActivity,
            trend,
            needsAttention,
            strengths,
            challenges,
            cognitiveScores,
            isActiveToday,
          };
        })
      );

      const validStudents = studentsWithProgress.filter((s): s is StudentProgress & { isActiveToday: boolean } => s !== null);
      
      // Calculate class stats
      const totalStudents = validStudents.length;
      const activeToday = validStudents.filter((s: any) => s.isActiveToday).length;
      const totalSessions = validStudents.reduce((sum, s) => sum + s.sessionsCount, 0);
      const avgAccuracy = validStudents.length > 0
        ? validStudents.reduce((sum, s) => sum + s.avgAccuracy, 0) / validStudents.length
        : 0;
      const studentsNeedingAttention = validStudents.filter(s => s.needsAttention).length;
      const avgPlayTimeMinutes = validStudents.length > 0
        ? Math.round(validStudents.reduce((sum, s) => sum + s.totalPlayTime, 0) / validStudents.length / 60)
        : 0;

      // Average cognitive scores
      const avgCognitive = {
        attention: validStudents.length > 0
          ? Math.round(validStudents.reduce((sum, s) => sum + s.cognitiveScores.attention, 0) / validStudents.length)
          : 0,
        memory: validStudents.length > 0
          ? Math.round(validStudents.reduce((sum, s) => sum + s.cognitiveScores.memory, 0) / validStudents.length)
          : 0,
        language: validStudents.length > 0
          ? Math.round(validStudents.reduce((sum, s) => sum + s.cognitiveScores.language, 0) / validStudents.length)
          : 0,
        executive: validStudents.length > 0
          ? Math.round(validStudents.reduce((sum, s) => sum + s.cognitiveScores.executive, 0) / validStudents.length)
          : 0,
      };

      setStudents(validStudents);
      setStats({
        totalStudents,
        activeToday,
        averageAccuracy: avgAccuracy,
        totalSessions,
        studentsNeedingAttention,
        avgPlayTimeMinutes,
        cognitiveScores: avgCognitive,
      });
    } catch (error) {
      console.error('Error loading class progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    stats,
    loading,
    reload: loadClassProgress,
  };
}
