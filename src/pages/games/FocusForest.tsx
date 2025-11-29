import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Trees, Star, Home, Target, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useFocusForestStats } from "@/hooks/useFocusForestStats";
import { useEducationalSystem } from "@/hooks/useEducationalSystem";
import { withBiofeedback, useBiofeedbackIntegration } from '@/components/withBiofeedback';
import { FocusForestStats } from "@/components/FocusForestStats";
import { FocusForestAchievements } from "@/components/FocusForestAchievements";
import { useGameSession } from '@/hooks/useGameSession';
import { GameExitButton } from '@/components/GameExitButton';
import { GameProgressBar } from '@/components/GameProgressBar';

interface FocusTarget {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  active: boolean;
  timeLeft: number;
}

type DifficultyMode = 'easy' | 'normal' | 'hard';

const difficultyLevels = [
  { name: 'Broto', targets: 1, duration: 3000, spawnRate: 4000, unlockRequirement: { hits: 0, accuracy: 0 } },
  { name: 'Mudinha', targets: 2, duration: 2500, spawnRate: 3500, unlockRequirement: { hits: 5, accuracy: 60 } },
  { name: 'Arbusto', targets: 2, duration: 2000, spawnRate: 3000, unlockRequirement: { hits: 8, accuracy: 70 } },
  { name: 'Árvore Jovem', targets: 3, duration: 1800, spawnRate: 2500, unlockRequirement: { hits: 12, accuracy: 80 } },
  { name: 'Árvore Adulta', targets: 3, duration: 1500, spawnRate: 2000, unlockRequirement: { hits: 15, accuracy: 85 } },
];

const difficultyModifiers = {
  easy: { sizeMultiplier: 1.3, durationMultiplier: 1.5, name: 'Fácil' },
  normal: { sizeMultiplier: 1.0, durationMultiplier: 1.0, name: 'Normal' },
  hard: { sizeMultiplier: 0.7, durationMultiplier: 0.8, name: 'Difícil' }
};

function FocusForestGame() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stats, achievements, loading, saveGameSession } = useFocusForestStats();
  const { recordLearningSession, getTrailByCategory } = useEducationalSystem();
  const biofeedback = useBiofeedbackIntegration();
  
  const {
    sessionId,
    startSession,
    endSession,
    updateSession,
    isActive,
    recoveredSession,
    resumeSession,
    discardRecoveredSession
  } = useGameSession('focus-forest');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<FocusTarget[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [treesGrown, setTreesGrown] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('normal');
  const [consecutiveHits, setConsecutiveHits] = useState(0);
  const [maxConsecutiveHits, setMaxConsecutiveHits] = useState(0);
  const [targetsHitSequence, setTargetsHitSequence] = useState<number[]>([]);
  const [showDifficultySettings, setShowDifficultySettings] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);

  const currentDifficulty = difficultyLevels[Math.min(level, difficultyLevels.length - 1)];
  const difficultyMod = difficultyModifiers[difficulty];
  
  // Verificar se nível está desbloqueado
  const isLevelUnlocked = (levelIndex: number) => {
    if (levelIndex === 0) return true;
    const requirement = difficultyLevels[levelIndex].unlockRequirement;
    return hits >= requirement.hits && accuracy >= requirement.accuracy;
  };

  useEffect(() => {
    let gameInterval: NodeJS.Timeout;
    let spawnInterval: NodeJS.Timeout;

    if (isPlaying) {
      // Game timer
      gameInterval = setInterval(() => {
        setGameTime(prev => prev + 100);
      }, 100);

      // Spawn targets
      spawnInterval = setInterval(() => {
        spawnTarget();
      }, currentDifficulty.spawnRate);

      // Update targets
      const targetUpdate = setInterval(() => {
        setTargets(prev => prev.map(target => ({
          ...target,
          timeLeft: target.timeLeft - 100
        })).filter(target => {
          if (target.timeLeft <= 0) {
            setMisses(m => m + 1);
            setTargetsHitSequence(prev => [...prev, 0]); // 0 = erro
            setConsecutiveHits(0); // Reset consecutive hits
            
            // Record missed target in biofeedback system  
            const responseTime = gameStartTime ? Date.now() - gameStartTime : 0;
            biofeedback.recordIncorrectAnswer(responseTime, { 
              reason: 'timeout', 
              level, 
              difficulty 
            });
            
            return false;
          }
          return true;
        }));
      }, 100);

      return () => {
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        clearInterval(targetUpdate);
      };
    }
  }, [isPlaying, currentDifficulty.spawnRate, targets.length]);

  const spawnTarget = () => {
    if (!gameAreaRef.current) return;

    setTargets(prev => {
      const maxTargets = currentDifficulty.targets;
      
      if (prev.length >= maxTargets) {
        return prev;
      }

      const rect = gameAreaRef.current!.getBoundingClientRect();
      const baseSize = Math.random() * 30 + 40; // 40-70px
      const size = baseSize * difficultyMod.sizeMultiplier;
      const colors = ['bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400'];
      
      const newTarget: FocusTarget = {
        id: targetIdRef.current++,
        x: Math.random() * (rect.width - size),
        y: Math.random() * (rect.height - size),
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        active: true,
        timeLeft: currentDifficulty.duration * difficultyMod.durationMultiplier,
      };

      return [...prev, newTarget];
    });
  };

  const hitTarget = (targetId: number) => {
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    // Calcular pontuação baseada na dificuldade
    const baseScore = 10;
    const difficultyBonus = difficulty === 'hard' ? 15 : difficulty === 'normal' ? 10 : 5;
    const newScore = score + baseScore + difficultyBonus;
    const newTreesGrown = treesGrown + 1;
    
    setScore(newScore);
    setTreesGrown(newTreesGrown);

    // Update session progress
    if (isActive) {
      updateSession({
        score: newScore,
        moves: hits + misses + 1,
        correctMoves: hits + 1,
        timeSpent: gameStartTime ? (Date.now() - gameStartTime) / 1000 : 0
      });
    }

    // Atualizar sequência de acertos
    setTargetsHitSequence(prev => [...prev, 1]); // 1 = acerto
    setConsecutiveHits(prev => {
      const newConsecutive = prev + 1;
      setMaxConsecutiveHits(max => Math.max(max, newConsecutive));
      return newConsecutive;
    });

    // Level up based on requirements
    setHits(prev => {
      const newHits = prev + 1;
      const currentAccuracy = (newHits / (newHits + misses)) * 100;
      
      // Verificar se pode subir de nível
      if (level < difficultyLevels.length - 1) {
        const nextLevelReq = difficultyLevels[level + 1].unlockRequirement;
        if (newHits >= nextLevelReq.hits && currentAccuracy >= nextLevelReq.accuracy) {
          setLevel(currentLevel => {
            const newLevel = currentLevel + 1;
            toast({
              title: `🌲 Nível ${newLevel + 1} desbloqueado!`,
              description: `${difficultyLevels[newLevel].name} - Sua floresta está crescendo!`,
            });
            return newLevel;
          });
        }
      }
      
      return newHits;
    });
  };

  const startGame = async () => {
    try {
      await startSession({ score: 0, level: level + 1, difficulty }, level + 1);
      setTargets([]);
      setIsPlaying(true);
      setGameStartTime(Date.now());
      setTimeout(() => {
        spawnTarget();
      }, 100);
    } catch (error) {
      console.error('Failed to start session:', error);
      toast({ title: "Erro ao iniciar jogo", variant: "destructive" });
    }
  };

  const handleResumeSession = async (session: any) => {
    setScore(session.session_data?.score || 0);
    setHits(session.session_data?.hits || 0);
    setMisses(session.session_data?.misses || 0);
    setLevel((session.difficulty_level || 1) - 1);
    setTreesGrown(session.session_data?.trees_grown || 0);
    
    await resumeSession(session.id);
    setIsPlaying(true);
    setGameStartTime(Date.now());
  };

  useEffect(() => {
    if (recoveredSession && !isPlaying) {
      handleResumeSession(recoveredSession);
    }
  }, [recoveredSession, isPlaying]);

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setTargets([]);
    setScore(0);
    setGameTime(0);
    setHits(0);
    setMisses(0);
    setLevel(0);
    setConsecutiveHits(0);
    setMaxConsecutiveHits(0);
    setTargetsHitSequence([]);
  };

  const completeGame = async () => {
    if (!user || hits < 5) return;

    try {
      const accuracy = hits / (hits + misses) * 100;

      // Complete session
      if (isActive) {
        await endSession({
          score,
          moves: hits + misses,
          correctMoves: hits,
          accuracy,
          timeSpent: gameStartTime ? (Date.now() - gameStartTime) / 1000 : 0
        });
      }
      
      const sessionData = {
        level: level + 1,
        score: score,
        hits: hits,
        misses: misses,
        accuracy: accuracy,
        duration_seconds: Math.round(gameTime / 1000),
        trees_grown: treesGrown,
        targets_hit_sequence: targetsHitSequence,
        difficulty_modifier: difficulty
      };

      await saveGameSession(sessionData);

      // Also save to educational system for learning analytics
      try {        
        await recordLearningSession(
          'focus_forest',
          Math.round(gameTime / 1000),
          {
            accuracy: accuracy,
            score: score,
            hits: hits,
            misses: misses,
            consecutive_hits: maxConsecutiveHits,
            difficulty: difficulty,
            completion_time: Math.round(gameTime / 1000)
          }
        );
      } catch (eduError) {
        console.warn('Could not save to educational system:', eduError);
      }

      toast({
        title: "🌳 Floresta cultivada!",
        description: `${treesGrown} árvores plantadas • ${accuracy.toFixed(1)}% precisão • Máximo ${maxConsecutiveHits} acertos consecutivos`,
      });

      resetGame();
    } catch (error) {
      console.error('Error saving game:', error);
      toast({
        title: "Erro ao salvar jogo",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const calculateResponseTimeVariance = () => {
    // Simple calculation based on hit sequence patterns
    if (targetsHitSequence.length < 3) return 0;
    
    const hitTimes = targetsHitSequence.map((hit, index) => 
      hit === 1 ? index * 100 : null
    ).filter(time => time !== null);
    
    if (hitTimes.length < 2) return 0;
    
    const intervals = hitTimes.slice(1).map((time, index) => 
      time - hitTimes[index]
    );
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    return Math.round(variance);
  };

  const accuracy = hits + misses > 0 ? (hits / (hits + misses) * 100) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para acessar este jogo, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 text-green-900">
              Focus Forest
            </h1>
            <p className="text-green-700">
              Cultive sua atenção e faça sua floresta crescer
            </p>
          </div>
          <div className="flex gap-2">
            <GameExitButton
              variant="quit"
              onExit={async () => {
                if (isActive) {
                  await endSession({
                    score,
                    moves: hits + misses,
                    correctMoves: hits,
                    accuracy: hits / (hits + misses) * 100,
                    timeSpent: gameStartTime ? (Date.now() - gameStartTime) / 1000 : 0
                  });
                }
              }}
              showProgress={isPlaying}
              currentProgress={hits + misses}
              totalProgress={50}
            />
          </div>
        </div>

        {recoveredSession && !isPlaying && (
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm">Continuar sessão anterior?</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleResumeSession(recoveredSession)}>
                  Continuar
                </Button>
                <Button size="sm" variant="outline" onClick={discardRecoveredSession}>
                  Descartar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Difficulty Settings */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Dificuldade:</span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(difficultyModifiers).map(([mode, config]) => (
                        <Button
                          key={mode}
                          variant={difficulty === mode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDifficulty(mode as DifficultyMode)}
                          disabled={isPlaying}
                        >
                          {config.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {difficultyMod.name} • Alvos {(difficultyMod.sizeMultiplier * 100).toFixed(0)}% • Tempo {(difficultyMod.durationMultiplier * 100).toFixed(0)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-glow bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Trees className="h-6 w-6 text-green-600" />
                    {currentDifficulty.name} - Nível {level + 1}
                  </CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-medium">Score: {score}</span>
                    <span className="text-blue-600 font-medium">
                      Tempo: {Math.floor(gameTime / 60000)}:{((gameTime / 1000) % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  ref={gameAreaRef}
                  className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-green-200 rounded-lg border-4 border-green-300 overflow-hidden cursor-crosshair"
                  style={{ 
                    backgroundImage: `
                      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
                    `
                  }}
                >
                  {/* Forest Background Elements */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-600/20 to-transparent"></div>
                  
                  {/* Trees grown */}
                  {Array.from({ length: Math.min(treesGrown, 20) }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute bottom-2"
                      style={{
                        left: `${(index * 30) % 80 + 5}%`,
                        transform: `translateX(-50%)`,
                      }}
                    >
                      <div className="text-2xl">🌲</div>
                    </div>
                  ))}

                  {/* Targets */}
                  {targets.map((target) => (
                    <button
                      key={target.id}
                      className={`absolute rounded-full ${target.color} shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center text-white font-bold border-2 border-white`}
                      style={{
                        left: target.x,
                        top: target.y,
                        width: target.size,
                        height: target.size,
                        opacity: target.timeLeft / currentDifficulty.duration,
                      }}
                      onClick={() => hitTarget(target.id)}
                    >
                      <Target className="h-4 w-4" />
                    </button>
                  ))}

                  {/* No targets message */}
                  {!isPlaying && targets.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-green-700">
                        <Trees className="h-16 w-16 mx-auto mb-4 text-green-500" />
                        <p className="text-xl font-semibold mb-2">Sua floresta está esperando...</p>
                        <p className="text-sm">Clique em "Começar" para plantar suas primeiras sementes</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  {!isPlaying ? (
                    <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Começar
                    </Button>
                  ) : (
                    <Button onClick={pauseGame} variant="secondary" size="lg" className="flex items-center gap-2">
                      <Pause className="h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                  <Button onClick={resetGame} variant="outline" size="lg" className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reiniciar
                  </Button>
                  {hits >= 5 && (
                    <Button onClick={completeGame} size="lg" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <Star className="h-5 w-5" />
                      Concluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FocusForestStats 
              stats={stats}
              currentSession={{
                hits,
                misses,
                accuracy,
                treesGrown,
                level
              }}
            />

            <FocusForestAchievements 
              achievements={achievements}
              currentSession={{
                hits,
                accuracy,
                level,
                duration_seconds: Math.round(gameTime / 1000)
              }}
            />

            {/* Enhanced Level Progress */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Progressão de Níveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {difficultyLevels.map((lvl, index) => {
                  const isUnlocked = index === 0 || isLevelUnlocked(index);
                  const isCurrent = index === level;
                  
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-md' 
                          : isUnlocked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lvl.name}</span>
                          {isCurrent && <Badge className="text-xs bg-green-600">Atual</Badge>}
                          {isUnlocked && index <= level && <Badge variant="secondary" className="text-xs">✓</Badge>}
                        </div>
                        {!isUnlocked && (
                          <Badge variant="outline" className="text-xs">
                            🔒 {lvl.unlockRequirement.hits} acertos • {lvl.unlockRequirement.accuracy}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lvl.targets} alvos • {(lvl.duration * difficultyMod.durationMultiplier / 1000).toFixed(1)}s duração
                      </div>
                      {!isUnlocked && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Acertos: {hits}/{lvl.unlockRequirement.hits}</span>
                            <span>Precisão: {accuracy.toFixed(1)}%/{lvl.unlockRequirement.accuracy}%</span>
                          </div>
                          <Progress 
                            value={Math.min(
                              (hits / lvl.unlockRequirement.hits * 50) + 
                              (Math.min(accuracy, lvl.unlockRequirement.accuracy) / lvl.unlockRequirement.accuracy * 50), 
                              100
                            )} 
                            className="h-1" 
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Enhanced Performance Tips */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Dicas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>🎯 <strong>Precisão:</strong> Mantenha acima de 80% para desbloquear níveis</p>
                <p>⚡ <strong>Velocidade:</strong> Acertos rápidos geram mais pontos</p>
                <p>🔄 <strong>Sequência:</strong> Acertos consecutivos desbloqueiam achievements</p>
                <p>💪 <strong>Resistência:</strong> Jogadas longas com boa precisão valem mais</p>
                <p>🏆 <strong>Dificuldade:</strong> Modos difíceis dão mais pontos e estrelas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the biofeedback-enhanced version
export default withBiofeedback(FocusForestGame, {
  enableEnergyBar: true,
  energyBarPosition: 'top-left',
  autoTriggerBreathing: true,
});