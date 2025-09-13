import { useState, useCallback } from 'react';

interface GameSession {
  gameType: string;
  startTime: Date;
  endTime?: Date;
  moves: number;
  correctMoves: number;
  level: number;
  hintsUsed: number;
  mistakes: number;
}

interface ScoreCalculation {
  baseScore: number;
  accuracyBonus: number;
  timeBonus: number;
  difficultyMultiplier: number;
  levelBonus: number;
  totalScore: number;
  xpGained: number;
  starsEarned: number;
  coinsEarned: number;
  feedback: {
    correct: boolean;
    explanation: string;
    skillImproved: string;
    tip?: string;
    encouragement: string;
    nextAction?: string;
    pedagogicalNote: string;
  };
}

export function useUnifiedScoring() {
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);

  const startSession = useCallback((gameType: string, level: number = 1) => {
    setCurrentSession({
      gameType,
      startTime: new Date(),
      moves: 0,
      correctMoves: 0,
      level,
      hintsUsed: 0,
      mistakes: 0,
    });
  }, []);

  const recordMove = useCallback((correct: boolean) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        moves: prev.moves + 1,
        correctMoves: correct ? prev.correctMoves + 1 : prev.correctMoves,
        mistakes: correct ? prev.mistakes : prev.mistakes + 1,
      };
    });
  }, []);

  const recordHint = useCallback(() => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      };
    });
  }, []);

  const calculateScore = useCallback((sessionOverride?: Partial<GameSession>): ScoreCalculation => {
    const session = { ...currentSession, ...sessionOverride };
    if (!session) {
      throw new Error('No active session to calculate score from');
    }

    const endTime = session.endTime || new Date();
    const duration = (endTime.getTime() - session.startTime.getTime()) / 1000; // seconds
    const accuracy = session.moves > 0 ? (session.correctMoves / session.moves) * 100 : 0;

    // Base score calculation
    const baseScore = session.correctMoves * 10;

    // Accuracy bonus (0-50% based on accuracy)
    const accuracyBonus = Math.round(accuracy / 2);

    // Time bonus (faster = better, but reasonable time)
    const expectedTime = session.level * 30; // Expected time per level
    const timeEfficiency = Math.max(0, (expectedTime - duration) / expectedTime);
    const timeBonus = Math.round(timeEfficiency * 30);

    // Difficulty multiplier based on level
    const difficultyMultiplier = 1 + (session.level - 1) * 0.2;

    // Level completion bonus
    const levelBonus = session.level * 5;

    // Total score
    const totalScore = Math.round(
      (baseScore + accuracyBonus + timeBonus + levelBonus) * difficultyMultiplier
    );

    // XP calculation (more educational focused)
    const xpGained = Math.round(totalScore * 0.8 + (session.level * 10));

    // Stars (achievements based on performance)
    let starsEarned = 0;
    if (accuracy >= 90) starsEarned = 3;
    else if (accuracy >= 70) starsEarned = 2;
    else if (accuracy >= 50) starsEarned = 1;

    // Coins (currency for customization)
    const coinsEarned = Math.round(xpGained * 0.1);

    // Generate educational feedback
    const feedback = generateFeedback(session, accuracy, starsEarned);

    return {
      baseScore,
      accuracyBonus,
      timeBonus,
      difficultyMultiplier,
      levelBonus,
      totalScore,
      xpGained,
      starsEarned,
      coinsEarned,
      feedback,
    };
  }, [currentSession]);

  const endSession = useCallback((): ScoreCalculation => {
    if (!currentSession) {
      throw new Error('No active session to end');
    }

    const result = calculateScore({ endTime: new Date() });
    setCurrentSession(null);
    return result;
  }, [currentSession, calculateScore]);

  return {
    currentSession,
    startSession,
    recordMove,
    recordHint,
    calculateScore,
    endSession,
  };
}

function generateFeedback(
  session: GameSession, 
  accuracy: number, 
  stars: number
): ScoreCalculation['feedback'] {
  const gameType = session.gameType.toLowerCase();
  
  // Game-specific educational content
  const gameContent = {
    'memoria-colorida': {
      skillImproved: 'Memória de Trabalho',
      explanation: 'Você exercitou sua memória de trabalho, que é essencial para manter informações temporariamente enquanto realiza tarefas. Isso fortalece conexões neurais no córtex pré-frontal.',
      pedagogicalNote: 'Este exercício desenvolve a capacidade de retenção sequencial, fundamental para leitura, matemática e resolução de problemas complexos.'
    },
    'foco-floresta': {
      skillImproved: 'Atenção Sustentada',
      explanation: 'Você treinou sua capacidade de manter o foco por períodos prolongados, fortalecendo redes neurais de atenção no cérebro.',
      pedagogicalNote: 'A atenção sustentada é a base para todos os aprendizados acadêmicos, especialmente importante para crianças com TDAH.'
    },
    'logica-rapida': {
      skillImproved: 'Raciocínio Lógico',
      explanation: 'Você desenvolveu habilidades de pensamento lógico e resolução de problemas, exercitando o córtex pré-frontal.',
      pedagogicalNote: 'O raciocínio lógico é fundamental para matemática, ciências e pensamento crítico em todas as disciplinas.'
    }
  };

  const content = gameContent[gameType as keyof typeof gameContent] || {
    skillImproved: 'Habilidades Cognitivas',
    explanation: 'Você exercitou importantes funções cerebrais que contribuem para o aprendizado e desenvolvimento.',
    pedagogicalNote: 'Exercícios cognitivos regulares fortalecem conexões neurais e melhoram o desempenho acadêmico.'
  };

  // Performance-based feedback
  let correct = accuracy >= 50;
  let encouragement = '';
  let tip = '';
  let nextAction = '';

  if (stars === 3) {
    encouragement = 'Excelente trabalho! Você mostrou grande concentração e precisão. Continue assim!';
    nextAction = 'Experimente um nível mais desafiador';
  } else if (stars === 2) {
    encouragement = 'Muito bem! Você está no caminho certo. Com mais prática, ficará ainda melhor!';
    tip = 'Tente se concentrar mais na precisão que na velocidade';
    nextAction = 'Pratique mais este nível';
  } else if (stars === 1) {
    encouragement = 'Bom trabalho! Todo aprendizado é importante. Continue praticando!';
    tip = 'Não se preocupe com o tempo, foque em entender o padrão';
    nextAction = 'Repita este exercício';
  } else {
    encouragement = 'Não desista! Aprender requer paciência. Cada tentativa te deixa mais forte!';
    tip = 'Tente usar as dicas disponíveis e vá devagar';
    nextAction = 'Tente novamente com calma';
  }

  // Mistake-based tips
  if (session.mistakes > session.moves * 0.5) {
    tip = 'Observe com mais atenção antes de responder. A pressa pode atrapalhar o aprendizado.';
  }

  if (session.hintsUsed > 2) {
    tip = 'As dicas são úteis! Continue usando-as até se sentir mais confiante.';
  }

  return {
    correct,
    explanation: content.explanation,
    skillImproved: content.skillImproved,
    tip,
    encouragement,
    nextAction,
    pedagogicalNote: content.pedagogicalNote,
  };
}