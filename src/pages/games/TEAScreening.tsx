import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, ArrowLeft } from 'lucide-react';
import { useScreening } from '@/hooks/useScreening';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Question {
  id: number;
  type: 'emotion' | 'social' | 'pattern' | 'perspective';
  question: string;
  scenario?: string;
  options: string[];
  correct: number;
  emoji?: string;
}

const questions: Question[] = [
  {
    id: 1,
    type: 'emotion',
    question: 'Como esta pessoa está se sentindo?',
    emoji: '😊',
    options: ['Feliz', 'Triste', 'Com raiva', 'Com medo'],
    correct: 0,
  },
  {
    id: 2,
    type: 'social',
    question: 'Maria está brincando sozinha. Pedro quer brincar também. O que Pedro deve fazer?',
    scenario: 'Pedro vê Maria brincando no parquinho',
    options: [
      'Pegar os brinquedos dela',
      'Perguntar se pode brincar junto',
      'Empurrar Maria',
      'Gritar com ela',
    ],
    correct: 1,
  },
  {
    id: 3,
    type: 'emotion',
    question: 'Como esta pessoa está se sentindo?',
    emoji: '😢',
    options: ['Feliz', 'Triste', 'Animada', 'Surpresa'],
    correct: 1,
  },
  {
    id: 4,
    type: 'perspective',
    question: 'João coloca chocolate na gaveta. Sua mãe não vê. Onde a mãe vai procurar o chocolate?',
    scenario: 'João guarda o chocolate enquanto sua mãe não está vendo',
    options: [
      'Na gaveta, porque ela sabe',
      'Ela não sabe onde está',
      'Na cozinha',
      'No armário',
    ],
    correct: 1,
  },
  {
    id: 5,
    type: 'emotion',
    question: 'Como esta pessoa está se sentindo?',
    emoji: '😠',
    options: ['Feliz', 'Triste', 'Com raiva', 'Surpresa'],
    correct: 2,
  },
  {
    id: 6,
    type: 'social',
    question: 'Ana está chorando porque perdeu o lápis. O que você faria?',
    scenario: 'Você vê Ana chorando na sala de aula',
    options: [
      'Ignorar ela',
      'Rir dela',
      'Oferecer seu lápis',
      'Contar para todos',
    ],
    correct: 2,
  },
  {
    id: 7,
    type: 'pattern',
    question: 'Qual não faz parte do grupo?',
    scenario: 'Olhe os itens: CACHORRO, GATO, PÁSSARO, MESA',
    options: ['Cachorro', 'Gato', 'Pássaro', 'Mesa'],
    correct: 3,
  },
  {
    id: 8,
    type: 'emotion',
    question: 'Como esta pessoa está se sentindo?',
    emoji: '😱',
    options: ['Feliz', 'Animada', 'Com medo', 'Brava'],
    correct: 2,
  },
];

export default function TEAScreening() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startScreening, saveScreening, loading } = useScreening();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (user) {
      startScreening('tea');
    }
  }, [user]);

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  const handleAnswer = (optionIndex: number) => {
    const responseTime = Date.now() - questionStartTime;
    setResponseTimes([...responseTimes, responseTime]);
    setAnswers([...answers, optionIndex]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishScreening([...answers, optionIndex], [...responseTimes, responseTime]);
    }
  };

  const finishScreening = async (finalAnswers: number[], finalResponseTimes: number[]) => {
    const duration = (Date.now() - startTime) / 1000;
    const correctAnswers = finalAnswers.filter(
      (answer, index) => answer === questions[index].correct
    ).length;
    const score = (correctAnswers / questions.length) * 100;

    const gameData = {
      questions: questions.length,
      correctAnswers,
      responseTimes: finalResponseTimes,
      averageResponseTime: finalResponseTimes.reduce((a, b) => a + b, 0) / finalResponseTimes.length,
      byType: {
        emotion: calculateTypeAccuracy(finalAnswers, 'emotion'),
        social: calculateTypeAccuracy(finalAnswers, 'social'),
        pattern: calculateTypeAccuracy(finalAnswers, 'pattern'),
        perspective: calculateTypeAccuracy(finalAnswers, 'perspective'),
      },
    };

    // Salvar apenas se o usuário estiver logado
    let result = null;
    if (user) {
      result = await saveScreening({ score, duration, gameData });
    } else {
      // Modo de teste: criar resultado temporário sem salvar no banco
      result = {
        id: 'test-mode',
        type: 'tea',
        score,
        duration,
        gameData,
        percentile: 50,
        recommended_action: 'Teste realizado em modo demo. Faça login para salvar seus resultados.'
      };
      toast.info('Teste realizado em modo demo. Faça login para salvar seus resultados.');
    }
    
    if (result) {
      navigate('/screening/result', { state: { result } });
    }
  };

  const calculateTypeAccuracy = (finalAnswers: number[], type: string): number => {
    const typeQuestions = questions.filter((q) => q.type === type);
    const typeCorrect = typeQuestions.filter(
      (q) => finalAnswers[q.id - 1] === q.correct
    ).length;
    return typeQuestions.length > 0 ? (typeCorrect / typeQuestions.length) * 100 : 0;
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-secondary to-destructive text-primary-foreground">
                <Heart className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Perfil Socioemocional</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">O que vamos observar:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Reconhecimento de emoções</li>
                <li>• Compreensão de situações sociais</li>
                <li>• Perspectiva dos outros</li>
                <li>• Identificação de padrões sociais</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Instruções:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Leia cada situação com atenção</li>
                <li>• Pense no que as pessoas estão sentindo</li>
                <li>• Escolha a melhor resposta</li>
                <li>• São {questions.length} questões ao todo</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/screening')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleStart} className="flex-1">
                Iniciar Atividade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-4 pb-20">
      <div className="container max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              {question.emoji && (
                <div className="text-8xl text-center animate-in zoom-in duration-300">
                  {question.emoji}
                </div>
              )}
              {question.scenario && (
                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground italic">
                  {question.scenario}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-secondary to-destructive text-primary-foreground">
                  <Heart className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{question.question}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-auto py-4 text-lg justify-start hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleAnswer(index)}
                disabled={loading}
              >
                <span className="mr-3 font-bold text-primary">{String.fromCharCode(65 + index)}</span>
                {option}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
