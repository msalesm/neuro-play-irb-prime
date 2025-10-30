import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ScreeningResult {
  id: string;
  type: 'dislexia' | 'tdah' | 'tea';
  score: number;
  percentile: number;
  duration: number;
  gameData: any;
  recommendedAction: string;
  createdAt: string;
}

export function useScreening() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentScreening, setCurrentScreening] = useState<ScreeningResult | null>(null);

  const startScreening = (type: 'dislexia' | 'tdah' | 'tea') => {
    setCurrentScreening({
      id: '',
      type,
      score: 0,
      percentile: 0,
      duration: 0,
      gameData: {},
      recommendedAction: '',
      createdAt: new Date().toISOString(),
    });
  };

  const calculatePercentile = (score: number, type: string): number => {
    // Simplified percentile calculation
    // In production, this would query historical data
    const normalized = Math.min(100, Math.max(0, score));
    return normalized;
  };

  const getRecommendation = (percentile: number, type: string): string => {
    if (percentile < 20) {
      return `Encaminhar para equipe pedagógica e pais. Score abaixo do esperado para ${type}.`;
    } else if (percentile < 40) {
      return `Acompanhamento pedagógico recomendado. Atenção aos sinais de ${type}.`;
    } else if (percentile < 60) {
      return `Desempenho dentro da média. Continuar monitoramento regular.`;
    } else {
      return `Desempenho acima da média. Manter acompanhamento de rotina.`;
    }
  };

  const saveScreening = async (score: number, duration: number, gameData: any) => {
    if (!user || !currentScreening) {
      toast.error('Erro ao salvar triagem');
      return null;
    }

    setLoading(true);
    try {
      const percentile = calculatePercentile(score, currentScreening.type);
      const recommendedAction = getRecommendation(percentile, currentScreening.type);

      const { data, error } = await supabase
        .from('screenings')
        .insert({
          user_id: user.id,
          type: currentScreening.type,
          score,
          percentile,
          duration,
          game_data: gameData,
          recommended_action: recommendedAction,
        })
        .select()
        .single();

      if (error) throw error;

      const result: ScreeningResult = {
        id: data.id,
        type: data.type as any,
        score: data.score,
        percentile: data.percentile || 0,
        duration: data.duration || 0,
        gameData: data.game_data,
        recommendedAction: data.recommended_action || '',
        createdAt: data.created_at,
      };

      setCurrentScreening(result);

      // Generate PEI if needed
      if (percentile < 40) {
        await generatePEI(data.id, result);
      }

      toast.success('Triagem concluída com sucesso!');
      return result;
    } catch (error: any) {
      console.error('Error saving screening:', error);
      toast.error('Erro ao salvar triagem');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generatePEI = async (screeningId: string, result: ScreeningResult) => {
    if (!user) return;

    try {
      const objectives = generateObjectives(result);
      const activities = generateActivities(result);
      const recommendations = generateRecommendations(result);

      await supabase.from('pei_plans').insert({
        user_id: user.id,
        screening_id: screeningId,
        objectives,
        activities,
        recommendations,
        ai_generated: true,
        progress: 0,
      });
    } catch (error) {
      console.error('Error generating PEI:', error);
    }
  };

  const generateObjectives = (result: ScreeningResult): string => {
    const objectives: { [key: string]: string[] } = {
      dislexia: [
        'Melhorar consciência fonológica',
        'Desenvolver habilidades de decodificação',
        'Aumentar fluência de leitura',
      ],
      tdah: [
        'Desenvolver estratégias de foco e atenção',
        'Melhorar controle inibitório',
        'Fortalecer memória de trabalho',
      ],
      tea: [
        'Desenvolver habilidades de comunicação social',
        'Melhorar reconhecimento de emoções',
        'Fortalecer interações sociais',
      ],
    };

    return objectives[result.type].join('\n• ');
  };

  const generateActivities = (result: ScreeningResult): string => {
    const activities: { [key: string]: string[] } = {
      dislexia: [
        'Jogos de rimas e aliterações (15 min/dia)',
        'Leitura guiada com apoio visual',
        'Exercícios de segmentação silábica',
      ],
      tdah: [
        'Técnicas de respiração e mindfulness (10 min/dia)',
        'Jogos de memória e concentração',
        'Atividades físicas estruturadas',
      ],
      tea: [
        'Role-playing de situações sociais',
        'Jogos de reconhecimento facial',
        'Atividades de comunicação alternativa',
      ],
    };

    return activities[result.type].join('\n• ');
  };

  const generateRecommendations = (result: ScreeningResult): string => {
    const recommendations: { [key: string]: string[] } = {
      dislexia: [
        'Usar recursos visuais e multissensoriais',
        'Permitir tempo adicional para leitura',
        'Avaliar com métodos alternativos quando apropriado',
      ],
      tdah: [
        'Ambiente estruturado e previsível',
        'Pausas regulares durante atividades',
        'Reforço positivo imediato',
      ],
      tea: [
        'Rotinas claras e consistentes',
        'Comunicação direta e objetiva',
        'Apoio em transições e mudanças',
      ],
    };

    return recommendations[result.type].join('\n• ');
  };

  const getScreeningHistory = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching screening history:', error);
      return [];
    }
  };

  return {
    loading,
    currentScreening,
    startScreening,
    saveScreening,
    getScreeningHistory,
  };
}
