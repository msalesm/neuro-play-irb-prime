import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TeleorientationSession {
  id: string;
  professional_id: string;
  parent_id: string;
  child_id?: string;
  session_type: 'orientation' | 'follow_up' | 'evaluation';
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  meeting_url?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface SessionNote {
  id: string;
  session_id: string;
  professional_id: string;
  notes: string;
  recommendations: any[];
  suggested_activities?: string[];
  follow_up_needed: boolean;
  follow_up_date?: string;
  is_shared_with_parent: boolean;
  created_at: string;
}

export function useTeleorientation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TeleorientationSession[]>([]);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      // Load sessions where user is professional or parent
      const { data, error } = await supabase
        .from('teleorientation_sessions')
        .select('*')
        .or(`professional_id.eq.${user.id},parent_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setSessions((data || []) as TeleorientationSession[]);
    } catch (error) {
      console.error('Error loading teleorientation sessions:', error);
    }
  }, [user]);

  const loadNotes = useCallback(async (sessionId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('teleorientation_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        query = query.eq('professional_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotes((data || []) as SessionNote[]);
    } catch (error) {
      console.error('Error loading session notes:', error);
    }
  }, [user]);

  const scheduleSession = useCallback(async (session: {
    parent_id: string;
    child_id?: string;
    session_type: TeleorientationSession['session_type'];
    scheduled_at: string;
    duration_minutes?: number;
  }) => {
    if (!user) return null;

    try {
      // Generate a placeholder meeting URL
      const meetingUrl = `https://meet.neuroplay.app/${crypto.randomUUID().slice(0, 8)}`;

      const { data, error } = await supabase
        .from('teleorientation_sessions')
        .insert({
          professional_id: user.id,
          parent_id: session.parent_id,
          child_id: session.child_id,
          session_type: session.session_type,
          scheduled_at: session.scheduled_at,
          duration_minutes: session.duration_minutes || 30,
          meeting_url: meetingUrl,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sessão agendada',
        description: 'A sessão foi agendada com sucesso'
      });

      await loadSessions();
      return data as TeleorientationSession;
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast({
        title: 'Erro ao agendar',
        description: 'Não foi possível agendar a sessão',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast, loadSessions]);

  const updateSessionStatus = useCallback(async (
    sessionId: string, 
    status: TeleorientationSession['status']
  ) => {
    try {
      const updates: any = { status };
      
      if (status === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('teleorientation_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      await loadSessions();
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  }, [loadSessions]);

  const addSessionNote = useCallback(async (note: {
    session_id: string;
    notes: string;
    recommendations?: any[];
    suggested_activities?: string[];
    follow_up_needed?: boolean;
    follow_up_date?: string;
    is_shared_with_parent?: boolean;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('teleorientation_notes')
        .insert({
          ...note,
          professional_id: user.id,
          recommendations: note.recommendations || [],
          follow_up_needed: note.follow_up_needed || false,
          is_shared_with_parent: note.is_shared_with_parent || false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Nota salva',
        description: 'As notas da sessão foram salvas'
      });

      await loadNotes(note.session_id);
      return data as SessionNote;
    } catch (error) {
      console.error('Error adding session note:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a nota',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast, loadNotes]);

  const cancelSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('teleorientation_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Sessão cancelada',
        description: 'A sessão foi cancelada'
      });

      await loadSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  }, [toast, loadSessions]);

  const getUpcomingSessions = useCallback(() => {
    const now = new Date().toISOString();
    return sessions.filter(s => s.scheduled_at > now && s.status === 'scheduled');
  }, [sessions]);

  const getPastSessions = useCallback(() => {
    const now = new Date().toISOString();
    return sessions.filter(s => s.scheduled_at <= now || s.status === 'completed');
  }, [sessions]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadSessions(), loadNotes()])
      .finally(() => setLoading(false));
  }, [loadSessions, loadNotes]);

  return {
    sessions,
    notes,
    loading,
    scheduleSession,
    updateSessionStatus,
    addSessionNote,
    cancelSession,
    getUpcomingSessions,
    getPastSessions,
    reload: () => Promise.all([loadSessions(), loadNotes()])
  };
}
