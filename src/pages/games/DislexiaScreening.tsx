import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useScreening } from '@/hooks/useScreening';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Question {
  id: number;
  type: 'rhyme' | 'phoneme' | 'syllable' | 'word_recognition';
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  {
    id: 1,
    type: 'rhyme',
    question: 'Qual palavra rima com GATO?',
    options: ['RATO', 'CASA', 'BOLA', 'MESA'],
    correct: 0,
  },
  {
    id: 2,
    type: 'phoneme',
    question: 'Qual som inicial da palavra CASA?',
    options: ['/K/', '/S/', '/A/', '/Z/'],
    correct: 0,
  },
  {
    id: 3,
    type: 'syllable',
    question: 'Quantas sílabas tem a palavra BANANA?',
    options: ['2', '3', '4', '5'],
    correct: 1,
  },
  {
    id: 4,
    type: 'word_recognition',
    question: 'Qual palavra está escrita corretamente?',
    options: ['KAZA', 'CASA', 'CAZA', 'KASA'],
    correct: 1,
  },
  {
    id: 5,
    type: 'rhyme',
    question: 'Qual palavra rima com SOL?',
    options: ['LUA', 'GOL', 'MAR', 'CÉU'],
    correct: 1,
  },
  {
    id: 6,
    type: 'phoneme',
    question: 'Qual som você ouve no meio de BOLA?',
    options: ['/B/', '/O/', '/L/', '/A/'],
    correct: 1,
  },
  {
    id: 7,
    type: 'syllable',
    question: 'Divida a palavra CACHORRO em sílabas',
    options: ['CA-CHO-RRO', 'CAC-HOR-RO', 'CACH-OR-RO', 'CA-CHOR-RO'],
    correct: 0,
  },
  {
    id: 8,
    type: 'word_recognition',
    question: 'Leia: O PÁSSARO VOA NO CÉU. O que voa?',
    options: ['O céu', 'O pássaro', 'A nuvem', 'O avião'],
    correct: 1,
  },
];

export default function DislexiaScreening() {
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
      startScreening('dislexia');
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
    const duration = (Date.now() - startTime) / 1000; // em segundos
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
        rhyme: calculateTypeAccuracy(finalAnswers, 'rhyme'),
        phoneme: calculateTypeAccuracy(finalAnswers, 'phoneme'),
        syllable: calculateTypeAccuracy(finalAnswers, 'syllable'),
        word_recognition: calculateTypeAccuracy(finalAnswers, 'word_recognition'),
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
        type: 'dislexia',
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
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Triagem de Dislexia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
              <strong>⚠️ Triagem de rastreio:</strong> Este teste avalia habilidades de consciência fonológica e leitura com {questions.length} questões. 
              Não substitui instrumentos validados como PROLEC, TDE-II ou avaliação neuropsicológica completa. 
              Resultados indicam áreas para investigação, não diagnóstico.
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">O que vamos avaliar:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Consciência fonológica (rimas e sons)</li>
                <li>• Segmentação silábica</li>
                <li>• Reconhecimento de palavras</li>
                <li>• Compreensão de leitura básica</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Instruções:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Leia cada questão com atenção</li>
                <li>• Escolha a opção que você acha correta</li>
                <li>• Não há limite de tempo, vá no seu ritmo</li>
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
                Iniciar Triagem
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{question.question}</CardTitle>
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
