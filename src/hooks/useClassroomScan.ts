import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function generateSessionCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function useClassroomScan(classId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Fetch active session for this class
  const { data: activeSession, isLoading: loadingSession } = useQuery({
    queryKey: ['scan-session', classId],
    queryFn: async () => {
      if (!classId) return null;
      const { data, error } = await supabase
        .from('classroom_scan_sessions')
        .select('*')
        .eq('class_id', classId)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) setActiveSessionId(data.id);
      return data;
    },
    enabled: !!classId,
  });

  // Fetch student results for active session
  const { data: studentResults = [] } = useQuery({
    queryKey: ['scan-results', activeSessionId],
    queryFn: async () => {
      if (!activeSessionId) return [];
      const { data, error } = await supabase
        .from('scan_student_results')
        .select('*')
        .eq('session_id', activeSessionId)
        .order('student_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeSessionId,
    refetchInterval: activeSession?.status === 'active' ? 3000 : false,
  });

  // Realtime subscription for live updates
  const subscribeToSession = (sessionId: string) => {
    const channel = supabase
      .channel(`scan-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scan_student_results',
        filter: `session_id=eq.${sessionId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['scan-results', sessionId] });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'classroom_scan_sessions',
        filter: `id=eq.${sessionId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['scan-session', classId] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  // Create a new scan session
  const createSession = useMutation({
    mutationFn: async (students: { child_id: string; name: string }[]) => {
      if (!classId || !user) throw new Error('Missing data');
      
      const sessionCode = generateSessionCode();
      
      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('classroom_scan_sessions')
        .insert({
          class_id: classId,
          teacher_id: user.id,
          session_code: sessionCode,
          status: 'waiting',
          total_students: students.length,
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      // Create student entries
      const studentEntries = students.map(s => ({
        session_id: session.id,
        child_id: s.child_id,
        student_name: s.name,
        status: 'waiting' as const,
      }));
      
      const { error: studentsError } = await supabase
        .from('scan_student_results')
        .insert(studentEntries);
      
      if (studentsError) throw studentsError;
      
      setActiveSessionId(session.id);
      return session;
    },
    onSuccess: () => {
      toast.success('Sessão de triagem criada!');
      queryClient.invalidateQueries({ queryKey: ['scan-session', classId] });
    },
    onError: (e) => toast.error('Erro: ' + (e as Error).message),
  });

  // Start the session (change status to active)
  const startSession = useMutation({
    mutationFn: async () => {
      if (!activeSessionId) throw new Error('No active session');
      const { error } = await supabase
        .from('classroom_scan_sessions')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', activeSessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-session', classId] });
    },
  });

  // Complete session and calculate results
  const completeSession = useMutation({
    mutationFn: async () => {
      if (!activeSessionId) throw new Error('No active session');
      
      // Get all completed results
      const { data: results } = await supabase
        .from('scan_student_results')
        .select('*')
        .eq('session_id', activeSessionId)
        .eq('status', 'completed');
      
      const completed = results || [];
      const n = completed.length;
      
      const classResults = n > 0 ? {
        avg_attention: Math.round(completed.reduce((s, r) => s + (Number(r.attention_score) || 0), 0) / n),
        avg_memory: Math.round(completed.reduce((s, r) => s + (Number(r.memory_score) || 0), 0) / n),
        avg_language: Math.round(completed.reduce((s, r) => s + (Number(r.language_score) || 0), 0) / n),
        avg_executive: Math.round(completed.reduce((s, r) => s + (Number(r.executive_function_score) || 0), 0) / n),
        total_assessed: n,
        risk_reading: completed.filter(r => {
          const flags = r.risk_flags as any[];
          return Array.isArray(flags) && flags.some((f: any) => f.type === 'reading');
        }).length,
        risk_attention: completed.filter(r => {
          const flags = r.risk_flags as any[];
          return Array.isArray(flags) && flags.some((f: any) => f.type === 'attention');
        }).length,
        risk_social: completed.filter(r => {
          const flags = r.risk_flags as any[];
          return Array.isArray(flags) && flags.some((f: any) => f.type === 'social');
        }).length,
      } : {};
      
      const { error } = await supabase
        .from('classroom_scan_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          students_completed: n,
          class_results: classResults,
        })
        .eq('id', activeSessionId);
      
      if (error) throw error;
      setActiveSessionId(null);
    },
    onSuccess: () => {
      toast.success('Triagem concluída!');
      queryClient.invalidateQueries({ queryKey: ['scan-session', classId] });
      queryClient.invalidateQueries({ queryKey: ['scan-history', classId] });
    },
  });

  // Cancel session
  const cancelSession = useMutation({
    mutationFn: async () => {
      if (!activeSessionId) throw new Error('No active session');
      const { error } = await supabase
        .from('classroom_scan_sessions')
        .update({ status: 'cancelled' })
        .eq('id', activeSessionId);
      if (error) throw error;
      setActiveSessionId(null);
    },
    onSuccess: () => {
      toast.info('Sessão cancelada');
      queryClient.invalidateQueries({ queryKey: ['scan-session', classId] });
    },
  });

  // History of past scans
  const { data: scanHistory = [] } = useQuery({
    queryKey: ['scan-history', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('classroom_scan_sessions')
        .select('*')
        .eq('class_id', classId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!classId,
  });

  return {
    activeSession,
    loadingSession,
    studentResults,
    scanHistory,
    createSession,
    startSession,
    completeSession,
    cancelSession,
    subscribeToSession,
  };
}
