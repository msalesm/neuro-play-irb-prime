import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Award,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { useTeacherTraining } from '@/hooks/useTeacherTraining';
import { useAuth } from '@/hooks/useAuth';
import { trainingModules } from '@/data/trainingModules';
import { toast } from 'sonner';

export default function TrainingModule() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startTraining, completeTraining, loading } = useTeacherTraining();

  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [started, setStarted] = useState(false);
  const [watchedVideo, setWatchedVideo] = useState(false);

  const module = trainingModules.find((m) => m.id === moduleId);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!module) {
      navigate('/training');
    }
  }, [user, module]);

  if (!module) {
    return null;
  }

  const handleStart = async () => {
    const id = await startTraining(module.id);
    if (id) {
      setTrainingId(id);
      setStarted(true);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    setAnswers([...answers, selectedAnswer]);
    setSelectedAnswer(null);
    setShowExplanation(false);

    if (currentQuestion < module.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTraining([...answers, selectedAnswer]);
    }
  };

  const finishTraining = async (finalAnswers: number[]) => {
    const correctCount = finalAnswers.filter(
      (answer, index) => answer === module.questions[index].correct
    ).length;
    const score = Math.round((correctCount / module.questions.length) * 100);

    setShowResult(true);

    if (trainingId && score >= 70) {
      await completeTraining(trainingId, score);
    } else if (score < 70) {
      toast.error('Score mínimo de 70% necessário para certificação. Tente novamente!');
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowResult(false);
    setStarted(false);
  };

  const correctCount = answers.filter(
    (answer, index) => answer === module.questions[index]?.correct
  ).length;
  const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4 pb-24">
        <Card className="max-w-2xl w-full">
          <div className={`h-2 bg-gradient-to-r ${module.color}`} />
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl">{module.icon}</div>
              <div>
                <CardTitle className="text-2xl">{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {module.videoUrl && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Assista ao vídeo introdutório:
                </h3>
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                  <video
                    controls
                    className="w-full h-full"
                    onEnded={() => setWatchedVideo(true)}
                    onPlay={() => {}}
                  >
                    <source src={module.videoUrl} type="video/mp4" />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                </div>
                {module.videoTitle && (
                  <p className="text-sm text-muted-foreground text-center italic">
                    {module.videoTitle}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">O que você aprenderá:</h3>
              <ul className="space-y-2">
                {module.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Formato do módulo:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {module.questions.length} questões de múltipla escolha</li>
                <li>• Explicações detalhadas para cada questão</li>
                <li>• Certificado digital ao atingir 70% de acertos</li>
                <li>• Duração estimada: {module.duration}</li>
              </ul>
            </div>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Leia cada questão com atenção. As explicações ajudarão a consolidar o aprendizado,
                mesmo em caso de erro.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/training')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleStart} className="flex-1" disabled={loading}>
                Iniciar Módulo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const passed = score >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4 pb-24">
        <Card className="max-w-2xl w-full">
          <div className={`h-2 bg-gradient-to-r ${module.color}`} />
          <CardHeader>
            <div className="flex flex-col items-center text-center gap-4">
              {passed ? (
                <Award className="h-16 w-16 text-yellow-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
              <div>
                <CardTitle className="text-2xl mb-2">
                  {passed ? 'Parabéns! Módulo Concluído' : 'Quase lá!'}
                </CardTitle>
                <CardDescription>
                  {passed
                    ? 'Você concluiu o módulo com sucesso e recebeu seu certificado.'
                    : 'Score mínimo de 70% necessário. Revise o conteúdo e tente novamente.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{score}%</div>
              <p className="text-sm text-muted-foreground">
                {correctCount} de {module.questions.length} questões corretas
              </p>
            </div>

            <div className="space-y-3">
              {module.questions.map((question, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === question.correct;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Questão {idx + 1}</p>
                        <p className="text-xs text-muted-foreground">{question.question}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              {!passed && (
                <Button onClick={handleRetry} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
              <Button
                variant={passed ? 'default' : 'outline'}
                onClick={() => navigate('/training')}
                className="flex-1"
              >
                {passed ? 'Ver Certificado' : 'Voltar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / module.questions.length) * 100;
  const question = module.questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-4 pb-20">
      <div className="container max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {module.questions.length}
            </span>
            <Badge variant="outline">{module.name}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-6">
          <div className={`h-1 bg-gradient-to-r ${module.color}`} />
          <CardHeader>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === question.correct;
              const showCorrect = showExplanation && isCorrectOption;
              const showIncorrect = showExplanation && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full h-auto py-4 text-left justify-start hover:bg-primary/10 hover:border-primary transition-all ${
                    showCorrect
                      ? 'bg-green-500/10 border-green-500 hover:bg-green-500/20'
                      : showIncorrect
                      ? 'bg-red-500/10 border-red-500 hover:bg-red-500/20'
                      : ''
                  }`}
                  onClick={() => !showExplanation && handleAnswer(index)}
                  disabled={showExplanation}
                >
                  <span className="mr-3 font-bold text-primary">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />}
                  {showIncorrect && <XCircle className="h-5 w-5 text-red-500 ml-2" />}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {showExplanation && (
          <Card className={`mb-6 ${isCorrect ? 'border-green-500/50' : 'border-red-500/50'}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-base">
                  {isCorrect ? 'Resposta Correta!' : 'Vamos Aprender'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </CardContent>
          </Card>
        )}

        {showExplanation && (
          <Button onClick={handleNext} className="w-full" size="lg">
            {currentQuestion < module.questions.length - 1 ? 'Próxima Questão' : 'Finalizar Módulo'}
          </Button>
        )}
      </div>
    </div>
  );
}
