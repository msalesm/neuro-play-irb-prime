import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionMetrics {
  score: number;
  accuracy: number;
  timeSpent: number;
  level: number;
  correctMoves?: number;
  totalMoves?: number;
  reactionTimeAvg?: number;
  hintsUsed?: number;
}

interface TherapeuticInsight {
  category: 'cognitive' | 'emotional' | 'behavioral' | 'developmental';
  title: string;
  description: string;
  severity: 'info' | 'concern' | 'alert';
  recommendations: string[];
}

interface PersonalizedRecommendation {
  nextGame: string;
  nextGameTitle: string;
  reason: string;
  targetDomain: string;
  estimatedDifficulty: number;
}

export function useEnhancedFeedback() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [therapeuticInsights, setTherapeuticInsights] = useState<TherapeuticInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);

  const generateEnhancedFeedback = async (
    childProfileId: string,
    gameId: string,
    sessionMetrics: SessionMetrics,
    historicalTrend?: 'improving' | 'stable' | 'declining'
  ) => {
    setIsGenerating(true);
    try {
      // Fetch child profile and recent sessions
      const { data: profile, error: profileError } = await supabase
        .from('child_profiles')
        .select('*, diagnosed_conditions, cognitive_baseline')
        .eq('id', childProfileId)
        .single();

      if (profileError) throw profileError;

      // Fetch latest clinical report if available
      const { data: latestReport } = await supabase
        .from('clinical_reports')
        .select('detailed_analysis, summary_insights')
        .eq('user_id', profile.parent_user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Generate therapeutic insights based on session performance
      const insights: TherapeuticInsight[] = [];

      // Cognitive assessment
      if (sessionMetrics.accuracy < 50) {
        insights.push({
          category: 'cognitive',
          title: 'Dificuldade Cognitiva Identificada',
          description: `A precisão de ${sessionMetrics.accuracy.toFixed(0)}% indica desafio na tarefa atual. Considerar reduzir dificuldade temporariamente.`,
          severity: 'concern',
          recommendations: [
            'Praticar tarefas similares em nível reduzido',
            'Dividir atividade em etapas menores',
            'Aumentar tempo disponível para respostas',
            'Consultar terapeuta sobre estratégias compensatórias'
          ]
        });
      } else if (sessionMetrics.accuracy > 85 && historicalTrend === 'improving') {
        insights.push({
          category: 'cognitive',
          title: 'Evolução Cognitiva Notável',
          description: `Precisão de ${sessionMetrics.accuracy.toFixed(0)}% com tendência crescente indica boa consolidação das habilidades trabalhadas.`,
          severity: 'info',
          recommendations: [
            'Avançar para nível de dificuldade superior',
            'Introduzir variações da atividade',
            'Explorar jogos que trabalhem domínios relacionados',
            'Reforçar conquistas para motivação intrínseca'
          ]
        });
      }

      // Behavioral assessment
      if (sessionMetrics.hintsUsed && sessionMetrics.hintsUsed > 5) {
        insights.push({
          category: 'behavioral',
          title: 'Busca Frequente por Suporte',
          description: `Uso de ${sessionMetrics.hintsUsed} dicas pode indicar necessidade de mais scaffolding ou ansiedade de desempenho.`,
          severity: 'concern',
          recommendations: [
            'Oferecer dicas preventivas no início',
            'Trabalhar autoconfiança e tolerância ao erro',
            'Considerar atividades colaborativas',
            'Observar sinais de frustração durante sessões'
          ]
        });
      }

      // Attention span assessment
      if (sessionMetrics.timeSpent > 900) { // 15+ minutes
        insights.push({
          category: 'developmental',
          title: 'Atenção Sustentada Prolongada',
          description: `Sessão de ${Math.round(sessionMetrics.timeSpent / 60)} minutos demonstra boa capacidade de foco para a faixa etária.`,
          severity: 'info',
          recommendations: [
            'Manter sessões nesta duração',
            'Introduzir atividades com progressão gradual de complexidade',
            'Reforçar capacidade atencional como ponto forte'
          ]
        });
      } else if (sessionMetrics.timeSpent < 180) { // Less than 3 minutes
        insights.push({
          category: 'behavioral',
          title: 'Sessão Muito Breve',
          description: `Sessão de apenas ${Math.round(sessionMetrics.timeSpent / 60)} minutos pode indicar perda de interesse ou frustração precoce.`,
          severity: 'concern',
          recommendations: [
            'Investigar barreiras à permanência na atividade',
            'Considerar ajustar motivadores e recompensas',
            'Avaliar nível de dificuldade',
            'Explorar atividades com maior apelo sensorial'
          ]
        });
      }

      // Processing speed assessment
      if (sessionMetrics.reactionTimeAvg) {
        if (sessionMetrics.reactionTimeAvg > 3000) {
          insights.push({
            category: 'cognitive',
            title: 'Velocidade de Processamento Reduzida',
            description: `Tempo médio de reação de ${sessionMetrics.reactionTimeAvg}ms sugere processamento cognitivo mais lento, comum em alguns perfis neurodivergentes.`,
            severity: 'info',
            recommendations: [
              'Não pressionar por rapidez - priorizar precisão',
              'Permitir tempo extra em todas as atividades',
              'Trabalhar processamento em atividades específicas',
              'Informar educadores sobre necessidade de tempo adicional'
            ]
          });
        }
      }

      setTherapeuticInsights(insights);

      // Generate personalized game recommendations
      const { data: gameRecs, error: recsError } = await supabase
        .functions.invoke('generate-game-recommendations', {
          body: { 
            childProfileId,
            includeCurrentPerformance: {
              gameId,
              accuracy: sessionMetrics.accuracy,
              score: sessionMetrics.score
            }
          }
        });

      if (!recsError && gameRecs?.recommendations) {
        const formattedRecs: PersonalizedRecommendation[] = gameRecs.recommendations.slice(0, 3).map((rec: any) => ({
          nextGame: rec.game_id,
          nextGameTitle: rec.title,
          reason: rec.reasoning,
          targetDomain: rec.target_domains?.[0] || 'Cognitivo',
          estimatedDifficulty: rec.suggested_difficulty || 1
        }));
        setRecommendations(formattedRecs);
      }

    } catch (error) {
      console.error('Error generating enhanced feedback:', error);
      toast.error('Erro ao gerar análise detalhada');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    therapeuticInsights,
    recommendations,
    generateEnhancedFeedback
  };
}
