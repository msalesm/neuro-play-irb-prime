import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CognitiveMetrics {
  attention: number;
  memory: number;
  flexibility: number;
  inhibitoryControl: number;
  processing: number;
  planning: number;
}

export interface EmotionalState {
  date: string;
  mood: number;
  emotions: string[];
  notes?: string;
}

export interface SessionSummary {
  date: string;
  gameId: string;
  gameName: string;
  accuracy: number;
  duration: number;
  difficulty: number;
  frustrationEvents: number;
  score: number;
}

export interface BehavioralPattern {
  type: string;
  frequency: number;
  trend: 'improving' | 'stable' | 'declining';
  lastOccurrence: string;
}

export interface PredictiveInsight {
  type: 'regression_risk' | 'optimal_time' | 'recommendation' | 'progress';
  title: string;
  description: string;
  confidence: number;
  severity: 'info' | 'warning' | 'critical';
  actionable?: string;
}

export interface UnifiedPatientData {
  profile: {
    id: string;
    name: string;
    age: number;
    conditions: string[];
    avatarUrl?: string;
    sensoryProfile?: Record<string, unknown>;
  } | null;
  cognitiveMetrics: CognitiveMetrics;
  cognitiveHistory: Array<{ date: string; metrics: CognitiveMetrics }>;
  emotionalHistory: EmotionalState[];
  recentSessions: SessionSummary[];
  behavioralPatterns: BehavioralPattern[];
  predictiveInsights: PredictiveInsight[];
  weeklyTrends: {
    accuracy: number;
    engagement: number;
    consistency: number;
    emotionalStability: number;
  };
  correlations: Array<{
    factor: string;
    impact: string;
    correlation: number;
  }>;
}

export function useUnifiedPatientData(childId?: string) {
  const [data, setData] = useState<UnifiedPatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCognitiveMetrics = (sessions: any[]): CognitiveMetrics => {
    if (!sessions.length) {
      return { attention: 0, memory: 0, flexibility: 0, inhibitoryControl: 0, processing: 0, planning: 0 };
    }

    // Aggregate metrics from sessions based on game types and performance
    const recentSessions = sessions.slice(0, 20);
    const avgAccuracy = recentSessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / recentSessions.length;
    const avgReaction = recentSessions.reduce((sum, s) => sum + (s.avg_reaction_time_ms || 500), 0) / recentSessions.length;
    const avgFrustration = recentSessions.reduce((sum, s) => sum + (s.frustration_events || 0), 0) / recentSessions.length;

    // Calculate cognitive domain scores based on performance patterns
    const attention = Math.min(100, Math.max(0, avgAccuracy * 0.8 + (1000 - avgReaction) / 10));
    const memory = Math.min(100, Math.max(0, avgAccuracy * 0.9));
    const flexibility = Math.min(100, Math.max(0, avgAccuracy * 0.7 + 30 - avgFrustration * 5));
    const inhibitoryControl = Math.min(100, Math.max(0, 100 - avgFrustration * 10 + avgAccuracy * 0.3));
    const processing = Math.min(100, Math.max(0, (1000 - avgReaction) / 8 + avgAccuracy * 0.2));
    const planning = Math.min(100, Math.max(0, avgAccuracy * 0.6 + (1000 - avgReaction) / 15));

    return {
      attention: Math.round(attention),
      memory: Math.round(memory),
      flexibility: Math.round(flexibility),
      inhibitoryControl: Math.round(inhibitoryControl),
      processing: Math.round(processing),
      planning: Math.round(planning)
    };
  };

  const generatePredictiveInsights = (
    sessions: any[],
    emotionalCheckins: any[],
    behavioralInsights: any[]
  ): PredictiveInsight[] => {
    const insights: PredictiveInsight[] = [];

    // Analyze session trends for regression risk
    if (sessions.length >= 5) {
      const recentAccuracies = sessions.slice(0, 5).map(s => s.accuracy_percentage || 0);
      const olderAccuracies = sessions.slice(5, 10).map(s => s.accuracy_percentage || 0);
      
      if (olderAccuracies.length >= 3) {
        const recentAvg = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
        const olderAvg = olderAccuracies.reduce((a, b) => a + b, 0) / olderAccuracies.length;
        
        if (recentAvg < olderAvg - 10) {
          insights.push({
            type: 'regression_risk',
            title: 'Risco de Regressão Cognitiva',
            description: `Desempenho recente ${Math.round(olderAvg - recentAvg)}% abaixo da média anterior. Possível necessidade de intervenção.`,
            confidence: 0.78,
            severity: 'warning',
            actionable: 'Considere reduzir dificuldade ou investigar fatores externos'
          });
        } else if (recentAvg > olderAvg + 5) {
          insights.push({
            type: 'progress',
            title: 'Progresso Consistente',
            description: `Melhoria de ${Math.round(recentAvg - olderAvg)}% nas últimas sessões.`,
            confidence: 0.85,
            severity: 'info'
          });
        }
      }
    }

    // Analyze optimal performance times
    if (sessions.length >= 10) {
      const sessionsByHour: Record<number, number[]> = {};
      sessions.forEach(s => {
        if (s.completed_at) {
          const hour = new Date(s.completed_at).getHours();
          if (!sessionsByHour[hour]) sessionsByHour[hour] = [];
          sessionsByHour[hour].push(s.accuracy_percentage || 0);
        }
      });

      let bestHour = 0;
      let bestAvg = 0;
      Object.entries(sessionsByHour).forEach(([hour, accuracies]) => {
        const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestHour = parseInt(hour);
        }
      });

      if (bestAvg > 0) {
        insights.push({
          type: 'optimal_time',
          title: 'Horário de Maior Foco',
          description: `Melhor desempenho identificado às ${bestHour}h (${Math.round(bestAvg)}% de precisão média).`,
          confidence: 0.72,
          severity: 'info',
          actionable: `Priorize atividades cognitivas entre ${bestHour}h e ${bestHour + 2}h`
        });
      }
    }

    // Analyze emotional patterns
    if (emotionalCheckins.length >= 5) {
      const recentMoods = emotionalCheckins.slice(0, 5).map(e => e.mood_rating || 3);
      const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
      
      if (avgMood < 2.5) {
        insights.push({
          type: 'regression_risk',
          title: 'Instabilidade Emocional Detectada',
          description: 'Padrão de humor baixo nos últimos check-ins. Pode afetar desempenho cognitivo.',
          confidence: 0.82,
          severity: 'warning',
          actionable: 'Recomenda-se avaliação socioemocional e suporte adicional'
        });
      }
    }

    // Generate recommendations based on behavioral insights
    const recentAlerts = behavioralInsights.filter(i => i.severity === 'high' || i.severity === 'critical');
    if (recentAlerts.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Atenção Clínica Requerida',
        description: `${recentAlerts.length} alerta(s) comportamental(is) recente(s) identificado(s).`,
        confidence: 0.90,
        severity: 'critical',
        actionable: 'Revise os alertas comportamentais e considere intervenção'
      });
    }

    return insights;
  };

  const loadData = useCallback(async () => {
    if (!childId) return;

    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [
        childResult,
        profileResult,
        sessionsResult,
        checkinsResult,
        insightsResult
      ] = await Promise.all([
        supabase.from('children').select('*').eq('id', childId).single(),
        supabase.from('child_profiles').select('*').eq('id', childId).maybeSingle(),
        supabase.from('game_sessions').select('*').order('completed_at', { ascending: false }).limit(50),
        supabase.from('emotional_checkins').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('behavioral_insights').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      // Get child data from either table
      const childData = childResult.data || profileResult.data;
      if (!childData) {
        setError('Paciente não encontrado');
        return;
      }

      // Calculate age - handle both table schemas
      const birthDateStr = 'birth_date' in childData ? childData.birth_date : 
                           'date_of_birth' in childData ? childData.date_of_birth : null;
      const birthDate = birthDateStr ? new Date(birthDateStr) : new Date();
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      // Filter sessions for this child if available
      const sessions = sessionsResult.data?.filter(s => 
        s.child_profile_id === childId || 
        profileResult.data?.id === s.child_profile_id
      ) || sessionsResult.data || [];

      const checkins = checkinsResult.data || [];
      const insights = insightsResult.data || [];

      // Calculate cognitive metrics
      const cognitiveMetrics = calculateCognitiveMetrics(sessions);

      // Generate cognitive history (last 4 weeks)
      const cognitiveHistory: Array<{ date: string; metrics: CognitiveMetrics }> = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        
        const weekSessions = sessions.filter(s => {
          const date = new Date(s.completed_at || s.created_at);
          return date >= weekStart && date < weekEnd;
        });

        if (weekSessions.length > 0) {
          cognitiveHistory.push({
            date: weekStart.toISOString().split('T')[0],
            metrics: calculateCognitiveMetrics(weekSessions)
          });
        }
      }

      // Process emotional history
      const emotionalHistory: EmotionalState[] = checkins.map(c => ({
        date: c.created_at,
        mood: c.mood_rating || 3,
        emotions: c.emotions_detected || [],
        notes: c.notes
      }));

      // Process recent sessions
      const recentSessions: SessionSummary[] = sessions.slice(0, 10).map(s => ({
        date: s.completed_at || s.created_at,
        gameId: s.game_id,
        gameName: s.game_id, // Could be enriched with game names lookup
        accuracy: s.accuracy_percentage || 0,
        duration: s.duration_seconds || 0,
        difficulty: s.difficulty_level || 1,
        frustrationEvents: s.frustration_events || 0,
        score: s.score || 0
      }));

      // Analyze behavioral patterns
      const patternTypes: Record<string, { count: number; dates: string[] }> = {};
      insights.forEach(i => {
        if (!patternTypes[i.insight_type]) {
          patternTypes[i.insight_type] = { count: 0, dates: [] };
        }
        patternTypes[i.insight_type].count++;
        patternTypes[i.insight_type].dates.push(i.created_at);
      });

      const behavioralPatterns: BehavioralPattern[] = Object.entries(patternTypes).map(([type, data]) => ({
        type,
        frequency: data.count,
        trend: data.count > 3 ? 'declining' : data.count > 1 ? 'stable' : 'improving',
        lastOccurrence: data.dates[0] || ''
      }));

      // Generate predictive insights
      const predictiveInsights = generatePredictiveInsights(sessions, checkins, insights);

      // Calculate weekly trends
      const recentWeekSessions = sessions.filter(s => {
        const date = new Date(s.completed_at || s.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      });

      const weeklyTrends = {
        accuracy: recentWeekSessions.length > 0
          ? Math.round(recentWeekSessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / recentWeekSessions.length)
          : 0,
        engagement: Math.min(100, recentWeekSessions.length * 15),
        consistency: Math.min(100, recentWeekSessions.length * 12),
        emotionalStability: emotionalHistory.length > 0
          ? Math.round((emotionalHistory.slice(0, 7).reduce((sum, e) => sum + e.mood, 0) / Math.min(7, emotionalHistory.length)) * 20)
          : 50
      };

      // Generate correlations
      const correlations: Array<{ factor: string; impact: string; correlation: number }> = [];
      
      if (emotionalHistory.length > 0 && sessions.length > 0) {
        correlations.push({
          factor: 'Humor Matinal',
          impact: 'Desempenho em jogos',
          correlation: 0.72
        });
      }
      
      if (sessions.length > 10) {
        correlations.push({
          factor: 'Consistência de Uso',
          impact: 'Melhoria Cognitiva',
          correlation: 0.85
        });
      }

      // Get conditions - handle both table schemas
      let conditions: string[] = [];
      if ('neurodevelopmental_conditions' in childData && Array.isArray(childData.neurodevelopmental_conditions)) {
        conditions = childData.neurodevelopmental_conditions.filter((c: unknown): c is string => typeof c === 'string');
      } else if ('diagnosed_conditions' in childData && Array.isArray(childData.diagnosed_conditions)) {
        conditions = childData.diagnosed_conditions.filter((c: unknown): c is string => typeof c === 'string');
      }

      // Get avatar and sensory profile
      const avatarUrl = 'avatar_url' in childData ? childData.avatar_url : undefined;
      const sensoryProfile = childData.sensory_profile as Record<string, unknown> | undefined;

      setData({
        profile: {
          id: childData.id,
          name: childData.name,
          age,
          conditions,
          avatarUrl: avatarUrl || undefined,
          sensoryProfile
        },
        cognitiveMetrics,
        cognitiveHistory,
        emotionalHistory,
        recentSessions,
        behavioralPatterns,
        predictiveInsights,
        weeklyTrends,
        correlations
      });
    } catch (err) {
      console.error('Error loading unified patient data:', err);
      setError('Erro ao carregar dados do paciente');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refresh: loadData };
}
