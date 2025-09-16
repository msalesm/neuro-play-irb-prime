import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, Timer, Target, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';

interface AttentionTask {
  id: string;
  type: 'target' | 'distractor';
  stimulus: string;
  color: string;
  position: { x: number; y: number };
  timestamp: number;
}

interface SessionStats {
  level: number;
  score: number;
  correctResponses: number;
  falseAlarms: number;
  missedTargets: number;
  averageReactionTime: number;
  vigilanceDecrement: number;
  attentionSpan: number;
  totalTrials: number;
  sessionDuration: number;
}

export const AttentionSustained: React.FC = () => {
  const { user } = useAuth();
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  
  const [gameState, setGameState] = useState<'idle' | 'instructions' | 'playing' | 'paused' | 'completed'>('idle');
  const [currentTask, setCurrentTask] = useState<AttentionTask | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    level: 1,
    score: 0,
    correctResponses: 0,
    falseAlarms: 0,
    missedTargets: 0,
    averageReactionTime: 0,
    vigilanceDecrement: 0,
    attentionSpan: 0,
    totalTrials: 0,
    sessionDuration: 0
  });
  
  const [currentTrial, setCurrentTrial] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const [taskTimer, setTaskTimer] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [taskStartTime, setTaskStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(60000);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const TRIAL_DURATION = 60000; // 1 minute per level
  const STIMULUS_DURATION = 1500; // Each stimulus shows for 1.5s
  const ISI_RANGE = [800, 2000]; // Inter-stimulus interval
  const TARGET_PROBABILITY = 0.3; // 30% targets, 70% distractors
  
  const STIMULI = {
    targets: ['🔴', '🟡', '🔵'],
    distractors: ['⚫', '⚪', '🟤', '🟢', '🟠', '🟣']
  };

  // Generate next task
  const generateTask = useCallback((level: number): AttentionTask => {
    const isTarget = Math.random() < TARGET_PROBABILITY;
    const stimuli = isTarget ? STIMULI.targets : STIMULI.distractors;
    const stimulus = stimuli[Math.floor(Math.random() * stimuli.length)];
    
    // Position varies with level difficulty
    const positionVariance = Math.min(80, 40 + (level * 5));
    const x = Math.random() * positionVariance + (100 - positionVariance) / 2;
    const y = Math.random() * positionVariance + (100 - positionVariance) / 2;
    
    return {
      id: `task-${Date.now()}-${Math.random()}`,
      type: isTarget ? 'target' : 'distractor',
      stimulus,
      color: isTarget ? '#ef4444' : '#6b7280',
      position: { x, y },
      timestamp: Date.now()
    };
  }, []);

  // Complete current level
  const completeLevel = useCallback(async () => {
    if (gameTimer) clearTimeout(gameTimer);
    if (taskTimer) clearTimeout(taskTimer);
    
    const sessionDuration = Date.now() - startTime;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    // Calculate vigilance decrement (attention decline over time)
    const vigilanceDecrement = calculateVigilanceDecrement(reactionTimes);
    
    // Calculate attention span score
    const attentionSpan = calculateAttentionSpan(stats.correctResponses, stats.totalTrials, sessionDuration);
    
    const finalStats: SessionStats = {
      ...stats,
      averageReactionTime: avgReactionTime,
      vigilanceDecrement,
      attentionSpan,
      sessionDuration
    };
    
    setStats(finalStats);
    setGameState('completed');
    
    // Save behavioral metrics
    if (user?.id) {
      await saveBehavioralMetric({
        metricType: 'sustained_attention',
        category: 'attention',
        value: attentionSpan / 100,
        gameId: 'attention_sustained',
        sessionId: `attention-${Date.now()}`,
        contextData: {
          attentionSpan: attentionSpan / 100,
          vigilanceDecrement: vigilanceDecrement / 100,
          reactionTime: avgReactionTime,
          inhibitoryControl: 1 - (finalStats.falseAlarms / Math.max(finalStats.totalTrials, 1)),
          workingMemory: finalStats.correctResponses / Math.max(finalStats.totalTrials, 1),
          riskIndicators: {
            tdahRisk: calculateTDAHRisk(finalStats, avgReactionTime, vigilanceDecrement),
            teaRisk: calculateTEARisk(finalStats),
            dislexiaRisk: 0.1
          },
          sessionDuration: sessionDuration / 1000
        }
      });
    }
  }, [gameTimer, taskTimer, startTime, reactionTimes, stats, user?.id, saveBehavioralMetric]);

  // Timer update effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (gameState === 'playing' && gameStarted) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, TRIAL_DURATION - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          completeLevel();
        }
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, gameStarted, startTime, completeLevel]);

  // Start game session
  const startGame = useCallback(() => {
    // Show countdown
    setGameState('instructions');
    
    setTimeout(() => {
      setGameState('playing');
      setGameStarted(true);
      setStartTime(Date.now());
      setTimeRemaining(TRIAL_DURATION);
      setCurrentTrial(0);
      setReactionTimes([]);
      
      const initialStats: SessionStats = {
        level: 1,
        score: 0,
        correctResponses: 0,
        falseAlarms: 0,
        missedTargets: 0,
        averageReactionTime: 0,
        vigilanceDecrement: 0,
        attentionSpan: 0,
        totalTrials: 0,
        sessionDuration: 0
      };
      setStats(initialStats);
      
      // Start first task
      const firstTask = generateTask(1);
      setCurrentTask(firstTask);
      setTaskStartTime(Date.now());
      
      // Set task timeout
      const timeout = setTimeout(() => {
        handleMissedTarget();
      }, STIMULUS_DURATION);
      setTaskTimer(timeout);
      
      // Set session timer
      const sessionTimer = setTimeout(() => {
        completeLevel();
      }, TRIAL_DURATION);
      setGameTimer(sessionTimer);
    }, 3000); // 3 second countdown
    
  }, [generateTask]);

  // Handle response to stimulus
  const handleResponse = useCallback((isTargetResponse: boolean) => {
    if (!currentTask || gameState !== 'playing') return;
    
    const reactionTime = Date.now() - taskStartTime;
    const isCorrectResponse = (currentTask.type === 'target' && isTargetResponse) || 
                             (currentTask.type === 'distractor' && !isTargetResponse);
    
    // Clear current task timer
    if (taskTimer) {
      clearTimeout(taskTimer);
      setTaskTimer(null);
    }
    
    // Update reaction times
    if (isTargetResponse && currentTask.type === 'target') {
      setReactionTimes(prev => [...prev, reactionTime]);
    }
    
    // Update stats
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalTrials += 1;
      
      if (isCorrectResponse) {
        newStats.correctResponses += 1;
        newStats.score += currentTask.type === 'target' ? 10 : 5;
      } else {
        if (isTargetResponse && currentTask.type === 'distractor') {
          newStats.falseAlarms += 1;
        }
      }
      
      return newStats;
    });
    
    // Generate next task after delay
    setTimeout(() => {
      if (gameState === 'playing') {
        const nextTask = generateTask(stats.level);
        setCurrentTask(nextTask);
        setTaskStartTime(Date.now());
        setCurrentTrial(prev => prev + 1);
        
        const timeout = setTimeout(() => {
          handleMissedTarget();
        }, STIMULUS_DURATION);
        setTaskTimer(timeout);
      }
    }, ISI_RANGE[0] + Math.random() * (ISI_RANGE[1] - ISI_RANGE[0]));
    
  }, [currentTask, gameState, taskTimer, stats.level, taskStartTime]);

  // Handle missed target
  const handleMissedTarget = useCallback(() => {
    if (!currentTask) return;
    
    if (currentTask.type === 'target') {
      setStats(prev => ({
        ...prev,
        missedTargets: prev.missedTargets + 1,
        totalTrials: prev.totalTrials + 1
      }));
    }
    
    // Generate next task
    setTimeout(() => {
      if (gameState === 'playing') {
        const nextTask = generateTask(stats.level);
        setCurrentTask(nextTask);
        setTaskStartTime(Date.now());
        setCurrentTrial(prev => prev + 1);
        
        const timeout = setTimeout(() => {
          handleMissedTarget();
        }, STIMULUS_DURATION);
        setTaskTimer(timeout);
      }
    }, ISI_RANGE[0] + Math.random() * (ISI_RANGE[1] - ISI_RANGE[0]));
  }, [currentTask, gameState, generateTask, stats.level]);

  // Calculate vigilance decrement
  const calculateVigilanceDecrement = (reactionTimes: number[]): number => {
    if (reactionTimes.length < 4) return 0;
    
    const firstHalf = reactionTimes.slice(0, Math.floor(reactionTimes.length / 2));
    const secondHalf = reactionTimes.slice(Math.floor(reactionTimes.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return Math.max(0, ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
  };

  // Calculate attention span score
  const calculateAttentionSpan = (correct: number, total: number, duration: number): number => {
    const accuracy = total > 0 ? (correct / total) : 0;
    const timeBonus = Math.min(1, duration / TRIAL_DURATION);
    return Math.round(accuracy * timeBonus * 100);
  };

  // Calculate TDAH risk factors
  const calculateTDAHRisk = (stats: SessionStats, avgRT: number, vigilance: number): number => {
    let risk = 0;
    
    // High false alarm rate indicates impulsivity
    const falseAlarmRate = stats.falseAlarms / Math.max(stats.totalTrials, 1);
    if (falseAlarmRate > 0.3) risk += 0.3;
    
    // High vigilance decrement indicates attention problems
    if (vigilance > 20) risk += 0.4;
    
    // Variable reaction times indicate attention inconsistency
    if (avgRT > 800) risk += 0.2;
    
    // High missed target rate
    const missRate = stats.missedTargets / Math.max(stats.totalTrials, 1);
    if (missRate > 0.4) risk += 0.3;
    
    return Math.min(risk, 1.0);
  };

  // Calculate TEA risk factors
  const calculateTEARisk = (stats: SessionStats): number => {
    let risk = 0;
    
    // Very low response rate might indicate social disengagement
    const responseRate = (stats.correctResponses + stats.falseAlarms) / Math.max(stats.totalTrials, 1);
    if (responseRate < 0.3) risk += 0.2;
    
    // Extremely consistent responses might indicate rigid patterns
    if (stats.falseAlarms === 0 && stats.correctResponses > 10) risk += 0.1;
    
    return Math.min(risk, 1.0);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      if (event.code === 'Space') {
        event.preventDefault();
        handleResponse(true); // Space = target response
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleResponse]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (gameTimer) clearTimeout(gameTimer);
      if (taskTimer) clearTimeout(taskTimer);
    };
  }, [gameTimer, taskTimer]);

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Login Necessário</AlertTitle>
        <AlertDescription>
          Faça login para acessar o teste de atenção sustentada.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-playful bg-clip-text text-transparent mb-4">
          Teste de Atenção Sustentada
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Avalia a capacidade de manter atenção focada ao longo do tempo - ferramenta diagnóstica para TDAH
        </p>
      </div>

      {gameState === 'idle' && (
        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Brain className="w-6 h-6 mr-2" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p>Este teste avalia sua capacidade de manter atenção sustentada.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Alvos</h3>
                  <p className="text-sm text-muted-foreground">Pressione ESPAÇO quando ver: 🔴 🟡 🔵</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Timer className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <h3 className="font-semibold">Distractores</h3>
                  <p className="text-sm text-muted-foreground">NÃO pressione para: ⚫ ⚪ 🟤 🟢 🟠 🟣</p>
                </div>
              </div>
              
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertTitle>Objetivo Diagnóstico</AlertTitle>
                <AlertDescription>
                  Este teste mede indicadores de TDAH: tempo de reação, impulsividade, 
                  declínio da vigilância e sustentação da atenção.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => setGameState('instructions')} 
                className="w-full shadow-soft"
                size="lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Iniciar Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'instructions' && !gameStarted && (
        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Instruções Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p><strong>1.</strong> Mantenha os olhos focados no centro da tela</p>
              <p><strong>2.</strong> Quando aparecer um alvo (🔴 🟡 🔵), pressione ESPAÇO rapidamente</p>
              <p><strong>3.</strong> NÃO responda aos distractores (⚫ ⚪ 🟤 🟢 🟠 🟣)</p>
              <p><strong>4.</strong> Mantenha atenção constante durante todo o teste</p>
              <p><strong>5.</strong> O teste dura 1 minuto e analisa sua concentração</p>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setGameState('idle')}
              >
                Voltar
              </Button>
              <Button onClick={startGame} className="shadow-soft">
                <Timer className="w-4 h-4 mr-2" />
                Começar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'instructions' && gameStarted && (
        <Card className="shadow-glow max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-primary rounded-full transition-all duration-1000"
                  style={{ 
                    clipPath: `polygon(50% 0%, 50% 0%, 50% 50%, 50% 50%)`,
                    transform: 'rotate(-90deg)',
                    animation: 'spin 3s linear'
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">PRONTO</span>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-primary">Teste Iniciando!</h2>
                <p className="text-lg text-muted-foreground">Foque no centro da tela</p>
                <p className="text-sm text-muted-foreground">O teste começará em alguns segundos...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          {/* Timer and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Circular Timer */}
            <Card className="shadow-soft md:col-span-1">
              <CardContent className="p-4 text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - timeRemaining / TRIAL_DURATION)}`}
                      className="transition-all duration-100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {Math.ceil(timeRemaining / 1000)}s
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Tempo</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.score}</div>
                <div className="text-sm text-muted-foreground">Pontos</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.correctResponses}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.falseAlarms}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.missedTargets}</div>
                <div className="text-sm text-muted-foreground">Perdidos</div>
              </CardContent>
            </Card>
          </div>

          {/* Game Area */}
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div 
                ref={gameAreaRef}
                className="relative h-96 bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden cursor-crosshair"
                onClick={() => handleResponse(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-50"></div>
                </div>
                
                {currentTask && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-6xl select-none animate-pulse"
                    style={{
                      left: `${currentTask.position.x}%`,
                      top: `${currentTask.position.y}%`,
                      color: currentTask.color
                    }}
                  >
                    {currentTask.stimulus}
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-center text-sm text-muted-foreground mb-2">
                    Pressione ESPAÇO para alvos • Trial {currentTrial + 1}
                  </div>
                  <Progress 
                    value={(Date.now() - startTime) / TRIAL_DURATION * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState === 'completed' && (
        <Card className="shadow-glow max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-2" />
              Teste Concluído
            </CardTitle>
            <CardDescription>Análise de Atenção Sustentada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{stats.score}</div>
                <div className="text-sm text-muted-foreground">Pontuação Final</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.attentionSpan}%</div>
                <div className="text-sm text-muted-foreground">Atenção Sustentada</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Respostas Corretas:</span>
                <Badge variant="secondary">{stats.correctResponses}/{stats.totalTrials}</Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Tempo de Reação Médio:</span>
                <Badge variant="outline">{stats.averageReactionTime.toFixed(0)}ms</Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Declínio da Vigilância:</span>
                <Badge variant={stats.vigilanceDecrement > 20 ? "destructive" : "secondary"}>
                  {stats.vigilanceDecrement.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Taxa de Falsos Alarmes:</span>
                <Badge variant={stats.falseAlarms > stats.totalTrials * 0.3 ? "destructive" : "secondary"}>
                  {((stats.falseAlarms / Math.max(stats.totalTrials, 1)) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>Análise Clínica</AlertTitle>
              <AlertDescription>
                {stats.vigilanceDecrement > 20 || stats.falseAlarms > stats.totalTrials * 0.3
                  ? "Indicadores sugerem possível déficit de atenção. Recomenda-se avaliação profissional."
                  : "Desempenho dentro dos parâmetros normais de atenção sustentada."
                }
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setGameState('idle')}
              >
                Tentar Novamente
              </Button>
              <Button onClick={() => window.location.href = '/games'}>
                Outros Jogos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};