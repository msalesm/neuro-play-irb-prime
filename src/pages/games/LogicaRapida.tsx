import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Zap, Trophy, Clock, Sparkles } from "lucide-react";
import { hapticsEngine } from "@/lib/haptics";
import { useAuth } from "@/hooks/useAuth";
import { useGameSession } from '@/hooks/useGameSession';
import { GameExitButton, GameResultsDashboard } from '@/components/games';
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

type PatternType = 'sequence' | 'shape' | 'color';
type PatternItem = string | number;

interface Pattern {
  type: PatternType;
  items: PatternItem[];
  options: PatternItem[];
  correctAnswer: PatternItem;
  hint: string;
}

interface GameStats {
  level: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeLeft: number;
  streak: number;
  bestStreak: number;
  questionsInLevel: number;
}

// Expanded pattern database
const SEQUENCE_PATTERNS = [
  { items: [2, 4, 6, 8], answer: 10, hint: '+2' },
  { items: [1, 3, 5, 7], answer: 9, hint: '+2' },
  { items: [5, 10, 15, 20], answer: 25, hint: '+5' },
  { items: [1, 4, 9, 16], answer: 25, hint: 'quadrados' },
  { items: [1, 1, 2, 3, 5], answer: 8, hint: 'fibonacci' },
  { items: [3, 6, 12, 24], answer: 48, hint: '×2' },
  { items: [100, 90, 80, 70], answer: 60, hint: '-10' },
  { items: [1, 2, 4, 8], answer: 16, hint: '×2' },
  { items: [2, 6, 18, 54], answer: 162, hint: '×3' },
  { items: [10, 7, 4, 1], answer: -2, hint: '-3' },
];

const SHAPE_PATTERNS = [
  { items: ['🔵', '🔺', '🔵', '🔺'], answer: '🔵', hint: 'alternado' },
  { items: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', hint: 'A-A-B' },
  { items: ['🟢', '🔴', '🟡', '🟢', '🔴'], answer: '🟡', hint: 'ciclo de 3' },
  { items: ['🔷', '🔶', '🔷', '🔷', '🔶'], answer: '🔷', hint: 'A-B-A-A-B' },
  { items: ['🟣', '🟣', '⚪', '🟣', '🟣'], answer: '⚪', hint: 'A-A-B' },
];

const COLOR_PATTERNS = [
  { items: ['🔴', '🟡', '🔵', '🔴', '🟡'], answer: '🔵', hint: 'ciclo RGB' },
  { items: ['🟢', '🟢', '🔴', '🟢', '🟢'], answer: '🔴', hint: 'destaque' },
  { items: ['⬛', '⬜', '⬛', '⬜', '⬛'], answer: '⬜', hint: 'alternado' },
];

export default function LogicaRapida() {
  const { user } = useAuth();
  const audio = useAudioEngine();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver'>('idle');
  const reactionStartRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);

  const {
    sessionId, startSession, endSession, updateSession, isActive,
    recoveredSession, resumeSession, discardRecoveredSession
  } = useGameSession('logica-rapida');

  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<PatternItem | null>(null);
  const [stats, setStats] = useState<GameStats>({
    level: 1, score: 0, correctAnswers: 0, totalQuestions: 0,
    timeLeft: 60, streak: 0, bestStreak: 0, questionsInLevel: 0,
  });
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showResults, setShowResults] = useState(false);

  const generatePattern = useCallback((level: number): Pattern => {
    const types: PatternType[] = level >= 3 ? ['sequence', 'shape', 'color'] : ['sequence', 'shape'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'sequence') {
      const patterns = level >= 4 ? SEQUENCE_PATTERNS : SEQUENCE_PATTERNS.slice(0, 5);
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      const wrongs = [p.answer + 1, p.answer + 2, p.answer - 1].filter(o => o > 0 && o !== p.answer);
      return {
        type: 'sequence',
        items: p.items,
        options: [p.answer, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5),
        correctAnswer: p.answer,
        hint: p.hint,
      };
    } else if (type === 'shape') {
      const p = SHAPE_PATTERNS[Math.floor(Math.random() * SHAPE_PATTERNS.length)];
      const wrongs = ['🔶', '🔸', '🟪', '⬛', '💎'].filter(o => o !== p.answer);
      return {
        type: 'shape',
        items: p.items,
        options: [p.answer, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5),
        correctAnswer: p.answer,
        hint: p.hint,
      };
    } else {
      const p = COLOR_PATTERNS[Math.floor(Math.random() * COLOR_PATTERNS.length)];
      const wrongs = ['🟪', '🟫', '🟠', '⚪'].filter(o => o !== p.answer);
      return {
        type: 'color',
        items: p.items,
        options: [p.answer, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5),
        correctAnswer: p.answer,
        hint: p.hint,
      };
    }
  }, []);

  const startGame = useCallback(async () => {
    reactionTimesRef.current = [];
    try { await startSession({ score: 0, level: stats.level }, stats.level); } catch (e) { console.error(e); }

    const timeLimit = Math.max(30, 60 - (stats.level * 3));
    setGameState('playing');
    setStats(prev => ({ ...prev, timeLeft: timeLimit, questionsInLevel: 0, totalQuestions: 0, correctAnswers: 0, score: 0, streak: 0 }));

    const pattern = generatePattern(stats.level);
    setCurrentPattern(pattern);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setAnswerFeedback(null);
    reactionStartRef.current = performance.now();

    const timer = setInterval(() => {
      setStats(prev => {
        if (prev.timeLeft <= 1) {
          setGameState('gameOver');
          clearInterval(timer);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    setGameTimer(timer);
  }, [stats.level, generatePattern, startSession]);

  const handleAnswer = (answer: PatternItem) => {
    if (gameState !== 'playing' || showAnswer) return;

    // Track reaction
    const reactionTime = Math.round(performance.now() - reactionStartRef.current);
    reactionTimesRef.current.push(reactionTime);

    setSelectedAnswer(answer);
    setShowAnswer(true);
    const isCorrect = answer === currentPattern?.correctAnswer;
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      audio.playSuccess('medium');
      hapticsEngine.trigger('success');
    } else {
      audio.playError('soft');
      hapticsEngine.trigger('error');
    }

    const newStats = {
      ...stats,
      totalQuestions: stats.totalQuestions + 1,
      questionsInLevel: stats.questionsInLevel + 1,
      correctAnswers: isCorrect ? stats.correctAnswers + 1 : stats.correctAnswers,
      score: isCorrect ? stats.score + (20 * stats.level) : Math.max(0, stats.score - 5),
      streak: isCorrect ? stats.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
    };
    setStats(newStats);

    if (isActive) {
      const avgReaction = reactionTimesRef.current.length > 0
        ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;
      updateSession({
        score: newStats.score,
        moves: newStats.totalQuestions,
        correctMoves: newStats.correctAnswers,
        accuracy: newStats.totalQuestions > 0 ? (newStats.correctAnswers / newStats.totalQuestions) * 100 : 0,
        timeSpent: 60 - newStats.timeLeft,
        avgReactionTime: avgReaction,
      });
    }

    setTimeout(() => {
      if (newStats.questionsInLevel >= 5 && newStats.streak >= 3) {
        audio.playLevelUp();
        hapticsEngine.trigger('achievement');
        setStats(prev => ({ ...prev, level: Math.min(prev.level + 1, 10), questionsInLevel: 0 }));
      } else if (newStats.questionsInLevel >= 5) {
        setStats(prev => ({ ...prev, questionsInLevel: 0 }));
      }

      const nextPattern = generatePattern(newStats.level);
      setCurrentPattern(nextPattern);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setAnswerFeedback(null);
      reactionStartRef.current = performance.now();
    }, 1200);
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (gameTimer) clearInterval(gameTimer);
    } else if (gameState === 'paused') {
      setGameState('playing');
      const timer = setInterval(() => {
        setStats(prev => {
          if (prev.timeLeft <= 1) { setGameState('gameOver'); clearInterval(timer); return { ...prev, timeLeft: 0 }; }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
      setGameTimer(timer);
    }
  };

  const resetGame = () => {
    if (gameTimer) clearInterval(gameTimer);
    setGameState('idle');
    setCurrentPattern(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowResults(false);
    setStats({ level: 1, score: 0, correctAnswers: 0, totalQuestions: 0, timeLeft: 60, streak: 0, bestStreak: 0, questionsInLevel: 0 });
    reactionTimesRef.current = [];
  };

  useEffect(() => { return () => { if (gameTimer) clearInterval(gameTimer); }; }, [gameTimer]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-muted-foreground">Faça login para jogar.</p>
            <Button asChild><a href="/auth">Login</a></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
  const levelProgress = (stats.questionsInLevel / 5) * 100;
  const avgReaction = reactionTimesRef.current.length > 0
    ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <GameExitButton
          variant="quit"
          onExit={async () => {
            if (isActive) await endSession({ score: stats.score, moves: stats.totalQuestions, correctMoves: stats.correctAnswers, accuracy, timeSpent: 60 - stats.timeLeft });
          }}
          showProgress={gameState === 'playing'}
          currentProgress={stats.questionsInLevel}
          totalProgress={5}
        />
        <h1 className="text-lg font-bold">🧩 Lógica Rápida</h1>
        <div className="flex gap-1">
          {gameState === 'playing' && (
            <Button variant="ghost" size="icon" onClick={togglePause}><Pause className="h-5 w-5" /></Button>
          )}
          {gameState === 'paused' && (
            <Button variant="ghost" size="icon" onClick={togglePause}><Play className="h-5 w-5" /></Button>
          )}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-5 gap-1.5">
        {[
          { label: 'Nível', value: stats.level, color: 'text-primary' },
          { label: 'Pontos', value: stats.score, color: 'text-success' },
          { label: 'Tempo', value: `${stats.timeLeft}s`, color: stats.timeLeft <= 10 ? 'text-destructive' : 'text-info' },
          { label: 'Precisão', value: `${accuracy}%`, color: 'text-secondary' },
          { label: 'Série', value: stats.streak, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="text-center bg-card rounded-lg p-1.5 border border-border">
            <div className={cn("text-sm font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      {gameState !== 'idle' && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">Nível {stats.level}</span>
          <Progress value={levelProgress} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground">{stats.questionsInLevel}/5</span>
        </div>
      )}

      {/* Clinical Metric */}
      {gameState !== 'idle' && avgReaction > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Reação média: <strong className="text-foreground">{avgReaction}ms</strong></span>
        </div>
      )}

      {/* Game Area */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {gameState === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 text-center space-y-5">
                <div className="text-5xl">🧩</div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Lógica Rápida</h2>
                  <p className="text-sm text-muted-foreground">Identifique padrões em sequências</p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {[
                    { icon: <Zap className="h-4 w-4 text-primary" />, text: 'Identifique o padrão na sequência' },
                    { icon: <Clock className="h-4 w-4 text-primary" />, text: 'Responda antes do tempo acabar' },
                    { icon: <Trophy className="h-4 w-4 text-primary" />, text: '5 questões por nível, 3 seguidas para subir' },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
                      {tip.icon}
                      <span className="text-muted-foreground text-xs text-left">{tip.text}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={startGame} size="lg" className="w-full h-14 text-lg font-bold rounded-2xl gap-2">
                  <Play className="h-5 w-5 fill-current" /> Começar
                </Button>
              </motion.div>
            )}

            {gameState === 'paused' && (
              <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center space-y-4">
                <div className="text-4xl">⏸️</div>
                <h2 className="text-xl font-bold">Pausado</h2>
                <Button onClick={togglePause} size="lg" className="gap-2"><Play className="h-5 w-5" /> Retomar</Button>
              </motion.div>
            )}

            {gameState === 'playing' && currentPattern && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-5">
                {/* Pattern type badge */}
                <div className="text-center">
                  <span className="inline-block text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {currentPattern.type === 'sequence' ? '🔢 Números' : currentPattern.type === 'shape' ? '🔷 Formas' : '🎨 Cores'}
                    {' · '}Qual é o próximo?
                  </span>
                </div>

                {/* Pattern items */}
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {currentPattern.items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="w-14 h-14 bg-card border-2 border-primary/20 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm"
                    >
                      {item}
                    </motion.div>
                  ))}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-14 h-14 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center text-xl text-primary font-bold"
                  >
                    ?
                  </motion.div>
                </div>

                {/* Answer options - 2x2 grid, large touch targets */}
                <div className="grid grid-cols-2 gap-3">
                  {currentPattern.options.map((option, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.95 }}
                      disabled={showAnswer}
                      onClick={() => handleAnswer(option)}
                      className={cn(
                        "h-16 rounded-xl border-2 transition-all font-bold text-xl",
                        showAnswer && option === currentPattern.correctAnswer
                          ? 'bg-success/10 border-success text-success scale-105'
                          : showAnswer && option === selectedAnswer && option !== currentPattern.correctAnswer
                          ? 'bg-destructive/10 border-destructive text-destructive'
                          : 'bg-card border-border hover:border-primary active:bg-primary/5'
                      )}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "text-center text-sm font-bold py-2 rounded-xl",
                        answerFeedback === 'correct' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {answerFeedback === 'correct'
                        ? `✅ +${20 * stats.level} pontos!`
                        : `❌ Resposta: ${currentPattern.correctAnswer}`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {gameState === 'gameOver' && !showResults && (
              <motion.div key="over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center space-y-5">
                <div className="text-5xl">⏱️</div>
                <h2 className="text-xl font-bold">Tempo Esgotado!</h2>
                <p className="text-sm text-muted-foreground">{stats.correctAnswers}/{stats.totalQuestions} corretas · {accuracy}% precisão</p>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setShowResults(true)} className="h-12 gap-2 rounded-xl font-bold">
                    <Trophy className="h-4 w-4" /> Resultados
                  </Button>
                  <Button variant="outline" onClick={() => { resetGame(); startGame(); }} className="h-12 gap-2 rounded-xl">
                    <Play className="h-4 w-4" /> Jogar
                  </Button>
                </div>
              </motion.div>
            )}

            {showResults && (
              <div className="p-2">
                <GameResultsDashboard
                  gameType="logic_game"
                  gameTitle="Lógica Rápida"
                  session={{
                    score: stats.score, accuracy, timeSpent: 60 - stats.timeLeft,
                    level: stats.level, correctMoves: stats.correctAnswers, totalMoves: stats.totalQuestions,
                  }}
                  cognitiveMetrics={{
                    attention: stats.totalQuestions > 0 ? Math.min(100, Math.round((stats.correctAnswers / stats.totalQuestions) * 100)) : 0,
                    memory: 0, // not measured
                    flexibility: stats.level > 1 ? Math.min(100, stats.level * 15) : 0,
                    processing: avgReaction > 0 ? Math.max(0, Math.min(100, Math.round(100 - (avgReaction / 50)))) : 0,
                    inhibition: stats.bestStreak > 0 ? Math.min(100, stats.bestStreak * 20) : 0,
                  }}
                  insights={[
                    `Acertou ${stats.correctAnswers} de ${stats.totalQuestions} (${accuracy}%).`,
                    avgReaction > 0 ? `Tempo médio de reação: ${avgReaction}ms.` : '',
                    `Melhor série: ${stats.bestStreak} acertos consecutivos.`,
                  ].filter(Boolean)}
                  nextSteps={[
                    { title: 'Jogar Novamente', description: 'Tente superar seu desempenho', action: () => { setShowResults(false); resetGame(); startGame(); } },
                    { title: 'Outros Jogos', description: 'Explore mais desafios cognitivos', action: () => window.location.href = '/games' },
                  ]}
                  onClose={() => { setShowResults(false); resetGame(); }}
                  onPlayAgain={() => { setShowResults(false); resetGame(); startGame(); }}
                />
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Therapeutic Benefits */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: '🧠', label: 'Raciocínio', desc: 'Lógico' },
          { icon: '🔍', label: 'Padrões', desc: 'Reconhecimento' },
          { icon: '⚡', label: 'Flexibilidade', desc: 'Cognitiva' },
        ].map(b => (
          <div key={b.label} className="p-3 bg-card rounded-xl border border-border">
            <div className="text-xl mb-1">{b.icon}</div>
            <div className="text-xs font-semibold">{b.label}</div>
            <div className="text-[10px] text-muted-foreground">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
