import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Types for behavioral analysis
export interface BehavioralMetric {
  id: string;
  userId: string;
  gameType: string;
  sessionId: string;
  metrics: {
    // Attention metrics
    attentionSpan?: number;
    distractability?: number;
    vigilanceDecrement?: number;
    
    // Executive function metrics
    workingMemory?: number;
    cognitiveFlexibility?: number;
    inhibitoryControl?: number;
    
    // Social cognition metrics
    emotionRecognition?: number;
    socialCueing?: number;
    theoryOfMind?: number;
    
    // Motor coordination metrics
    reactionTime?: number;
    motorPlanning?: number;
    visualMotorIntegration?: number;
    
    // Language processing metrics
    phonologicalProcessing?: number;
    sequentialProcessing?: number;
    rapidNaming?: number;
  };
  riskIndicators: {
    teaRisk?: number;
    tdahRisk?: number;
    dislexiaRisk?: number;
  };
  timestamp: Date;
  sessionDuration: number;
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
  const [patterns, setPatterns] = useState<DiagnosticPattern[]>([]);

  // Save behavioral metric
  const saveBehavioralMetric = useCallback(async (metric: Omit<BehavioralMetric, 'id' | 'userId' | 'timestamp'>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('behavioral_patterns')
        .insert({
          user_id: user.id,
          pattern_type: 'diagnostic_session',
          pattern_data: {
            gameType: metric.gameType,
            sessionId: metric.sessionId,
            metrics: metric.metrics,
            riskIndicators: metric.riskIndicators,
            sessionDuration: metric.sessionDuration
          },
          strength: calculateOverallRisk(metric.riskIndicators),
          confidence: calculateConfidence(metric.metrics),
          last_observed: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      
      // Refresh metrics after saving
      await fetchBehavioralMetrics();
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
        .from('behavioral_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('pattern_type', 'diagnostic_session')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMetrics: BehavioralMetric[] = data?.map(item => {
        const patternData = item.pattern_data as any;
        return {
          id: item.id,
          userId: item.user_id,
          gameType: patternData.gameType,
          sessionId: patternData.sessionId,
          metrics: patternData.metrics,
          riskIndicators: patternData.riskIndicators,
          timestamp: new Date(item.created_at),
          sessionDuration: patternData.sessionDuration
        };
      }) || [];

      setMetrics(formattedMetrics);
    } catch (error) {
      console.error('Error fetching behavioral metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Generate clinical report
  const generateClinicalReport = useCallback(async () => {
    if (!user?.id || metrics.length === 0) return;

    try {
      setLoading(true);
      
      // Analyze patterns from metrics
      const analysisResults = analyzePatterns(metrics);
      
      const report: ClinicalReport = {
        userId: user.id,
        generatedAt: new Date(),
        overallRiskAssessment: calculateOverallRiskAssessment(metrics),
        patterns: analysisResults.patterns,
        behavioralTrends: identifyTrends(metrics),
        interventionSuggestions: generateInterventionSuggestions(analysisResults.patterns)
      };

      setCurrentReport(report);
      setPatterns(analysisResults.patterns);

      // Save report to database
      await supabase
        .from('behavioral_patterns')
        .insert({
          user_id: user.id,
          pattern_type: 'clinical_report',
          pattern_data: JSON.parse(JSON.stringify(report)),
          strength: Math.max(
            report.overallRiskAssessment.tea,
            report.overallRiskAssessment.tdah,
            report.overallRiskAssessment.dislexia
          ),
          confidence: calculateReportConfidence(report),
          last_observed: new Date().toISOString().split('T')[0]
        });

    } catch (error) {
      console.error('Error generating clinical report:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, metrics]);

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
    saveBehavioralMetric,
    fetchBehavioralMetrics,
    generateClinicalReport
  };
};

// Helper functions for analysis
function calculateOverallRisk(riskIndicators: BehavioralMetric['riskIndicators']): number {
  const values = Object.values(riskIndicators).filter(v => v !== undefined) as number[];
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function calculateConfidence(metrics: BehavioralMetric['metrics']): number {
  const filledMetrics = Object.values(metrics).filter(v => v !== undefined).length;
  const totalMetrics = Object.keys(metrics).length;
  return filledMetrics / totalMetrics;
}

function analyzePatterns(metrics: BehavioralMetric[]): { patterns: DiagnosticPattern[] } {
  const patterns: DiagnosticPattern[] = [];
  
  // TEA pattern analysis
  const teaIndicators = analyzeTEAPatterns(metrics);
  if (teaIndicators.confidence > 0.3) {
    patterns.push(teaIndicators);
  }
  
  // TDAH pattern analysis
  const tdahIndicators = analyzeTDAHPatterns(metrics);
  if (tdahIndicators.confidence > 0.3) {
    patterns.push(tdahIndicators);
  }
  
  // Dislexia pattern analysis
  const dislexiaIndicators = analyzeDislexiaPatterns(metrics);
  if (dislexiaIndicators.confidence > 0.3) {
    patterns.push(dislexiaIndicators);
  }
  
  return { patterns };
}

function analyzeTEAPatterns(metrics: BehavioralMetric[]): DiagnosticPattern {
  const relevantMetrics = metrics.filter(m => 
    m.metrics.socialCueing !== undefined || 
    m.metrics.emotionRecognition !== undefined ||
    m.metrics.cognitiveFlexibility !== undefined
  );
  
  const avgSocialCueing = calculateAverage(relevantMetrics.map(m => m.metrics.socialCueing));
  const avgEmotionRecognition = calculateAverage(relevantMetrics.map(m => m.metrics.emotionRecognition));
  const avgCognitiveFlexibility = calculateAverage(relevantMetrics.map(m => m.metrics.cognitiveFlexibility));
  
  const indicators: string[] = [];
  let confidence = 0;
  
  if (avgSocialCueing < 0.6) {
    indicators.push('Dificuldades em pistas sociais');
    confidence += 0.3;
  }
  
  if (avgEmotionRecognition < 0.5) {
    indicators.push('Reconhecimento de emoções reduzido');
    confidence += 0.4;
  }
  
  if (avgCognitiveFlexibility < 0.4) {
    indicators.push('Rigidez cognitiva');
    confidence += 0.3;
  }
  
  return {
    condition: 'TEA',
    confidence: Math.min(confidence, 1.0),
    keyIndicators: indicators,
    recommendations: [
      'Avaliação com especialista em TEA',
      'Intervenções sociais estruturadas',
      'Desenvolvimento de habilidades de comunicação'
    ],
    nextSteps: [
      'Agendar consulta com neuropediatra',
      'Aplicar mais jogos de habilidades sociais',
      'Envolver família no processo terapêutico'
    ]
  };
}

function analyzeTDAHPatterns(metrics: BehavioralMetric[]): DiagnosticPattern {
  const relevantMetrics = metrics.filter(m => 
    m.metrics.attentionSpan !== undefined || 
    m.metrics.inhibitoryControl !== undefined ||
    m.metrics.distractability !== undefined
  );
  
  const avgAttentionSpan = calculateAverage(relevantMetrics.map(m => m.metrics.attentionSpan));
  const avgInhibitoryControl = calculateAverage(relevantMetrics.map(m => m.metrics.inhibitoryControl));
  const avgDistractability = calculateAverage(relevantMetrics.map(m => m.metrics.distractability));
  
  const indicators: string[] = [];
  let confidence = 0;
  
  if (avgAttentionSpan < 0.5) {
    indicators.push('Déficit de atenção sustentada');
    confidence += 0.4;
  }
  
  if (avgInhibitoryControl < 0.6) {
    indicators.push('Controle inibitório reduzido');
    confidence += 0.3;
  }
  
  if (avgDistractability > 0.7) {
    indicators.push('Alta distractibilidade');
    confidence += 0.3;
  }
  
  return {
    condition: 'TDAH',
    confidence: Math.min(confidence, 1.0),
    keyIndicators: indicators,
    recommendations: [
      'Avaliação neuropsicológica completa',
      'Estratégias de organização e planejamento',
      'Técnicas de mindfulness e autorregulação'
    ],
    nextSteps: [
      'Consulta com neurologista infantil',
      'Implementar rotinas estruturadas',
      'Jogos de foco e concentração'
    ]
  };
}

function analyzeDislexiaPatterns(metrics: BehavioralMetric[]): DiagnosticPattern {
  const relevantMetrics = metrics.filter(m => 
    m.metrics.phonologicalProcessing !== undefined || 
    m.metrics.sequentialProcessing !== undefined ||
    m.metrics.rapidNaming !== undefined
  );
  
  const avgPhonological = calculateAverage(relevantMetrics.map(m => m.metrics.phonologicalProcessing));
  const avgSequential = calculateAverage(relevantMetrics.map(m => m.metrics.sequentialProcessing));
  const avgRapidNaming = calculateAverage(relevantMetrics.map(m => m.metrics.rapidNaming));
  
  const indicators: string[] = [];
  let confidence = 0;
  
  if (avgPhonological < 0.5) {
    indicators.push('Dificuldades no processamento fonológico');
    confidence += 0.4;
  }
  
  if (avgSequential < 0.6) {
    indicators.push('Processamento sequencial comprometido');
    confidence += 0.3;
  }
  
  if (avgRapidNaming < 0.5) {
    indicators.push('Nomeação rápida reduzida');
    confidence += 0.3;
  }
  
  return {
    condition: 'Dislexia',
    confidence: Math.min(confidence, 1.0),
    keyIndicators: indicators,
    recommendations: [
      'Avaliação fonoaudiológica especializada',
      'Métodos de leitura multissensoriais',
      'Apoio pedagógico especializado'
    ],
    nextSteps: [
      'Consulta com fonoaudiólogo',
      'Aplicar jogos de processamento fonológico',
      'Adaptações curriculares se necessário'
    ]
  };
}

function calculateOverallRiskAssessment(metrics: BehavioralMetric[]): ClinicalReport['overallRiskAssessment'] {
  const teaRisks = metrics.map(m => m.riskIndicators.teaRisk).filter(r => r !== undefined) as number[];
  const tdahRisks = metrics.map(m => m.riskIndicators.tdahRisk).filter(r => r !== undefined) as number[];
  const dislexiaRisks = metrics.map(m => m.riskIndicators.dislexiaRisk).filter(r => r !== undefined) as number[];
  
  return {
    tea: calculateAverage(teaRisks),
    tdah: calculateAverage(tdahRisks),
    dislexia: calculateAverage(dislexiaRisks)
  };
}

function identifyTrends(metrics: BehavioralMetric[]): ClinicalReport['behavioralTrends'] {
  // Simplified trend analysis - in a real implementation, this would be more sophisticated
  return {
    improving: ['Tempo de reação', 'Controle inibitório'],
    stable: ['Reconhecimento de emoções', 'Flexibilidade cognitiva'],
    declining: []
  };
}

function generateInterventionSuggestions(patterns: DiagnosticPattern[]): string[] {
  const allRecommendations = patterns.flatMap(p => p.recommendations);
  return [...new Set(allRecommendations)]; // Remove duplicates
}

function calculateReportConfidence(report: ClinicalReport): number {
  const avgConfidence = report.patterns.reduce((acc, p) => acc + p.confidence, 0) / report.patterns.length;
  return avgConfidence || 0;
}

function calculateAverage(values: (number | undefined)[]): number {
  const validValues = values.filter(v => v !== undefined) as number[];
  return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
}