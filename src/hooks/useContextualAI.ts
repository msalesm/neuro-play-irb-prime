import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AIRecommendation {
  id: string;
  type: 'game' | 'routine' | 'story' | 'intervention' | 'insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  reasoning?: string;
  confidence: number;
}

interface PredictiveInsight {
  id: string;
  category: 'risk' | 'progress' | 'opportunity';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  metrics?: Record<string, number>;
  recommendations?: string[];
  timestamp: string;
}

interface ChildContext {
  childId: string;
  name: string;
  age: number;
  conditions: string[];
  recentPerformance: {
    averageAccuracy: number;
    sessionsThisWeek: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  emotionalState: {
    lastMood: number;
    trend: 'positive' | 'neutral' | 'concerning';
  };
}

export function useContextualAI() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [childContext, setChildContext] = useState<ChildContext | null>(null);

  // Fetch child context for personalized recommendations
  const fetchChildContext = useCallback(async (childId: string) => {
    if (!user) return null;

    try {
      // Get child profile
      const { data: childProfile, error: profileError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .single();

      if (profileError) throw profileError;

      // Get recent game sessions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: recentSessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', childId)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get recent emotional check-ins
      const { data: recentEmotions, error: emotionsError } = await supabase
        .from('emotional_checkins')
        .select('*')
        .eq('child_profile_id', childId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (emotionsError) throw emotionsError;

      // Calculate metrics
      const birthDate = new Date(childProfile.date_of_birth);
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      const avgAccuracy = recentSessions?.length
        ? recentSessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / recentSessions.length
        : 0;

      // Calculate performance trend
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentSessions && recentSessions.length >= 4) {
        const recent = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
        const older = recentSessions.slice(-Math.floor(recentSessions.length / 2));
        const recentAvg = recent.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / older.length;
        if (recentAvg - olderAvg > 5) trend = 'improving';
        else if (recentAvg - olderAvg < -5) trend = 'declining';
      }

      // Calculate emotional trend
      const avgMood = recentEmotions?.length
        ? recentEmotions.reduce((sum, e) => sum + (e.mood_rating || 5), 0) / recentEmotions.length
        : 5;
      const emotionalTrend = avgMood >= 7 ? 'positive' : avgMood <= 4 ? 'concerning' : 'neutral';

      const context: ChildContext = {
        childId,
        name: childProfile.name,
        age,
        conditions: childProfile.diagnosed_conditions || [],
        recentPerformance: {
          averageAccuracy: avgAccuracy,
          sessionsThisWeek: recentSessions?.length || 0,
          trend,
        },
        emotionalState: {
          lastMood: recentEmotions?.[0]?.mood_rating || 5,
          trend: emotionalTrend,
        },
      };

      setChildContext(context);
      return context;
    } catch (error) {
      console.error('Error fetching child context:', error);
      return null;
    }
  }, [user]);

  // Generate personalized recommendations
  const generateRecommendations = useCallback(async (childId: string) => {
    if (!user) return [];

    setIsLoading(true);
    try {
      const context = await fetchChildContext(childId);
      if (!context) return [];

      const { data, error } = await supabase.functions.invoke('generate-game-recommendations', {
        body: {
          childProfileId: childId,
          includeReasons: true,
        }
      });

      if (error) throw error;

      // Transform to AIRecommendation format
      const aiRecs: AIRecommendation[] = (data?.recommendations || []).map((rec: any, index: number) => ({
        id: `rec-${index}`,
        type: 'game' as const,
        title: rec.gameName || rec.name,
        description: rec.reason || rec.description,
        priority: rec.priority || 'medium',
        actionUrl: rec.path,
        reasoning: rec.reason,
        confidence: rec.matchScore || 0.8,
      }));

      // Add contextual recommendations based on child state
      if (context.emotionalState.trend === 'concerning') {
        aiRecs.unshift({
          id: 'emotional-checkin',
          type: 'intervention',
          title: 'Check-in Emocional Sugerido',
          description: 'Detectamos uma tendência de humor baixo. Considere fazer um check-in emocional.',
          priority: 'high',
          actionUrl: '/therapeutic-chat',
          reasoning: 'Baseado nos últimos registros emocionais',
          confidence: 0.9,
        });
      }

      if (context.recentPerformance.sessionsThisWeek < 3) {
        aiRecs.push({
          id: 'engagement-boost',
          type: 'insight',
          title: 'Aumentar Engajamento',
          description: `${context.name} jogou apenas ${context.recentPerformance.sessionsThisWeek} vezes esta semana. Tente incorporar jogos na rotina diária.`,
          priority: 'medium',
          reasoning: 'Engajamento regular melhora resultados terapêuticos',
          confidence: 0.85,
        });
      }

      if (context.recentPerformance.trend === 'declining') {
        aiRecs.unshift({
          id: 'performance-alert',
          type: 'insight',
          title: 'Atenção ao Desempenho',
          description: 'Notamos um declínio no desempenho recente. Considere ajustar a dificuldade ou verificar fatores externos.',
          priority: 'high',
          reasoning: 'Declínio de desempenho pode indicar necessidade de ajuste',
          confidence: 0.8,
        });
      }

      setRecommendations(aiRecs);
      return aiRecs;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchChildContext]);

  // Run predictive analysis
  const runPredictiveAnalysis = useCallback(async (
    childId: string,
    analysisType: 'crisis_detection' | 'behavioral_trend' | 'intervention_recommendation'
  ) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predictive-analysis', {
        body: {
          childProfileId: childId,
          analysisType,
          timeRangeDays: 30,
        }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        const insight: PredictiveInsight = {
          id: `insight-${Date.now()}`,
          category: analysisType === 'crisis_detection' ? 'risk' : 
                   analysisType === 'behavioral_trend' ? 'progress' : 'opportunity',
          title: analysisType === 'crisis_detection' ? 'Análise de Risco' :
                 analysisType === 'behavioral_trend' ? 'Tendências Comportamentais' : 'Recomendações de Intervenção',
          description: data.analysis.substring(0, 300) + '...',
          severity: extractSeverity(data.analysis),
          metrics: data.dataSummary?.gamePerformance,
          recommendations: extractRecommendations(data.analysis),
          timestamp: new Date().toISOString(),
        };

        setPredictiveInsights(prev => [insight, ...prev.slice(0, 4)]);
        return insight;
      }

      return null;
    } catch (error) {
      console.error('Error running predictive analysis:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get smart context for AI assistant
  const getSmartContext = useCallback(async () => {
    if (!user) return null;

    try {
      // Get user's children
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id, name, birth_date, neurodevelopmental_conditions')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (childrenError) throw childrenError;

      // Get recent activity summary
      const { data: recentSessions, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;

      // Get recent insights
      const { data: insights, error: insightsError } = await supabase
        .from('behavioral_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (insightsError) throw insightsError;

      return {
        children: children || [],
        recentActivityCount: recentSessions?.length || 0,
        hasRecentInsights: (insights?.length || 0) > 0,
        userEngagementLevel: (recentSessions?.length || 0) > 5 ? 'high' : 
                             (recentSessions?.length || 0) > 2 ? 'medium' : 'low',
      };
    } catch (error) {
      console.error('Error getting smart context:', error);
      return null;
    }
  }, [user]);

  return {
    isLoading,
    recommendations,
    predictiveInsights,
    childContext,
    fetchChildContext,
    generateRecommendations,
    runPredictiveAnalysis,
    getSmartContext,
  };
}

// Helper functions
function extractSeverity(analysis: string): 'critical' | 'warning' | 'info' | 'positive' {
  const lower = analysis.toLowerCase();
  if (lower.includes('crítico') || lower.includes('urgente') || lower.includes('alto risco')) return 'critical';
  if (lower.includes('atenção') || lower.includes('alerta') || lower.includes('moderado')) return 'warning';
  if (lower.includes('positivo') || lower.includes('progresso') || lower.includes('melhora')) return 'positive';
  return 'info';
}

function extractRecommendations(analysis: string): string[] {
  const recommendations: string[] = [];
  const lines = analysis.split('\n');
  let inRecommendations = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('recomend') || line.toLowerCase().includes('sugest')) {
      inRecommendations = true;
    }
    if (inRecommendations && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
      recommendations.push(line.replace(/^[-•\d.]+\s*/, '').trim());
    }
    if (recommendations.length >= 5) break;
  }

  return recommendations;
}
