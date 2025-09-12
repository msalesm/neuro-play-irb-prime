import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface NeuroplasticityData {
  memory_score: number;
  logic_score: number;
  math_score: number;
  music_score: number;
  language_score: number;
  focus_score: number;
  coordination_score: number;
  overall_score: number;
  games_completed: number;
  total_sessions: number;
}

export interface SkillMetrics {
  quick_reasoning: number;
  flexible_thinking: number;
  tracking_ability: number;
  memory_thinking: number;
}

export interface NeuroplasticityHistory {
  category: string;
  score: number;
  recorded_at: string;
}

// Mapeamento dos jogos existentes para categorias de neuroplasticidade
const gameToNeuroplasticityMapping = {
  'memoria-colorida': { 
    categories: ['memory_score', 'coordination_score'], 
    weights: [0.8, 0.2] 
  },
  'caca-foco': { 
    categories: ['focus_score', 'tracking_ability'], 
    weights: [0.7, 0.3] 
  },
  'logica-rapida': { 
    categories: ['logic_score', 'quick_reasoning'], 
    weights: [0.8, 0.2] 
  },
  'aventura-numeros': { 
    categories: ['math_score', 'logic_score'], 
    weights: [0.7, 0.3] 
  },
  'ritmo-musical': { 
    categories: ['music_score', 'coordination_score'], 
    weights: [0.8, 0.2] 
  },
  'silaba-magica': { 
    categories: ['language_score', 'memory_score'], 
    weights: [0.7, 0.3] 
  },
  'quebra-cabeca-magico': { 
    categories: ['logic_score', 'coordination_score'], 
    weights: [0.6, 0.4] 
  },
  'focus-forest': { 
    categories: ['focus_score', 'tracking_ability'], 
    weights: [0.8, 0.2] 
  },
  'attention-sustained': { 
    categories: ['focus_score', 'quick_reasoning'], 
    weights: [0.7, 0.3] 
  },
  'cognitive-flexibility': { 
    categories: ['flexible_thinking', 'logic_score'], 
    weights: [0.8, 0.2] 
  },
  'phonological-processing': { 
    categories: ['language_score', 'memory_thinking'], 
    weights: [0.8, 0.2] 
  },
  'social-scenarios': { 
    categories: ['language_score', 'flexible_thinking'], 
    weights: [0.6, 0.4] 
  }
};

export function useNeuroplasticity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [neuroplasticityData, setNeuroplasticityData] = useState<NeuroplasticityData>({
    memory_score: 0,
    logic_score: 0,
    math_score: 0,
    music_score: 0,
    language_score: 0,
    focus_score: 0,
    coordination_score: 0,
    overall_score: 0,
    games_completed: 0,
    total_sessions: 0
  });
  const [skillMetrics, setSkillMetrics] = useState<SkillMetrics>({
    quick_reasoning: 0,
    flexible_thinking: 0,
    tracking_ability: 0,
    memory_thinking: 0
  });
  const [history, setHistory] = useState<NeuroplasticityHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNeuroplasticityData();
      fetchHistory();
    }
  }, [user]);

  const fetchNeuroplasticityData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_neuroplasticity')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setNeuroplasticityData({
          memory_score: data.memory_score || 0,
          logic_score: data.logic_score || 0,
          math_score: data.math_score || 0,
          music_score: data.music_score || 0,
          language_score: data.language_score || 0,
          focus_score: data.focus_score || 0,
          coordination_score: data.coordination_score || 0,
          overall_score: data.overall_score || 0,
          games_completed: data.games_completed || 0,
          total_sessions: data.total_sessions || 0
        });

        setSkillMetrics({
          quick_reasoning: data.quick_reasoning || 0,
          flexible_thinking: data.flexible_thinking || 0,
          tracking_ability: data.tracking_ability || 0,
          memory_thinking: data.memory_thinking || 0
        });
      } else {
        // Criar registro inicial se não existir
        await createInitialNeuroplasticityRecord();
      }
    } catch (error) {
      console.error('Error fetching neuroplasticity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('neuroplasticity_history')
        .select('category, score, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching neuroplasticity history:', error);
    }
  };

  const createInitialNeuroplasticityRecord = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_neuroplasticity')
        .insert({
          user_id: user.id,
          memory_score: 0,
          logic_score: 0,
          math_score: 0,
          music_score: 0,
          language_score: 0,
          focus_score: 0,
          coordination_score: 0,
          overall_score: 0,
          quick_reasoning: 0,
          flexible_thinking: 0,
          tracking_ability: 0,
          memory_thinking: 0,
          games_completed: 0,
          total_sessions: 0
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating initial neuroplasticity record:', error);
    }
  };

  const updateNeuroplasticityFromGame = async (gameType: string, sessionData: any) => {
    if (!user) return;

    const mapping = gameToNeuroplasticityMapping[gameType as keyof typeof gameToNeuroplasticityMapping];
    if (!mapping) return;

    try {
      // Calcular score baseado na performance da sessão
      const baseScore = calculateGameScore(sessionData);
      
      // Buscar dados atuais
      const { data: currentData } = await supabase
        .from('user_neuroplasticity')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!currentData) {
        await createInitialNeuroplasticityRecord();
        return;
      }

      // Aplicar incrementos ponderados
      const updates: any = {
        games_completed: (currentData.games_completed || 0) + 1,
        total_sessions: (currentData.total_sessions || 0) + 1
      };

      mapping.categories.forEach((category, index) => {
        const weight = mapping.weights[index];
        const increment = baseScore * weight * 0.1; // Fator de crescimento controlado
        const currentScore = currentData[category] || 0;
        updates[category] = Math.min(100, currentScore + increment);
      });

      // Calcular overall score como média das categorias principais
      const categoryScores = [
        updates.memory_score || currentData.memory_score,
        updates.logic_score || currentData.logic_score,
        updates.math_score || currentData.math_score,
        updates.music_score || currentData.music_score,
        updates.language_score || currentData.language_score,
        updates.focus_score || currentData.focus_score,
        updates.coordination_score || currentData.coordination_score
      ];
      
      updates.overall_score = categoryScores.reduce((sum, score) => sum + (score || 0), 0) / 7;

      // Atualizar no banco
      const { error } = await supabase
        .from('user_neuroplasticity')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Salvar histórico
      for (const category of mapping.categories) {
        if (updates[category]) {
          await supabase
            .from('neuroplasticity_history')
            .insert({
              user_id: user.id,
              category,
              score: updates[category],
              game_session_data: sessionData
            });
        }
      }

      // Atualizar estado local
      await fetchNeuroplasticityData();
      await fetchHistory();

      // Mostrar notificação de progresso
      if (baseScore > 70) {
        toast({
          title: "🧠 Neuroplasticidade em Crescimento!",
          description: `Excelente desempenho! Suas habilidades cognitivas estão se desenvolvendo.`
        });
      }

    } catch (error) {
      console.error('Error updating neuroplasticity from game:', error);
    }
  };

  const calculateGameScore = (sessionData: any): number => {
    // Score baseado em múltiplos fatores do jogo
    let score = 0;

    // Precisão/Acurácia (40% do score)
    if (sessionData.accuracy) {
      score += sessionData.accuracy * 0.4;
    }

    // Velocidade/Tempo (30% do score)
    if (sessionData.completion_time || sessionData.duration_seconds) {
      const timeBonus = Math.max(0, 100 - (sessionData.completion_time || sessionData.duration_seconds / 10));
      score += timeBonus * 0.3;
    }

    // Dificuldade/Nível (20% do score)
    if (sessionData.level || sessionData.difficulty) {
      const levelBonus = (sessionData.level || 1) * 10;
      score += Math.min(levelBonus, 20) * 0.2;
    }

    // Consistência (10% do score)
    if (sessionData.consistency_score) {
      score += sessionData.consistency_score * 0.1;
    }

    return Math.max(0, Math.min(100, score));
  };

  const getCategoryProgress = (category: keyof NeuroplasticityData) => {
    return neuroplasticityData[category] || 0;
  };

  const getSkillProgress = (skill: keyof SkillMetrics) => {
    return skillMetrics[skill] || 0;
  };

  const getCategoryTrend = (category: string) => {
    const categoryHistory = history
      .filter(h => h.category === category)
      .slice(0, 5); // Últimas 5 sessões

    if (categoryHistory.length < 2) return 'stable';

    const recent = categoryHistory[0].score;
    const older = categoryHistory[categoryHistory.length - 1].score;
    
    if (recent > older + 2) return 'up';
    if (recent < older - 2) return 'down';
    return 'stable';
  };

  return {
    neuroplasticityData,
    skillMetrics,
    history,
    loading,
    updateNeuroplasticityFromGame,
    getCategoryProgress,
    getSkillProgress,
    getCategoryTrend,
    refreshData: fetchNeuroplasticityData
  };
}