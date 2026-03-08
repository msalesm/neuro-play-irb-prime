import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, RotateCcw, Flame, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';

/**
 * BATERIA MÍNIMA - DOMÍNIO 6: Persistência Comportamental
 * 
 * Desafio progressivo com opção de desistência
 * Métricas: tempo investido, tentativas, recuperação após erro
 */

interface PuzzleLevel {
  level: number;
  size: number; // grid size
  target: number[]; // target pattern (cell indices)
  timeLimit: number; // seconds
}

const generateLevel = (level: number): PuzzleLevel => {
  const size = Math.min(6, 3 + Math.floor(level / 3));
  const totalCells = size * size;
  const targetCount = Math.min(totalCells - 1, 2 + level);
  const indices = Array.from({ length: totalCells }, (_, i) => i);
  
  // Shuffle and pick
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  return {
    level,
    size,
    target: indices.slice(0, targetCount).sort((a, b) => a - b),
    timeLimit: Math.max(10, 30 - level * 2),
  };
};

export default function BehavioralPersistence() {
  const navigate = useNavigate();
  const { childProfileId, isTestMode } = useGameProfile();

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  const [currentLevel, setCurrentLevel] = useState<PuzzleLevel | null>(null);
  const [levelNum, setLevelNum] = useState(1);
  const [phase, setPhase] = useState<'showing' | 'input' | 'feedback'>('showing');
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPattern, setShowPattern] = useState(true);

  const [totalAttempts, setTotalAttempts] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [recoveries, setRecoveries] = useState(0);
  const [lastWasError, setLastWasError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const { startSession, endSession } = useGameSession(
    'behavioral-persistence',
    childProfileId || undefined
  );

  const startNewLevel = (level: number) => {
    const puzzle = generateLevel(level);
    setCurrentLevel(puzzle);
    setLevelNum(level);
    setPhase('showing');
    setSelectedCells(new Set());
    setShowPattern(true);
    setTimeLeft(puzzle.timeLimit);

    // Show pattern for a duration based on level
    const showTime = Math.max(1000, 3000 - level * 200);
    setTimeout(() => {
      setShowPattern(false);
      setPhase('input');
    }, showTime);
  };

  const startGame = async () => {
    setIsPlaying(true);
    setGameComplete(false);
    setGaveUp(false);
    setTotalAttempts(0);
    setConsecutiveErrors(0);
    setMaxLevel(0);
    setRecoveries(0);
    setLastWasError(false);
    setStartTime(Date.now());

    if (!isTestMode) await startSession({ difficulty_level: 1 });

    startNewLevel(1);
  };

  // Timer
  useEffect(() => {
    if (phase !== 'input' || !isPlaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(true); // time up = error
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, isPlaying]);

  const toggleCell = (idx: number) => {
    if (phase !== 'input') return;
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSubmit = (isTimeout = false) => {
    if (!currentLevel) return;
    clearInterval(timerRef.current);

    const selected = Array.from(selectedCells).sort((a, b) => a - b);
    const isCorrect = !isTimeout && 
      selected.length === currentLevel.target.length &&
      selected.every((v, i) => v === currentLevel.target[i]);

    setTotalAttempts(prev => prev + 1);
    setPhase('feedback');

    if (isCorrect) {
      const newLevel = levelNum + 1;
      setMaxLevel(prev => Math.max(prev, levelNum));
      setConsecutiveErrors(0);

      if (lastWasError) {
        setRecoveries(prev => prev + 1);
      }
      setLastWasError(false);

      setTimeout(() => startNewLevel(newLevel), 1000);
    } else {
      setConsecutiveErrors(prev => {
        const newVal = prev + 1;
        if (newVal >= 2) {
          // End after 2 consecutive errors
          setGameComplete(true);
          setIsPlaying(false);
        } else {
          // Retry same level
          setTimeout(() => startNewLevel(levelNum), 1500);
        }
        return newVal;
      });
      setLastWasError(true);
    }
  };

  const handleGiveUp = () => {
    setGaveUp(true);
    setGameComplete(true);
    setIsPlaying(false);
    clearInterval(timerRef.current);
  };

  // Save results
  useEffect(() => {
    if (!gameComplete) return;

    const totalTime = Math.round((Date.now() - startTime) / 1000);

    if (!isTestMode) {
      endSession({
        score: maxLevel * 10,
        accuracy_percentage: totalAttempts > 0 ? Math.round((maxLevel / totalAttempts) * 100) : 0,
        correct_attempts: maxLevel,
        incorrect_attempts: totalAttempts - maxLevel,
        avg_reaction_time_ms: totalAttempts > 0 ? Math.round((totalTime * 1000) / totalAttempts) : 0,
        session_data: {
          gameId: 'behavioral-persistence',
          persistence: totalTime,
          totalAttempts,
          maxLevel,
          recoveryAfterError: recoveries > 0,
          gaveUp,
          recoveries,
        },
      });
    }
  }, [gameComplete]);

  const totalTime = isPlaying || gameComplete ? Math.round((Date.now() - startTime) / 1000) : 0;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Persistência Comportamental</h1>
          <p className="text-sm text-muted-foreground">Bateria Cognitiva — Domínio 6</p>
        </div>
        <div className="w-20" />
      </div>

      {isPlaying && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">Nível {levelNum}</div>
              <div className="text-xs text-muted-foreground">Atual</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalAttempts}</div>
              <div className="text-xs text-muted-foreground">Tentativas</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{timeLeft}s</div>
              <div className="text-xs text-muted-foreground">Tempo</div>
            </div>
          </div>
        </Card>
      )}

      <Card className="relative overflow-hidden">
        <div className="w-full min-h-[400px] flex items-center justify-center p-6">
          {!isPlaying && !gameComplete && (
            <div className="text-center space-y-4">
              <Flame className="w-16 h-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Desafio Progressivo</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Memorize o padrão e reproduza-o. Os níveis ficam progressivamente mais difíceis.
                Você pode desistir a qualquer momento.
              </p>
              <p className="text-sm text-muted-foreground">
                O jogo encerra após 2 erros consecutivos.
              </p>
              <Button size="lg" onClick={startGame}>
                <Play className="w-5 h-5 mr-2" /> Iniciar
              </Button>
            </div>
          )}

          {isPlaying && currentLevel && (
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-muted-foreground">
                {showPattern ? '👀 Memorize o padrão...' : '🎯 Reproduza o padrão!'}
              </div>

              {/* Grid */}
              <div
                className="inline-grid gap-2 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${currentLevel.size}, 1fr)`,
                }}
              >
                {Array.from({ length: currentLevel.size * currentLevel.size }, (_, i) => {
                  const isTarget = currentLevel.target.includes(i);
                  const isSelected = selectedCells.has(i);
                  const showAsTarget = showPattern && isTarget;
                  const feedbackCorrect = phase === 'feedback' && isTarget;
                  const feedbackWrong = phase === 'feedback' && isSelected && !isTarget;

                  return (
                    <button
                      key={i}
                      onClick={() => toggleCell(i)}
                      disabled={phase !== 'input'}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 transition-all ${
                        showAsTarget
                          ? 'bg-primary border-primary'
                          : feedbackCorrect
                          ? 'bg-green-500 border-green-500'
                          : feedbackWrong
                          ? 'bg-red-500 border-red-500'
                          : isSelected
                          ? 'bg-primary/80 border-primary'
                          : 'bg-muted border-border hover:border-primary/50'
                      }`}
                    />
                  );
                })}
              </div>

              {phase === 'input' && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => handleSubmit()}>
                    Confirmar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleGiveUp}>
                    <XCircle className="w-4 h-4 mr-2" /> Desistir
                  </Button>
                </div>
              )}

              {phase === 'feedback' && (
                <div className="text-lg font-bold">
                  {consecutiveErrors === 0 ? '✅ Correto!' : `❌ Incorreto (${consecutiveErrors}/2)`}
                </div>
              )}
            </div>
          )}

          {gameComplete && (
            <div className="text-center space-y-4">
              <div className="text-5xl">{gaveUp ? '🏳️' : '🏆'}</div>
              <h2 className="text-2xl font-bold">
                {gaveUp ? 'Você desistiu' : 'Avaliação Completa'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{maxLevel}</div>
                  <div className="text-xs text-muted-foreground">Nível Máximo</div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalTime}s</div>
                  <div className="text-xs text-muted-foreground">Tempo Investido</div>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{totalAttempts}</div>
                  <div className="text-xs text-muted-foreground">Tentativas</div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{recoveries}</div>
                  <div className="text-xs text-muted-foreground">Recuperações</div>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{gaveUp ? 'Sim' : 'Não'}</div>
                  <div className="text-xs text-muted-foreground">Desistência</div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button onClick={startGame}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Repetir
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h3 className="font-semibold mb-2">Instruções</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Um padrão será mostrado brevemente na grade</li>
          <li>• Memorize e reproduza tocando nas células corretas</li>
          <li>• Os níveis ficam progressivamente mais difíceis</li>
          <li>• O teste encerra após 2 erros consecutivos</li>
          <li>• Você pode desistir a qualquer momento</li>
        </ul>
      </Card>
    </div>
  );
}
