import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LearningTrail {
  id: string;
  cognitive_category: string;
  current_level: number;
  max_level_unlocked: number;
  total_xp: number;
  completed_exercises: number;
}

export interface NeurodiversityProfile {
  id: string;
  detected_conditions: string[];
  last_assessment: string;
  needs_educator_review: boolean;
}

interface RecentSession {
  id: string;
  game_type: string;
  created_at: string;
  duration: number;
  score: number;
}

export function useEducationalSystem() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trails, setTrails] = useState<LearningTrail[]>([]);
  const [profile, setProfile] = useState<NeurodiversityProfile | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    if (user) {
      loadEducationalData();
    }
  }, [user]);

  const loadEducationalData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar sessões de aprendizado
      const { data: sessions, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;

      // Buscar screenings para perfil de neurodiversidade
      const { data: screenings, error: screeningsError } = await supabase
        .from('screenings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (screeningsError) throw screeningsError;

      // Processar trilhas de aprendizado por categoria
      const trailsData = calculateTrails(sessions || []);
      setTrails(trailsData);

      // Processar perfil de neurodiversidade
      if (screenings && screenings.length > 0) {
        const detectedConditions: string[] = [];
        screenings.forEach(screening => {
          if (screening.score > 70) {
            detectedConditions.push(screening.type);
          }
        });

        setProfile({
          id: user.id,
          detected_conditions: detectedConditions,
          last_assessment: screenings[0].created_at,
          needs_educator_review: detectedConditions.length > 0
        });
      }

      // Processar sessões recentes
      const recentData = (sessions || []).slice(0, 10).map(s => ({
        id: s.id,
        game_type: s.game_type,
        created_at: s.created_at,
        duration: s.session_duration_seconds || 0,
        score: calculateScore(s.performance_data)
      }));
      setRecentSessions(recentData);

    } catch (error) {
      console.error('Error loading educational data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrails = (sessions: any[]): LearningTrail[] => {
    const categories = ['Memória', 'Atenção', 'Lógica', 'Linguagem', 'Matemática', 'Funções Executivas'];
    
    return categories.map(category => {
      const categorySessions = sessions.filter(s => 
        getCategoryFromGame(s.game_type) === category
      );

      const totalXP = categorySessions.reduce((sum, s) => {
        const score = calculateScore(s.performance_data);
        return sum + Math.round(score / 10); // XP baseado no score
      }, 0);

      const currentLevel = Math.floor(totalXP / 100) + 1;
      const maxLevel = Math.min(currentLevel + 1, 10);

      return {
        id: category.toLowerCase().replace(/\s/g, '_'),
        cognitive_category: category,
        current_level: currentLevel,
        max_level_unlocked: maxLevel,
        total_xp: totalXP,
        completed_exercises: categorySessions.filter(s => s.completed).length
      };
    });
  };

  const getCategoryFromGame = (gameType: string): string => {
    const lower = gameType.toLowerCase();
    if (lower.includes('memoria') || lower.includes('memory')) return 'Memória';
    if (lower.includes('atencao') || lower.includes('attention') || lower.includes('foco')) return 'Atenção';
    if (lower.includes('logica') || lower.includes('logic')) return 'Lógica';
    if (lower.includes('lingua') || lower.includes('language') || lower.includes('silaba')) return 'Linguagem';
    if (lower.includes('numero') || lower.includes('math')) return 'Matemática';
    return 'Funções Executivas';
  };

  const calculateScore = (perfData: any): number => {
    if (!perfData) return 50;
    const accuracy = perfData.accuracy || perfData.correctAnswers / (perfData.totalAttempts || 1) || 0.5;
    return Math.round(accuracy * 100);
  };

  const recordLearningSession = async (gameType: string, duration: number, performanceData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          game_type: gameType,
          session_duration_seconds: duration,
          performance_data: performanceData,
          completed: true
        });

      if (error) throw error;
      await loadEducationalData();
    } catch (error) {
      console.error('Error recording session:', error);
    }
  };

  const getTrailByCategory = (category: string) => {
    return trails.find(t => t.cognitive_category === category) || null;
  };

  const getStrengths = (): string[] => {
    return trails
      .filter(t => t.current_level >= 5)
      .map(t => t.cognitive_category);
  };

  const getWeaknesses = (): string[] => {
    return trails
      .filter(t => t.current_level < 3)
      .map(t => t.cognitive_category);
  };

  return {
    loading,
    trails,
    profile,
    startTrail: loadEducationalData,
    updateProgress: loadEducationalData,
    assessNeurodiversity: loadEducationalData,
    learningTrails: trails,
    neurodiversityProfile: profile,
    recentSessions,
    recordLearningSession,
    getTrailByCategory,
    showFeedback: async () => {},
    recordProgress: async () => ({ success: true }),
    getStrengths,
    getWeaknesses,
  };
}
