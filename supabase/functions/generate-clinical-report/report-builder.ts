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

  const reportData: ReportData = {
    demographic: {
      userId,
      period: { start: startDate, end: endDate },
      totalDays
    },
    general: {
      totalSessions: generalMetrics.totalSessions,
      totalDurationMinutes: generalMetrics.totalDurationMinutes,
      avgAccuracy: generalMetrics.avgAccuracy,
      avgReactionTime: generalMetrics.avgReactionTime,
      completionRate: generalMetrics.completionRate
    },
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
