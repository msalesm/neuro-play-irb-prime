import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface IntegratedProfile {
  id: string;
  child_id: string;
  generated_at: string;
  // Layer 1 - Cognitive
  cognitive_attention: number | null;
  cognitive_inhibition: number | null;
  cognitive_memory: number | null;
  cognitive_flexibility: number | null;
  cognitive_coordination: number | null;
  cognitive_persistence: number | null;
  cognitive_overall: number | null;
  // Layer 2 - Executive Routine
  executive_autonomy_score: number | null;
  executive_completion_rate: number | null;
  executive_consistency_score: number | null;
  executive_organization_index: number | null;
  // Layer 3 - Socioemotional
  socioemotional_empathy: number | null;
  socioemotional_impulse_control: number | null;
  socioemotional_flexibility: number | null;
  socioemotional_overall: number | null;
  // Meta
  layer1_sessions_count: number;
  layer2_executions_count: number;
  layer3_decisions_count: number;
  interpretation: string | null;
  recommendations: any[];
}

export interface LayerSummary {
  layer: number;
  name: string;
  score: number | null;
  dataPoints: number;
  status: 'insufficient' | 'partial' | 'complete';
  icon: string;
}

export function useIntegratedProfile(childId: string) {
  const query = useQuery({
    queryKey: ['integrated-profile', childId],
    queryFn: async (): Promise<IntegratedProfile | null> => {
      const { data, error } = await supabase
        .from('integrated_profiles')
        .select('*')
        .eq('child_id', childId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as IntegratedProfile | null;
    },
    enabled: !!childId,
  });

  const generateProfile = useCallback(async (
    childId: string,
    cognitiveData?: {
      attention: number; inhibition: number; memory: number;
      flexibility: number; coordination: number; persistence: number;
      overall: number; sessionsCount: number;
    },
    executiveData?: {
      autonomyScore: number; completionRate: number;
      consistencyScore: number; organizationIndex: number;
      executionsCount: number;
    },
    socioemotionalData?: {
      empathy: number; impulseControl: number;
      flexibility: number; overall: number;
      decisionsCount: number;
    }
  ) => {
    const layers: LayerSummary[] = [];
    const recommendations: string[] = [];

    // Assess Layer 1
    if (cognitiveData && cognitiveData.sessionsCount >= 3) {
      layers.push({ layer: 1, name: 'Bateria Cognitiva', score: cognitiveData.overall, dataPoints: cognitiveData.sessionsCount, status: cognitiveData.sessionsCount >= 6 ? 'complete' : 'partial', icon: 'brain' });
      if (cognitiveData.attention < 40) recommendations.push('Atenção sustentada abaixo do esperado - considerar atividades de foco progressivo');
      if (cognitiveData.memory < 40) recommendations.push('Memória operacional requer reforço - exercícios de span com dificuldade gradual');
    }

    // Assess Layer 2
    if (executiveData && executiveData.executionsCount >= 5) {
      layers.push({ layer: 2, name: 'Organização Executiva', score: executiveData.organizationIndex, dataPoints: executiveData.executionsCount, status: executiveData.executionsCount >= 14 ? 'complete' : 'partial', icon: 'calendar' });
      if (executiveData.autonomyScore < 50) recommendations.push('Autonomia na rotina precisa de desenvolvimento - reduzir lembretes gradualmente');
      if (executiveData.completionRate < 60) recommendations.push('Taxa de conclusão baixa - simplificar rotinas e celebrar completude');
    }

    // Assess Layer 3
    if (socioemotionalData && socioemotionalData.decisionsCount >= 10) {
      layers.push({ layer: 3, name: 'Socioemocional', score: socioemotionalData.overall, dataPoints: socioemotionalData.decisionsCount, status: socioemotionalData.decisionsCount >= 20 ? 'complete' : 'partial', icon: 'heart' });
      if (socioemotionalData.impulseControl < 40) recommendations.push('Controle inibitório socioemocional baixo - integrar pausas reflexivas nas histórias');
      if (socioemotionalData.empathy < 40) recommendations.push('Empatia cognitiva em desenvolvimento - priorizar histórias com perspectiva do outro');
    }

    // Generate interpretation
    const activeScores = layers.filter(l => l.score !== null).map(l => l.score!);
    const globalAvg = activeScores.length > 0 ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length) : null;

    let interpretation = '';
    if (layers.length === 0) {
      interpretation = 'Dados insuficientes para gerar perfil integrado. Continue utilizando os módulos.';
    } else if (layers.length === 1) {
      interpretation = `Perfil parcial com dados de ${layers[0].name}. Recomenda-se completar os outros módulos para visão completa.`;
    } else if (layers.length === 2) {
      interpretation = `Perfil com ${layers.map(l => l.name).join(' e ')}. Falta ${layers.length === 2 ? 'um módulo' : ''} para visão 360°.`;
    } else {
      if (globalAvg && globalAvg >= 70) {
        interpretation = 'Perfil integrado indica desenvolvimento adequado nas três dimensões avaliadas.';
      } else if (globalAvg && globalAvg >= 50) {
        interpretation = 'Perfil integrado indica áreas em desenvolvimento. Monitoramento contínuo recomendado.';
      } else {
        interpretation = 'Perfil integrado indica necessidade de atenção em múltiplas dimensões. Intervenção recomendada.';
      }
    }

    const { data, error } = await supabase
      .from('integrated_profiles')
      .insert({
        child_id: childId,
        cognitive_attention: cognitiveData?.attention ?? null,
        cognitive_inhibition: cognitiveData?.inhibition ?? null,
        cognitive_memory: cognitiveData?.memory ?? null,
        cognitive_flexibility: cognitiveData?.flexibility ?? null,
        cognitive_coordination: cognitiveData?.coordination ?? null,
        cognitive_persistence: cognitiveData?.persistence ?? null,
        cognitive_overall: cognitiveData?.overall ?? null,
        executive_autonomy_score: executiveData?.autonomyScore ?? null,
        executive_completion_rate: executiveData?.completionRate ?? null,
        executive_consistency_score: executiveData?.consistencyScore ?? null,
        executive_organization_index: executiveData?.organizationIndex ?? null,
        socioemotional_empathy: socioemotionalData?.empathy ?? null,
        socioemotional_impulse_control: socioemotionalData?.impulseControl ?? null,
        socioemotional_flexibility: socioemotionalData?.flexibility ?? null,
        socioemotional_overall: socioemotionalData?.overall ?? null,
        layer1_sessions_count: cognitiveData?.sessionsCount ?? 0,
        layer2_executions_count: executiveData?.executionsCount ?? 0,
        layer3_decisions_count: socioemotionalData?.decisionsCount ?? 0,
        interpretation,
        recommendations,
      })
      .select()
      .single();

    if (error) throw error;
    return data as IntegratedProfile;
  }, []);

  const getHistory = useCallback(async (childId: string) => {
    const { data, error } = await supabase
      .from('integrated_profiles')
      .select('*')
      .eq('child_id', childId)
      .order('generated_at', { ascending: true })
      .limit(20);

    if (error) throw error;
    return (data || []) as IntegratedProfile[];
  }, []);

  return {
    profile: query.data,
    isLoading: query.isLoading,
    generateProfile,
    getHistory,
    refetch: query.refetch,
  };
}
