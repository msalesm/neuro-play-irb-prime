import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, RotateCcw, Target, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';
import { attentionSustainedPhases } from '@/data/game-phases/attention-sustained-phases';
import { GameCompatibilityCheck } from '@/components/GameCompatibilityCheck';

interface GameTarget {
  id: string;
  x: number;
  y: number;
  isTarget: boolean;
  color: string;
  size: number;
  createdAt: number;
}

export default function AttentionSustainedPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phaseId') || 'attention-1';
  const { childProfileId, isTestMode } = useGameProfile();
  const { toast } = useToast();
  
  const phase = attentionSustainedPhases.find(p => p.id === phaseId) || attentionSustainedPhases[0];
  const gameConfig = phase.gameConfig || { duration: 60, targetCount: 20, speedMultiplier: 1 };
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<GameTarget[]>([]);
  const [timeLeft, setTimeLeft] = useState(gameConfig.duration || 60);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  
  const { startSession, updateSession, endSession } = useGameSession(
    'attention-sustained',
    childProfileId || undefined
  );
  
  const colors = {
    target: 'hsl(var(--primary))',
    distractor: 'hsl(var(--muted))',
    success: 'hsl(142.1 76.2% 36.3%)',
    error: 'hsl(0 84.2% 60.2%)'
  };

  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const size = 40 + Math.random() * 20;
    const isTarget = Math.random() > 0.3; // 70% chance of being a valid target
    
    const newTarget: GameTarget = {
      id: `target-${targetIdRef.current++}`,
      x: Math.random() * (rect.width - size),
      y: Math.random() * (rect.height - size),
      isTarget,
      color: isTarget ? colors.target : colors.distractor,
      size,
      createdAt: Date.now()
    };
    
    setTargets(prev => [...prev.slice(-10), newTarget]);
  }, [colors.target, colors.distractor]);

  const handleTargetClick = useCallback((target: GameTarget) => {
    const reactionTime = Date.now() - target.createdAt;
    
    if (target.isTarget) {
      setHits(prev => prev + 1);
      setScore(prev => prev + Math.max(100 - Math.floor(reactionTime / 10), 10));
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(best => Math.max(best, newStreak));
        return newStreak;
      });
      setReactionTimes(prev => [...prev, reactionTime]);
    } else {
      setMisses(prev => prev + 1);
      setStreak(0);
      setScore(prev => Math.max(0, prev - 20));
    }
    
    setTargets(prev => prev.filter(t => t.id !== target.id));
  }, []);

  // Game timer
  useEffect(() => {
    if (!isPlaying || isPaused || gameComplete) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, gameComplete]);

  // Target spawner
  useEffect(() => {
    if (!isPlaying || isPaused || gameComplete) return;
    
    const spawnRate = 2000 / (gameConfig.speedMultiplier || 1);
    const spawner = setInterval(spawnTarget, spawnRate);
    
    return () => clearInterval(spawner);
  }, [isPlaying, isPaused, gameComplete, spawnTarget, gameConfig.speedMultiplier]);

  // Target timeout (remove old targets)
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    const cleaner = setInterval(() => {
      const now = Date.now();
      setTargets(prev => {
        const filtered = prev.filter(t => now - t.createdAt < 3000);
        const expired = prev.length - filtered.length;
        if (expired > 0) {
          setMisses(m => m + expired);
          setStreak(0);
        }
        return filtered;
      });
    }, 500);
    
    return () => clearInterval(cleaner);
  }, [isPlaying, isPaused]);

  const startGame = async () => {
    setIsPlaying(true);
    setIsPaused(false);
    setGameComplete(false);
    setScore(0);
    setHits(0);
    setMisses(0);
    setStreak(0);
    setBestStreak(0);
    setReactionTimes([]);
    setTargets([]);
    setTimeLeft(gameConfig.duration || 60);
    
    if (!isTestMode) {
      await startSession({ difficulty_level: phase.phaseNumber });
    } else {
      toast({ title: "Modo Teste", description: "Progresso não será salvo" });
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const endGame = async () => {
    setIsPlaying(false);
    setGameComplete(true);
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
    
    if (!isTestMode) {
      await endSession({
        score,
        accuracy_percentage: accuracy,
        correct_attempts: hits,
        incorrect_attempts: misses,
        avg_reaction_time_ms: avgReactionTime,
        session_data: {
          bestStreak,
          reactionTimes,
          phaseId
        }
      });
    }
    
    // Calculate stars
    let stars = 0;
    if (accuracy >= 50) stars = 1;
    if (accuracy >= 80) stars = 2;
    if (accuracy >= 90) stars = 3;
    
    toast({
      title: gameComplete ? "Tempo Esgotado!" : "Jogo Finalizado!",
      description: `Pontuação: ${score} | Precisão: ${accuracy.toFixed(0)}% | ⭐ ${stars}`,
    });
  };

  useEffect(() => {
    if (gameComplete && isPlaying === false) {
      endGame();
    }
  }, [gameComplete]);

  const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
  const avgReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <GameCompatibilityCheck />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold">{phase.name}</h1>
          <p className="text-sm text-muted-foreground">Fase {phase.phaseNumber}</p>
        </div>
        
        {isTestMode && (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded text-xs">
            Modo Teste
          </span>
        )}
      </div>

      {/* Stats Bar */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Clock className="w-5 h-5" />
              {timeLeft}s
            </div>
            <div className="text-xs text-muted-foreground">Tempo</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-xs text-muted-foreground">Pontos</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Zap className="w-5 h-5 text-yellow-500" />
              {streak}
            </div>
            <div className="text-xs text-muted-foreground">Sequência</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{accuracy.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Precisão</div>
          </div>
        </div>
        
        <Progress value={(timeLeft / (gameConfig.duration || 60)) * 100} className="mt-3" />
      </Card>

      {/* Game Area */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30">
        <div 
          ref={gameAreaRef}
          className="relative w-full h-[400px] md:h-[500px]"
        >
          {!isPlaying && !gameComplete && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-10">
              <Target className="w-16 h-16 text-primary animate-pulse" />
              <h2 className="text-2xl font-bold">⏱️ Missão Cronometrada</h2>
              <p className="text-muted-foreground text-center max-w-md px-4">
                Clique nos alvos <span className="text-primary font-semibold">azuis</span> rapidamente!
                Evite os alvos cinza.
              </p>
              <Button size="lg" onClick={startGame}>
                <Play className="w-5 h-5 mr-2" />
                Iniciar
              </Button>
            </div>
          )}
          
          {gameComplete && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-sm z-10">
              <div className="text-6xl">🎯</div>
              <h2 className="text-3xl font-bold">Missão Completa!</h2>
              
              <div className="grid grid-cols-2 gap-4 text-center mt-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <div className="text-sm text-muted-foreground">Pontuação Final</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{accuracy.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Precisão</div>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">{bestStreak}</div>
                  <div className="text-sm text-muted-foreground">Melhor Sequência</div>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{avgReactionTime}ms</div>
                  <div className="text-sm text-muted-foreground">Tempo Médio</div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={startGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </Button>
              </div>
            </div>
          )}
          
          {isPlaying && (
            <>
              {targets.map(target => (
                <button
                  key={target.id}
                  onClick={() => handleTargetClick(target)}
                  className="absolute rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                  style={{
                    left: target.x,
                    top: target.y,
                    width: target.size,
                    height: target.size,
                    backgroundColor: target.color,
                    animation: 'pulse 1s ease-in-out infinite'
                  }}
                />
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Controls */}
      {isPlaying && (
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="outline" onClick={togglePause}>
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? 'Continuar' : 'Pausar'}
          </Button>
          <Button variant="destructive" onClick={() => setGameComplete(true)}>
            Finalizar
          </Button>
        </div>
      )}

      {/* Instructions */}
      <Card className="mt-4 p-4">
        <h3 className="font-semibold mb-2">Como Jogar</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Clique nos círculos <span className="text-primary font-semibold">azuis</span> (alvos válidos)</li>
          <li>• Evite clicar nos círculos cinza (distratores)</li>
          <li>• Quanto mais rápido, mais pontos você ganha</li>
          <li>• Mantenha uma sequência para maximizar a pontuação</li>
        </ul>
      </Card>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
