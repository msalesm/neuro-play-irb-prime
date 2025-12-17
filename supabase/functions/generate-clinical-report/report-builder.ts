import { ReportData, GeneralMetrics, BehavioralPatterns, TemporalDataPoint, NeurodiversityProfile } from "./types.ts";

interface ReportBuilderInput {
  userId: string;
  startDate: string;
  endDate: string;
  reportType: string;
  generalMetrics: GeneralMetrics;
  temporalEvolution: TemporalDataPoint[];
  behavioralPatterns: BehavioralPatterns;
  aiAnalysis: any;
  neurodiversityProfile: NeurodiversityProfile | null;
}

export function buildReport(input: ReportBuilderInput): ReportData {
  const {
    userId,
    startDate,
    endDate,
    generalMetrics,
    temporalEvolution,
    behavioralPatterns,
    aiAnalysis
  } = input;

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Map cognitive scores to standard domains
  const cognitiveScores = generalMetrics.cognitiveScores;
  const mappedCognitive = {
    attention: 0,
    memory: 0,
    language: 0,
    logic: 0,
    emotion: 0,
    coordination: 0
  };

  // Map game categories to cognitive domains
  Object.entries(cognitiveScores).forEach(([category, data]: [string, any]) => {
    const catLower = category.toLowerCase();
    const score = typeof data === 'object' ? (data.avgAccuracy || 0) : (Number(data) || 0);
    
    if (catLower.includes('attention') || catLower.includes('atenção') || catLower.includes('foco') || catLower.includes('focus')) {
      mappedCognitive.attention = Math.max(mappedCognitive.attention, score);
    } else if (catLower.includes('memory') || catLower.includes('memória') || catLower.includes('memoria')) {
      mappedCognitive.memory = Math.max(mappedCognitive.memory, score);
    } else if (catLower.includes('language') || catLower.includes('linguagem') || catLower.includes('dislexia') || catLower.includes('dyslexia')) {
      mappedCognitive.language = Math.max(mappedCognitive.language, score);
    } else if (catLower.includes('logic') || catLower.includes('lógica') || catLower.includes('logica') || catLower.includes('raciocínio') || catLower.includes('executive')) {
      mappedCognitive.logic = Math.max(mappedCognitive.logic, score);
    } else if (catLower.includes('emotion') || catLower.includes('emoção') || catLower.includes('emocao') || catLower.includes('tea') || catLower.includes('autism')) {
      mappedCognitive.emotion = Math.max(mappedCognitive.emotion, score);
    } else if (catLower.includes('coordination') || catLower.includes('coordenação') || catLower.includes('motor')) {
      mappedCognitive.coordination = Math.max(mappedCognitive.coordination, score);
    } else if (catLower.includes('tdah') || catLower.includes('adhd')) {
      mappedCognitive.attention = Math.max(mappedCognitive.attention, score);
    } else if (catLower.includes('screening')) {
      // For screenings, distribute scores based on type
      if (catLower.includes('tea')) mappedCognitive.emotion = Math.max(mappedCognitive.emotion, score);
      else if (catLower.includes('tdah')) mappedCognitive.attention = Math.max(mappedCognitive.attention, score);
      else if (catLower.includes('dislexia')) mappedCognitive.language = Math.max(mappedCognitive.language, score);
    } else {
      // Generic fallback - distribute to logic
      mappedCognitive.logic = Math.max(mappedCognitive.logic, score);
    }
  });

  // Calculate total play time in minutes
  const totalPlayTime = generalMetrics.totalDurationMinutes || 0;

  const reportData: ReportData = {
    demographic: {
      userId,
      period: { start: startDate, end: endDate },
      totalDays
    },
    general: {
      totalSessions: generalMetrics.totalSessions,
      totalDurationMinutes: generalMetrics.totalDurationMinutes,
      totalPlayTime: totalPlayTime,
      avgAccuracy: generalMetrics.avgAccuracy,
      avgReactionTime: generalMetrics.avgReactionTime,
      completionRate: generalMetrics.completionRate
    },
    cognitive: mappedCognitive,
    cognitiveScores: generalMetrics.cognitiveScores,
    temporalEvolution,
    behavioral: behavioralPatterns
  };

  // Add AI analysis if available
  if (aiAnalysis) {
    reportData.aiAnalysis = {
      executiveSummary: aiAnalysis.executiveSummary || 'Análise não disponível',
      domainAnalysis: aiAnalysis.domainAnalysis || {},
      strengths: Array.isArray(aiAnalysis.strengths) ? aiAnalysis.strengths : [],
      areasOfConcern: Array.isArray(aiAnalysis.areasOfConcern) ? aiAnalysis.areasOfConcern : [],
      recommendations: Array.isArray(aiAnalysis.recommendations) ? aiAnalysis.recommendations : [],
      diagnosticIndicators: Array.isArray(aiAnalysis.diagnosticIndicators) ? aiAnalysis.diagnosticIndicators : []
    };
  }

  return reportData;
}
