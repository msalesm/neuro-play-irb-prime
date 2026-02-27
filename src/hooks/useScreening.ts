import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ScreeningResult {
  id: string;
  type: string;
  score: number;
  performanceLevel: 'above_average' | 'average' | 'attention' | 'referral';
  recommended_action: string;
  gameData?: any;
  duration?: number;
  /** @deprecated Use performanceLevel instead. Mantido para compatibilidade. */
  percentile: number;
}

/**
 * Classifica o desempenho com base no score bruto (0-100).
 * NÃO utiliza percentis normativos — esta é uma classificação relativa
 * ao instrumento interno da plataforma, sem validação clínica externa.
 */
function classifyPerformance(score: number): ScreeningResult['performanceLevel'] {
  if (score >= 75) return 'above_average';
  if (score >= 50) return 'average';
  if (score >= 30) return 'attention';
  return 'referral';
}

const PERFORMANCE_LABELS: Record<ScreeningResult['performanceLevel'], string> = {
  above_average: 'Desempenho acima da média da plataforma',
  average: 'Desempenho dentro da média da plataforma',
  attention: 'Desempenho abaixo da média — atenção recomendada',
  referral: 'Desempenho significativamente abaixo da média — encaminhamento recomendado',
};

export function useScreening() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [currentScreeningType, setCurrentScreeningType] = useState<string>('');

  const getRecommendedAction = (score: number, type: string): string => {
    const level = classifyPerformance(score);
    const typeLabel = type.toUpperCase();

    const DISCLAIMER = '\n\n⚠️ IMPORTANTE: Este resultado é uma triagem inicial de rastreio, NÃO um diagnóstico clínico. Os valores apresentados são relativos ao instrumento interno da plataforma e não possuem validação normativa em população brasileira. Para avaliação diagnóstica, consulte um profissional especializado (neuropsicólogo, neuropediatra ou equipe multidisciplinar).';

    switch (level) {
      case 'above_average':
        return `Bom desempenho na triagem de ${typeLabel}. Continue com o acompanhamento regular e utilize os jogos cognitivos da plataforma para reforço.${DISCLAIMER}`;
      case 'average':
        return `Desempenho dentro da média esperada na triagem de ${typeLabel}. Recomenda-se continuar o acompanhamento e utilizar os jogos educativos para reforço das habilidades avaliadas.${DISCLAIMER}`;
      case 'attention':
        return `Desempenho abaixo da média na triagem de ${typeLabel}. Recomenda-se atenção especial e consulta com profissional especializado para avaliação mais detalhada. Um Plano Educacional Individualizado (PEI) foi gerado para apoiar o desenvolvimento.${DISCLAIMER}`;
      case 'referral':
        return `Desempenho significativamente abaixo da média na triagem de ${typeLabel}. Encaminhamento profissional recomendado. Os resultados sugerem a necessidade de avaliação clínica especializada com instrumentos validados (como CPT-3 para TDAH, M-CHAT/SCQ para TEA, ou PROLEC para Dislexia).${DISCLAIMER}`;
    }
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
      const performanceLevel = classifyPerformance(data.score);
      const recommended_action = getRecommendedAction(data.score, currentScreeningType);
      // Percentil mantido para compatibilidade com banco existente, mas usando score direto
      const percentile = Math.round(data.score);

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
        performanceLevel,
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
        performanceLevel: classifyPerformance(data.score),
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
