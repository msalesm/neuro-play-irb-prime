import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { SessionRecoveryModal } from '@/components/SessionRecoveryModal';
import { GameExitButton } from '@/components/GameExitButton';
import { useEducationalSystem } from "@/hooks/useEducationalSystem";
import { SimonButton } from "@/components/games/SimonButton";
import { SimonDisplay } from "@/components/games/SimonDisplay";
import { SimonAchievements } from "@/components/games/SimonAchievements";
import { simonSoundEngine, SimonColor } from "@/lib/simonSounds";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GameStats {
  level: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  totalAttempts: number;
  perfectRounds: number;
  highScore: number;
}

const COLORS: SimonColor[] = ['red', 'blue', 'green', 'yellow'];

export default function MemoriaColorida() {
  const { user } = useAuth();
  const { getTrailByCategory } = useEducationalSystem();
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameOver'>('idle');
  const [showTutorial, setShowTutorial] = useState(true);
  
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
  } = useSessionRecovery('memoria_colorida_v2');

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [sequence, setSequence] = useState<SimonColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<SimonColor[]>([]);
  const [currentShowingIndex, setCurrentShowingIndex] = useState(-1);
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    perfectRounds: 0,
    highScore: 0,
  });
  const [showingColor, setShowingColor] = useState<SimonColor | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1000);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showColorNames, setShowColorNames] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Sound engine setup
  useEffect(() => {
    simonSoundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      simonSoundEngine.dispose();
    };
  }, []);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('simon_high_score');
    if (savedHighScore) {
      setStats(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
    }
  }, []);

  // Session recovery
  useEffect(() => {
    if (hasUnfinishedSessions && gameState === 'idle' && !currentSession) {
      setShowRecoveryModal(true);
    }
  }, [hasUnfinishedSessions, gameState, currentSession]);

  const startGame = useCallback(async () => {
    const memoryTrail = getTrailByCategory('memory');
    const sessionId = await startAutoSave('memoria_colorida_v2', stats.level, {
      trailId: memoryTrail?.id
    });

    if (sessionId) {
      const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newSequence = [firstColor];
      setSequence(newSequence);
      setPlayerSequence([]);
      setCurrentShowingIndex(-1);
      setGameState('showing');
      setShowTutorial(false);
      playSequence(newSequence);
      toast.success("🎮 Jogo iniciado! Observe a sequência.");
    }
  }, [stats.level]);

  const handleResumeSession = async (session: any) => {
    setStats({
      ...stats,
      score: session.performance_data.score || 0,
      level: session.level,
      correctAnswers: session.performance_data.correctAnswers || 0,
      totalAttempts: session.performance_data.totalAttempts || 0
    });
    
    const memoryTrail = getTrailByCategory('memory');
    await startAutoSave('memoria_colorida_v2', session.level, {
      sessionId: session.id,
      trailId: memoryTrail?.id
    });

    setGameState('idle');
    setShowRecoveryModal(false);
  };

  const playSequence = useCallback((seq: SimonColor[]) => {
    let index = 0;
    setCurrentShowingIndex(0);
    
    const showNext = () => {
      if (index < seq.length) {
        setShowingColor(seq[index]);
        setCurrentShowingIndex(index);
        
        // Play sound
        simonSoundEngine.playColorTone(seq[index], gameSpeed / 2000);
        
        setTimeout(() => {
          setShowingColor(null);
          index++;
          setCurrentShowingIndex(-1);
          
          if (index < seq.length) {
            setTimeout(showNext, 300);
          } else {
            setTimeout(() => {
              setGameState('playing');
              setCurrentShowingIndex(-1);
              toast.info("🎯 Sua vez! Repita a sequência.");
            }, 500);
          }
        }, gameSpeed / 2);
      }
    };
    
    setTimeout(showNext, 500);
  }, [gameSpeed]);

  const handleColorClick = async (color: SimonColor) => {
    if (gameState !== 'playing') return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    // Play sound feedback
    simonSoundEngine.playColorTone(color, 0.2);

    // Check if correct
    if (color === sequence[playerSequence.length]) {
      if (newPlayerSequence.length === sequence.length) {
        // Sequence completed successfully!
        const isPerfect = newPlayerSequence.length === sequence.length;
        const newStats = {
          ...stats,
          score: stats.score + (sequence.length * 10),
          streak: stats.streak + 1,
          bestStreak: Math.max(stats.bestStreak, stats.streak + 1),
          correctAnswers: stats.correctAnswers + 1,
          totalAttempts: stats.totalAttempts + 1,
          level: stats.level + 1,
          perfectRounds: isPerfect ? stats.perfectRounds + 1 : stats.perfectRounds,
        };
        setStats(newStats);

        // Update high score
        if (newStats.score > newStats.highScore) {
          setStats(prev => ({ ...prev, highScore: newStats.score }));
          localStorage.setItem('simon_high_score', newStats.score.toString());
          toast.success("🏆 Novo recorde!");
        }

        // Auto-save progress
        updateAutoSave({
          score: newStats.score,
          moves: newStats.totalAttempts,
          correctMoves: newStats.correctAnswers,
          additionalData: {
            level: newStats.level,
            streak: newStats.streak,
            sequence_length: sequence.length
          }
        });
        
        // Play success sound
        simonSoundEngine.playSuccessSound();
        toast.success(`✅ Nível ${stats.level} completo!`);

        // Increase speed progressively
        if (newStats.level > 3 && newStats.level % 3 === 0) {
          const newSpeed = Math.max(400, gameSpeed - 100);
          setGameSpeed(newSpeed);
          if (newSpeed < gameSpeed) {
            toast.info("⚡ Velocidade aumentada!");
          }
        }

        // Victory fanfare on level milestones
        if (newStats.level % 5 === 0) {
          simonSoundEngine.playVictoryFanfare();
          toast.success(`🎉 Incrível! Nível ${newStats.level} alcançado!`);
        }

        // Add next color to sequence
        setTimeout(() => {
          const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          const nextSequence = [...sequence, nextColor];
          setSequence(nextSequence);
          setPlayerSequence([]);
          setCurrentShowingIndex(-1);
          setGameState('showing');
          playSequence(nextSequence);
        }, 1500);
      }
    } else {
      // Wrong answer - Game Over
      simonSoundEngine.playErrorSound();
      toast.error("❌ Sequência incorreta!");

      const finalStats = {
        ...stats,
        streak: 0,
        totalAttempts: stats.totalAttempts + 1,
      };
      setStats(finalStats);
      
      // Complete session
      await completeAutoSave({
        score: finalStats.score,
        moves: finalStats.totalAttempts,
        correctMoves: finalStats.correctAnswers,
        accuracy: (finalStats.correctAnswers / finalStats.totalAttempts) * 100,
        additionalData: {
          level: finalStats.level,
          bestStreak: finalStats.bestStreak,
          perfectRounds: finalStats.perfectRounds
        }
      });
      
      setGameState('gameOver');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setSequence([]);
    setPlayerSequence([]);
    setCurrentShowingIndex(-1);
    setShowingColor(null);
    setStats(prev => ({
      level: 1,
      score: 0,
      streak: 0,
      bestStreak: prev.bestStreak,
      correctAnswers: 0,
      totalAttempts: 0,
      perfectRounds: 0,
      highScore: prev.highScore,
    }));
    setGameSpeed(1000);
    setShowTutorial(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para jogar Memória Colorida, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = stats.totalAttempts > 0 
    ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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
          <div className="flex gap-2 items-center">
            {isSaving && <Badge variant="outline" className="bg-blue-500/20 text-blue-300">💾 Salvando...</Badge>}
            <GameExitButton
              variant="quit"
              onExit={async () => {
                await abandonSession();
              }}
              showProgress={gameState === 'playing'}
              currentProgress={playerSequence.length}
              totalProgress={sequence.length}
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white drop-shadow-lg">
              🎨 Simon Says
            </h1>
            <p className="text-gray-400 text-sm">Jogo de Memória Profissional</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorNames(!showColorNames)}
              className="gap-2 bg-gray-800 border-gray-700 text-gray-300"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                toast.info(soundEnabled ? "🔇 Som desativado" : "🔊 Som ativado");
              }}
              className="gap-2 bg-gray-800 border-gray-700 text-gray-300"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.level}</div>
              <div className="text-sm text-gray-400">Nível</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.score}</div>
              <div className="text-sm text-gray-400">Pontos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.bestStreak}</div>
              <div className="text-sm text-gray-400">Melhor Sequência</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{accuracy}%</div>
              <div className="text-sm text-gray-400">Precisão</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Console */}
        <Card className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardContent className="p-8 sm:p-12">
            {gameState === 'idle' && showTutorial && (
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Como Jogar Simon Says</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">👀</span>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Observe</h3>
                          <p className="text-sm text-gray-400">Assista a sequência de cores que acendem</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Repita</h3>
                          <p className="text-sm text-gray-400">Clique nas cores na mesma ordem</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Evolua</h3>
                          <p className="text-sm text-gray-400">A cada nível, uma cor nova é adicionada</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Vença</h3>
                          <p className="text-sm text-gray-400">Desbloqueie conquistas e bata recordes!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button onClick={startGame} size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <Play className="w-5 h-5" />
                  Começar Jogo
                </Button>
              </div>
            )}

            {(gameState === 'showing' || gameState === 'playing' || (gameState === 'idle' && !showTutorial)) && (
              <div className="flex justify-center items-center">
                {/* Simon Console - Classic Circular Layout */}
                <div className="relative">
                  {/* The 4-button grid */}
                  <div className={cn(
                    "grid grid-cols-2 gap-3 p-6 rounded-full",
                    "bg-gray-900 shadow-2xl border-8 border-gray-700",
                    "w-[320px] h-[320px] sm:w-[400px] sm:h-[400px]"
                  )}>
                    <div className="w-full h-full">
                      <SimonButton
                        color="red"
                        isActive={showingColor === 'red'}
                        isDisabled={gameState !== 'playing'}
                        position="top-left"
                        onClick={() => handleColorClick('red')}
                        showName={showColorNames}
                      />
                    </div>
                    <div className="w-full h-full">
                      <SimonButton
                        color="blue"
                        isActive={showingColor === 'blue'}
                        isDisabled={gameState !== 'playing'}
                        position="top-right"
                        onClick={() => handleColorClick('blue')}
                        showName={showColorNames}
                      />
                    </div>
                    <div className="w-full h-full">
                      <SimonButton
                        color="green"
                        isActive={showingColor === 'green'}
                        isDisabled={gameState !== 'playing'}
                        position="bottom-left"
                        onClick={() => handleColorClick('green')}
                        showName={showColorNames}
                      />
                    </div>
                    <div className="w-full h-full">
                      <SimonButton
                        color="yellow"
                        isActive={showingColor === 'yellow'}
                        isDisabled={gameState !== 'playing'}
                        position="bottom-right"
                        onClick={() => handleColorClick('yellow')}
                        showName={showColorNames}
                      />
                    </div>
                  </div>

                  {/* Central Display */}
                  <SimonDisplay
                    level={stats.level}
                    score={stats.score}
                    gameState={gameState}
                    currentPosition={playerSequence.length}
                    sequenceLength={sequence.length}
                    highScore={stats.highScore}
                  />
                </div>
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-white">Game Over!</h2>
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-blue-400">{stats.level}</div>
                        <div className="text-sm text-gray-400">Nível Alcançado</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-400">{stats.score}</div>
                        <div className="text-sm text-gray-400">Pontos</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-yellow-400">{stats.bestStreak}</div>
                        <div className="text-sm text-gray-400">Melhor Sequência</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-400">{accuracy}%</div>
                        <div className="text-sm text-gray-400">Precisão</div>
                      </div>
                    </div>

                    {stats.score === stats.highScore && stats.score > 0 && (
                      <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                        <p className="text-yellow-300 font-semibold">
                          🏆 Novo Recorde: {stats.highScore} pontos!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={startGame} 
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Play className="w-5 h-5" />
                    Jogar Novamente
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetGame} 
                    size="lg"
                    className="gap-2 bg-gray-800 border-gray-700 text-gray-300"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Menu Inicial
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <SimonAchievements 
          stats={{
            level: stats.level,
            score: stats.score,
            bestStreak: stats.bestStreak,
            accuracy,
            perfectRounds: stats.perfectRounds
          }}
        />

        {/* Benefits */}
        <Card className="mt-8 bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Benefícios Terapêuticos & Cognitivos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">🧠 Memória de Trabalho</h4>
                <p className="text-gray-400">
                  Fortalece a capacidade de reter e manipular sequências temporariamente, essencial para aprendizado e resolução de problemas.
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">🎯 Atenção Sequencial</h4>
                <p className="text-gray-400">
                  Desenvolve foco em padrões e ordem temporal, crucial para compreensão de processos complexos.
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">⚡ Concentração</h4>
                <p className="text-gray-400">
                  Melhora sustentação da atenção e controle inibitório, fundamentais para produtividade e autocontrole.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
