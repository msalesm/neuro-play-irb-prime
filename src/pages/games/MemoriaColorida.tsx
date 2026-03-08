import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGameSession } from '@/hooks/useGameSession';
import { useGameHistory } from '@/hooks/useGameHistory';
import { useEnhancedFeedback } from '@/hooks/useEnhancedFeedback';
import { GameExitButton, GameResultsDashboard, SimonButton, SimonDisplay, SimonAchievements } from '@/components/games';
import { useEducationalSystem } from "@/hooks/useEducationalSystem";
import { simonSoundEngine, SimonColor } from "@/lib/simonSounds";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

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
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameOver' | 'results'>('idle');
  const [showTutorial, setShowTutorial] = useState(true);
  const [childProfileId, setChildProfileId] = useState<string | null>(null);
  
  const {
    sessionId,
    startSession,
    endSession,
    updateSession,
    isActive,
    recordMetric,
    recoveredSession,
    resumeSession,
    discardRecoveredSession
  } = useGameSession('memoria-colorida', childProfileId || undefined);

  const { 
    evolution, 
    getTrend, 
    totalSessions 
  } = useGameHistory('memoria-colorida', childProfileId);

  const {
    isGenerating,
    therapeuticInsights,
    recommendations,
    generateEnhancedFeedback
  } = useEnhancedFeedback();

  useEffect(() => {
    const loadChildProfile = async () => {
      if (!user) return;
      const { data: profiles } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (profiles) {
        setChildProfileId(profiles.id);
      }
    };
    loadChildProfile();
  }, [user]);

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

  useEffect(() => {
    simonSoundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      simonSoundEngine.dispose();
    };
  }, []);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('simon_high_score');
    if (savedHighScore) {
      setStats(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
    }
  }, []);

  useEffect(() => {
    if (recoveredSession && gameState === 'idle' && !isActive) {
      setShowRecoveryModal(true);
    }
  }, [recoveredSession, gameState, isActive]);

  const playSequence = useCallback((seq: SimonColor[]) => {
    console.log('🎵 Tocando sequência:', seq);
    let index = 0;
    setCurrentShowingIndex(0);
    
    const showNext = () => {
      if (index < seq.length) {
        setShowingColor(seq[index]);
        setCurrentShowingIndex(index);
        
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

  const startGame = useCallback(async () => {
    try {
      console.log('🎮 Iniciando jogo...');
      
      const result = await startSession({
        score: 0
      }, stats.level);
      
      console.log('💾 Sessão criada:', result);

      if (result.success) {
        const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newSequence = [firstColor];
        setSequence(newSequence);
        setPlayerSequence([]);
        setCurrentShowingIndex(-1);
        setGameState('showing');
        setShowTutorial(false);
        playSequence(newSequence);
      } else {
        console.error('❌ Falha ao criar sessão');
        const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newSequence = [firstColor];
        setSequence(newSequence);
        setPlayerSequence([]);
        setCurrentShowingIndex(-1);
        setGameState('showing');
        setShowTutorial(false);
        playSequence(newSequence);
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar jogo:', error);
      toast.error("Erro ao iniciar. Jogando sem salvar progresso.");
      const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newSequence = [firstColor];
      setSequence(newSequence);
      setPlayerSequence([]);
      setCurrentShowingIndex(-1);
      setGameState('showing');
      setShowTutorial(false);
      playSequence(newSequence);
    }
  }, [stats.level, startSession, playSequence]);

  const handleResumeSession = async (session: any) => {
    const recoveredData = resumeSession(session);
    
    setStats({
      ...stats,
      score: recoveredData.score || 0,
      level: session.difficulty_level || 1,
      correctAnswers: recoveredData.correctMoves || 0,
      totalAttempts: recoveredData.totalMoves || 0
    });

    setGameState('idle');
    setShowRecoveryModal(false);
  };

  const handleColorClick = async (color: SimonColor) => {
    if (gameState !== 'playing') return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    simonSoundEngine.playColorTone(color, 0.2);

    if (color === sequence[playerSequence.length]) {
      if (newPlayerSequence.length === sequence.length) {
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

        if (newStats.score > newStats.highScore) {
          setStats(prev => ({ ...prev, highScore: newStats.score }));
          localStorage.setItem('simon_high_score', newStats.score.toString());
        }

        await updateSession({
          score: newStats.score,
          correctMoves: newStats.correctAnswers,
          totalMoves: newStats.totalAttempts,
          reactionTimes: []
        });
        
        simonSoundEngine.playSuccessSound();

        if (newStats.level > 3 && newStats.level % 3 === 0) {
          const newSpeed = Math.max(400, gameSpeed - 100);
          setGameSpeed(newSpeed);
        }

        if (newStats.level % 5 === 0) {
          simonSoundEngine.playVictoryFanfare();
        }

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
      simonSoundEngine.playErrorSound();

      const finalStats = {
        ...stats,
        streak: 0,
        totalAttempts: stats.totalAttempts + 1,
      };
      setStats(finalStats);
      
      await endSession({
        score: finalStats.score,
        correctMoves: finalStats.correctAnswers,
        totalMoves: finalStats.totalAttempts,
        accuracy: (finalStats.correctAnswers / finalStats.totalAttempts) * 100,
        timeSpent: 0
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {recoveredSession && (
          <Card className="bg-warning/10 border-warning/30 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warning font-medium">Sessão anterior encontrada</p>
                  <p className="text-warning/70 text-sm">Score: {recoveredSession.score}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResumeSession(recoveredSession)}
                    className="bg-warning/20 border-warning/50"
                  >
                    Retomar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={discardRecoveredSession}
                    className="bg-muted/50 border-border"
                  >
                    Descartar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2 items-center">
            <GameExitButton
              variant="quit"
              onExit={async () => {
                if (isActive) {
                  await endSession({
                    quitReason: 'user_quit'
                  });
                }
              }}
              showProgress={gameState === 'playing'}
              currentProgress={playerSequence.length}
              totalProgress={sequence.length}
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground drop-shadow-lg">
              🎨 Simon Says
            </h1>
            <p className="text-muted-foreground text-sm">Jogo de Memória Profissional</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorNames(!showColorNames)}
              className="gap-2 bg-card border-border text-muted-foreground"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
              }}
              className="gap-2 bg-card border-border text-muted-foreground"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-info">{stats.level}</div>
              <div className="text-sm text-muted-foreground">Nível</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.score}</div>
              <div className="text-sm text-muted-foreground">Pontos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.bestStreak}</div>
              <div className="text-sm text-muted-foreground">Melhor Sequência</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Console */}
        <Card className="mb-8 bg-gradient-to-br from-card to-muted/50 border-border">
          <CardContent className="p-8 sm:p-12">
            {gameState === 'idle' && showTutorial && (
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Como Jogar Simon Says</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">👀</span>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Observe</h3>
                          <p className="text-sm text-muted-foreground">Assista a sequência de cores que acendem</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Repita</h3>
                          <p className="text-sm text-muted-foreground">Clique nas cores na mesma ordem</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Evolua</h3>
                          <p className="text-sm text-muted-foreground">A cada nível, uma cor nova é adicionada</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Vença</h3>
                          <p className="text-sm text-muted-foreground">Desbloqueie conquistas e bata recordes!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    simonSoundEngine.setEnabled(true);
                    startGame();
                  }} 
                  size="lg" 
                  className="gap-2 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Começar Jogo
                </Button>
              </div>
            )}

            {(gameState === 'showing' || gameState === 'playing' || (gameState === 'idle' && !showTutorial)) && (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                {/* Simon Console - Classic Circular Layout */}
                <div className="relative">
                  {/* The 4-button grid */}
                  <div className={cn(
                    "grid grid-cols-2 gap-3 p-6 rounded-full",
                    "bg-background shadow-2xl border-8 border-border",
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
                </div>

                {/* Central Display - Moved Below */}
                <SimonDisplay
                  level={stats.level}
                  score={stats.score}
                  gameState={gameState}
                  currentPosition={playerSequence.length}
                  sequenceLength={sequence.length}
                  highScore={stats.highScore}
                />
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">Game Over!</h2>
                  <div className="bg-muted/50 p-6 rounded-lg border border-border">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-info">{stats.level}</div>
                        <div className="text-sm text-muted-foreground">Nível Alcançado</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-success">{stats.score}</div>
                        <div className="text-sm text-muted-foreground">Pontos</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-warning">{stats.bestStreak}</div>
                        <div className="text-sm text-muted-foreground">Melhor Sequência</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-primary">{accuracy}%</div>
                        <div className="text-sm text-muted-foreground">Precisão</div>
                      </div>
                    </div>

                    {stats.score === stats.highScore && stats.score > 0 && (
                      <div className="mt-4 p-3 bg-warning/20 border border-warning/50 rounded-lg">
                        <p className="text-warning font-semibold">
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
                    className="gap-2 bg-gradient-to-r from-success to-success/80 hover:opacity-90"
                  >
                    <Play className="w-5 h-5" />
                    Jogar Novamente
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetGame} 
                    size="lg"
                    className="gap-2 bg-card border-border text-muted-foreground"
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
        <div className="relative z-0">
          <SimonAchievements
          stats={{
            level: stats.level,
            score: stats.score,
            bestStreak: stats.bestStreak,
            accuracy,
            perfectRounds: stats.perfectRounds
          }}
        />
        </div>

        {/* Benefits */}
        <Card className="mt-8 bg-card/50 border-border">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Trophy className="w-5 h-5 text-warning" />
              Benefícios Terapêuticos & Cognitivos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-info mb-2">🧠 Memória de Trabalho</h4>
                <p className="text-muted-foreground">
                  Fortalece a capacidade de reter e manipular sequências temporariamente, essencial para aprendizado e resolução de problemas.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-success mb-2">🎯 Atenção Sequencial</h4>
                <p className="text-muted-foreground">
                  Desenvolve foco em padrões e ordem temporal, crucial para compreensão de processos complexos.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">⚡ Concentração</h4>
                <p className="text-muted-foreground">
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