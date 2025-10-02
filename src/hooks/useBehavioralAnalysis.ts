import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Types for behavioral analysis
export interface BehavioralMetric {
  id: string;
  userId: string;
  metricType: string;
  category: string;
  value: number;
  contextData?: Record<string, any>;
  sessionId?: string;
  gameId?: string;
  timestamp: Date;
}

export interface DiagnosticPattern {
  condition: 'TEA' | 'TDAH' | 'Dislexia';
  confidence: number;
  keyIndicators: string[];
  recommendations: string[];
  nextSteps: string[];
}

export interface ClinicalReport {
  userId: string;
  generatedAt: Date;
  overallRiskAssessment: {
    tea: number;
    tdah: number;
    dislexia: number;
  };
  patterns: DiagnosticPattern[];
  behavioralTrends: {
    improving: string[];
    stable: string[];
    declining: string[];
  };
  interventionSuggestions: string[];
}

export const useBehavioralAnalysis = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<BehavioralMetric[]>([]);
  const [currentReport, setCurrentReport] = useState<ClinicalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'fetching' | 'analyzing' | 'generating'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<DiagnosticPattern[]>([]);

  // Save behavioral metric
  const saveBehavioralMetric = useCallback(async (metric: Omit<BehavioralMetric, 'id' | 'userId' | 'timestamp'>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('behavioral_metrics')
        .insert({
          user_id: user.id,
          metric_type: metric.metricType,
          category: metric.category,
          value: metric.value,
          context_data: metric.contextData || {},
          session_id: metric.sessionId,
          game_id: metric.gameId
        })
        .select()
        .single();

      if (error) throw error;

      const newMetric: BehavioralMetric = {
        id: data.id,
        userId: user.id,
        timestamp: new Date(data.timestamp),
        metricType: data.metric_type,
        category: data.category,
        value: data.value,
        contextData: (data.context_data as Record<string, any>) || {},
        sessionId: data.session_id,
        gameId: data.game_id
      };
      
      setMetrics(prev => [newMetric, ...prev]);
    } catch (error) {
      console.error('Error saving behavioral metric:', error);
    }
  }, [user?.id]);

  // Fetch behavioral metrics
  const fetchBehavioralMetrics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('behavioral_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const formattedMetrics: BehavioralMetric[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        metricType: item.metric_type,
        category: item.category,
        value: item.value,
        contextData: (item.context_data as Record<string, any>) || {},
        sessionId: item.session_id,
        gameId: item.game_id,
        timestamp: new Date(item.timestamp)
      }));

      setMetrics(formattedMetrics);
    } catch (error) {
      console.error('Error fetching behavioral metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Generate clinical report
  const generateClinicalReport = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setLoadingState('fetching');
      setError(null);
      
      console.log('🔍 Iniciando geração de relatório clínico...');
      
      // Define período de análise (últimos 3 meses)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      setLoadingState('analyzing');
      
      // Chamar edge function
      const { data, error } = await supabase.functions.invoke(
        'generate-clinical-report',
        {
          body: {
            userId: user.id,
            startDate,
            endDate,
            reportType: 'comprehensive'
          }
        }
      );

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Mensagens específicas baseadas no tipo de erro
        if (error.message?.includes('404') || error.message?.includes('No data')) {
          setError('Nenhuma sessão encontrada. Complete alguns jogos de diagnóstico primeiro!');
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError('Erro ao gerar relatório. Tente novamente em alguns instantes.');
        }
        
        throw new Error(error.message || 'Failed to generate report');
      }

      if (data.status === 'error') {
        console.error('❌ Report generation error:', data);
        setError(data.message || 'Falha ao gerar relatório');
        throw new Error(data.message || 'Report generation failed');
      }

      setLoadingState('generating');

      // Converter dados da edge function para formato do componente
      const report: ClinicalReport = {
        userId: user.id,
        generatedAt: new Date(data.generatedAt),
        overallRiskAssessment: {
          tea: data.data.behavioral?.errorPatterns?.cognitive || 0,
          tdah: data.data.behavioral?.errorPatterns?.attention || 0,
          dislexia: data.data.behavioral?.errorPatterns?.impulsive || 0,
        },
        patterns: Object.entries(data.data.cognitiveScores || {}).map(
          ([category, scores]: [string, any]) => ({
            condition: category.toUpperCase() as 'TEA' | 'TDAH' | 'Dislexia',
            confidence: Math.min((scores.improvement || 50) / 100, 1),
            keyIndicators: [`Acurácia: ${scores.avgAccuracy?.toFixed(1) || 0}%`, `Nível: ${scores.currentLevel || 1}`],
            recommendations: data.data.aiAnalysis?.recommendations || [],
            nextSteps: ['Continuar praticando regularmente'],
          })
        ),
        behavioralTrends: {
          improving: data.data.aiAnalysis?.strengths || [],
          stable: [],
          declining: data.data.aiAnalysis?.areasOfConcern || [],
        },
        interventionSuggestions: data.data.aiAnalysis?.recommendations || [],
      };

      setCurrentReport(report);
      setPatterns(report.patterns);
      setLoadingState('idle');

      console.log('✅ Relatório clínico gerado com sucesso:', data.reportId);
      console.log(`📊 Fonte de dados: ${data.data?.dataSource || 'unknown'}`);
      console.log(`📈 Sessões analisadas: ${data.data?.sessionsAnalyzed || 0}`);
    } catch (error: any) {
      console.error('❌ Erro ao gerar relatório clínico:', error);
      setLoadingState('idle');
      
      // Se não definiu erro específico ainda, definir genérico
      if (!error) {
        setError('Erro desconhecido ao gerar relatório');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchBehavioralMetrics();
    }
  }, [user?.id, fetchBehavioralMetrics]);

  return {
    metrics,
    currentReport,
    patterns,
    loading,
    loadingState,
    error,
    saveBehavioralMetric,
    fetchBehavioralMetrics,
    generateClinicalReport
  };
};

// Helper functions
function analyzePatterns(metrics: BehavioralMetric[]): { patterns: DiagnosticPattern[] } {
  const patterns: DiagnosticPattern[] = [];
  
  // TEA pattern analysis
  const socialMetrics = metrics.filter(m => 
    m.category === 'social_cognition' || 
    m.metricType === 'theory_of_mind'
  );
  
  if (socialMetrics.length > 0) {
    const avgScore = calculateAverage(socialMetrics.map(m => m.value));
    if (avgScore < 0.6) {
      patterns.push({
        condition: 'TEA',
        confidence: 1 - avgScore,
        keyIndicators: ['Dificuldades em teoria da mente', 'Cognição social comprometida'],
        recommendations: ['Avaliação especializada', 'Intervenções sociais'],
        nextSteps: ['Consulta com neuropediatra', 'Jogos sociais']
      });
    }
  }
  
  // TDAH pattern analysis
  const attentionMetrics = metrics.filter(m => 
    m.category === 'attention' || 
    m.metricType === 'working_memory'
  );
  
  if (attentionMetrics.length > 0) {
    const avgScore = calculateAverage(attentionMetrics.map(m => m.value));
    if (avgScore < 0.6) {
      patterns.push({
        condition: 'TDAH',
        confidence: 1 - avgScore,
        keyIndicators: ['Déficit de atenção', 'Memória de trabalho comprometida'],
        recommendations: ['Avaliação neuropsicológica', 'Estratégias de organização'],
        nextSteps: ['Consulta neurologista', 'Jogos de concentração']
      });
    }
  }
  
  return { patterns };
}

function calculateOverallRiskAssessment(metrics: BehavioralMetric[]): ClinicalReport['overallRiskAssessment'] {
  const socialMetrics = metrics.filter(m => m.category === 'social_cognition');
  const attentionMetrics = metrics.filter(m => m.category === 'attention' || m.category === 'cognitive');
  const languageMetrics = metrics.filter(m => m.category === 'language');
  
  return {
    tea: socialMetrics.length > 0 ? 1 - calculateAverage(socialMetrics.map(m => m.value)) : 0,
    tdah: attentionMetrics.length > 0 ? 1 - calculateAverage(attentionMetrics.map(m => m.value)) : 0,
    dislexia: languageMetrics.length > 0 ? 1 - calculateAverage(languageMetrics.map(m => m.value)) : 0
  };
}

function identifyTrends(metrics: BehavioralMetric[]): ClinicalReport['behavioralTrends'] {
  return {
    improving: ['Memória de trabalho'],
    stable: ['Teoria da mente'],
    declining: []
  };
}

function generateInterventionSuggestions(patterns: DiagnosticPattern[]): string[] {
  const allRecommendations = patterns.flatMap(p => p.recommendations);
  return [...new Set(allRecommendations)];
}

function calculateAverage(values: (number | undefined)[]): number {
  const validValues = values.filter(v => v !== undefined) as number[];
  return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
}