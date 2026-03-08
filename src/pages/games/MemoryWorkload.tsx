import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, RotateCcw, CheckCircle, AlertCircle, TrendingUp, Brain, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useGameSession } from '@/hooks/useGameSession';
import { GameExitButton } from '@/components/games';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MemoryItem {
  id: string;
  position: number;
  color: string;
  order: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
const GRID_SIZE = 16; // 4x4 grid
const SHOW_DURATION = 800; // Reduzido de 1200ms para 800ms
const PAUSE_DURATION = 400; // Reduzido de 800ms para 400ms
const FEEDBACK_DURATION = 1000; // Reduzido de 2000ms para 1000ms

export default function MemoryWorkload() {
  const { user } = useAuth();
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  const audio = useAudioEngine();
  const [gameState, setGameState] = useState<'waiting' | 'showing' | 'input' | 'feedback'>('waiting');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<MemoryItem[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const clickTimeRef = useRef<number>(0);
  const [sessionData, setSessionData] = useState({
    correctResponses: 0,
    totalResponses: 0,
    averageReactionTime: 0,
    maxLevel: 1,
    errors: 0,
    reactionTimes: [] as number[]
  });
  const [childProfileId, setChildProfileId] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Get child profile ID
  useEffect(() => {
    const loadChildProfile = async () => {
      if (!user) {
        setProfileLoaded(true);
        return;
      }
      const { data: profiles } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (profiles) {
        setChildProfileId(profiles.id);
      }
      setProfileLoaded(true);
    };
    loadChildProfile();
  }, [user]);
  
  // Modo teste quando não há usuário ou perfil carregado sem perfil
  const isTestMode = !user || (profileLoaded && !childProfileId);

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
  } = useGameSession('memory-workload', childProfileId || undefined);

  const sequenceLength = Math.min(3 + level, 8);

  const generateSequence = useCallback(() => {
    const newSequence: MemoryItem[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push({
        id: `item-${i}`,
        position: Math.floor(Math.random() * GRID_SIZE),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        order: i
      });
    }
    setSequence(newSequence);
  }, [sequenceLength]);

  const startRound = useCallback(() => {
    generateSequence();
    setUserSequence([]);
    setCurrentStep(0);
    setShowingIndex(0);
    setGameState('showing');
    setTimeLeft(sequenceLength * SHOW_DURATION);
    clickTimeRef.current = Date.now();
  }, [generateSequence, sequenceLength]);

  const showSequenceRef = useRef(false);
  
  const showSequence = useCallback(() => {
    if (showSequenceRef.current) return; // Prevent double execution
    showSequenceRef.current = true;
    
    if (showingIndex < sequence.length) {
      audio.playTick();
      
      const timer = setTimeout(() => {
        showSequenceRef.current = false;
        setShowingIndex(prev => prev + 1);
      }, SHOW_DURATION);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        showSequenceRef.current = false;
        setGameState('input');
        setTimeLeft(sequenceLength * 1500);
        clickTimeRef.current = Date.now();
        audio.playHint();
      }, PAUSE_DURATION);
      
      return () => clearTimeout(timer);
    }
  }, [showingIndex, sequence.length, sequenceLength, audio]);

  const handleCellClick = (position: number) => {
    if (gameState !== 'input') return;

    const reactionTime = Date.now() - clickTimeRef.current;
    clickTimeRef.current = Date.now();

    const newUserSequence = [...userSequence, position];
    setUserSequence(newUserSequence);

    if (newUserSequence[currentStep] === sequence[currentStep].position) {
      if (currentStep === sequence.length - 1) {
        // Round completed successfully
        setGameState('feedback');
        const newScore = score + level * 10;
        setScore(newScore);
        
        const newReactionTimes = [...sessionData.reactionTimes, reactionTime];
        const avgReactionTime = newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length;
        
        const newSessionData = {
          ...sessionData,
          correctResponses: sessionData.correctResponses + 1,
          totalResponses: sessionData.totalResponses + 1,
          maxLevel: Math.max(sessionData.maxLevel, level),
          averageReactionTime: avgReactionTime,
          reactionTimes: newReactionTimes
        };
        
        setSessionData(newSessionData);
        setConsecutiveCorrect(prev => prev + 1);
        setConsecutiveErrors(0);

        // Adaptive difficulty and audio feedback
        let nextLevel = level;
        if (adaptiveMode && consecutiveCorrect >= 2) {
          nextLevel = level + 2; // Aumenta 2 níveis se acertar 3 seguidas
          audio.playAchievement();
          audio.speak('Excelente! Pulando de nível!');
          toast.success(`Excelente! Pulando para nível ${nextLevel}!`, { duration: 2000 });
        } else if (adaptiveMode && consecutiveCorrect >= 1) {
          nextLevel = level + 1; // Aumenta 1 nível
          audio.playLevelUp();
          toast.success(`Nível ${level} completo! +${level * 10} pontos`);
        } else {
          audio.playSuccess('high');
          toast.success(`Nível ${level} completo! +${level * 10} pontos`);
          nextLevel = level + 1;
        }

        // Save behavioral metric
        saveBehavioralMetric({
          metricType: 'working_memory',
          category: 'cognitive',
          value: (currentStep + 1) / sequence.length,
          contextData: {
            level,
            sequenceLength,
            score: newScore,
            accuracy: newSessionData.correctResponses / newSessionData.totalResponses,
            reactionTime,
            avgReactionTime
          },
          gameId: 'memory-workload'
        });

        // Auto-save update
        updateSession({
          score: newScore,
          level: nextLevel,
          moves: newSessionData.totalResponses
        });

        setTimeout(() => {
          setLevel(nextLevel);
          startRound();
        }, FEEDBACK_DURATION);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // Wrong answer
      setGameState('feedback');
      
      const newSessionData = {
        ...sessionData,
        errors: sessionData.errors + 1,
        totalResponses: sessionData.totalResponses + 1
      };
      
      setSessionData(newSessionData);
      setConsecutiveErrors(prev => prev + 1);
      setConsecutiveCorrect(0);

      // Adaptive difficulty and audio feedback
      let nextLevel = level;
      if (adaptiveMode && consecutiveErrors >= 1 && level > 1) {
        nextLevel = Math.max(1, level - 1); // Diminui 1 nível após 2 erros
        audio.playError('soft');
        audio.speak('Vamos tentar algo mais fácil');
        toast.error('Ajustando dificuldade...', { duration: 1500 });
      } else {
        audio.playError('soft');
        toast.error('Sequência incorreta. Tente novamente!');
      }

      // Save error metric
      saveBehavioralMetric({
        metricType: 'working_memory_error',
        category: 'cognitive',
        value: currentStep / sequence.length,
        contextData: {
          level,
          sequenceLength,
          errorPosition: currentStep,
          expectedPosition: sequence[currentStep].position,
          clickedPosition: position
        },
        gameId: 'memory-workload'
      });

      // Auto-save update
      updateSession({
        score,
        level: nextLevel,
        moves: newSessionData.totalResponses
      });

      setTimeout(() => {
        setLevel(nextLevel);
        startRound();
      }, FEEDBACK_DURATION);
    }
  };

  useEffect(() => {
    if (gameState === 'showing') {
      showSequenceRef.current = false;
      const cleanup = showSequence();
      return cleanup;
    }
  }, [gameState, showingIndex]);

  useEffect(() => {
    if (timeLeft > 0 && (gameState === 'showing' || gameState === 'input')) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 100), 100);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && gameState === 'input') {
      handleCellClick(-1); // Timeout treated as wrong answer
    }
  }, [timeLeft, gameState]);

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      // Durante fase "showing": mostrar apenas a célula atual com cor e número
      const isCurrentShowing = gameState === 'showing' && 
        showingIndex > 0 && 
        sequence[showingIndex - 1]?.position === i;
      
      const sequenceItem = sequence.find(item => item.position === i);
      
      // Durante fase "input": verificar se o usuário já clicou nesta célula
      const userClickIndex = userSequence.indexOf(i);
      const wasClickedByUser = userClickIndex !== -1;

      // Determinar estilo baseado na fase do jogo
      let backgroundColor = '#f1f5f9'; // Cinza claro padrão
      let borderColor = '#cbd5e1';
      let showNumber = false;
      let numberToShow = 0;

      if (gameState === 'showing' && isCurrentShowing) {
        // Fase de memorização: mostrar cor e número da sequência
        backgroundColor = sequenceItem?.color || '#f1f5f9';
        borderColor = sequenceItem?.color || '#cbd5e1';
        showNumber = true;
        numberToShow = showingIndex;
      } else if (gameState === 'input' && wasClickedByUser) {
        // Fase de input: células clicadas ficam verdes com número da ordem
        backgroundColor = '#10b981'; // Verde
        borderColor = '#059669';
        showNumber = true;
        numberToShow = userClickIndex + 1;
      }

      cells.push(
        <div
          key={i}
          className={`
            w-16 h-16 rounded-lg border-2 flex items-center justify-center
            ${gameState === 'input' ? 'cursor-pointer hover:scale-105 hover:shadow-md transition-transform duration-150' : 'cursor-default'}
            ${isCurrentShowing ? 'scale-110 shadow-xl ring-4 ring-white/50' : ''}
            ${wasClickedByUser ? 'ring-2 ring-green-400' : ''}
          `}
          style={{
            backgroundColor,
            borderColor,
            transition: 'background-color 0.2s ease, border-color 0.2s ease'
          }}
          onClick={() => handleCellClick(i)}
        >
          {showNumber && (
            <div className="text-2xl font-bold text-white drop-shadow-md">
              {numberToShow}
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  const handleStartGame = async () => {
    if (!childProfileId && !isTestMode) {
      toast.info('🎮 Jogando em Modo Teste - Sem salvar progresso');
    }

    await startSession();
    audio.speak('Vamos começar! Memorize a sequência de cores e posições.');
    startRound();
  };

  const handleResumeSession = async () => {
    if (!recoveredSession) return;
    
    setLevel(recoveredSession.difficulty_level || 1);
    setScore(recoveredSession.score || 0);
    
    await resumeSession(recoveredSession);
    startRound();
    toast.success('Sessão recuperada!');
  };

  const accuracy = sessionData.totalResponses > 0 
    ? (sessionData.correctResponses / sessionData.totalResponses * 100).toFixed(1)
    : '0.0';

  const avgReactionTime = sessionData.averageReactionTime > 0 
    ? (sessionData.averageReactionTime / 1000).toFixed(2)
    : '0.00';

  // Render capacity graph (span visualization)
  const renderCapacityGraph = () => {
    const maxCapacity = 8;
    return (
      <div className="flex items-end gap-1 justify-center h-16">
        {Array.from({ length: maxCapacity }).map((_, i) => {
          const barLevel = i + 1;
          const isReached = sessionData.maxLevel >= barLevel;
          const isCurrent = level === barLevel;
          
          return (
            <div
              key={i}
              className={`w-6 rounded-t transition-all duration-300 ${
                isCurrent 
                  ? 'bg-gradient-to-t from-info to-info/70 animate-pulse' 
                  : isReached 
                    ? 'bg-gradient-to-t from-success to-success/70' 
                    : 'bg-muted'
              }`}
              style={{ 
                height: `${((barLevel) / maxCapacity) * 100}%`,
              }}
              title={`Nível ${barLevel}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      {recoveredSession && gameState === 'waiting' && (
        <Card className="max-w-md mx-auto mb-4 p-4">
          <h3 className="font-bold mb-2">Sessão não concluída encontrada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deseja continuar de onde parou?
          </p>
          <div className="flex gap-2">
            <Button onClick={handleResumeSession} size="sm">Continuar</Button>
            <Button onClick={discardRecoveredSession} size="sm" variant="outline">Descartar</Button>
          </div>
        </Card>
      )}
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
        <div className="max-w-4xl mx-auto">
          {gameState !== 'waiting' && (
            <div className="mb-4">
              <GameExitButton 
                onExit={() => {
                  setGameState('waiting');
                  window.location.href = '/games';
                }}
              />
            </div>
          )}

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  Memória de Trabalho
                </h1>
                <p className="text-muted-foreground">Memorize e reproduza a sequência</p>
                {adaptiveMode && gameState !== 'waiting' && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-info">
                    <TrendingUp className="w-3 h-3" />
                    <span>Modo Adaptativo Ativo</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <div className="text-sm text-muted-foreground">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{level}</div>
                  <div className="text-sm text-muted-foreground">Nível</div>
                </div>
              </div>
            </div>

          {gameState !== 'waiting' && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tempo restante</span>
                <Timer className="w-4 h-4" />
              </div>
              <Progress 
                value={(timeLeft / (sequenceLength * (gameState === 'showing' ? 1000 : 2000))) * 100} 
                className="h-2"
              />
            </div>
          )}

          <div className="text-center mb-6">
            {gameState === 'waiting' && (
              <div className="space-y-4">
                <p className="mb-4 text-muted-foreground">
                  Memorize a sequência de cores e posições, depois reproduza clicando nas células na ordem correta.
                </p>
                
                <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-foreground mb-2">💡 Como Jogar</h3>
                  <ul className="text-sm text-muted-foreground text-left space-y-1">
                    <li>• Primeiro você verá uma sequência de cores piscando</li>
                    <li>• Cada cor aparece em uma célula específica com um número</li>
                    <li>• Depois, clique nas células na mesma ordem</li>
                    <li>• O jogo ajusta automaticamente a dificuldade</li>
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={adaptiveMode}
                      onChange={(e) => setAdaptiveMode(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Modo Adaptativo (recomendado)</span>
                  </label>
                </div>
                
                <Button onClick={handleStartGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Iniciar Teste
                </Button>
              </div>
            )}
            
            {gameState === 'showing' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-info font-semibold">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                  <span>Memorize a sequência...</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {showingIndex}/{sequence.length} itens mostrados
                </div>
                <Progress 
                  value={(showingIndex / sequence.length) * 100} 
                  className="h-2 max-w-xs mx-auto"
                />
              </div>
            )}
            
            {gameState === 'input' && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-success font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Clique nas células na ordem correta</span>
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Progresso: {userSequence.length}/{sequence.length} células
                </div>
                <Progress 
                  value={(userSequence.length / sequence.length) * 100} 
                  className="h-2 max-w-xs mx-auto"
                />
              </div>
            )}
            
            {gameState === 'feedback' && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Preparando próximo nível...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 justify-center max-w-xs mx-auto mb-6">
            {renderGrid()}
          </div>

          {gameState !== 'waiting' && (
            <>
              <div className="mb-6">
                <div className="text-center mb-2 text-sm font-semibold text-foreground/80">
                  Capacidade de Memória (Span)
                </div>
                {renderCapacityGraph()}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-center">
                <div>
                  <div className="text-lg font-bold text-success">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Precisão</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-info">{sessionData.maxLevel}</div>
                  <div className="text-sm text-muted-foreground">Span Máximo</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-warning">{avgReactionTime}s</div>
                  <div className="text-sm text-muted-foreground">Tempo Médio</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-destructive">{sessionData.errors}</div>
                  <div className="text-sm text-muted-foreground">Erros</div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
    </>
  );
}