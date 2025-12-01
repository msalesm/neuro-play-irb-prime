import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  priority: number;
  recommended_games: string[];
  suggested_actions: {
    game_id: string;
    game_name: string;
    suggested_difficulty: number;
    target_domains: string[];
    overall_strategy?: string;
  };
  status: string;
  created_at: string;
  valid_until: string;
}

export function useGameRecommendations(childProfileId?: string) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Buscar recomendações existentes
  const fetchRecommendations = async (profileId?: string) => {
    if (!user) return;
    
    const targetProfileId = profileId || childProfileId;
    if (!targetProfileId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('child_profile_id', targetProfileId)
        .eq('status', 'active')
        .gte('valid_until', new Date().toISOString())
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRecommendations((data || []).map(item => ({
        ...item,
        suggested_actions: item.suggested_actions as any
      })));
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
    } finally {
      setLoading(false);
    }
  };

  // Gerar novas recomendações
  const generateRecommendations = async (profileId?: string) => {
    if (!user) {
      toast.info('Faça login para receber recomendações personalizadas');
      return;
    }

    const targetProfileId = profileId || childProfileId;
    if (!targetProfileId) {
      toast.info('Complete o perfil da criança para recomendações personalizadas');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'generate-game-recommendations',
        { body: { child_profile_id: targetProfileId } }
      );

      if (invokeError) throw invokeError;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Recomendações geradas com sucesso! 🎮');
      
      // Atualizar lista de recomendações
      await fetchRecommendations(targetProfileId);

      return data;
    } catch (err) {
      console.error('Error generating recommendations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar recomendações';
      
      if (errorMessage.includes('Rate limit')) {
        toast.error('Limite de requisições atingido. Tente novamente mais tarde.');
      } else {
        toast.error(errorMessage);
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  // Marcar recomendação como aplicada
  const applyRecommendation = async (recommendationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_recommendations')
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Atualizar estado local
      setRecommendations(prev => 
        prev.filter(rec => rec.id !== recommendationId)
      );

      toast.success('Recomendação aplicada! 👍');
    } catch (err) {
      console.error('Error applying recommendation:', err);
      toast.error('Erro ao aplicar recomendação');
    }
  };

  // Descartar recomendação
  const dismissRecommendation = async (recommendationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_recommendations')
        .update({ status: 'dismissed' })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Atualizar estado local
      setRecommendations(prev => 
        prev.filter(rec => rec.id !== recommendationId)
      );

      toast.success('Recomendação descartada');
    } catch (err) {
      console.error('Error dismissing recommendation:', err);
      toast.error('Erro ao descartar recomendação');
    }
  };

  useEffect(() => {
    if (childProfileId) {
      fetchRecommendations(childProfileId);
    }
  }, [childProfileId, user]);

  return {
    recommendations,
    loading,
    generating,
    error,
    fetchRecommendations,
    generateRecommendations,
    applyRecommendation,
    dismissRecommendation,
  };
}
