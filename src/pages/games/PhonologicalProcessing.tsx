import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Volume2, Mic, Brain, BookOpen, AlertTriangle, TrendingUp, Play, Pause } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';

interface PhonemeTask {
  id: string;
  type: 'rhyme' | 'segment' | 'blend' | 'manipulate';
  instruction: string;
  stimulus: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
}

interface SessionStats {
  level: number;
  score: number;
  correctResponses: number;
  errors: number;
  rhymeAccuracy: number;
  segmentationAccuracy: number;
  blendingAccuracy: number;
  manipulationAccuracy: number;
  averageReactionTime: number;
  phonologicalScore: number;
  totalTasks: number;
}

const PHONEME_TASKS: PhonemeTask[] = [
  // Rhyming tasks
  {
    id: '1',
    type: 'rhyme',
    instruction: 'Qual palavra rima com "GATO"?',
    stimulus: 'gato',
    options: ['pato', 'casa', 'mesa', 'livro'],
    correctAnswer: 'pato',
    difficulty: 1
  },
  {
    id: '2',
    type: 'rhyme',
    instruction: 'Qual palavra rima com "SOL"?',
    stimulus: 'sol',
    options: ['gol', 'lua', 'mar', 'céu'],
    correctAnswer: 'gol',
    difficulty: 1
  },
  
  // Segmentation tasks
  {
    id: '3',
    type: 'segment',
    instruction: 'Quantos sons tem a palavra "CASA"?',
    stimulus: 'casa',
    options: ['2', '3', '4', '5'],
    correctAnswer: '4',
    difficulty: 2
  },
  {
    id: '4',
    type: 'segment',
    instruction: 'Qual é o primeiro som de "BOLA"?',
    stimulus: 'bola',
    options: ['/b/', '/o/', '/l/', '/a/'],
    correctAnswer: '/b/',
    difficulty: 2
  },
  
  // Blending tasks
  {
    id: '5',
    type: 'blend',
    instruction: 'Que palavra formam os sons /m/ + /a/ + /r/?',
    stimulus: '/m/ /a/ /r/',
    options: ['mar', 'par', 'bar', 'tar'],
    correctAnswer: 'mar',
    difficulty: 3
  },
  {
    id: '6',
    type: 'blend',
    instruction: 'Que palavra formam os sons /f/ + /l/ + /o/ + /r/?',
    stimulus: '/f/ /l/ /o/ /r/',
    options: ['flor', 'amor', 'dor', 'cor'],
    correctAnswer: 'flor',
    difficulty: 3
  },
  
  // Manipulation tasks
  {
    id: '7',
    type: 'manipulate',
    instruction: 'Se tirarmos o som /g/ de "gato", que palavra fica?',
    stimulus: 'gato - /g/',
    options: ['ato', 'gato', 'pato', 'nato'],
    correctAnswer: 'ato',
    difficulty: 4
  },
  {
    id: '8',
    type: 'manipulate',
    instruction: 'Se trocarmos o /p/ por /g/ em "pato", que palavra fica?',
    stimulus: 'pato: /p/ → /g/',
    options: ['gato', 'pato', 'nato', 'mato'],
    correctAnswer: 'gato',
    difficulty: 4
  }
];

export const PhonologicalProcessing: React.FC = () => {
  const { user } = useAuth();
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  
  const [gameState, setGameState] = useState<'idle' | 'instructions' | 'playing' | 'completed'>('idle');
  const [currentTask, setCurrentTask] = useState<PhonemeTask | null>(null);
  const [taskIndex, setTaskIndex] = useState<number>(0);
  const [stats, setStats] = useState<SessionStats>({
    level: 1,
    score: 0,
    correctResponses: 0,
    errors: 0,
    rhymeAccuracy: 0,
    segmentationAccuracy: 0,
    blendingAccuracy: 0,
    manipulationAccuracy: 0,
    averageReactionTime: 0,
    phonologicalScore: 0,
    totalTasks: 0
  });
  
  const [taskStartTime, setTaskStartTime] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [taskResults, setTaskResults] = useState<{[key: string]: boolean}>({});
  const [feedback, setFeedback] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  
  const audioRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      
      audioRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Start next task
  const startNextTask = useCallback(() => {
    if (taskIndex >= PHONEME_TASKS.length) {
      completeTest();
      return;
    }
    
    const task = PHONEME_TASKS[taskIndex];
    setCurrentTask(task);
    setTaskStartTime(Date.now());
    setFeedback('');
    
    // Automatically read the instruction
    setTimeout(() => {
      speakText(task.instruction);
    }, 500);
  }, [taskIndex, speakText]);

  // Handle answer selection
  const handleAnswer = useCallback(async (selectedAnswer: string) => {
    if (!currentTask) return;
    
    const reactionTime = Date.now() - taskStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    const isCorrect = selectedAnswer === currentTask.correctAnswer;
    
    // Record result for accuracy calculation
    setTaskResults(prev => ({
      ...prev,
      [`${currentTask.type}_${currentTask.id}`]: isCorrect
    }));
    
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalTasks += 1;
      
      if (isCorrect) {
        newStats.correctResponses += 1;
        newStats.score += currentTask.difficulty * 10;
        setFeedback('Correto! Muito bem! ✓');
      } else {
        newStats.errors += 1;
        setFeedback(`Incorreto. A resposta correta era: ${currentTask.correctAnswer}`);
      }
      
      return newStats;
    });
    
    // Move to next task after delay
    setTimeout(() => {
      setTaskIndex(prev => prev + 1);
      startNextTask();
    }, 2500);
  }, [currentTask, taskStartTime, startNextTask]);

  // Complete test and calculate results
  const completeTest = useCallback(async () => {
    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    
    // Calculate accuracy by task type
    const rhymeResults = Object.entries(taskResults).filter(([key]) => key.startsWith('rhyme'));
    const segmentResults = Object.entries(taskResults).filter(([key]) => key.startsWith('segment'));
    const blendResults = Object.entries(taskResults).filter(([key]) => key.startsWith('blend'));
    const manipulateResults = Object.entries(taskResults).filter(([key]) => key.startsWith('manipulate'));
    
    const rhymeAccuracy = rhymeResults.length > 0 
      ? (rhymeResults.filter(([, correct]) => correct).length / rhymeResults.length) * 100 
      : 0;
    const segmentationAccuracy = segmentResults.length > 0 
      ? (segmentResults.filter(([, correct]) => correct).length / segmentResults.length) * 100 
      : 0;
    const blendingAccuracy = blendResults.length > 0 
      ? (blendResults.filter(([, correct]) => correct).length / blendResults.length) * 100 
      : 0;
    const manipulationAccuracy = manipulateResults.length > 0 
      ? (manipulateResults.filter(([, correct]) => correct).length / manipulateResults.length) * 100 
      : 0;
    
    const phonologicalScore = calculatePhonologicalScore(
      rhymeAccuracy, segmentationAccuracy, blendingAccuracy, manipulationAccuracy
    );
    
    const finalStats: SessionStats = {
      ...stats,
      averageReactionTime: avgReactionTime,
      rhymeAccuracy,
      segmentationAccuracy,
      blendingAccuracy,
      manipulationAccuracy,
      phonologicalScore
    };
    
    setStats(finalStats);
    setGameState('completed');
    
    // Save behavioral metrics
    if (user?.id) {
      await saveBehavioralMetric({
        gameType: 'phonological_processing',
        sessionId: `phonological-${Date.now()}`,
        metrics: {
          phonologicalProcessing: phonologicalScore / 100,
          sequentialProcessing: (segmentationAccuracy + blendingAccuracy) / 200,
          rapidNaming: 1 - (avgReactionTime / 5000), // Normalized reaction time
          workingMemory: manipulationAccuracy / 100
        },
        riskIndicators: {
          dislexiaRisk: calculateDislexiaRisk(finalStats),
          tdahRisk: calculateTDAHRisk(finalStats),
          teaRisk: 0.1 // Low relevance for phonological tasks
        },
        sessionDuration: (Date.now() - taskStartTime) / 1000
      });
    }
  }, [reactionTimes, taskResults, stats, user?.id, saveBehavioralMetric, taskStartTime]);

  // Calculate phonological score
  const calculatePhonologicalScore = (rhyme: number, segment: number, blend: number, manipulate: number): number => {
    // Weighted average with higher weight on more complex tasks
    return Math.round((rhyme * 0.15 + segment * 0.25 + blend * 0.3 + manipulate * 0.3));
  };

  // Calculate risk indicators
  const calculateDislexiaRisk = (stats: SessionStats): number => {
    let risk = 0;
    
    // Poor phonological awareness is primary dyslexia indicator
    if (stats.phonologicalScore < 60) risk += 0.5;
    if (stats.segmentationAccuracy < 50) risk += 0.3;
    if (stats.blendingAccuracy < 50) risk += 0.3;
    if (stats.manipulationAccuracy < 40) risk += 0.4;
    
    // Slow processing speed
    if (stats.averageReactionTime > 3000) risk += 0.2;
    
    return Math.min(risk, 1.0);
  };

  const calculateTDAHRisk = (stats: SessionStats): number => {
    let risk = 0;
    
    // High error rate might indicate attention difficulties
    const errorRate = stats.errors / Math.max(stats.totalTasks, 1);
    if (errorRate > 0.4) risk += 0.2;
    
    // Variable reaction times indicate attention inconsistency
    if (stats.averageReactionTime > 4000) risk += 0.2;
    
    return Math.min(risk, 1.0);
  };

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setTaskIndex(0);
    setStats({
      level: 1,
      score: 0,
      correctResponses: 0,
      errors: 0,
      rhymeAccuracy: 0,
      segmentationAccuracy: 0,
      blendingAccuracy: 0,
      manipulationAccuracy: 0,
      averageReactionTime: 0,
      phonologicalScore: 0,
      totalTasks: 0
    });
    setReactionTimes([]);
    setTaskResults({});
    startNextTask();
  }, [startNextTask]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Login Necessário</AlertTitle>
        <AlertDescription>
          Faça login para acessar o teste de processamento fonológico.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-playful bg-clip-text text-transparent mb-4">
          Teste de Processamento Fonológico
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Avalia habilidades de consciência fonológica - principal indicador de dislexia
        </p>
      </div>

      {gameState === 'idle' && (
        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p>Este teste avalia sua capacidade de processar sons da fala.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Rimas</h3>
                  <p className="text-sm text-muted-foreground">Identificar palavras que rimam</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <h3 className="font-semibold">Segmentação</h3>
                  <p className="text-sm text-muted-foreground">Dividir palavras em sons</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Play className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <h3 className="font-semibold">Síntese</h3>
                  <p className="text-sm text-muted-foreground">Juntar sons em palavras</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Mic className="w-8 h-8 mx-auto mb-2 text-destructive" />
                  <h3 className="font-semibold">Manipulação</h3>
                  <p className="text-sm text-muted-foreground">Alterar sons nas palavras</p>
                </div>
              </div>
              
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertTitle>Objetivo Diagnóstico</AlertTitle>
                <AlertDescription>
                  Este teste identifica dificuldades de processamento fonológico, 
                  principal causa da dislexia e outras dificuldades de leitura.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => setGameState('instructions')} 
                className="w-full shadow-soft"
                size="lg"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Iniciar Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'instructions' && (
        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Instruções Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p><strong>1.</strong> O computador lerá as instruções em voz alta</p>
              <p><strong>2.</strong> Escute com atenção cada pergunta</p>
              <p><strong>3.</strong> Clique na resposta que achar correta</p>
              <p><strong>4.</strong> Use fones de ouvido se possível</p>
              <p><strong>5.</strong> Responda com calma, sem pressa</p>
              <p><strong>6.</strong> O teste avalia diferentes habilidades fonológicas</p>
            </div>
            
            <Alert>
              <Volume2 className="h-4 w-4" />
              <AlertTitle>Áudio Necessário</AlertTitle>
              <AlertDescription>
                Este teste usa síntese de voz. Certifique-se de que o áudio está funcionando.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center space-x-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setGameState('idle')}
              >
                Voltar
              </Button>
              <Button onClick={startGame} className="shadow-soft">
                <Play className="w-4 h-4 mr-2" />
                Começar Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && currentTask && (
        <div className="space-y-6">
          {/* Progress */}
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span>Progresso do Teste</span>
                <span>{taskIndex + 1}/{PHONEME_TASKS.length}</span>
              </div>
              <Progress value={((taskIndex + 1) / PHONEME_TASKS.length) * 100} />
            </CardContent>
          </Card>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-purple-600">{currentTask.difficulty}</div>
                <div className="text-sm text-muted-foreground">Dificuldade</div>
              </CardContent>
            </Card>
          </div>

          {/* Current Task */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Tarefa de {currentTask.type === 'rhyme' ? 'Rima' : 
                           currentTask.type === 'segment' ? 'Segmentação' :
                           currentTask.type === 'blend' ? 'Síntese' : 'Manipulação'}
                </div>
                <Badge variant="outline">
                  Nível {currentTask.difficulty}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instruction */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <h2 className="text-2xl font-semibold">{currentTask.instruction}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(currentTask.instruction)}
                    disabled={isPlayingAudio}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                
                {currentTask.stimulus && (
                  <div className="text-xl text-muted-foreground mb-6">
                    <strong>Estímulo:</strong> {currentTask.stimulus}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => speakText(currentTask.stimulus)}
                      disabled={isPlayingAudio}
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTask.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-16 text-lg hover:shadow-soft transition-all"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Audio Controls */}
              {isPlayingAudio && (
                <div className="text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={stopAudio}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Parar Áudio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          {feedback && (
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold">{feedback}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {gameState === 'completed' && (
        <Card className="shadow-glow max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-2" />
              Teste Concluído
            </CardTitle>
            <CardDescription>Análise de Processamento Fonológico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{stats.phonologicalScore}</div>
                <div className="text-sm text-muted-foreground">Score Fonológico (%)</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.score}</div>
                <div className="text-sm text-muted-foreground">Pontuação Final</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Rimas:</span>
                <Badge variant={stats.rhymeAccuracy > 70 ? "secondary" : "destructive"}>
                  {stats.rhymeAccuracy.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Segmentação:</span>
                <Badge variant={stats.segmentationAccuracy > 60 ? "secondary" : "destructive"}>
                  {stats.segmentationAccuracy.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Síntese:</span>
                <Badge variant={stats.blendingAccuracy > 60 ? "secondary" : "destructive"}>
                  {stats.blendingAccuracy.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Manipulação:</span>
                <Badge variant={stats.manipulationAccuracy > 50 ? "secondary" : "destructive"}>
                  {stats.manipulationAccuracy.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Tempo Médio:</span>
                <Badge variant="outline">
                  {stats.averageReactionTime.toFixed(0)}ms
                </Badge>
              </div>
            </div>
            
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>Análise Clínica</AlertTitle>
              <AlertDescription>
                {stats.phonologicalScore > 70
                  ? "Habilidades fonológicas adequadas. Baixo risco de dificuldades de leitura."
                  : stats.phonologicalScore > 50
                  ? "Algumas dificuldades fonológicas. Recomenda-se acompanhamento."
                  : "Indicadores significativos de dificuldades fonológicas. Avaliação especializada recomendada."
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