import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PatientData {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  conditions: string[];
}

export interface SessionData {
  id: string;
  game_id: string;
  completed_at: string;
  accuracy_percentage: number;
  duration_seconds: number;
  score: number;
  difficulty_level: number;
}

export interface ClinicalReport {
  id: string;
  report_type: string;
  generated_date: string;
  summary_insights: string;
}

export interface BehavioralInsight {
  id: string;
  title: string;
  description: string;
  severity: string;
  insight_type: string;
  created_at: string;
}

export function useTherapistPatientData(patientId: string | undefined) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatientData = useCallback(async () => {
    if (!patientId) return null;
    const { data: childData, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();

    if (error) throw error;
    if (!childData) return null;

    const birthDate = new Date(childData.birth_date);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const conditions: string[] = Array.isArray(childData.neurodevelopmental_conditions)
      ? childData.neurodevelopmental_conditions.filter((c): c is string => typeof c === 'string')
      : [];

    const p: PatientData = { id: childData.id, name: childData.name, age, avatar_url: childData.avatar_url, conditions };
    setPatient(p);
    return childData;
  }, [patientId]);

  const loadGameSessions = useCallback(async (childData?: any | null) => {
    if (!patientId) return;
    const { data: directSessions, error: directError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('child_profile_id', patientId)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (directError) throw directError;
    if (directSessions && directSessions.length > 0) {
      setSessions(directSessions);
      return;
    }

    const childName = childData?.name || patient?.name;
    if (!childName) return;

    const { data: childProfile } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('name', childName)
      .maybeSingle();

    if (!childProfile?.id) return;

    const { data: sessionData, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('child_profile_id', childProfile.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    setSessions(sessionData || []);
  }, [patientId, patient?.name]);

  const loadClinicalReports = useCallback(async () => {
    const { data, error } = await supabase
      .from('clinical_reports')
      .select('*')
      .order('generated_date', { ascending: false })
      .limit(5);
    if (error) throw error;
    setReports(data || []);
  }, []);

  const loadBehavioralInsights = useCallback(async () => {
    const { data, error } = await supabase
      .from('behavioral_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    setInsights(data || []);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const child = await loadPatientData();
      await Promise.all([loadGameSessions(child), loadClinicalReports(), loadBehavioralInsights()]);
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Erro ao carregar dados do paciente');
    } finally {
      setLoading(false);
    }
  }, [loadPatientData, loadGameSessions, loadClinicalReports, loadBehavioralInsights]);

  useEffect(() => {
    if (patientId) loadAll();
  }, [patientId]);

  const generateReport = useCallback(async () => {
    toast.info('Gerando relatório clínico com IA...');
    try {
      const { error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          childId: patientId,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reportType: 'comprehensive'
        }
      });
      if (error) throw error;
      toast.success('Relatório gerado com sucesso!');
      loadClinicalReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    }
  }, [patientId, loadClinicalReports]);

  const saveSessionNotes = useCallback(async (notes: string) => {
    const { error } = await supabase
      .from('behavioral_insights')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        child_profile_id: patientId,
        title: `Sessão Terapêutica - ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
        description: notes,
        insight_type: 'session_notes',
        severity: 'info'
      });
    if (error) throw error;
    toast.success('Sessão registrada com sucesso');
    loadBehavioralInsights();
  }, [patientId, loadBehavioralInsights]);

  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / sessions.length)
    : 0;
  const totalSessions = sessions.length;
  const totalPlayTime = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);

  return {
    patient, sessions, reports, insights, loading,
    avgAccuracy, totalSessions, totalPlayTime,
    generateReport, saveSessionNotes, reloadInsights: loadBehavioralInsights,
  };
}
