import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CategoryScores {
  [key: string]: {
    score: number;
    count: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface SkillMetrics {
  [key: string]: {
    progress: number;
    sessions: number;
  };
}

export function useNeuroplasticity() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<CategoryScores>({});
  const [skillMetrics, setSkillMetrics] = useState<SkillMetrics>({});
  const [history, setHistory] = useState<any[]>([]);
  const [neuroplasticityData, setNeuroplasticityData] = useState({
    overallProgress: 0,
    cognitiveSkills: [] as any[],
    recentActivity: [] as any[],
    overall_score: 0,
    games_completed: 0,
    total_sessions: 0
  });

  useEffect(() => {
    if (user) {
      loadNeuroplasticityData();
    }
  }, [user]);

  const loadNeuroplasticityData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar todas as sessões de aprendizado do usuário
      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (sessions && sessions.length > 0) {
        // Mapear jogos para categorias cognitivas
        const categoryMapping: { [key: string]: string } = {
          'memory': 'Memória',
          'attention': 'Atenção',
          'logic': 'Lógica',
          'language': 'Linguagem',
          'math': 'Matemática',
          'executive': 'Funções Executivas'
        };

        // Calcular scores por categoria
        const categoryScores: CategoryScores = {};
        const skillMetricsData: SkillMetrics = {};
        
        sessions.forEach((session) => {
          const perfData = session.performance_data as any;
          const category = getCategoryFromGameType(session.game_type);
          
          if (!categoryScores[category]) {
            categoryScores[category] = { score: 0, count: 0, trend: 'stable' };
          }
          
          const score = calculateSessionScore(perfData);
          categoryScores[category].score += score;
          categoryScores[category].count += 1;

          // Skill metrics
          const skill = session.game_type;
          if (!skillMetricsData[skill]) {
            skillMetricsData[skill] = { progress: 0, sessions: 0 };
          }
          skillMetricsData[skill].progress += score;
          skillMetricsData[skill].sessions += 1;
        });

        // Normalizar scores (média)
        Object.keys(categoryScores).forEach(cat => {
          categoryScores[cat].score = Math.round(
            categoryScores[cat].score / categoryScores[cat].count
          );
        });

        // Calcular tendências
        calculateTrends(sessions, categoryScores);

        // Calcular score geral
        const totalScore = Object.values(categoryScores).reduce(
          (sum, cat) => sum + cat.score, 0
        );
        const avgScore = Math.round(totalScore / Object.keys(categoryScores).length) || 0;

        setScores(categoryScores);
        setSkillMetrics(skillMetricsData);
        setHistory(sessions);
        setNeuroplasticityData({
          overallProgress: avgScore,
          cognitiveSkills: Object.entries(categoryScores).map(([key, val]) => ({
            name: key,
            score: val.score,
            trend: val.trend
          })),
          recentActivity: sessions.slice(0, 10).map(s => ({
            game: s.game_type,
            date: s.created_at,
            score: calculateSessionScore(s.performance_data)
          })),
          overall_score: avgScore,
          games_completed: sessions.filter(s => s.completed).length,
          total_sessions: sessions.length
        });
      }
    } catch (error) {
      console.error('Error loading neuroplasticity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromGameType = (gameType: string): string => {
    const lower = gameType.toLowerCase();
    if (lower.includes('memoria') || lower.includes('memory')) return 'Memória';
    if (lower.includes('atencao') || lower.includes('attention') || lower.includes('foco')) return 'Atenção';
    if (lower.includes('logica') || lower.includes('logic')) return 'Lógica';
    if (lower.includes('lingua') || lower.includes('language') || lower.includes('silaba')) return 'Linguagem';
    if (lower.includes('numero') || lower.includes('math')) return 'Matemática';
    return 'Funções Executivas';
  };

  const calculateSessionScore = (perfData: any): number => {
    if (!perfData) return 50;
    
    const accuracy = perfData.accuracy || perfData.correctAnswers / (perfData.totalAttempts || 1) || 0.5;
    const reactionTime = perfData.reactionTime || perfData.avg_reaction_time_ms || 1000;
    
    // Score baseado em acurácia (0-100)
    let score = accuracy * 100;
    
    // Ajustar por tempo de reação (bonus se for rápido)
    if (reactionTime < 500) score += 10;
    else if (reactionTime > 2000) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const calculateTrends = (sessions: any[], categoryScores: CategoryScores) => {
    // Comparar primeira metade vs segunda metade das sessões
    const midPoint = Math.floor(sessions.length / 2);
    const recentSessions = sessions.slice(0, midPoint);
    const olderSessions = sessions.slice(midPoint);

    Object.keys(categoryScores).forEach(category => {
      const recentAvg = calculateCategoryAverage(recentSessions, category);
      const olderAvg = calculateCategoryAverage(olderSessions, category);
      
      if (recentAvg > olderAvg + 5) {
        categoryScores[category].trend = 'up';
      } else if (recentAvg < olderAvg - 5) {
        categoryScores[category].trend = 'down';
      } else {
        categoryScores[category].trend = 'stable';
      }
    });
  };

  const calculateCategoryAverage = (sessions: any[], category: string): number => {
    const categorySessions = sessions.filter(
      s => getCategoryFromGameType(s.game_type) === category
    );
    if (categorySessions.length === 0) return 0;
    
    const total = categorySessions.reduce(
      (sum, s) => sum + calculateSessionScore(s.performance_data), 0
    );
    return total / categorySessions.length;
  };

  const getCategoryProgress = (category: string): number => {
    return scores[category]?.score || 0;
  };

  const getSkillProgress = (skill: string): number => {
    const metric = skillMetrics[skill];
    if (!metric) return 0;
    return Math.round(metric.progress / metric.sessions);
  };

  const getCategoryTrend = (category: string): 'up' | 'down' | 'stable' => {
    return scores[category]?.trend || 'stable';
  };

  return {
    loading,
    scores,
    updateScores: loadNeuroplasticityData,
    neuroplasticityData,
    skillMetrics,
    history,
    getCategoryProgress,
    getSkillProgress,
    getCategoryTrend,
  };
}
