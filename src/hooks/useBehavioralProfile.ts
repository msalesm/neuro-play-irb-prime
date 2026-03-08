/**
 * Hook: useBehavioralProfile
 * 
 * Connects the core behavioral-profile-engine to real platform data,
 * generating a UnifiedProfile for a given child.
 * 
 * Integrates 4 data sources:
 * 1. Game sessions → cognitive domains
 * 2. ABA trials/programs → independence & mastered skills
 * 3. Routine executions → executive function
 * 4. Story decisions → socioemotional traits
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateUnifiedProfile, type ProfileDataSources, type UnifiedProfile } from '@/modules/behavioral/engine';
import type { SocioemotionalMetrics } from '@/hooks/useStoryEngine';
import type { ExecutiveMetrics } from '@/hooks/useExecutiveRoutine';

export function useBehavioralProfile(childId: string | undefined) {
  return useQuery<UnifiedProfile | null>({
    queryKey: ['behavioral-profile', childId],
    queryFn: async () => {
      if (!childId) return null;

      // Fetch all 4 data sources in parallel
      const [gameSessions, abaTrials, abaPrograms, abaInterventions, routineExecs, storyDecisions] = await Promise.all([
        // 1. Game sessions (filtered by child)
        supabase
          .from('game_sessions')
          .select('game_id, accuracy_percentage, avg_reaction_time_ms, completed_at, cognitive_games(cognitive_domains)')
          .eq('child_profile_id', childId)
          .eq('completed', true)
          .order('completed_at', { ascending: false })
          .limit(100),
        // 2. ABA trials
        supabase
          .from('aba_np_trials')
          .select('correct, prompt_level, recorded_at')
          .eq('child_id', childId)
          .order('recorded_at', { ascending: false })
          .limit(200),
        // 3. ABA programs
        supabase
          .from('aba_np_programs')
          .select('id, status')
          .eq('child_id', childId),
        // 4. ABA interventions (for mastered skills)
        supabase
          .from('aba_np_interventions')
          .select('status, program_id')
          .in('program_id', [childId]) // Will be refined below
          .limit(500),
        // 5. Routine executions
        supabase
          .from('routine_executions')
          .select('completed_steps, total_steps, autonomy_score, interruptions, started_at, completed_at, abandoned_at')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
          .limit(50),
        // 6. Story decisions
        supabase
          .from('story_decisions')
          .select('emotional_tag, decision_time_ms, changed_answer, change_count')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      // ── Build game metrics source ────────────────────
      const gameMetrics: ProfileDataSources['gameMetrics'] = (gameSessions.data || []).map((s: any) => ({
        gameId: s.game_id,
        date: s.completed_at || '',
        metrics: {
          accuracy: (s.accuracy_percentage || 0) / 100,
          reactionTimeMs: s.avg_reaction_time_ms || 0,
        },
      }));

      // ── Build ABA data source ────────────────────────
      const trials = abaTrials.data || [];
      const programs = abaPrograms.data || [];
      
      // Fetch interventions for actual program IDs
      let masteredCount = 0;
      if (programs.length > 0) {
        const programIds = programs.map((p: any) => p.id);
        const { data: interventions } = await supabase
          .from('aba_np_interventions')
          .select('status')
          .in('program_id', programIds);
        masteredCount = (interventions || []).filter((i: any) => i.status === 'mastered').length;
      }

      const independentTrials = trials.filter((t: any) => t.prompt_level === 'independente').length;
      
      // Calculate ABA trend from recent vs older trials
      let abaTrend: 'up' | 'stable' | 'down' = 'stable';
      if (trials.length >= 10) {
        const recentHalf = trials.slice(0, Math.floor(trials.length / 2));
        const olderHalf = trials.slice(Math.floor(trials.length / 2));
        const recentAccuracy = recentHalf.filter((t: any) => t.correct).length / recentHalf.length;
        const olderAccuracy = olderHalf.filter((t: any) => t.correct).length / olderHalf.length;
        const diff = recentAccuracy - olderAccuracy;
        if (diff > 0.05) abaTrend = 'up';
        else if (diff < -0.05) abaTrend = 'down';
      }

      const abaData: ProfileDataSources['abaData'] = trials.length > 0 ? {
        independencePercentage: Math.round((independentTrials / trials.length) * 100),
        activePrograms: programs.filter((p: any) => p.status === 'active').length,
        masteredSkills: masteredCount,
        trend: abaTrend,
      } : undefined;

      // ── Build routine metrics source ─────────────────
      const routines = routineExecs.data || [];
      let routineMetrics: ProfileDataSources['routineMetrics'] | undefined;
      
      if (routines.length > 0) {
        const completedRoutines = routines.filter((r: any) => r.completed_at);
        const completionRate = routines.length > 0 
          ? (completedRoutines.length / routines.length) * 100 : 0;
        
        const avgAutonomy = routines
          .filter((r: any) => r.autonomy_score != null)
          .reduce((sum: number, r: any, _: number, arr: any[]) => sum + (r.autonomy_score / arr.length), 0);
        
        const avgInterruptions = routines
          .filter((r: any) => r.interruptions != null)
          .reduce((sum: number, r: any, _: number, arr: any[]) => sum + (r.interruptions / arr.length), 0);
        
        // Calculate avg latency (time between started_at and first step)
        const avgLatency = completedRoutines.length > 0
          ? completedRoutines.reduce((sum: number, r: any) => {
              if (!r.started_at || !r.completed_at) return sum;
              const durationMs = new Date(r.completed_at).getTime() - new Date(r.started_at).getTime();
              const durationSec = durationMs / 1000;
              const expectedSec = (r.total_steps || 1) * 60; // ~1 min per step baseline
              return sum + Math.max(0, durationSec - expectedSec);
            }, 0) / completedRoutines.length
          : 120; // default 2 min latency

        const abandonedCount = routines.filter((r: any) => r.abandoned_at).length;
        
        // Organization index: weighted combination
        const organizationIndex = Math.round(
          completionRate * 0.35 +
          (avgAutonomy || 50) * 0.30 +
          Math.max(0, 100 - avgInterruptions * 10) * 0.20 +
          Math.max(0, 100 - (abandonedCount / Math.max(routines.length, 1)) * 100) * 0.15
        );

        routineMetrics = {
          organizationIndex: Math.min(100, organizationIndex),
          autonomyScore: avgAutonomy || 50,
          completionRate,
          avgLatencySeconds: avgLatency,
          totalExecutions: routines.length,
          abandonmentRate: routines.length > 0 ? (abandonedCount / routines.length) * 100 : 0,
        } as ExecutiveMetrics;
      }

      // ── Build story metrics source ───────────────────
      const decisions = storyDecisions.data || [];
      let storyMetrics: ProfileDataSources['storyMetrics'] | undefined;
      
      if (decisions.length > 0) {
        const emotionalTags = decisions.map((d: any) => d.emotional_tag).filter(Boolean);
        const avgDecisionTime = decisions
          .filter((d: any) => d.decision_time_ms != null)
          .reduce((sum: number, d: any, _: number, arr: any[]) => 
            sum + (d.decision_time_ms / arr.length), 0);
        
        const changedAnswers = decisions.filter((d: any) => d.changed_answer).length;
        const changeRate = changedAnswers / decisions.length;
        
        // Derive socioemotional scores from decision patterns
        const empathyTags = emotionalTags.filter((t: string) => 
          ['empathy', 'kindness', 'helping', 'caring', 'compassion'].includes(t));
        const impulseTags = emotionalTags.filter((t: string) => 
          ['patience', 'waiting', 'calm', 'thoughtful'].includes(t));
        
        const empathyScore = emotionalTags.length > 0 
          ? Math.min(100, (empathyTags.length / emotionalTags.length) * 100 + 40)
          : 50;
        
        // Impulse control: slower decisions + fewer changes = better control
        const impulseControlScore = Math.min(100, Math.round(
          (avgDecisionTime > 3000 ? 70 : avgDecisionTime > 1500 ? 55 : 35) +
          (1 - changeRate) * 30
        ));
        
        // Social flexibility: variety of emotional tags
        const uniqueTags = new Set(emotionalTags).size;
        const socialFlexibilityScore = Math.min(100, Math.round(
          (uniqueTags / Math.max(emotionalTags.length, 1)) * 50 + 40
        ));
        
        // Frustration tolerance: fewer abandoned/changed decisions
        const frustrationScore = Math.min(100, Math.round(
          (1 - changeRate * 0.5) * 80 + 20
        ));

        const overallScore = Math.round(
          empathyScore * 0.25 + impulseControlScore * 0.25 + 
          socialFlexibilityScore * 0.25 + frustrationScore * 0.25
        );

        storyMetrics = {
          empathyScore,
          impulseControlScore,
          socialFlexibilityScore,
          frustrationToleranceScore: frustrationScore,
          overallScore,
          totalDecisions: decisions.length,
        } as SocioemotionalMetrics;
      }

      // ── Generate unified profile ─────────────────────
      const sources: ProfileDataSources = {
        gameMetrics,
        abaData,
        routineMetrics,
        storyMetrics,
      };

      return generateUnifiedProfile(childId, sources);
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}
