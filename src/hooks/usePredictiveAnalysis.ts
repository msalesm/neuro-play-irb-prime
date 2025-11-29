import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PredictiveAnalysisResult {
  id: string;
  analysis: string;
  analysisType: 'crisis_detection' | 'behavioral_trend' | 'intervention_recommendation';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  dataSummary: any;
}

interface RiskIndicator {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  indicators: string[];
  recommendations: string[];
  timeline: string;
}

export const usePredictiveAnalysis = (childProfileId?: string) => {
  const [analyses, setAnalyses] = useState<PredictiveAnalysisResult[]>([]);
  const [riskIndicator, setRiskIndicator] = useState<RiskIndicator | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (childProfileId) {
      loadPredictiveAnalyses();
    }
  }, [childProfileId]);

  const loadPredictiveAnalyses = async () => {
    if (!childProfileId) return;

    try {
      setLoading(true);

      // Load recent predictive analyses from behavioral_insights
      const { data: insights, error } = await supabase
        .from('behavioral_insights')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .in('insight_type', ['predictive_crisis_detection', 'predictive_behavioral_trend', 'predictive_intervention_recommendation'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedAnalyses: PredictiveAnalysisResult[] = (insights || []).map(insight => ({
        id: insight.id,
        analysis: (insight.supporting_data as any)?.fullAnalysis || insight.description,
        analysisType: insight.insight_type.replace('predictive_', '') as any,
        severity: insight.severity as any,
        timestamp: insight.created_at,
        dataSummary: (insight.supporting_data as any)?.dataSummary || {},
      }));

      setAnalyses(formattedAnalyses);

      // Extract risk indicator from most recent crisis detection
      const crisisAnalysis = formattedAnalyses.find(a => a.analysisType === 'crisis_detection');
      if (crisisAnalysis) {
        setRiskIndicator(parseRiskFromAnalysis(crisisAnalysis));
      }

    } catch (error) {
      console.error('Error loading predictive analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPredictiveAnalysis = async (
    analysisType: 'crisis_detection' | 'behavioral_trend' | 'intervention_recommendation',
    timeRangeDays: number = 30
  ) => {
    if (!childProfileId) {
      toast.error('Nenhum perfil de criança selecionado');
      return null;
    }

    try {
      setAnalyzing(true);
      toast.loading('Executando análise preditiva...', { id: 'predictive-analysis' });

      const { data, error } = await supabase.functions.invoke('predictive-analysis', {
        body: {
          childProfileId,
          analysisType,
          timeRangeDays,
        },
      });

      if (error) throw error;

      toast.dismiss('predictive-analysis');

      if (data.success) {
        toast.success('Análise preditiva concluída!');
        await loadPredictiveAnalyses(); // Reload to get new analysis
        return data;
      } else {
        throw new Error(data.error || 'Análise falhou');
      }

    } catch (error: any) {
      console.error('Error running predictive analysis:', error);
      toast.dismiss('predictive-analysis');
      toast.error('Erro ao executar análise preditiva');
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const detectCrisisRisk = async (timeRangeDays: number = 14) => {
    return runPredictiveAnalysis('crisis_detection', timeRangeDays);
  };

  const analyzeBehavioralTrends = async (timeRangeDays: number = 30) => {
    return runPredictiveAnalysis('behavioral_trend', timeRangeDays);
  };

  const generateInterventionRecommendations = async (timeRangeDays: number = 30) => {
    return runPredictiveAnalysis('intervention_recommendation', timeRangeDays);
  };

  const parseRiskFromAnalysis = (analysis: PredictiveAnalysisResult): RiskIndicator => {
    const text = analysis.analysis.toLowerCase();
    
    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (text.includes('crítico') || text.includes('alto risco')) level = 'critical';
    else if (text.includes('alto') || text.includes('preocupante')) level = 'high';
    else if (text.includes('médio') || text.includes('atenção')) level = 'medium';

    // Extract score (0-100)
    const scoreMatch = text.match(/(\d+)%/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : level === 'critical' ? 90 : level === 'high' ? 70 : level === 'medium' ? 40 : 20;

    // Extract indicators (simplified)
    const indicators: string[] = [];
    if (text.includes('frustração')) indicators.push('Aumento de frustração');
    if (text.includes('desempenho')) indicators.push('Declínio de desempenho');
    if (text.includes('humor')) indicators.push('Mudanças no humor');
    if (text.includes('isolamento')) indicators.push('Padrão de isolamento');

    // Extract recommendations (simplified)
    const recommendations: string[] = [];
    if (text.includes('intervenção')) recommendations.push('Considere intervenção profissional');
    if (text.includes('rotina')) recommendations.push('Ajuste rotina diária');
    if (text.includes('comunicação')) recommendations.push('Aumentar comunicação empática');

    // Extract timeline
    let timeline = 'próximos 7-14 dias';
    if (text.includes('urgente') || text.includes('imediato')) timeline = 'próximas 24-48 horas';
    else if (text.includes('curto prazo')) timeline = 'próximos 3-5 dias';

    return {
      level,
      score,
      indicators: indicators.length > 0 ? indicators : ['Análise em andamento'],
      recommendations: recommendations.length > 0 ? recommendations : ['Monitorar de perto'],
      timeline,
    };
  };

  return {
    analyses,
    riskIndicator,
    loading,
    analyzing,
    detectCrisisRisk,
    analyzeBehavioralTrends,
    generateInterventionRecommendations,
    reload: loadPredictiveAnalyses,
  };
};
