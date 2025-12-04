import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Users, MessageCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameProfile } from '@/hooks/useGameProfile';
import { GameExitButton } from '@/components/GameExitButton';
import { Badge } from '@/components/ui/badge';

interface Scenario {
  id: string;
  title: string;
  situation: string;
  character: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

const scenarios: Scenario[] = [
  {
    id: 'false-belief-1',
    title: 'A Caixa de Surpresas',
    situation: 'Ana vê uma caixa de biscoitos e pensa que tem biscoitos dentro. Quando Ana sai da sala, sua mãe tira os biscoitos e coloca lápis na caixa.',
    character: 'Ana',
    question: 'Quando Ana voltar, o que ela vai pensar que tem na caixa?',
    options: ['Biscoitos', 'Lápis', 'Nada', 'Não sei'],
    correctAnswer: 0,
    explanation: 'Ana ainda pensa que tem biscoitos porque ela não viu a troca acontecer.',
    difficulty: 'basic'
  },
  {
    id: 'emotion-understanding-1',
    title: 'O Presente Perdido',
    situation: 'Pedro estava muito animado para dar um presente especial para sua irmã no aniversário dela. Mas quando foi pegar o presente, descobriu que havia sumido.',
    character: 'Pedro',
    question: 'Como Pedro provavelmente se sente?',
    options: ['Feliz', 'Triste e desapontado', 'Com raiva da irmã', 'Orgulhoso'],
    correctAnswer: 1,
    explanation: 'Pedro se sente triste e desapontado porque queria muito dar o presente e agora não pode.',
    difficulty: 'basic'
  },
  {
    id: 'perspective-taking-1',
    title: 'A Visão Diferente',
    situation: 'Carla está sentada de um lado da mesa e vê uma bola vermelha à sua esquerda. João está sentado do lado oposto da mesa.',
    character: 'João',
    question: 'De onde João está sentado, onde ele vê a bola vermelha?',
    options: ['À sua esquerda', 'À sua direita', 'À sua frente', 'Atrás dele'],
    correctAnswer: 1,
    explanation: 'Como João está do lado oposto, a bola que está à esquerda de Carla fica à direita dele.',
    difficulty: 'intermediate'
  },
  {
    id: 'complex-emotion-1',
    title: 'Sentimentos Misturados',
    situation: 'Lia ganhou o primeiro lugar em uma competição de dança. Mas sua melhor amiga ficou em último lugar e estava chorando.',
    character: 'Lia',
    question: 'Como Lia provavelmente se sente?',
    options: ['Apenas feliz', 'Apenas triste', 'Feliz por ganhar, mas triste pela amiga', 'Com raiva da amiga'],
    correctAnswer: 2,
    explanation: 'Lia pode sentir emoções conflitantes: alegria pela vitória e tristeza por ver a amiga upset.',
    difficulty: 'advanced'
  },
  {
    id: 'intention-understanding-1',
    title: 'O Acidente',
    situation: 'Lucas estava carregando um copo de suco. Tropeçou e derrubou o suco na camisa nova do irmão. O irmão ficou bravo.',
    character: 'Lucas',
    question: 'Por que Lucas derrubou o suco?',
    options: ['Para deixar o irmão bravo', 'Foi um acidente', 'Para estragar a camisa', 'Porque não gosta do irmão'],
    correctAnswer: 1,
    explanation: 'Lucas não tinha intenção de derrubar o suco - foi um acidente quando ele tropeçou.',
    difficulty: 'intermediate'
  }
];

export default function TheoryOfMind() {
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  const { childProfileId, isTestMode, loading } = useGameProfile();
  const { startSession, endSession, updateSession, isActive } = useGameSession('theory-of-mind', childProfileId || undefined, isTestMode);
  
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionData, setSessionData] = useState({
    correctAnswers: 0,
    totalAnswers: 0,
    responseTime: [] as number[],
    scenarioStartTime: Date.now()
  });

  const handleStartGame = async () => {
    await startSession({ score: 0 });
    setGameStarted(true);
    setSessionData(prev => ({ ...prev, scenarioStartTime: Date.now() }));
  };

  const handleGameComplete = async () => {
    const accuracy = sessionData.totalAnswers > 0 
      ? (sessionData.correctAnswers / sessionData.totalAnswers) * 100 
      : 0;
    
    await endSession({
      score,
      accuracy,
      correctMoves: sessionData.correctAnswers,
      totalMoves: sessionData.totalAnswers,
      reactionTimes: sessionData.responseTime,
    });
  };

  const scenario = scenarios[currentScenario];
  const progress = ((currentScenario + 1) / scenarios.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    const responseTime = Date.now() - sessionData.scenarioStartTime;
    const isCorrect = answerIndex === scenario.correctAnswer;

    setSessionData(prev => ({
      ...prev,
      totalAnswers: prev.totalAnswers + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      responseTime: [...prev.responseTime, responseTime]
    }));

    // Save behavioral metric
    saveBehavioralMetric({
      metricType: 'theory_of_mind',
      category: 'social_cognition',
      value: isCorrect ? 1 : 0,
      contextData: {
        scenarioId: scenario.id,
        difficulty: scenario.difficulty,
        responseTime,
        selectedAnswer: answerIndex,
        correctAnswer: scenario.correctAnswer,
        accuracy: (sessionData.correctAnswers + (isCorrect ? 1 : 0)) / (sessionData.totalAnswers + 1)
      },
      gameId: 'theory-of-mind'
    });

    if (isCorrect) {
      setScore(prev => prev + getDifficultyPoints(scenario.difficulty));
      toast.success('Resposta correta!');
    } else {
      toast.error('Resposta incorreta. Vamos ver a explicação.');
    }

    setShowFeedback(true);
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 10;
      case 'intermediate': return 20;
      case 'advanced': return 30;
      default: return 10;
    }
  };

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setSessionData(prev => ({
        ...prev,
        scenarioStartTime: Date.now()
      }));
    } else {
      // Test completed
      const finalAccuracy = sessionData.correctAnswers / sessionData.totalAnswers;
      const avgResponseTime = sessionData.responseTime.reduce((a, b) => a + b, 0) / sessionData.responseTime.length;

      saveBehavioralMetric({
        metricType: 'theory_of_mind_complete',
        category: 'social_cognition',
        value: finalAccuracy,
        contextData: {
          totalScenarios: scenarios.length,
          correctAnswers: sessionData.correctAnswers,
          finalScore: score,
          averageResponseTime: avgResponseTime,
          completionRate: 1.0
        },
        gameId: 'theory-of-mind'
      });

      toast.success(`Teste completo! Pontuação: ${score} pontos`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return <Eye className="w-4 h-4" />;
      case 'intermediate': return <MessageCircle className="w-4 h-4" />;
      case 'advanced': return <Brain className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (currentScenario >= scenarios.length) {
    const accuracy = (sessionData.correctAnswers / sessionData.totalAnswers * 100).toFixed(1);
    const avgTime = (sessionData.responseTime.reduce((a, b) => a + b, 0) / sessionData.responseTime.length / 1000).toFixed(1);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Teste Completo!</h1>
              <p className="text-gray-600">Excelente trabalho explorando a Teoria da Mente</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-500">Pontos Totais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-gray-500">Precisão</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{avgTime}s</div>
                <div className="text-sm text-gray-500">Tempo Médio</div>
              </div>
            </div>

            <div className="text-left bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Sobre a Teoria da Mente:</h3>
              <p className="text-blue-700 text-sm">
                A Teoria da Mente é a capacidade de compreender que outras pessoas têm pensamentos, 
                sentimentos e perspectivas diferentes das nossas. Este teste avalia habilidades importantes 
                como compreensão de falsas crenças, reconhecimento de emoções e tomada de perspectiva.
              </p>
            </div>

            <Button onClick={() => window.history.back()} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
              Voltar aos Jogos
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Teoria da Mente</h1>
              <p className="text-gray-600">Compreenda pensamentos e sentimentos dos outros</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-500">Pontos</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-gray-500">{currentScenario + 1}/{scenarios.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDifficultyColor(scenario.difficulty)}`}>
                {getDifficultyIcon(scenario.difficulty)}
                {scenario.difficulty === 'basic' ? 'Básico' : 
                 scenario.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{scenario.title}</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 leading-relaxed">{scenario.situation}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-blue-800 font-medium">{scenario.question}</p>
            </div>

            <div className="space-y-3 mb-6">
              {scenario.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all duration-200
                    ${selectedAnswer === index 
                      ? showFeedback 
                        ? index === scenario.correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-red-500 bg-red-50 text-red-800'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && index === scenario.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showFeedback && index === scenario.correctAnswer && (
                      <span className="text-green-600 font-medium">✓ Correto</span>
                    )}
                    {showFeedback && selectedAnswer === index && index !== scenario.correctAnswer && (
                      <span className="text-red-600 font-medium">✗ Incorreto</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-purple-800 mb-2">Explicação:</h3>
                <p className="text-purple-700">{scenario.explanation}</p>
              </div>
            )}

            {showFeedback && (
              <div className="text-center">
                <Button onClick={handleNextScenario} size="lg">
                  {currentScenario < scenarios.length - 1 ? 'Próximo Cenário' : 'Ver Resultados'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}