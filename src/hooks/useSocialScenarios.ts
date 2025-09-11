import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SocialScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  difficulty_level: string;
  age_range: string;
  skills_focus: string[];
  scenario_data: any;
  choices: any[];
  educational_notes: string | null;
}

interface SocialSession {
  id: string;
  user_id: string;
  scenario_id: string;
  choices_made: any[];
  score: number;
  empathy_score: number;
  assertiveness_score: number;
  communication_score: number;
  completion_time_seconds: number | null;
  completed_at: string | null;
}

interface SocialProgress {
  skill_type: string;
  current_level: number;
  experience_points: number;
  scenarios_completed: number;
  best_scores: any;
}

interface SocialAchievement {
  name: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: any;
  stars_reward: number;
}

export const useSocialScenarios = (userId?: string) => {
  const [scenarios, setScenarios] = useState<SocialScenario[]>([]);
  const [userProgress, setUserProgress] = useState<SocialProgress[]>([]);
  const [userSessions, setUserSessions] = useState<SocialSession[]>([]);
  const [achievements, setAchievements] = useState<SocialAchievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all scenarios
  const fetchScenarios = async () => {
    try {
      const { data, error } = await supabase
        .from('social_scenarios')
        .select('*')
        .order('difficulty_level', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        choices: Array.isArray(item.choices) ? item.choices : JSON.parse(item.choices as string || '[]'),
        skills_focus: Array.isArray(item.skills_focus) ? item.skills_focus : []
      }));
      
      setScenarios(transformedData);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar cenários sociais",
        variant: "destructive",
      });
    }
  };

  // Fetch user progress
  const fetchUserProgress = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('social_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  // Fetch user sessions
  const fetchUserSessions = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('social_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        choices_made: Array.isArray(item.choices_made) ? item.choices_made : JSON.parse(item.choices_made as string || '[]')
      }));
      
      setUserSessions(transformedData);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('social_achievements')
        .select('*')
        .order('stars_reward', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Fetch user achievements
  const fetchUserAchievements = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_social_achievements')
        .select('achievement_name')
        .eq('user_id', userId);

      if (error) throw error;
      setUnlockedAchievements(data?.map(a => a.achievement_name) || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  // Complete a scenario session
  const completeSession = async (
    scenarioId: string,
    choicesMade: any[],
    scores: {
      empathy: number;
      assertiveness: number;
      communication: number;
    },
    completionTime: number
  ) => {
    if (!userId) return;

    try {
      const totalScore = Math.round((scores.empathy + scores.assertiveness + scores.communication) / 3);

      const { data, error } = await supabase
        .from('social_sessions')
        .insert({
          user_id: userId,
          scenario_id: scenarioId,
          choices_made: choicesMade,
          score: totalScore,
          empathy_score: scores.empathy,
          assertiveness_score: scores.assertiveness,
          communication_score: scores.communication,
          completion_time_seconds: completionTime,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Check for new achievements
      await checkAchievements();
      
      // Refresh data
      await Promise.all([
        fetchUserProgress(),
        fetchUserSessions(),
        fetchUserAchievements()
      ]);

      toast({
        title: "Cenário Concluído!",
        description: `Pontuação: ${totalScore}/5 - Continue praticando suas habilidades sociais!`,
      });

      return data;
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar progresso do cenário",
        variant: "destructive",
      });
    }
  };

  // Check for new achievements
  const checkAchievements = async () => {
    if (!userId) return;

    try {
      // Get current progress
      const { data: progressData } = await supabase
        .from('social_progress')
        .select('*')
        .eq('user_id', userId);

      const { data: sessionsData } = await supabase
        .from('social_sessions')
        .select('*')
        .eq('user_id', userId);

      if (!progressData || !sessionsData) return;

      const totalScenarios = sessionsData.length;
      const empathyChoices = sessionsData.reduce((sum, s) => sum + s.empathy_score, 0);
      const highAssertiveScenarios = sessionsData.filter(s => s.assertiveness_score >= 4).length;

      // Check each achievement
      const achievementChecks = [
        { name: 'first_scenario', condition: totalScenarios >= 1 },
        { name: 'empathy_champion', condition: empathyChoices >= 40 }, // 10 choices with avg 4
        { name: 'assertive_communicator', condition: highAssertiveScenarios >= 5 },
        { name: 'social_butterfly', condition: totalScenarios >= 15 },
        { name: 'perfect_score', condition: sessionsData.some(s => s.score >= 5) },
        { name: 'skill_master', condition: progressData.some(p => p.current_level >= 5) }
      ];

      for (const check of achievementChecks) {
        if (check.condition && !unlockedAchievements.includes(check.name)) {
          await supabase
            .from('user_social_achievements')
            .insert({
              user_id: userId,
              achievement_name: check.name
            });
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchScenarios(),
        fetchAchievements(),
        ...(userId ? [
          fetchUserProgress(),
          fetchUserSessions(),
          fetchUserAchievements()
        ] : [])
      ]);
      setLoading(false);
    };

    loadData();
  }, [userId]);

  return {
    scenarios,
    userProgress,
    userSessions,
    achievements,
    unlockedAchievements,
    loading,
    completeSession,
    fetchUserProgress,
    fetchUserSessions,
  };
};