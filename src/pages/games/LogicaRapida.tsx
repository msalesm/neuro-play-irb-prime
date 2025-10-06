import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Trophy, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { SessionRecoveryModal } from '@/components/SessionRecoveryModal';
import { GameExitButton } from '@/components/GameExitButton';
import { useEducationalSystem } from "@/hooks/useEducationalSystem";
import { useAudioEngine } from "@/hooks/useAudioEngine";

type PatternType = 'sequence' | 'shape' | 'color' | 'number';
type PatternItem = string | number;

interface Pattern {
  type: PatternType;
  items: PatternItem[];
  options: PatternItem[];
  correctAnswer: PatternItem;
}

interface GameStats {
  level: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeLeft: number;
  streak: number;
  bestTime: number;
  questionsInLevel: number;
}

const SEQUENCE_PATTERNS = [
  { items: [2, 4, 6, 8], answer: 10 },
  { items: [1, 3, 5, 7], answer: 9 },
  { items: [5, 10, 15, 20], answer: 25 },
  { items: [1, 4, 9, 16], answer: 25 }, // squares
  { items: [1, 1, 2, 3, 5], answer: 8 }, // fibonacci
];

const SHAPE_PATTERNS = [
  { items: ['🔵', '🔺', '🔵', '🔺'], answer: '🔵' },
  { items: ['⭐', '⭐', '⭐⭐', '⭐⭐'], answer: '⭐⭐⭐' },
  { items: ['🟢', '🔴', '🟡', '🟢'], answer: '🔴' },
];

const COLOR_PATTERNS = [
  { items: ['🔴', '🟡', '🔵', '🔴', '🟡'], answer: '🔵' },
  { items: ['🟢', '🟢', '🔴', '🔴', '🟡'], answer: '🟡' },
];

export default function LogicaRapida() {
  const { user } = useAuth();
  const { getTrailByCategory } = useEducationalSystem();
  const audio = useAudioEngine();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver'>('idle');
  
  const {
    currentSession,
    isSaving,
    startSession: startAutoSave,
    updateSession: updateAutoSave,
    completeSession: completeAutoSave,
    abandonSession
  } = useAutoSave({ saveInterval: 10000, saveOnUnload: true });

  const {
    unfinishedSessions,
    hasUnfinishedSessions,
    resumeSession,
    discardSession
  } = useSessionRecovery('logic_game');

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<PatternItem | null>(null);
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    timeLeft: 60,
    streak: 0,
    bestTime: 0,
    questionsInLevel: 0,
  });
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Generate a pattern based on level
  const generatePattern = useCallback((level: number): Pattern => {
    const patternTypes: PatternType[] = level >= 3 ? ['sequence', 'shape', 'color', 'number'] : ['sequence', 'shape'];
    const randomType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    switch (randomType) {
      case 'sequence': {
        const patterns = level >= 4 ? SEQUENCE_PATTERNS : SEQUENCE_PATTERNS.slice(0, 3);
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const wrongOptions = [
          pattern.answer + 1,
          pattern.answer + 2,
          pattern.answer - 1,
        ].filter(opt => opt > 0);
        
        return {
          type: 'sequence',
          items: pattern.items,
          options: [pattern.answer, ...wrongOptions].sort(() => Math.random() - 0.5),
          correctAnswer: pattern.answer,
        };
      }
      
      case 'shape': {
        const pattern = SHAPE_PATTERNS[Math.floor(Math.random() * SHAPE_PATTERNS.length)];
        const wrongOptions = ['🔶', '🔸', '🟪', '⬛'].filter(opt => opt !== pattern.answer);
        
        return {
          type: 'shape',
          items: pattern.items,
          options: [pattern.answer, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5),
          correctAnswer: pattern.answer,
        };
      }
      
      case 'color':
      case 'number': {
        const pattern = COLOR_PATTERNS[Math.floor(Math.random() * COLOR_PATTERNS.length)];
        const wrongOptions = ['🟪', '🟫', '⚫', '⚪'].filter(opt => opt !== pattern.answer);
        
        return {
          type: 'color',
          items: pattern.items,
          options: [pattern.answer, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5),
          correctAnswer: pattern.answer,
        };
      }
    }
  }, []);

  // Start game
  const startGame = useCallback(async () => {
    const logicTrail = getTrailByCategory('logic');
    const sessionId = await startAutoSave('logic_game', stats.level, {
      trailId: logicTrail?.id
    });

    if (sessionId) {
      setGameState('playing');
      setStats(prev => ({
        ...prev,
        timeLeft: Math.max(30, 60 - (prev.level * 3)),
        questionsInLevel: 0,
      }));
    
    const pattern = generatePattern(stats.level);
    setCurrentPattern(pattern);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setAnswerFeedback(null);
    
    // Start timer
      const timer = setInterval(() => {
        setStats(prev => {
          if (prev.timeLeft <= 1) {
            setGameState('gameOver');
            if (timer) clearInterval(timer);
            
            // Complete session on time out
            completeAutoSave({
              score: prev.score,
              moves: prev.totalQuestions,
              correctMoves: prev.correctAnswers,
              accuracy: (prev.correctAnswers / prev.totalQuestions) * 100,
              additionalData: {
                level: prev.level,
                reason: 'timeout'
              }
            });
            
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    
    setGameTimer(timer);
    }
  }, [stats.level, generatePattern]);

  const handleResumeSession = async (session: any) => {
    setStats({
      ...stats,
      score: session.performance_data.score || 0,
      level: session.level,
      correctAnswers: session.performance_data.correctAnswers || 0,
      totalQuestions: session.performance_data.totalQuestions || 0
    });
    
    const logicTrail = getTrailByCategory('logic');
    await startAutoSave('logic_game', session.level, {
      sessionId: session.id,
      trailId: logicTrail?.id
    });

    setGameState('idle');
    setShowRecoveryModal(false);
  };

  useEffect(() => {
    if (hasUnfinishedSessions && gameState === 'idle' && !currentSession) {
      setShowRecoveryModal(true);
    }
  }, [hasUnfinishedSessions, gameState, currentSession]);

  // Handle answer selection
  const handleAnswer = (answer: PatternItem) => {
    if (gameState !== 'playing' || showAnswer) return;
    
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    const isCorrect = answer === currentPattern?.correctAnswer;
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');
    
    // Audio feedback
    if (isCorrect) {
      audio.playSuccess('medium');
      audio.speak('Correto!', { rate: 1.1 });
    } else {
      audio.playError('soft');
      audio.speak('Tente novamente', { rate: 0.9 });
    }
    
    const newStats = {
      ...stats,
      totalQuestions: stats.totalQuestions + 1,
      questionsInLevel: stats.questionsInLevel + 1,
    };

    if (isCorrect) {
      newStats.correctAnswers = stats.correctAnswers + 1;
      newStats.score = stats.score + (20 * stats.level);
      newStats.streak = stats.streak + 1;
    } else {
      newStats.streak = 0;
      newStats.score = Math.max(0, stats.score - 5);
    }

    setStats(newStats);

    // Auto-save progress
    updateAutoSave({
      score: newStats.score,
      moves: newStats.totalQuestions,
      correctMoves: newStats.correctAnswers,
      additionalData: {
        level: newStats.level,
        streak: newStats.streak,
        timeLeft: newStats.timeLeft
      }
    });

    // Check level progression
    setTimeout(() => {
      if (newStats.questionsInLevel >= 5) {
        // Level completed
        if (newStats.streak >= 3) {
          // Level up
          audio.playLevelUp();
          audio.speak('Nível aumentado! Parabéns!', { rate: 1.0 });
          setStats(prev => ({ 
            ...prev, 
            level: Math.min(prev.level + 1, 10),
            questionsInLevel: 0,
          }));
        } else {
          // Reset level progress
          setStats(prev => ({ ...prev, questionsInLevel: 0 }));
        }
      }
      
      // Generate next pattern
      const nextPattern = generatePattern(newStats.level);
      setCurrentPattern(nextPattern);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setAnswerFeedback(null);
    }, 1500);
  };

  // Pause/Resume game
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (gameTimer) clearInterval(gameTimer);
    } else if (gameState === 'paused') {
      setGameState('playing');
      const timer = setInterval(() => {
        setStats(prev => {
          if (prev.timeLeft <= 1) {
            setGameState('gameOver');
            if (timer) clearInterval(timer);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
      setGameTimer(timer);
    }
  };

  // Reset game
  const resetGame = () => {
    if (gameTimer) clearInterval(gameTimer);
    setGameState('idle');
    setCurrentPattern(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setAnswerFeedback(null);
    setStats({
      level: 1,
      score: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      timeLeft: 60,
      streak: 0,
      bestTime: stats.bestTime, // Keep best time
      questionsInLevel: 0,
    });
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [gameTimer]);

  // Login required check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para jogar Lógica Rápida, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
  const levelProgress = (stats.questionsInLevel / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-card py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <SessionRecoveryModal
          open={showRecoveryModal}
          sessions={unfinishedSessions}
          onResume={handleResumeSession}
          onDiscard={async (sessionId) => {
            await discardSession(sessionId);
            setShowRecoveryModal(false);
          }}
          onStartNew={() => setShowRecoveryModal(false)}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {isSaving && <Badge variant="outline">💾 Salvando...</Badge>}
            <GameExitButton
              variant="quit"
              onExit={async () => {
                await abandonSession();
              }}
              showProgress={gameState === 'playing'}
              currentProgress={stats.questionsInLevel}
              totalProgress={5}
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
              🧩 Lógica Rápida
            </h1>
            <p className="text-muted-foreground text-sm">Quebra-cabeças e padrões</p>
          </div>

          <div className="flex gap-2">
            {gameState === 'playing' && (
              <Button variant="outline" onClick={togglePause} size="sm" className="gap-2">
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}
            {gameState === 'paused' && (
              <Button variant="outline" onClick={togglePause} size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                Retomar
              </Button>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-primary">{stats.level}</div>
              <div className="text-xs text-muted-foreground">Nível</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-600">{stats.score}</div>
              <div className="text-xs text-muted-foreground">Pontos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-red-600">{stats.timeLeft}s</div>
              <div className="text-xs text-muted-foreground">Tempo</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Precisão</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.streak}</div>
              <div className="text-xs text-muted-foreground">Sequência</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        {gameState !== 'idle' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso do Nível</span>
                <span className="text-sm text-muted-foreground">
                  {stats.questionsInLevel}/5 questões
                </span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Game Area */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {gameState === 'idle' && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Como Jogar</h2>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Identifique o padrão na sequência
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Escolha a resposta correta
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Responda 5 questões por nível
                    </p>
                  </div>
                </div>
                
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Começar Jogo
                </Button>
              </div>
            )}

            {gameState === 'paused' && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Jogo Pausado</h2>
                <p className="text-muted-foreground">Clique em "Retomar" para continuar</p>
              </div>
            )}

            {(gameState === 'playing' && currentPattern) && (
              <div className="space-y-6">
                {/* Pattern Display */}
                <div className="text-center">
                  <Badge variant="outline" className="mb-4">
                    Qual é o próximo item na sequência?
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground mb-6">
                    Tipo: {currentPattern.type === 'sequence' ? 'Números' : 
                           currentPattern.type === 'shape' ? 'Formas' : 'Cores'}
                  </div>
                </div>

                {/* Pattern Items */}
                <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
                  {currentPattern.items.map((item, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-white border-2 border-primary/30 rounded-xl flex items-center justify-center text-2xl font-bold shadow-md"
                    >
                      {item}
                    </div>
                  ))}
                  
                  <div className="w-16 h-16 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center text-2xl text-primary">
                    ?
                  </div>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
                  {currentPattern.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={showAnswer}
                      className={`
                        w-full h-16 rounded-xl border-2 transition-all duration-200 font-bold text-lg
                        ${showAnswer && option === currentPattern.correctAnswer
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : showAnswer && option === selectedAnswer && option !== currentPattern.correctAnswer
                          ? 'bg-red-100 border-red-500 text-red-700'
                          : 'bg-white border-primary/30 hover:border-primary hover:scale-105'
                        }
                        ${showAnswer ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Answer Feedback */}
                {showAnswer && (
                  <div className="text-center">
                    {answerFeedback === 'correct' ? (
                      <div className="text-green-600 font-semibold">
                        ✅ Correto! +{20 * stats.level} pontos
                      </div>
                    ) : (
                      <div className="text-red-600 font-semibold">
                        ❌ Incorreto. A resposta era: {currentPattern.correctAnswer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Fim de Jogo!</h2>
                  <p className="text-muted-foreground">
                    Você chegou ao nível {stats.level} com {stats.score} pontos
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Acertos: {stats.correctAnswers}/{stats.totalQuestions}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      Precisão: {accuracy}%
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={startGame} className="gap-2">
                    <Play className="w-4 h-4" />
                    Jogar Novamente
                  </Button>
                  <Button variant="outline" onClick={resetGame} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reiniciar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Benefícios Terapêuticos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-primary">Raciocínio Lógico</h4>
                <p className="text-muted-foreground">Desenvolve capacidade de identificar padrões e relações</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Resolução de Problemas</h4>
                <p className="text-muted-foreground">Melhora estratégias de análise e solução sistemática</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Flexibilidade Cognitiva</h4>
                <p className="text-muted-foreground">Fortalece adaptação a diferentes tipos de desafios lógicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}