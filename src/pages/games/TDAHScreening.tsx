import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, ArrowLeft, Circle } from 'lucide-react';
import { useScreening } from '@/hooks/useScreening';

interface Trial {
  id: number;
  type: 'go' | 'no-go';
  stimulus: string;
  color: string;
}

export default function TDAHScreening() {
  const navigate = useNavigate();
  const { startScreening, saveScreening, loading } = useScreening();
  const [started, setStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trials] = useState<Trial[]>(generateTrials());
  const [responses, setResponses] = useState<{
    correct: boolean;
    responseTime: number;
    type: string;
  }[]>([]);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  useEffect(() => {
    startScreening('tdah');
  }, []);

  function generateTrials(): Trial[] {
    const trials: Trial[] = [];
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500'];
    
    // 70% go trials, 30% no-go trials
    for (let i = 0; i < 40; i++) {
      const isGo = Math.random() < 0.7;
      trials.push({
        id: i,
        type: isGo ? 'go' : 'no-go',
        stimulus: isGo ? '●' : '■',
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    return trials;
  }

  const startGame = () => {
    setStarted(true);
    setSessionStartTime(Date.now());
    startNextTrial();
  };

  const startNextTrial = useCallback(() => {
    if (currentTrial >= trials.length) {
      finishScreening();
      return;
    }

    setShowStimulus(false);
    
    // Inter-trial interval: 500-1000ms
    const delay = 500 + Math.random() * 500;
    
    setTimeout(() => {
      setShowStimulus(true);
      setTrialStartTime(Date.now());
    }, delay);
  }, [currentTrial, trials.length]);

  const handleResponse = (responded: boolean) => {
    if (!showStimulus) return;

    const responseTime = Date.now() - trialStartTime;
    const trial = trials[currentTrial];
    const correct = (trial.type === 'go' && responded) || (trial.type === 'no-go' && !responded);

    setResponses([
      ...responses,
      {
        correct,
        responseTime,
        type: trial.type,
      },
    ]);

    setShowStimulus(false);
    setCurrentTrial(currentTrial + 1);

    // Wait before next trial
    setTimeout(startNextTrial, 300);
  };

  useEffect(() => {
    if (started && showStimulus) {
      // Auto advance after 1500ms if no response
      const timeout = setTimeout(() => {
        handleResponse(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [started, showStimulus, currentTrial]);

  const finishScreening = async () => {
    const duration = (Date.now() - sessionStartTime) / 1000;
    
    const goTrials = responses.filter(r => r.type === 'go');
    const noGoTrials = responses.filter(r => r.type === 'no-go');
    
    const goCorrect = goTrials.filter(r => r.correct).length;
    const noGoCorrect = noGoTrials.filter(r => r.correct).length;
    
    const goAccuracy = goTrials.length > 0 ? (goCorrect / goTrials.length) * 100 : 0;
    const noGoAccuracy = noGoTrials.length > 0 ? (noGoCorrect / noGoTrials.length) * 100 : 0;
    
    const avgResponseTime = responses
      .filter(r => r.responseTime > 0)
      .reduce((sum, r) => sum + r.responseTime, 0) / responses.length;

    // Score calculation: balance between accuracy and response time
    const accuracyScore = (goAccuracy + noGoAccuracy) / 2;
    const responseScore = Math.max(0, 100 - (avgResponseTime / 10));
    const score = (accuracyScore * 0.7 + responseScore * 0.3);

    const gameData = {
      totalTrials: trials.length,
      responses: responses.length,
      goAccuracy,
      noGoAccuracy,
      averageResponseTime: avgResponseTime,
      impulsivityErrors: noGoTrials.length - noGoCorrect,
      omissionErrors: goTrials.length - goCorrect,
    };

    const result = await saveScreening(score, duration, gameData);
    
    if (result) {
      navigate('/screening/result', { state: { result } });
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Triagem de TDAH</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">O que vamos avaliar:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Atenção sustentada</li>
                <li>• Controle inibitório</li>
                <li>• Impulsividade</li>
                <li>• Tempo de reação</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Instruções:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Quando ver um CÍRCULO (●), pressione o botão rapidamente</li>
                <li>• Quando ver um QUADRADO (■), NÃO pressione o botão</li>
                <li>• Fique atento e responda o mais rápido possível</li>
                <li>• São 40 tentativas ao todo</li>
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
              <Button onClick={startGame} className="flex-1">
                Iniciar Triagem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentTrial + 1) / trials.length) * 100;
  const trial = trials[currentTrial];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-4 pb-20">
      <div className="container max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Tentativa {currentTrial + 1} de {trials.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-6 min-h-[400px] flex items-center justify-center">
          <CardContent className="w-full flex flex-col items-center justify-center py-20">
            {showStimulus && trial ? (
              <div className={`w-32 h-32 rounded-lg ${trial.color} flex items-center justify-center text-8xl text-white animate-in fade-in zoom-in duration-200`}>
                {trial.stimulus}
              </div>
            ) : (
              <div className="w-32 h-32 flex items-center justify-center">
                <Circle className="h-8 w-8 text-muted-foreground animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="px-12 py-6 text-lg"
            onClick={() => handleResponse(true)}
            disabled={!showStimulus || loading}
          >
            <Zap className="h-6 w-6 mr-2" />
            Responder
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Pressione o botão quando ver um CÍRCULO (●)
        </p>
      </div>
    </div>
  );
}
