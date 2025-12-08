import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmotionalAnalysis {
  id: string;
  child_id: string;
  analysis_date: string;
  emotional_state: string;
  confidence_score: number;
  detected_patterns: any[];
  recommendations: any[];
  created_at: string;
}

export interface SmartRecommendation {
  recommendedGames: Array<{
    gameId: string;
    reason: string;
    suggestedDifficulty: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  recommendedStories: Array<{
    storyId: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  suggestedRoutine?: {
    name: string;
    activities: string[];
    reason: string;
  };
  parentAlerts: Array<{
    type: string;
    message: string;
    actionUrl?: string;
  }>;
  modeRecommendation: 'normal' | 'calm' | 'focus';
  overallInsight: string;
}

export function useEmotionalAI(childId?: string) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<SmartRecommendation | null>(null);
  const { toast } = useToast();

  const runEmotionalAnalysis = useCallback(async (analysisType = 'emotional_state') => {
    if (!childId) return null;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('emotional-ai-analysis', {
        body: { childId, analysisType }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis({
          id: data.savedId,
          child_id: childId,
          analysis_date: new Date().toISOString().split('T')[0],
          emotional_state: data.analysis.emotionalState,
          confidence_score: data.analysis.confidenceScore,
          detected_patterns: data.analysis.detectedPatterns,
          recommendations: data.analysis.recommendations,
          created_at: new Date().toISOString()
        });
      }

      return data;
    } catch (error) {
      console.error('Emotional analysis error:', error);
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível realizar a análise emocional',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [childId, toast]);

  const getSmartRecommendations = useCallback(async (context?: any) => {
    if (!childId) return null;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-recommendations', {
        body: { childId, context }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }

      return data?.recommendations;
    } catch (error) {
      console.error('Recommendations error:', error);
      toast({
        title: 'Erro nas recomendações',
        description: 'Não foi possível gerar recomendações',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [childId, toast]);

  const loadLatestAnalysis = useCallback(async () => {
    if (!childId) return;

    try {
      const { data, error } = await supabase
        .from('ai_emotional_analysis')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAnalysis(data as EmotionalAnalysis);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    }
  }, [childId]);

  return {
    isAnalyzing,
    analysis,
    recommendations,
    runEmotionalAnalysis,
    getSmartRecommendations,
    loadLatestAnalysis
  };
}
