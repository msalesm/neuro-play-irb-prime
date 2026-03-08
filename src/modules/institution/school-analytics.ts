/**
 * School Analytics
 * 
 * Aggregate metrics across all classes in a school.
 */

import type { ClassAnalytics } from './class-analytics';

// ─── Types ────────────────────────────────────────────────

export interface SchoolAnalytics {
  institutionId: string;
  institutionName: string;
  calculatedAt: string;
  totalStudents: number;
  totalClasses: number;
  overallCognitiveAvg: number;
  overallEngagement: number;
  domainAverages: Record<string, number>;
  classComparisons: ClassComparison[];
  topPerformingClasses: string[];
  classesNeedingAttention: string[];
  evolutionIndicator: 'improving' | 'stable' | 'declining';
}

export interface ClassComparison {
  classId: string;
  className: string;
  studentCount: number;
  overallAvg: number;
  engagement: number;
  strongestDomain: string;
  weakestDomain: string;
  studentsNeedingSupport: number;
}

// ─── Calculator ───────────────────────────────────────────

export function calculateSchoolAnalytics(
  institutionId: string,
  institutionName: string,
  classesData: ClassAnalytics[]
): SchoolAnalytics {
  if (classesData.length === 0) {
    return emptySchoolAnalytics(institutionId, institutionName);
  }

  const totalStudents = classesData.reduce((s, c) => s + c.studentCount, 0);

  // Aggregate domain averages across all classes (weighted by student count)
  const domainAverages: Record<string, number> = {};
  const domainSums: Record<string, { sum: number; count: number }> = {};

  for (const cls of classesData) {
    for (const da of cls.domainAverages) {
      if (!domainSums[da.domain]) domainSums[da.domain] = { sum: 0, count: 0 };
      domainSums[da.domain].sum += da.avgScore * cls.studentCount;
      domainSums[da.domain].count += cls.studentCount;
    }
  }
  for (const [domain, { sum, count }] of Object.entries(domainSums)) {
    domainAverages[domain] = count > 0 ? Math.round(sum / count) : 50;
  }

  const overallCognitiveAvg = Object.values(domainAverages).length > 0
    ? Math.round(Object.values(domainAverages).reduce((a, b) => a + b, 0) / Object.values(domainAverages).length)
    : 50;

  const overallEngagement = classesData.length > 0
    ? Math.round(classesData.reduce((s, c) => s + c.overallEngagement * c.studentCount, 0) / totalStudents)
    : 0;

  // Class comparisons
  const classComparisons: ClassComparison[] = classesData.map(cls => {
    const sorted = [...cls.domainAverages].sort((a, b) => a.avgScore - b.avgScore);
    return {
      classId: cls.classId,
      className: cls.className,
      studentCount: cls.studentCount,
      overallAvg: cls.domainAverages.length > 0
        ? Math.round(cls.domainAverages.reduce((s, d) => s + d.avgScore, 0) / cls.domainAverages.length)
        : 50,
      engagement: cls.overallEngagement,
      strongestDomain: sorted.length > 0 ? sorted[sorted.length - 1].domainLabel : 'N/A',
      weakestDomain: sorted.length > 0 ? sorted[0].domainLabel : 'N/A',
      studentsNeedingSupport: cls.riskDistribution.needsSupport,
    };
  });

  const sortedClasses = [...classComparisons].sort((a, b) => b.overallAvg - a.overallAvg);
  
  return {
    institutionId,
    institutionName,
    calculatedAt: new Date().toISOString(),
    totalStudents,
    totalClasses: classesData.length,
    overallCognitiveAvg,
    overallEngagement,
    domainAverages,
    classComparisons,
    topPerformingClasses: sortedClasses.slice(0, 3).map(c => c.className),
    classesNeedingAttention: sortedClasses.filter(c => c.overallAvg < 50 || c.studentsNeedingSupport > c.studentCount * 0.3).map(c => c.className),
    evolutionIndicator: 'stable', // Would need historical snapshots
  };
}

// ─── Support ──────────────────────────────────────────────

export function identifyClassesNeedingAttention(
  analytics: SchoolAnalytics,
  thresholdAvg = 50,
  thresholdSupportPct = 0.3
): ClassComparison[] {
  return analytics.classComparisons.filter(c => 
    c.overallAvg < thresholdAvg || 
    c.studentsNeedingSupport / Math.max(1, c.studentCount) > thresholdSupportPct
  );
}

function emptySchoolAnalytics(id: string, name: string): SchoolAnalytics {
  return {
    institutionId: id, institutionName: name,
    calculatedAt: new Date().toISOString(),
    totalStudents: 0, totalClasses: 0,
    overallCognitiveAvg: 0, overallEngagement: 0,
    domainAverages: {},
    classComparisons: [],
    topPerformingClasses: [],
    classesNeedingAttention: [],
    evolutionIndicator: 'stable',
  };
}
