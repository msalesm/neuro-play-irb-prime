import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Smile, Frown, Meh, Angry, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useGameSession } from '@/hooks/useGameSession';
import { GameExitButton, GameResultsDashboard } from '@/components/games';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  } = useGameSession('emotion-lab', childProfileId || undefined);

  // Get child profile ID
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
  
  const isTestMode = !childProfileId; // Modo teste quando não há perfil
  
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
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const currentScenario = emotionScenarios[currentScenarioIndex];

  const startGame = async () => {
    if (!childProfileId && !isTestMode) {
      toast.info('🎮 Jogando em Modo Teste - Sem salvar progresso');
    }

    await startSession();
    setGameStarted(true);
  };

  const handleResumeSession = async () => {
    if (!recoveredSession) return;
    
    setScore(recoveredSession.score || 0);
    setLevel(recoveredSession.difficulty_level || 1);
    setSessionData(prev => ({
      ...prev,
      totalCorrect: recoveredSession.correct_attempts || 0
    }));
    
    await resumeSession(recoveredSession);
    setGameStarted(true);
  };

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

    // Update session
    if (isActive) {
      await updateSession({
        score,
        timeSpent: Math.floor((Date.now() - sessionData.startTime) / 1000),
        moves: currentScenarioIndex + 1,
      });
    }

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
    const totalTime = Math.floor((Date.now() - sessionData.startTime) / 1000);
    setTotalTime(totalTime);
    setFinalScore(score);
    
    // End game session
    if (isActive) {
      await endSession({
        score,
        accuracy,
        timeSpent: totalTime,
        moves: emotionScenarios.length,
      });
    }
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

  if (isComplete && showResults) {
    const accuracy = (sessionData.totalCorrect / emotionScenarios.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
        <GameResultsDashboard
          gameType="emotion_lab"
          gameTitle="Laboratório das Emoções"
          session={{
            score: score,
            accuracy: accuracy,
            timeSpent: totalTime,
            level: level,
            correctMoves: sessionData.totalCorrect,
            totalMoves: emotionScenarios.length,
          }}
          cognitiveMetrics={{
            attention: Math.min(100, accuracy + 10),
            memory: Math.min(100, accuracy + 5),
            flexibility: Math.min(100, accuracy + 15),
            processing: Math.min(100, accuracy + 8),
            inhibition: Math.min(100, accuracy + 3),
          }}
          insights={[
            `Você desenvolveu habilidades de reconhecimento emocional (${sessionData.recognitionAccuracy}%).`,
            `Aprendeu estratégias de regulação emocional (${sessionData.regulationStrategies}%).`,
            `Compreensão de situações sociais: ${sessionData.situationUnderstanding}%.`,
          ]}
          nextSteps={[
            {
              title: 'Cenários Sociais',
              description: 'Pratique habilidades sociais em contextos do dia a dia',
              action: () => window.location.href = '/games/social-scenarios'
            },
            {
              title: 'Jogar Novamente',
              description: 'Reforce suas habilidades emocionais',
              action: () => window.location.reload()
            }
          ]}
          onClose={() => window.location.href = '/games'}
          onPlayAgain={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isComplete && !showResults) {
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
            <Button onClick={() => setShowResults(true)}>
              Ver Resultados Detalhados
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
      {recoveredSession && !gameStarted && (
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
      
      <Card className="max-w-3xl mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <GameExitButton
                variant="quit"
                onExit={() => window.location.href = '/games'}
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