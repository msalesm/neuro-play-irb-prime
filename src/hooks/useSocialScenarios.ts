import { useState, useCallback } from 'react';

export interface SocialScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  skills_focus: string[];
  options: { text: string; isCorrect: boolean; feedback: string; empathy?: number; assertiveness?: number; communication?: number }[];
}

export interface SocialSession {
  id: string;
  score: number;
  completed_at: string;
}

export interface SocialProgress {
  totalSessions: number;
  avgScore: number;
}

export interface SocialAchievement {
  name: string;
  title: string;
  description: string;
  icon: string;
  stars_reward: number;
  unlocked: boolean;
}

const defaultScenarios: SocialScenario[] = [
  {
    id: '1',
    title: 'Dividir brinquedos',
    description: 'Seu amigo quer brincar com o seu brinquedo favorito. O que você faz?',
    category: 'sharing',
    difficulty: 1,
    difficulty_level: 'beginner',
    skills_focus: ['communication', 'empathy'],
    options: [
      { text: 'Divido o brinquedo com meu amigo', isCorrect: true, feedback: 'Ótimo! Compartilhar é muito legal!', empathy: 5, assertiveness: 3, communication: 4 },
      { text: 'Não divido', isCorrect: false, feedback: 'Tente compartilhar, seus amigos vão gostar!', empathy: 1, assertiveness: 2, communication: 1 },
    ],
  },
  {
    id: '2',
    title: 'Cumprimentar alguém',
    description: 'Você encontra um colega na escola. O que você faz?',
    category: 'greeting',
    difficulty: 1,
    difficulty_level: 'beginner',
    skills_focus: ['communication'],
    options: [
      { text: 'Digo "Oi!" e aceno', isCorrect: true, feedback: 'Perfeito! Cumprimentar é muito educado!', empathy: 3, assertiveness: 4, communication: 5 },
      { text: 'Ignoro', isCorrect: false, feedback: 'Cumprimentar as pessoas é gentil!', empathy: 1, assertiveness: 1, communication: 1 },
    ],
  },
];

export function useSocialScenarios(userId?: string) {
  const [scenarios] = useState<SocialScenario[]>(defaultScenarios);
  const [userSessions] = useState<SocialSession[]>([]);
  const [userProgress] = useState<SocialProgress>({ totalSessions: 0, avgScore: 0 });
  const [achievements] = useState<SocialAchievement[]>([]);
  const [unlockedAchievements] = useState<string[]>([]);
  const [loading] = useState(false);

  const completeSession = useCallback(async (
    scenarioId: string,
    choices: any[],
    scores: { empathy: number; assertiveness: number; communication: number },
    completionTime: number
  ) => {
    console.log('Session completed:', { scenarioId, scores, completionTime });
  }, []);

  return {
    scenarios,
    userProgress,
    userSessions,
    achievements,
    unlockedAchievements,
    loading,
    completeSession,
  };
}
