import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Smile, Frown, Meh, Angry, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { SessionRecoveryModal } from '@/components/SessionRecoveryModal';
import { GameExitButton } from '@/components/GameExitButton';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface EmotionScenario {
  id: string;
  type: 'recognition' | 'regulation' | 'situation';
  emotion: string;
  stimulus: string;
  situation?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  level: number;
}

const emotionScenarios: EmotionScenario[] = [
  {
    id: 'recognition-1',
    type: 'recognition',
    emotion: 'alegria',
    stimulus: '😊',
    question: 'Que emoção esta pessoa está sentindo?',
    options: ['Alegria', 'Tristeza', 'Raiva', 'Medo'],
    correctAnswer: 0,
    explanation: 'O sorriso e os olhos brilhantes indicam alegria!',
    level: 1
  },
  {
    id: 'regulation-1',
    type: 'regulation',
    emotion: 'raiva',
    stimulus: '😠',
    situation: 'Você está muito bravo porque seu irmão quebrou seu brinquedo favorito.',
    question: 'Qual é a melhor estratégia para lidar com essa raiva?',
    options: ['Gritar com ele', 'Respirar fundo e contar até 10', 'Quebrar algo dele também', 'Ignorar completamente'],
    correctAnswer: 1,
    explanation: 'Respirar fundo ajuda a acalmar o corpo e a mente, permitindo pensar melhor.',
    level: 1
  },
  {
    id: 'situation-1',
    type: 'situation',
    emotion: 'tristeza',
    stimulus: '😢',
    situation: 'Maria chegou na escola e viu que seus amigos estavam brincando sem ela.',
    question: 'Como Maria provavelmente se sente?',
    options: ['Feliz', 'Triste e excluída', 'Com raiva', 'Animada'],
    correctAnswer: 1,
    explanation: 'É natural se sentir triste quando nos sentimos deixados de fora.',
    level: 1
  },
  {
    id: 'recognition-2',
    type: 'recognition',
    emotion: 'surpresa',
    stimulus: '😲',
    question: 'Esta expressão mostra qual emoção?',
    options: ['Medo', 'Surpresa', 'Nojo', 'Alegria'],
    correctAnswer: 1,
    explanation: 'Os olhos arregalados e a boca aberta são sinais típicos de surpresa.',
    level: 2
  },
  {
    id: 'regulation-2',
    type: 'regulation',
    emotion: 'ansiedade',
    stimulus: '😰',
    situation: 'Você tem uma apresentação importante na escola amanhã e está se sentindo muito nervoso.',
    question: 'O que pode ajudar a diminuir a ansiedade?',
    options: ['Não pensar na apresentação', 'Praticar a apresentação algumas vezes', 'Desistir da apresentação', 'Ficar acordado a noite toda preocupado'],
    correctAnswer: 1,
    explanation: 'Praticar nos ajuda a nos sentir mais preparados e confiantes.',
    level: 2
  },
  {
    id: 'situation-2',
    type: 'situation',
    emotion: 'orgulho',
    stimulus: '😊',
    situation: 'Pedro estudou muito para a prova de matemática e tirou a nota mais alta da turma.',
    question: 'Como Pedro provavelmente se sente?',
    options: ['Orgulhoso de seu esforço', 'Preocupado com os colegas', 'Triste por ter estudado demais', 'Indiferente'],
    correctAnswer: 0,
    explanation: 'Quando nos esforçamos e conseguimos bons resultados, é natural sentir orgulho.',
    level: 2
  }
];

export default function EmotionLab() {
  const { user } = useAuth();
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  const audio = useAudioEngine();
  
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
  } = useSessionRecovery('emotion_lab');

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [sessionData, setSessionData] = useState({
    recognitionAccuracy: 0,
    regulationStrategies: 0,
    situationUnderstanding: 0,
    totalCorrect: 0,
    startTime: Date.now()
  });
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const currentScenario = emotionScenarios[currentScenarioIndex];

  const startGame = async () => {
    const sessionId = await startAutoSave('emotion_lab', level, {
      currentScenario: currentScenarioIndex
    });

    if (sessionId) {
      setGameStarted(true);
    }
  };

  const handleResumeSession = async (session: any) => {
    setScore(session.performance_data.score || 0);
    setLevel(session.level);
    setCurrentScenarioIndex(session.performance_data.currentScenario || 0);
    setSessionData({
      ...sessionData,
      totalCorrect: session.performance_data.totalCorrect || 0
    });
    
    await startAutoSave('emotion_lab', session.level, {
      sessionId: session.id,
      currentScenario: session.performance_data.currentScenario || 0
    });

    setGameStarted(true);
    setShowRecoveryModal(false);
  };

  useEffect(() => {
    if (hasUnfinishedSessions && !gameStarted && !currentSession) {
      setShowRecoveryModal(true);
    }
  }, [hasUnfinishedSessions, gameStarted, currentSession]);

  const handleAnswerSelect = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === currentScenario.correctAnswer;
    const responseTime = Date.now() - sessionData.startTime;
    
    if (isCorrect) {
      const points = currentScenario.level * 10;
      setScore(prev => prev + points);
      setSessionData(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        [currentScenario.type === 'recognition' ? 'recognitionAccuracy' : 
         currentScenario.type === 'regulation' ? 'regulationStrategies' : 
         'situationUnderstanding']: prev[currentScenario.type === 'recognition' ? 'recognitionAccuracy' : 
                                              currentScenario.type === 'regulation' ? 'regulationStrategies' : 
                                              'situationUnderstanding'] + 1
      }));
      
      // Audio feedback
      audio.playSuccess('high');
      audio.speak(`Correto! Você ganhou ${points} pontos!`, { rate: 1.0 });
      toast.success(`Correto! +${points} pontos`);
    } else {
      audio.playError('soft');
      audio.speak('Não foi dessa vez, mas continue tentando!', { rate: 0.9 });
      toast.error("Não foi dessa vez, mas continue tentando!");
    }
    
    // Narrate explanation after feedback
    setTimeout(() => {
      audio.speak(currentScenario.explanation, { rate: 0.85 });
    }, 2000);

    // Auto-save progress
    updateAutoSave({
      score,
      moves: currentScenarioIndex + 1,
      correctMoves: sessionData.totalCorrect,
      additionalData: {
        level,
        currentScenario: currentScenarioIndex,
        sessionData,
        accuracy: (sessionData.totalCorrect / (currentScenarioIndex + 1)) * 100
      }
    });

    // Save behavioral data
    await saveBehavioralMetric({
      metricType: 'game_emotion_lab',
      category: 'emotional_regulation',
      value: isCorrect ? 1 : 0,
      contextData: {
        scenarioType: currentScenario.type,
        emotion: currentScenario.emotion,
        level: currentScenario.level,
        responseTime,
        correct: isCorrect
      }
    });
  };

  const handleNextScenario = () => {
    if (currentScenarioIndex < emotionScenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      
      // Level up every 2 correct answers
      if (sessionData.totalCorrect % 2 === 0 && sessionData.totalCorrect > 0) {
        setLevel(prev => prev + 1);
        audio.playLevelUp();
        audio.speak('Nível aumentado!', { rate: 1.1, pitch: 1.2 });
        toast.success("Nível aumentado! 🎉");
      }
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    setIsComplete(true);
    
    // Completion audio
    audio.playAchievement();
    audio.speak('Laboratório concluído! Parabéns pelo seu trabalho!', { rate: 0.9 });
    
    const accuracy = (sessionData.totalCorrect / emotionScenarios.length) * 100;
    
    // Complete auto-save session
    await completeAutoSave({
      score,
      moves: emotionScenarios.length,
      correctMoves: sessionData.totalCorrect,
      additionalData: {
        finalLevel: level,
        sessionData,
        accuracy
      }
    });
    const emotionalIntelligenceScore = Math.round(
      (sessionData.recognitionAccuracy * 30 + 
       sessionData.regulationStrategies * 40 + 
       sessionData.situationUnderstanding * 30) / emotionScenarios.length * 100
    );

    await saveBehavioralMetric({
      metricType: 'game_emotion_lab_complete',
      category: 'emotional_regulation', 
      value: emotionalIntelligenceScore,
      contextData: {
        accuracy,
        finalScore: score,
        finalLevel: level,
        recognitionAccuracy: sessionData.recognitionAccuracy,
        regulationStrategies: sessionData.regulationStrategies,
        situationUnderstanding: sessionData.situationUnderstanding
      }
    });
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'alegria': return <Smile className="w-8 h-8 text-yellow-500" />;
      case 'tristeza': return <Frown className="w-8 h-8 text-blue-500" />;
      case 'raiva': return <Angry className="w-8 h-8 text-red-500" />;
      case 'medo': return <Meh className="w-8 h-8 text-purple-500" />;
      default: return <Heart className="w-8 h-8 text-pink-500" />;
    }
  };

  if (isComplete) {
    const accuracy = (sessionData.totalCorrect / emotionScenarios.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
        <Card className="max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Laboratório Concluído! 🧪</h2>
            <div className="space-y-3 mb-6">
              <p>Pontuação final: {score}</p>
              <p>Nível alcançado: {level}</p>
              <p>Precisão: {Math.round(accuracy)}%</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <Badge variant="secondary">Reconhecimento</Badge>
                  <p className="text-lg font-semibold">{sessionData.recognitionAccuracy}</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">Regulação</Badge>
                  <p className="text-lg font-semibold">{sessionData.regulationStrategies}</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">Situações</Badge>
                  <p className="text-lg font-semibold">{sessionData.situationUnderstanding}</p>
                </div>
              </div>
            </div>
            <Button onClick={() => window.history.back()}>
              Voltar aos Jogos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para jogar, você precisa fazer login.
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
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
      
      <Card className="max-w-3xl mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {isSaving && <Badge variant="outline">💾 Salvando...</Badge>}
              <GameExitButton
                variant="quit"
                onExit={async () => {
                  await abandonSession();
                }}
                showProgress={gameStarted}
                currentProgress={sessionData.totalCorrect}
                totalProgress={emotionScenarios.length}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <h1 className="text-2xl font-bold">Laboratório das Emoções</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge>Nível {level}</Badge>
              <Badge variant="secondary">{score} pontos</Badge>
            </div>
          </div>

          <Progress value={(currentScenarioIndex / emotionScenarios.length) * 100} className="mb-6" />

          {!gameStarted && !isComplete && (
            <div className="text-center mb-8 space-y-4">
              <h2 className="text-xl font-bold">Bem-vindo ao Laboratório das Emoções!</h2>
              <p className="text-muted-foreground">
                Aprenda a reconhecer, entender e regular suas emoções através de desafios interativos.
              </p>
              <Button onClick={startGame} size="lg">
                Começar Jogo
              </Button>
            </div>
          )}

          {gameStarted && !isComplete && (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {getEmotionIcon(currentScenario.emotion)}
                </div>
                
                <div className="text-6xl mb-4">{currentScenario.stimulus}</div>
                
                {currentScenario.situation && (
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Situação:</p>
                    <p>{currentScenario.situation}</p>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-6">{currentScenario.question}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentScenario.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? 
                      (index === currentScenario.correctAnswer ? "default" : "destructive") : 
                      "outline"
                    }
                    className="p-4 h-auto text-left"
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {showFeedback && (
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <p className="font-medium mb-2">Explicação:</p>
                  <p>{currentScenario.explanation}</p>
                </div>
              )}

              {showFeedback && (
                <div className="text-center">
                  <Button onClick={handleNextScenario}>
                    {currentScenarioIndex < emotionScenarios.length - 1 ? 'Próximo Cenário' : 'Finalizar'}
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground mt-4">
                Cenário {currentScenarioIndex + 1} de {emotionScenarios.length} • Tipo: {
                  currentScenario.type === 'recognition' ? 'Reconhecimento' :
                  currentScenario.type === 'regulation' ? 'Regulação' :
                  'Situação Social'
                }
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}