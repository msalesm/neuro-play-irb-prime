import { useState, useCallback } from 'react';

interface SocialScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  options: { text: string; isCorrect: boolean; feedback: string }[];
}

interface SocialSession {
  id: string;
  score: number;
  completed_at: string;
}

const defaultScenarios: SocialScenario[] = [
  {
    id: '1',
    title: 'Dividir brinquedos',
    description: 'Seu amigo quer brincar com o seu brinquedo favorito. O que você faz?',
    category: 'sharing',
    difficulty: 1,
    options: [
      { text: 'Divido o brinquedo com meu amigo', isCorrect: true, feedback: 'Ótimo! Compartilhar é muito legal!' },
      { text: 'Não divido', isCorrect: false, feedback: 'Tente compartilhar, seus amigos vão gostar!' },
    ],
  },
  {
    id: '2',
    title: 'Cumprimentar alguém',
    description: 'Você encontra um colega na escola. O que você faz?',
    category: 'greeting',
    difficulty: 1,
    options: [
      { text: 'Digo "Oi!" e aceno', isCorrect: true, feedback: 'Perfeito! Cumprimentar é muito educado!' },
      { text: 'Ignoro', isCorrect: false, feedback: 'Cumprimentar as pessoas é gentil!' },
    ],
  },
];

export function useSocialScenarios(userId?: string) {
  const [scenarios] = useState<SocialScenario[]>(defaultScenarios);
  const [sessions] = useState<SocialSession[]>([]);
  const [loading] = useState(false);

  const completeSession = useCallback(async (score: number) => {
    console.log('Session completed with score:', score);
  }, []);

  return {
    scenarios,
    sessions,
    loading,
    completeSession,
  };
}
