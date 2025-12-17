import { SessionData, GeneralMetrics, BehavioralPatterns, TemporalDataPoint, SessionsQueryResult } from "./types.ts";

const getAccuracyPercent = (session: SessionData): number | null => {
  const pd = session.performance_data || {};

  // Support multiple shapes from different game modules
  const raw =
    (pd as any).accuracy ??
    (pd as any).accuracy_percentage ??
    (pd as any).accuracyPercentage ??
    (pd as any).accuracyPercent ??
    (session as any).accuracy_percentage ??
    (session as any).accuracy ??
    null;

  if (typeof raw !== 'number' || Number.isNaN(raw)) return null;

  // If value looks like a ratio (0..1), convert to percent
  if (raw >= 0 && raw <= 1) return Math.round(raw * 10000) / 100;

  return Math.max(0, Math.min(100, Math.round(raw * 100) / 100));
};

const getReactionTimeMs = (session: SessionData): number | null => {
  const pd = session.performance_data || {};
  const raw =
    (pd as any).reaction_time ??
    (pd as any).reaction_time_ms ??
    (pd as any).avg_reaction_time_ms ??
    (pd as any).reactionTime ??
    (session as any).avg_reaction_time_ms ??
    (session as any).reaction_time_ms ??
    null;

  if (typeof raw !== 'number' || Number.isNaN(raw)) return null;
  return Math.max(0, Math.round(raw));
};

export function calculateMetrics(sessionsData: SessionsQueryResult): GeneralMetrics {
  const { sessions, trailsData } = sessionsData;

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalDurationMinutes: 0,
      avgAccuracy: 0,
      avgReactionTime: 0,
      completionRate: 0,
      cognitiveScores: {}
    };
  }

  // Calculate general metrics
  let totalAccuracy = 0;
  let totalReactionTime = 0;
  let totalDuration = 0;
  let completedSessions = 0;
  let validAccuracyCount = 0;
  let validReactionTimeCount = 0;


  sessions.forEach(session => {
    const accuracy = getAccuracyPercent(session);
    const reactionTime = getReactionTimeMs(session);

    if (typeof accuracy === 'number') {
      totalAccuracy += accuracy;
      validAccuracyCount++;
    }

    if (typeof reactionTime === 'number') {
      totalReactionTime += reactionTime;
      validReactionTimeCount++;
    }

    if (session.completed_at) {
      completedSessions++;
      const duration = new Date(session.completed_at).getTime() - new Date(session.created_at).getTime();
      totalDuration += duration;
    }
  });

  const avgAccuracy = validAccuracyCount > 0 ? totalAccuracy / validAccuracyCount : 0;
  const avgReactionTime = validReactionTimeCount > 0 ? totalReactionTime / validReactionTimeCount : 0;
  const totalDurationMinutes = Math.round(totalDuration / (1000 * 60));
  const completionRate = (completedSessions / sessions.length) * 100;

  // Calculate cognitive scores by category
  const cognitiveScores: { [category: string]: any } = {};
  const categoryGroups: { [category: string]: SessionData[] } = {};

  sessions.forEach(session => {
    const category = session.cognitive_category;
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(session);
  });

  Object.entries(categoryGroups).forEach(([category, categorySessions]) => {
    const categoryAccuracies = categorySessions
      .map(s => getAccuracyPercent(s))
      .filter((a): a is number => typeof a === 'number');

    const avgCategoryAccuracy = categoryAccuracies.length > 0
      ? categoryAccuracies.reduce((sum, a) => sum + a, 0) / categoryAccuracies.length
      : 0;

    const trailInfo = trailsData[category] || { initialLevel: 1, currentLevel: 1, totalXP: 0 };
    
    // Calculate improvement
    const firstSessionAccuracies = categorySessions.slice(0, Math.ceil(categorySessions.length * 0.2))
      .map(s => getAccuracyPercent(s))
      .filter((a): a is number => typeof a === 'number');

    const lastSessionAccuracies = categorySessions.slice(-Math.ceil(categorySessions.length * 0.2))
      .map(s => getAccuracyPercent(s))
      .filter((a): a is number => typeof a === 'number');

    const initialAvg = firstSessionAccuracies.length > 0
      ? firstSessionAccuracies.reduce((sum, a) => sum + a, 0) / firstSessionAccuracies.length
      : avgCategoryAccuracy;

    const currentAvg = lastSessionAccuracies.length > 0
      ? lastSessionAccuracies.reduce((sum, a) => sum + a, 0) / lastSessionAccuracies.length
      : avgCategoryAccuracy;

    const improvement = initialAvg > 0 ? ((currentAvg - initialAvg) / initialAvg) * 100 : 0;

    cognitiveScores[category] = {
      currentLevel: trailInfo.currentLevel,
      initialLevel: trailInfo.initialLevel,
      totalXP: trailInfo.totalXP,
      sessionsCompleted: categorySessions.length,
      avgAccuracy: Math.round(avgCategoryAccuracy * 100) / 100,
      improvement: Math.round(improvement * 100) / 100
    };
  });

  return {
    totalSessions: sessions.length,
    totalDurationMinutes,
    avgAccuracy: Math.round(avgAccuracy * 100) / 100,
    avgReactionTime: Math.round(avgReactionTime),
    completionRate: Math.round(completionRate * 100) / 100,
    cognitiveScores
  };
}

export function analyzeTemporalEvolution(sessions: SessionData[]): TemporalDataPoint[] {
  if (sessions.length === 0) return [];

  // Group sessions by date
  const dateGroups: { [date: string]: SessionData[] } = {};

  sessions.forEach(session => {
    const date = session.created_at.split('T')[0];
    if (!dateGroups[date]) {
      dateGroups[date] = [];
    }
    dateGroups[date].push(session);
  });

  // Calculate metrics for each date
  const evolution: TemporalDataPoint[] = Object.entries(dateGroups)
    .map(([date, dateSessions]) => {
      const accuracies = dateSessions
        .map(s => getAccuracyPercent(s))
        .filter((a): a is number => typeof a === 'number');

      const reactionTimes = dateSessions
        .map(s => getReactionTimeMs(s))
        .filter((r): r is number => typeof r === 'number');

      const avgAccuracy = accuracies.length > 0
        ? accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length
        : 0;

      const avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce((sum, r) => sum + r, 0) / reactionTimes.length
        : 0;

      return {
        date,
        accuracy: Math.round(avgAccuracy * 100) / 100,
        sessionCount: dateSessions.length,
        avgReactionTime: Math.round(avgReactionTime)
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return evolution;
}

export function analyzeBehavioralPatterns(sessions: SessionData[]): BehavioralPatterns {
  if (sessions.length === 0) {
    return {
      errorPatterns: { impulsive: 0, attention: 0, cognitive: 0 },
      bestPerformanceTime: 'Unknown',
      consistencyScore: 0,
      strugglesDetected: []
    };
  }

  // Analyze struggles detected
  const allStruggles: string[] = [];
  sessions.forEach(session => {
    if (session.struggles_detected && Array.isArray(session.struggles_detected)) {
      allStruggles.push(...session.struggles_detected);
    }
  });

  const uniqueStruggles = [...new Set(allStruggles)];

  // Categorize error patterns based on struggles
  let impulsiveErrors = 0;
  let attentionErrors = 0;
  let cognitiveErrors = 0;

  allStruggles.forEach(struggle => {
    const lowerStruggle = struggle.toLowerCase();
    if (lowerStruggle.includes('impuls') || lowerStruggle.includes('rush') || lowerStruggle.includes('rápid')) {
      impulsiveErrors++;
    } else if (lowerStruggle.includes('atenção') || lowerStruggle.includes('distração') || lowerStruggle.includes('foco')) {
      attentionErrors++;
    } else {
      cognitiveErrors++;
    }
  });

  // Find best performance time
  const hourGroups: { [hour: number]: number[] } = {};
  
  sessions.forEach(session => {
    const hour = new Date(session.created_at).getHours();
    const accuracy = getAccuracyPercent(session);

    if (typeof accuracy === 'number') {
      if (!hourGroups[hour]) {
        hourGroups[hour] = [];
      }
      hourGroups[hour].push(accuracy);
    }
  });

  let bestHour = 0;
  let bestAvgAccuracy = 0;

  Object.entries(hourGroups).forEach(([hour, accuracies]) => {
    const avgAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
    if (avgAccuracy > bestAvgAccuracy) {
      bestAvgAccuracy = avgAccuracy;
      bestHour = parseInt(hour);
    }
  });

  const bestPerformanceTime = bestHour >= 0 && bestHour < 24
    ? `${bestHour.toString().padStart(2, '0')}:00 - ${(bestHour + 1).toString().padStart(2, '0')}:00`
    : 'Unknown';

  // Calculate consistency score (inverse of standard deviation)
  const accuracies = sessions
    .map(s => getAccuracyPercent(s))
    .filter((a): a is number => typeof a === 'number');

  let consistencyScore = 5;
  if (accuracies.length > 1) {
    const mean = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to 0-10 scale (lower stdDev = higher consistency)
    consistencyScore = Math.max(0, Math.min(10, 10 - (stdDev / 10)));
  }

  return {
    errorPatterns: {
      impulsive: impulsiveErrors,
      attention: attentionErrors,
      cognitive: cognitiveErrors
    },
    bestPerformanceTime,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    strugglesDetected: uniqueStruggles
  };
}
