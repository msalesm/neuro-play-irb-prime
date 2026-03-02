import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ScreeningResult {
  id: string;
  type: string;
  score: number;
  percentile: number;
  recommended_action: string;
  gameData?: any;
  duration?: number;
}

export function useScreening() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [currentScreeningType, setCurrentScreeningType] = useState<string>('');

  const calculatePercentile = (score: number): number => {
    // Percentile calculation based on score distribution
    // Assuming normal distribution with mean=50, std=15
    if (score >= 90) return 95;
    if (score >= 80) return 85;
    if (score >= 70) return 70;
    if (score >= 60) return 55;
    if (score >= 50) return 40;
    if (score >= 40) return 25;
    if (score >= 30) return 15;
    return 10;
  };

  const getRecommendedAction = (score: number, type: string): string => {
    const percentile = calculatePercentile(score);
    
    if (percentile >= 60) {
      return `Desempenho acima da média para ${type.toUpperCase()}. Continue com o acompanhamento regular e incentive o desenvolvimento através dos jogos cognitivos disponíveis na plataforma.`;
    }
    
    if (percentile >= 40) {
      return `Desempenho dentro da média esperada. Recomenda-se continuar o acompanhamento e utilizar os jogos educativos para reforço das habilidades avaliadas.`;
    }
    
    if (percentile >= 20) {
      return `Recomenda-se atenção especial. Considere consultar um profissional especializado para avaliação mais detalhada e implementar estratégias de suporte pedagógico através do PEI.`;
    }
    
    return `Encaminhamento profissional recomendado. Os resultados sugerem a necessidade de avaliação clínica especializada. Um Plano Educacional Individualizado (PEI) foi gerado para apoiar o desenvolvimento.`;
  };

  const startScreening = async (type: string) => {
    setCurrentScreeningType(type);
    return { success: true };
  };

  const saveScreening = async (data: { score: number; duration: number; gameData: any }) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);

    try {
      const percentile = calculatePercentile(data.score);
      const recommended_action = getRecommendedAction(data.score, currentScreeningType);

      const { data: screening, error } = await supabase
        .from('screenings')
        .insert({
          user_id: user.id,
          type: currentScreeningType,
          score: data.score,
          percentile,
          recommended_action,
          test_data: data.gameData,
          duration: Math.round(data.duration),
        })
        .select()
        .single();

      if (error) throw error;

      const result: ScreeningResult = {
        id: screening.id,
        type: screening.type,
        score: screening.score,
        percentile: screening.percentile,
        recommended_action: screening.recommended_action,
        gameData: screening.test_data,
        duration: screening.duration,
      };

      toast.success('Triagem salva com sucesso!');
      return result;
    } catch (error: any) {
      console.error('Error saving screening:', error);
      toast.error('Erro ao salvar triagem: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getScreening = async (id: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        type: data.type,
        score: data.score,
        percentile: data.percentile,
        recommended_action: data.recommended_action,
        gameData: data.test_data,
        duration: data.duration,
      } as ScreeningResult;
    } catch (error: any) {
      console.error('Error fetching screening:', error);
      return null;
    }
  };

  const submitScreening = async (type: string, score: number, duration: number, gameData: any) => {
    setCurrentScreeningType(type);
    return saveScreening({ score, duration, gameData });
  };

  return {
    loading,
    screenings,
    submitScreening,
    getScreening,
    startScreening,
    saveScreening,
  };
}
