/**
 * Hook: useBehavioralProfile
 * 
 * Connects the core behavioral-profile-engine to real platform data,
 * generating a UnifiedProfile for a given child.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateUnifiedProfile, type ProfileDataSources, type UnifiedProfile } from '@/core/behavioral-profile-engine';

export function useBehavioralProfile(childId: string | undefined) {
  return useQuery<UnifiedProfile | null>({
    queryKey: ['behavioral-profile', childId],
    queryFn: async () => {
      if (!childId) return null;

      // Fetch all data sources in parallel
      const [gameSessions, abaTrials, abaPrograms] = await Promise.all([
        supabase
          .from('game_sessions')
          .select('game_id, accuracy_percentage, avg_reaction_time_ms, completed_at')
          .order('completed_at', { ascending: false })
          .limit(50),
        supabase
          .from('aba_np_trials')
          .select('correct, prompt_level')
          .eq('child_id', childId)
          .limit(200),
        supabase
          .from('aba_np_programs')
          .select('id, status')
          .eq('child_id', childId),
      ]);

      // Build game metrics source
      const gameMetrics: ProfileDataSources['gameMetrics'] = (gameSessions.data || []).map(s => ({
        gameId: s.game_id,
        date: s.completed_at || '',
        metrics: {
          accuracy: (s.accuracy_percentage || 0) / 100,
          reactionTimeMs: s.avg_reaction_time_ms || 0,
        },
      }));

      // Build ABA data source
      const trials = abaTrials.data || [];
      const programs = abaPrograms.data || [];
      const correctTrials = trials.filter((t: any) => t.correct).length;
      const independentTrials = trials.filter((t: any) => t.prompt_level === 'independente').length;

      const abaData: ProfileDataSources['abaData'] = trials.length > 0 ? {
        independencePercentage: Math.round((independentTrials / trials.length) * 100),
        activePrograms: programs.filter((p: any) => p.status === 'active').length,
        masteredSkills: 0, // Would need intervention data
        trend: 'stable' as const,
      } : undefined;

      const sources: ProfileDataSources = {
        gameMetrics,
        abaData,
      };

      return generateUnifiedProfile(childId, sources);
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}
