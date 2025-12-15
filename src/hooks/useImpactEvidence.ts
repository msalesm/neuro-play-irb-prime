import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OutcomeMeasurement {
  id: string;
  child_id: string;
  measurement_type: string;
  domain: string;
  score_raw: number | null;
  score_normalized: number | null;
  percentile: number | null;
  interpretation: string | null;
  measured_at: string;
}

interface InterventionEffectiveness {
  id: string;
  intervention_type: string;
  sample_size: number;
  avg_improvement_cognitive: number | null;
  avg_improvement_behavioral: number | null;
  avg_improvement_socioemotional: number | null;
  effect_size: number | null;
  measurement_period_start: string | null;
  measurement_period_end: string | null;
}

interface ImpactReport {
  id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  total_patients_served: number;
  new_patients: number;
  completed_interventions: number;
  outcomes_summary: any;
  is_published: boolean;
  created_at: string;
}

export function useImpactEvidence(institutionId?: string) {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<OutcomeMeasurement[]>([]);
  const [effectiveness, setEffectiveness] = useState<InterventionEffectiveness[]>([]);
  const [reports, setReports] = useState<ImpactReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeasurements = useCallback(async () => {
    if (!institutionId) return;
    
    const { data } = await supabase
      .from('outcome_measurements')
      .select('*')
      .eq('institution_id', institutionId)
      .order('measured_at', { ascending: false })
      .limit(100);
    
    setMeasurements((data || []) as OutcomeMeasurement[]);
  }, [institutionId]);

  const loadEffectiveness = useCallback(async () => {
    if (!institutionId) return;
    
    const { data } = await supabase
      .from('intervention_effectiveness')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });
    
    setEffectiveness((data || []) as InterventionEffectiveness[]);
  }, [institutionId]);

  const loadReports = useCallback(async () => {
    if (!institutionId) return;
    
    const { data } = await supabase
      .from('impact_reports')
      .select('*')
      .eq('institution_id', institutionId)
      .order('period_end', { ascending: false });
    
    setReports((data || []) as ImpactReport[]);
  }, [institutionId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadMeasurements(), loadEffectiveness(), loadReports()]);
      setLoading(false);
    };
    load();
  }, [loadMeasurements, loadEffectiveness, loadReports]);

  const addMeasurement = async (data: Omit<OutcomeMeasurement, 'id' | 'measured_at'>) => {
    try {
      const { error } = await supabase
        .from('outcome_measurements')
        .insert({
          ...data,
          institution_id: institutionId,
          professional_id: user?.id
        });

      if (error) throw error;
      toast.success('Medição registrada');
      loadMeasurements();
    } catch (error) {
      toast.error('Erro ao registrar medição');
    }
  };

  const generateImpactReport = async (reportType: string, periodStart: string, periodEnd: string) => {
    if (!institutionId) return;

    try {
      // Gather data for report
      const { data: patients } = await supabase
        .from('children')
        .select('id, created_at')
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd);

      const { data: measurementsData } = await supabase
        .from('outcome_measurements')
        .select('*')
        .eq('institution_id', institutionId)
        .gte('measured_at', periodStart)
        .lte('measured_at', periodEnd);

      const outcomes = {
        cognitive: { baseline: 0, final: 0, improvement: 0 },
        behavioral: { baseline: 0, final: 0, improvement: 0 },
        socioemotional: { baseline: 0, final: 0, improvement: 0 }
      };

      // Calculate average improvements by domain
      if (measurementsData) {
        const byDomain = measurementsData.reduce((acc, m) => {
          if (!acc[m.domain]) acc[m.domain] = [];
          acc[m.domain].push(m);
          return acc;
        }, {} as Record<string, typeof measurementsData>);

        for (const [domain, items] of Object.entries(byDomain)) {
          const baseline = items.filter(i => i.measurement_type === 'baseline');
          const final = items.filter(i => i.measurement_type !== 'baseline');
          
          if (baseline.length && final.length && domain in outcomes) {
            const avgBaseline = baseline.reduce((s, i) => s + (i.score_normalized || 0), 0) / baseline.length;
            const avgFinal = final.reduce((s, i) => s + (i.score_normalized || 0), 0) / final.length;
            (outcomes as any)[domain] = {
              baseline: avgBaseline,
              final: avgFinal,
              improvement: avgFinal - avgBaseline
            };
          }
        }
      }

      const { error } = await supabase
        .from('impact_reports')
        .insert({
          institution_id: institutionId,
          report_type: reportType,
          period_start: periodStart,
          period_end: periodEnd,
          total_patients_served: patients?.length || 0,
          new_patients: patients?.filter(p => p.created_at >= periodStart).length || 0,
          completed_interventions: measurementsData?.filter(m => m.measurement_type === 'exit').length || 0,
          outcomes_summary: outcomes,
          generated_by: user?.id
        });

      if (error) throw error;
      toast.success('Relatório de impacto gerado');
      loadReports();
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    }
  };

  const publishReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('impact_reports')
        .update({ 
          is_published: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', reportId);

      if (error) throw error;
      toast.success('Relatório publicado');
      loadReports();
    } catch (error) {
      toast.error('Erro ao publicar relatório');
    }
  };

  return {
    measurements,
    effectiveness,
    reports,
    loading,
    addMeasurement,
    generateImpactReport,
    publishReport,
    refresh: () => Promise.all([loadMeasurements(), loadEffectiveness(), loadReports()])
  };
}
