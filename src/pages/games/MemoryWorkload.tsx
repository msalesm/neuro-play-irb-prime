import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, RotateCcw, CheckCircle, AlertCircle, TrendingUp, Brain, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { SessionRecoveryModal } from '@/components/SessionRecoveryModal';
import { GameExitButton } from '@/components/GameExitButton';

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
  const { saveBehavioralMetric } = useBehavioralAnalysis();
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

  // Auto-save integration
  const { 
    startSession, 
    updateSession, 
    completeSession, 
    abandonSession,
    currentSession,
    isSaving 
  } = useAutoSave({ 
    saveInterval: 10000,
    saveOnAction: true,
    saveOnUnload: true 
  });

  // Session recovery
  const { 
    unfinishedSessions, 
    loading: recoveryLoading,
    resumeSession,
    discardSession 
  } = useSessionRecovery('memory-workload');

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

  const showSequence = useCallback(() => {
    if (showingIndex < sequence.length) {
      setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, SHOW_DURATION);
    } else {
      setTimeout(() => {
        setGameState('input');
        setTimeLeft(sequenceLength * 1500); // Tempo adequado para input
        clickTimeRef.current = Date.now();
      }, PAUSE_DURATION);
    }
  }, [showingIndex, sequence.length, sequenceLength]);

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

        // Adaptive difficulty
        let nextLevel = level;
        if (adaptiveMode && consecutiveCorrect >= 2) {
          nextLevel = level + 2; // Aumenta 2 níveis se acertar 3 seguidas
          toast.success(`Excelente! Pulando para nível ${nextLevel}!`, { duration: 2000 });
        } else if (adaptiveMode && consecutiveCorrect >= 1) {
          nextLevel = level + 1; // Aumenta 1 nível
          toast.success(`Nível ${level} completo! +${level * 10} pontos`);
        } else {
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

      // Adaptive difficulty
      let nextLevel = level;
      if (adaptiveMode && consecutiveErrors >= 1 && level > 1) {
        nextLevel = Math.max(1, level - 1); // Diminui 1 nível após 2 erros
        toast.error('Ajustando dificuldade...', { duration: 1500 });
      } else {
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
      showSequence();
    }
  }, [gameState, showSequence]);

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
            w-16 h-16 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
            ${gameState === 'input' ? 'cursor-pointer hover:scale-110 hover:border-primary hover:shadow-lg' : 'cursor-default'}
            ${isCurrentShowing ? 'animate-pulse scale-110 shadow-xl' : ''}
            ${wasClickedByUser ? 'ring-2 ring-green-400' : ''}
          `}
          style={{
            backgroundColor,
            borderColor
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
    const sessionId = await startSession('memory-workload', level, {
      adaptiveMode,
      initialLevel: level
    });
    
    if (sessionId) {
      startRound();
    }
  };

  const handleResumeSession = async (session: any) => {
    const recoveredSession = await resumeSession(session.id);
    if (recoveredSession) {
      setLevel(recoveredSession.level || 1);
      setScore(recoveredSession.performance_data?.score || 0);
      setSessionData(prev => ({
        ...prev,
        ...recoveredSession.performance_data?.sessionData
      }));
      
      await startSession('memory-workload', recoveredSession.level, recoveredSession.performance_data);
      startRound();
      toast.success('Sessão recuperada!');
    }
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
                  ? 'bg-gradient-to-t from-blue-600 to-blue-400 animate-pulse' 
                  : isReached 
                    ? 'bg-gradient-to-t from-green-600 to-green-400' 
                    : 'bg-gray-200'
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
      <SessionRecoveryModal
        open={!recoveryLoading && unfinishedSessions.length > 0 && gameState === 'waiting'}
        sessions={unfinishedSessions}
        onResume={handleResumeSession}
        onDiscard={discardSession}
        onStartNew={handleStartGame}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {gameState !== 'waiting' && (
            <div className="mb-4">
              <GameExitButton 
                onExit={async () => {
                  await abandonSession();
                  setGameState('waiting');
                }}
              />
            </div>
          )}

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Memória de Trabalho
                </h1>
                <p className="text-gray-600">Memorize e reproduza a sequência</p>
                {adaptiveMode && gameState !== 'waiting' && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>Modo Adaptativo Ativo</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{score}</div>
                  <div className="text-sm text-gray-500">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{level}</div>
                  <div className="text-sm text-gray-500">Nível</div>
                </div>
                {isSaving && gameState !== 'waiting' && (
                  <div className="text-xs text-gray-500 italic">
                    💾 Salvando...
                  </div>
                )}
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
                <p className="mb-4 text-gray-600">
                  Memorize a sequência de cores e posições, depois reproduza clicando nas células na ordem correta.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Como Jogar</h3>
                  <ul className="text-sm text-blue-800 text-left space-y-1">
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
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                  <span>Memorize a sequência...</span>
                </div>
                <div className="text-sm text-gray-600">
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
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Clique nas células na ordem correta</span>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Progresso: {userSequence.length}/{sequence.length} células
                </div>
                <Progress 
                  value={(userSequence.length / sequence.length) * 100} 
                  className="h-2 max-w-xs mx-auto"
                />
              </div>
            )}
            
            {gameState === 'feedback' && (
              <div className="flex items-center justify-center gap-2 text-purple-600">
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
                <div className="text-center mb-2 text-sm font-semibold text-gray-700">
                  Capacidade de Memória (Span)
                </div>
                {renderCapacityGraph()}
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6 text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-600">{accuracy}%</div>
                  <div className="text-sm text-gray-500">Precisão</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{sessionData.maxLevel}</div>
                  <div className="text-sm text-gray-500">Span Máximo</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{avgReactionTime}s</div>
                  <div className="text-sm text-gray-500">Tempo Médio</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{sessionData.errors}</div>
                  <div className="text-sm text-gray-500">Erros</div>
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