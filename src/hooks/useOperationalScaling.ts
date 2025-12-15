import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InstitutionSettings {
  id: string;
  institution_id: string;
  auto_assign_enabled: boolean;
  max_queue_size: number;
  default_sla_hours: number;
  escalation_enabled: boolean;
  escalation_threshold_hours: number;
  working_hours_start: string;
  working_hours_end: string;
  working_days: number[];
  notification_channels: string[];
}

interface ProfessionalSchedule {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_cases_per_slot: number;
}

interface PerformanceMetric {
  id: string;
  institution_id: string;
  metric_date: string;
  total_cases: number;
  completed_cases: number;
  avg_wait_time_minutes: number;
  avg_service_time_minutes: number;
  sla_compliance_rate: number;
  sla_breaches: number;
  high_risk_cases: number;
  professional_utilization_rate: number;
}

interface EscalationRecord {
  id: string;
  queue_item_id: string;
  escalated_from: string | null;
  escalated_to: string | null;
  escalation_level: number;
  reason: string;
  auto_escalated: boolean;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface ShiftHandoff {
  id: string;
  institution_id: string;
  from_professional_id: string;
  to_professional_id: string;
  handoff_time: string;
  pending_cases_count: number;
  critical_notes: string | null;
  acknowledged_at: string | null;
}

export function useOperationalScaling(institutionId?: string) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [handoffs, setHandoffs] = useState<ShiftHandoff[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!institutionId) return;
    
    const { data } = await supabase
      .from('institution_operational_settings')
      .select('*')
      .eq('institution_id', institutionId)
      .single();
    
    if (data) {
      setSettings(data as InstitutionSettings);
    }
  }, [institutionId]);

  const loadSchedules = useCallback(async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('professional_schedules')
      .select('*')
      .eq('professional_id', user.id)
      .order('day_of_week');
    
    setSchedules((data || []) as ProfessionalSchedule[]);
  }, [user?.id]);

  const loadMetrics = useCallback(async () => {
    if (!institutionId) return;
    
    const { data } = await supabase
      .from('queue_performance_metrics')
      .select('*')
      .eq('institution_id', institutionId)
      .order('metric_date', { ascending: false })
      .limit(30);
    
    setMetrics((data || []) as PerformanceMetric[]);
  }, [institutionId]);

  const loadEscalations = useCallback(async () => {
    const { data } = await supabase
      .from('escalation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    setEscalations((data || []) as EscalationRecord[]);
  }, []);

  const loadHandoffs = useCallback(async () => {
    const { data } = await supabase
      .from('shift_handoffs')
      .select('*')
      .order('handoff_time', { ascending: false })
      .limit(20);
    
    setHandoffs((data || []) as ShiftHandoff[]);
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        loadSettings(),
        loadSchedules(),
        loadMetrics(),
        loadEscalations(),
        loadHandoffs()
      ]);
      setLoading(false);
    };
    loadAll();
  }, [loadSettings, loadSchedules, loadMetrics, loadEscalations, loadHandoffs]);

  const updateSettings = async (updates: Partial<InstitutionSettings>) => {
    if (!institutionId) return;

    try {
      const { error } = await supabase
        .from('institution_operational_settings')
        .upsert({
          institution_id: institutionId,
          ...settings,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Configurações atualizadas');
      loadSettings();
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  const updateSchedule = async (dayOfWeek: number, updates: Partial<ProfessionalSchedule>) => {
    if (!user?.id) return;

    try {
      const existing = schedules.find(s => s.day_of_week === dayOfWeek);
      
      if (existing) {
        const { error } = await supabase
          .from('professional_schedules')
          .update(updates)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('professional_schedules')
          .insert({
            professional_id: user.id,
            day_of_week: dayOfWeek,
            start_time: updates.start_time || '08:00:00',
            end_time: updates.end_time || '18:00:00',
            is_available: updates.is_available ?? true,
            max_cases_per_slot: updates.max_cases_per_slot || 4
          });
        if (error) throw error;
      }

      toast.success('Agenda atualizada');
      loadSchedules();
    } catch (error) {
      toast.error('Erro ao atualizar agenda');
    }
  };

  const createEscalation = async (
    queueItemId: string, 
    toUserId: string, 
    reason: string,
    level: number = 1
  ) => {
    try {
      const { error } = await supabase
        .from('escalation_history')
        .insert({
          queue_item_id: queueItemId,
          escalated_from: user?.id,
          escalated_to: toUserId,
          escalation_level: level,
          reason,
          auto_escalated: false
        });

      if (error) throw error;
      toast.success('Caso escalado com sucesso');
      loadEscalations();
    } catch (error) {
      toast.error('Erro ao escalar caso');
    }
  };

  const resolveEscalation = async (escalationId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('escalation_history')
        .update({
          resolved_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', escalationId);

      if (error) throw error;
      toast.success('Escalação resolvida');
      loadEscalations();
    } catch (error) {
      toast.error('Erro ao resolver escalação');
    }
  };

  const createHandoff = async (
    toUserId: string, 
    pendingCount: number, 
    notes?: string
  ) => {
    if (!user?.id || !institutionId) return;

    try {
      const { error } = await supabase
        .from('shift_handoffs')
        .insert({
          institution_id: institutionId,
          from_professional_id: user.id,
          to_professional_id: toUserId,
          pending_cases_count: pendingCount,
          critical_notes: notes
        });

      if (error) throw error;
      toast.success('Passagem de plantão registrada');
      loadHandoffs();
    } catch (error) {
      toast.error('Erro ao registrar passagem');
    }
  };

  const acknowledgeHandoff = async (handoffId: string) => {
    try {
      const { error } = await supabase
        .from('shift_handoffs')
        .update({ acknowledged_at: new Date().toISOString() })
        .eq('id', handoffId);

      if (error) throw error;
      toast.success('Plantão reconhecido');
      loadHandoffs();
    } catch (error) {
      toast.error('Erro ao reconhecer plantão');
    }
  };

  const autoAssignCase = async (queueItemId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('auto_assign_queue_item', { p_queue_item_id: queueItemId });

      if (error) throw error;
      
      if (data) {
        toast.success('Caso atribuído automaticamente');
      } else {
        toast.warning('Nenhum profissional disponível');
      }
      
      return data;
    } catch (error) {
      toast.error('Erro na atribuição automática');
      return null;
    }
  };

  return {
    settings,
    schedules,
    metrics,
    escalations,
    handoffs,
    loading,
    updateSettings,
    updateSchedule,
    createEscalation,
    resolveEscalation,
    createHandoff,
    acknowledgeHandoff,
    autoAssignCase,
    refresh: () => Promise.all([loadSettings(), loadSchedules(), loadMetrics(), loadEscalations(), loadHandoffs()])
  };
}
