import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CooperativeRecommendation {
  gameId: string;
  gameName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  bondingFocus: string;
  ageAppropriate: boolean;
}

export const useCooperativeRecommendations = (userId?: string, childProfileId?: string) => {
  const [recommendations, setRecommendations] = useState<CooperativeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && childProfileId) {
      loadRecommendations();
    }
  }, [userId, childProfileId]);

  const loadRecommendations = async () => {
    if (!userId || !childProfileId) return;

    try {
      setLoading(true);

      // Get child profile data
      const { data: childProfile, error: profileError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childProfileId)
        .single();

      if (profileError) throw profileError;

      // Calculate child's age from date_of_birth
      const birthDate = new Date(childProfile.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Get diagnosed conditions
      const conditions = childProfile.diagnosed_conditions || [];

      // Get recent game history
      const { data: recentSessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('game_id, cognitive_games!inner(cognitive_domains)')
        .eq('child_profile_id', childProfileId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;

      // Get completed cooperative sessions
      const { data: cooperativeSessions, error: coopError } = await supabase
        .from('cooperative_sessions')
        .select('game_id')
        .eq('host_profile_id', childProfileId)
        .eq('status', 'completed');

      if (coopError) throw coopError;

      const completedGameIds = new Set(cooperativeSessions?.map(s => s.game_id) || []);

      // Determine weak cognitive domains
      const domainCounts: Record<string, number> = {};
      recentSessions?.forEach(session => {
        const domains = (session.cognitive_games as any)?.cognitive_domains || [];
        domains.forEach((domain: string) => {
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        });
      });

      // Find least practiced domains
      const sortedDomains = Object.entries(domainCounts)
        .sort(([, a], [, b]) => a - b)
        .map(([domain]) => domain);

      // Get available cooperative games
      const { data: games, error: gamesError } = await supabase
        .from('cognitive_games')
        .select('*')
        .eq('active', true)
        .contains('cognitive_domains', ['social_skills']);

      if (gamesError) throw gamesError;

      // Generate personalized recommendations
      const recs: CooperativeRecommendation[] = [];

      games?.forEach(game => {
        // Skip already completed
        if (completedGameIds.has(game.id)) return;

        // Check age appropriateness
        const ageAppropriate = age >= (game.age_min || 0) && age <= (game.age_max || 18);
        if (!ageAppropriate) return;

        // Determine priority
        let priority: 'high' | 'medium' | 'low' = 'low';
        let reason = 'Atividade cooperativa interessante';

        const gameDomains = game.cognitive_domains || [];
        
        // High priority: targets weak domains
        if (sortedDomains.some(weak => gameDomains.includes(weak))) {
          priority = 'high';
          reason = 'Reforça áreas que precisam de mais prática';
        }

        // High priority: matches diagnosed conditions
        const targetConditions = game.target_conditions || [];
        if (conditions.some((c: string) => targetConditions.includes(c))) {
          priority = 'high';
          reason = 'Específico para o perfil do seu filho';
        }

        // Medium priority: social skills focus
        if (gameDomains.includes('social_skills')) {
          priority = priority === 'low' ? 'medium' : priority;
          reason = priority === 'medium' ? 'Ótimo para desenvolver habilidades sociais' : reason;
        }

        recs.push({
          gameId: game.game_id,
          gameName: game.name,
          reason,
          priority,
          estimatedDuration: game.avg_duration_minutes || 15,
          bondingFocus: determineBondingFocus(gameDomains),
          ageAppropriate
        });
      });

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setRecommendations(recs.slice(0, 6)); // Top 6 recommendations

    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const determineBondingFocus = (domains: string[]): string => {
    if (domains.includes('social_skills')) return 'Comunicação e empatia';
    if (domains.includes('emotional_regulation')) return 'Regulação emocional compartilhada';
    if (domains.includes('attention')) return 'Foco e concentração conjunta';
    if (domains.includes('executive_functions')) return 'Planejamento em equipe';
    return 'Colaboração geral';
  };

  return { recommendations, loading, reload: loadRecommendations };
};
