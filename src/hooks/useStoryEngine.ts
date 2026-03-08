import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DecisionPoint {
  id: string;
  story_id: string;
  step_order: number;
  question_text: string;
  decision_type: 'moral' | 'emotional' | 'strategic' | 'social';
  options: DecisionOption[];
  correct_option_index: number | null;
}

export interface DecisionOption {
  label: string;
  description?: string;
  trait_tags?: string[]; // e.g. ['empathy', 'impulsive', 'avoidant']
}

export interface StoryDecision {
  id: string;
  decision_point_id: string;
  user_id: string;
  child_id: string | null;
  story_id: string;
  selected_option_index: number;
  response_time_ms: number | null;
  changed_answer: boolean;
  change_count: number;
}

export interface SocioemotionalMetrics {
  empathyScore: number; // 0-100
  impulseControlScore: number; // 0-100
  socialFlexibilityScore: number; // 0-100
  conflictAvoidanceScore: number; // 0-100
  moralConsistencyScore: number; // 0-100
  frustrationToleranceScore: number; // 0-100
  overallScore: number;
  avgDecisionLatencyMs: number;
  indecisionRate: number; // % of changed answers
  totalDecisions: number;
}

export function useStoryEngine() {
  const { user } = useAuth();
  const [decisionStartTime, setDecisionStartTime] = useState<number | null>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getDecisionPoints = useCallback(async (storyId: string): Promise<DecisionPoint[]> => {
    const { data, error } = await supabase
      .from('story_decision_points')
      .select('*')
      .eq('story_id', storyId)
      .order('step_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(dp => ({
      ...dp,
      options: (dp.options as unknown as DecisionOption[]) || [],
    })) as DecisionPoint[];
  }, []);

  const startDecision = useCallback(() => {
    setDecisionStartTime(Date.now());
    setChangeCount(0);
    setSelectedIndex(null);
  }, []);

  const selectOption = useCallback((index: number) => {
    if (selectedIndex !== null && selectedIndex !== index) {
      setChangeCount(prev => prev + 1);
    }
    setSelectedIndex(index);
  }, [selectedIndex]);

  const submitDecision = useCallback(async (
    decisionPointId: string,
    storyId: string,
    finalOptionIndex: number,
    childId?: string
  ): Promise<StoryDecision> => {
    if (!user) throw new Error('Não autenticado');

    const responseTime = decisionStartTime ? Date.now() - decisionStartTime : null;

    const { data, error } = await supabase
      .from('story_decisions')
      .insert({
        decision_point_id: decisionPointId,
        user_id: user.id,
        child_id: childId || null,
        story_id: storyId,
        selected_option_index: finalOptionIndex,
        response_time_ms: responseTime,
        changed_answer: changeCount > 0,
        change_count: changeCount,
      })
      .select()
      .single();

    if (error) throw error;
    
    setDecisionStartTime(null);
    setChangeCount(0);
    setSelectedIndex(null);

    return data as StoryDecision;
  }, [user, decisionStartTime, changeCount]);

  const getSocioemotionalMetrics = useCallback(async (childId?: string): Promise<SocioemotionalMetrics> => {
    if (!user) return defaultSocioemotionalMetrics();

    let query = supabase
      .from('story_decisions')
      .select('*, story_decision_points(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (childId) query = query.eq('child_id', childId);

    const { data: decisions, error } = await query;
    if (error || !decisions?.length) return defaultSocioemotionalMetrics();

    const total = decisions.length;
    const avgLatency = decisions.reduce((sum, d) => sum + (d.response_time_ms || 0), 0) / total;
    const changedAnswers = decisions.filter(d => d.changed_answer).length;
    const indecisionRate = (changedAnswers / total) * 100;

    // Analyze trait patterns from decision points
    const traitScores: Record<string, number[]> = {
      empathy: [],
      impulse_control: [],
      social_flexibility: [],
      conflict_avoidance: [],
      moral_consistency: [],
      frustration_tolerance: [],
    };

    decisions.forEach(d => {
      const dp = d.story_decision_points as any;
      if (!dp?.options) return;
      
      const options = dp.options as DecisionOption[];
      const selected = options[d.selected_option_index];
      if (!selected?.trait_tags) return;

      // Score based on trait tags
      selected.trait_tags.forEach((tag: string) => {
        if (tag === 'empathy' || tag === 'empathetic') traitScores.empathy.push(100);
        if (tag === 'impulsive') traitScores.impulse_control.push(20);
        if (tag === 'thoughtful') traitScores.impulse_control.push(90);
        if (tag === 'flexible') traitScores.social_flexibility.push(90);
        if (tag === 'rigid') traitScores.social_flexibility.push(20);
        if (tag === 'avoidant') traitScores.conflict_avoidance.push(90);
        if (tag === 'confrontational') traitScores.conflict_avoidance.push(20);
        if (tag === 'moral') traitScores.moral_consistency.push(90);
        if (tag === 'tolerant') traitScores.frustration_tolerance.push(90);
        if (tag === 'frustrated') traitScores.frustration_tolerance.push(20);
      });
    });

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 50;

    const empathyScore = Math.round(avg(traitScores.empathy));
    const impulseControlScore = Math.round(avg(traitScores.impulse_control));
    const socialFlexibilityScore = Math.round(avg(traitScores.social_flexibility));
    const conflictAvoidanceScore = Math.round(avg(traitScores.conflict_avoidance));
    const moralConsistencyScore = Math.round(avg(traitScores.moral_consistency));
    const frustrationToleranceScore = Math.round(avg(traitScores.frustration_tolerance));

    // Impulse control bonus from latency
    const latencyBonus = avgLatency > 3000 ? 10 : avgLatency > 1500 ? 5 : 0;
    const adjustedImpulseControl = Math.min(100, impulseControlScore + latencyBonus);

    const overallScore = Math.round(
      (empathyScore + adjustedImpulseControl + socialFlexibilityScore + 
       moralConsistencyScore + frustrationToleranceScore) / 5
    );

    return {
      empathyScore,
      impulseControlScore: adjustedImpulseControl,
      socialFlexibilityScore,
      conflictAvoidanceScore,
      moralConsistencyScore,
      frustrationToleranceScore,
      overallScore,
      avgDecisionLatencyMs: Math.round(avgLatency),
      indecisionRate: Math.round(indecisionRate),
      totalDecisions: total,
    };
  }, [user]);

  const saveSocioemotionalProfile = useCallback(async (
    childId: string,
    metrics: SocioemotionalMetrics
  ) => {
    const { error } = await supabase
      .from('socioemotional_profiles')
      .insert({
        child_id: childId,
        empathy_score: metrics.empathyScore,
        impulse_control_score: metrics.impulseControlScore,
        social_flexibility_score: metrics.socialFlexibilityScore,
        conflict_avoidance_score: metrics.conflictAvoidanceScore,
        moral_consistency_score: metrics.moralConsistencyScore,
        frustration_tolerance_score: metrics.frustrationToleranceScore,
        overall_score: metrics.overallScore,
        data_sources: { decisions: metrics.totalDecisions, avgLatency: metrics.avgDecisionLatencyMs },
      });

    if (error) throw error;
  }, []);

  return {
    getDecisionPoints,
    startDecision,
    selectOption,
    submitDecision,
    getSocioemotionalMetrics,
    saveSocioemotionalProfile,
    selectedIndex,
    changeCount,
  };
}

function defaultSocioemotionalMetrics(): SocioemotionalMetrics {
  return {
    empathyScore: 0,
    impulseControlScore: 0,
    socialFlexibilityScore: 0,
    conflictAvoidanceScore: 0,
    moralConsistencyScore: 0,
    frustrationToleranceScore: 0,
    overallScore: 0,
    avgDecisionLatencyMs: 0,
    indecisionRate: 0,
    totalDecisions: 0,
  };
}
