/**
 * Class Analytics
 * 
 * Aggregated analytics for a class of students.
 * Uses anonymized, educational-only language.
 */

// ─── Types ────────────────────────────────────────────────

export interface ClassAnalytics {
  classId: string;
  className: string;
  studentCount: number;
  calculatedAt: string;
  domainAverages: ClassDomainAverage[];
  overallEngagement: number;     // 0-100
  avgCompletionRate: number;     // 0-100
  riskDistribution: {
    adequate: number;
    monitoring: number;
    needsSupport: number;
  };
  topStrengths: string[];
  areasNeedingAttention: string[];
}

export interface ClassDomainAverage {
  domain: string;
  domainLabel: string;
  avgScore: number;
  minScore: number;
  maxScore: number;
  stdDeviation: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface StudentSummary {
  studentId: string;
  studentName: string;
  overallScore: number;
  weakestDomain: string;
  strongestDomain: string;
  engagementLevel: 'high' | 'moderate' | 'low';
  needsSupport: boolean;
}

interface StudentData {
  studentId: string;
  studentName: string;
  domainScores: Record<string, number>;
  sessionsCompleted: number;
  lastActivity: string;
}

// ─── Calculator ───────────────────────────────────────────

export function calculateClassAnalytics(
  classId: string,
  className: string,
  students: StudentData[]
): ClassAnalytics {
  if (students.length === 0) {
    return emptyClassAnalytics(classId, className);
  }

  const domains = ['attention', 'memory', 'flexibility', 'persistence', 'inhibition', 'coordination'];
  const domainLabels: Record<string, string> = {
    attention: 'Atenção',
    memory: 'Memória',
    flexibility: 'Flexibilidade',
    persistence: 'Persistência',
    inhibition: 'Autocontrole',
    coordination: 'Coordenação',
  };

  const domainAverages: ClassDomainAverage[] = domains.map(domain => {
    const scores = students
      .map(s => s.domainScores[domain])
      .filter(s => s !== undefined && s !== null);

    if (scores.length === 0) {
      return {
        domain,
        domainLabel: domainLabels[domain] || domain,
        avgScore: 50,
        minScore: 0,
        maxScore: 0,
        stdDeviation: 0,
        trend: 'stable' as const,
      };
    }

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / scores.length;

    return {
      domain,
      domainLabel: domainLabels[domain] || domain,
      avgScore: Math.round(avg),
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      stdDeviation: Math.round(Math.sqrt(variance) * 10) / 10,
      trend: 'stable' as const, // Would need historical data
    };
  });

  // Overall engagement based on sessions completed
  const totalSessions = students.reduce((s, st) => s + st.sessionsCompleted, 0);
  const avgSessions = totalSessions / students.length;
  const overallEngagement = Math.min(100, Math.round(avgSessions * 10));

  // Risk distribution
  const overallScores = students.map(s => {
    const scores = Object.values(s.domainScores);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  });
  const riskDistribution = {
    adequate: overallScores.filter(s => s >= 65).length,
    monitoring: overallScores.filter(s => s >= 45 && s < 65).length,
    needsSupport: overallScores.filter(s => s < 45).length,
  };

  // Top strengths and areas needing attention
  const sortedDomains = [...domainAverages].sort((a, b) => b.avgScore - a.avgScore);
  const topStrengths = sortedDomains.filter(d => d.avgScore >= 65).map(d => d.domainLabel);
  const areasNeedingAttention = sortedDomains.filter(d => d.avgScore < 50).map(d => d.domainLabel);

  return {
    classId,
    className,
    studentCount: students.length,
    calculatedAt: new Date().toISOString(),
    domainAverages,
    overallEngagement,
    avgCompletionRate: Math.round(avgSessions > 0 ? Math.min(100, avgSessions * 15) : 0),
    riskDistribution,
    topStrengths,
    areasNeedingAttention,
  };
}

// ─── Support Identification ───────────────────────────────

export function identifyStudentsNeedingSupport(
  students: StudentData[],
  threshold = 45
): StudentSummary[] {
  return students.map(student => {
    const scores = Object.entries(student.domainScores);
    if (scores.length === 0) {
    const engagementLevel: 'high' | 'moderate' | 'low' = student.sessionsCompleted >= 10 ? 'high' : student.sessionsCompleted >= 3 ? 'moderate' : 'low';
        overallScore: 50,
        weakestDomain: 'N/A',
        strongestDomain: 'N/A',
        engagementLevel: 'low' as const,
        needsSupport: false,
      };
    }

    const sortedScores = [...scores].sort((a, b) => a[1] - b[1]);
    const overallScore = Math.round(scores.reduce((s, [, v]) => s + v, 0) / scores.length);

    return {
      studentId: student.studentId,
      studentName: student.studentName,
      overallScore,
      weakestDomain: sortedScores[0][0],
      strongestDomain: sortedScores[sortedScores.length - 1][0],
      engagementLevel: student.sessionsCompleted >= 10 ? 'high' : student.sessionsCompleted >= 3 ? 'moderate' : 'low',
      needsSupport: overallScore < threshold,
    };
  }).sort((a, b) => a.overallScore - b.overallScore);
}

function emptyClassAnalytics(classId: string, className: string): ClassAnalytics {
  return {
    classId, className,
    studentCount: 0,
    calculatedAt: new Date().toISOString(),
    domainAverages: [],
    overallEngagement: 0,
    avgCompletionRate: 0,
    riskDistribution: { adequate: 0, monitoring: 0, needsSupport: 0 },
    topStrengths: [],
    areasNeedingAttention: [],
  };
}
