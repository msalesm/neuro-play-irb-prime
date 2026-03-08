import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameExitButton } from '@/components/games';
import { Play, RotateCcw, Trophy, Star, Zap } from 'lucide-react';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';
import { executiveProcessingPhases } from '@/data/game-phases/executive-processing-phases';
import { useToast } from '@/hooks/use-toast';

type StimulusType = 'go' | 'no-go';

interface Trial {
  type: StimulusType;
  symbol: string;
  color: string;
}

interface TrialResult {
  type: StimulusType;
  responded: boolean;
  correct: boolean;
  responseTimeMs: number;
}

export default function ExecutiveProcessingPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phaseId') || 'executive-phase-1';
  const childProfileIdParam = searchParams.get('childProfileId');
  const { childProfileId: profileId } = useGameProfile();
  const effectiveChildProfileId = childProfileIdParam || profileId;
  const { startSession, endSession } = useGameSession('executive-processing', effectiveChildProfileId || undefined);
  const { toast } = useToast();

  const phase = executiveProcessingPhases.find(p => p.id === phaseId) || executiveProcessingPhases[0];
  const config = phase.gameConfig || {};
  const targetCount = (config.targetCount as number) || 10;
  const duration = (config.duration as number) || 60;
  const speedMultiplier = (config.speedMultiplier as number) || 1.0;

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [showStimulus, setShowStimulus] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [responded, setResponded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const trialTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const GO_SYMBOLS = ['●', '◆', '▲'];
  const NOGO_SYMBOLS = ['■', '✖', '◼'];
  const COLORS = ['bg-success', 'bg-primary', 'bg-warning', 'bg-info'];

  const generateTrials = useCallback(() => {
    const generated: Trial[] = [];
    for (let i = 0; i < targetCount; i++) {
      const isGo = Math.random() < 0.7;
      const symbols = isGo ? GO_SYMBOLS : NOGO_SYMBOLS;
      generated.push({
        type: isGo ? 'go' : 'no-go',
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    return generated;
  }, [targetCount]);

  const startGame = useCallback(() => {
    const newTrials = generateTrials();
    setTrials(newTrials);
    setResults([]);
    setCurrentTrialIndex(0);
    setTimeRemaining(duration);
    setGameState('playing');
    startSession?.();
  }, [generateTrials, duration, startSession]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Show stimulus with delay
  useEffect(() => {
    if (gameState !== 'playing' || currentTrialIndex >= trials.length) return;

    setShowStimulus(false);
    setResponded(false);

    const delay = 400 + Math.random() * (600 / speedMultiplier);
    const showTimer = setTimeout(() => {
      setShowStimulus(true);
      setTrialStartTime(Date.now());

      // Auto-advance after display window
      const displayTime = 1500 / speedMultiplier;
      trialTimerRef.current = setTimeout(() => {
        handleNoResponse();
      }, displayTime);
    }, delay);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(trialTimerRef.current);
    };
  }, [currentTrialIndex, gameState, trials.length, speedMultiplier]);

  const handleNoResponse = useCallback(() => {
    if (responded) return;
    const trial = trials[currentTrialIndex];
    if (!trial) return;

    const result: TrialResult = {
      type: trial.type,
      responded: false,
      correct: trial.type === 'no-go',
      responseTimeMs: 0,
    };

    setResults(prev => [...prev, result]);
    advanceTrial();
  }, [currentTrialIndex, trials, responded]);

  const handleResponse = useCallback(() => {
    if (!showStimulus || responded) return;
    setResponded(true);
    clearTimeout(trialTimerRef.current);

    const responseTime = Date.now() - trialStartTime;
    const trial = trials[currentTrialIndex];
    if (!trial) return;

    const correct = trial.type === 'go';
    const result: TrialResult = {
      type: trial.type,
      responded: true,
      correct,
      responseTimeMs: responseTime,
    };

    setResults(prev => [...prev, result]);

    if (!correct) {
      toast({ title: '⚠️ Controle!', description: 'Não deveria responder a esse estímulo', variant: 'destructive' });
    }

    setTimeout(advanceTrial, 200);
  }, [showStimulus, responded, trialStartTime, currentTrialIndex, trials, toast]);

  const advanceTrial = useCallback(() => {
    setShowStimulus(false);
    const next = currentTrialIndex + 1;
    if (next >= trials.length) {
      finishGame();
    } else {
      setCurrentTrialIndex(next);
    }
  }, [currentTrialIndex, trials.length]);

  const finishGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('results');
  }, []);

  // Keyboard support
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleResponse();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, handleResponse]);

  // Compute results
  const goTrials = results.filter(r => r.type === 'go');
  const noGoTrials = results.filter(r => r.type === 'no-go');
  const goCorrect = goTrials.filter(r => r.correct).length;
  const noGoCorrect = noGoTrials.filter(r => r.correct).length;
  const totalCorrect = goCorrect + noGoCorrect;
  const accuracy = results.length > 0 ? Math.round((totalCorrect / results.length) * 100) : 0;
  const avgResponseTime = goTrials.filter(r => r.responded).length > 0
    ? Math.round(goTrials.filter(r => r.responded).reduce((s, r) => s + r.responseTimeMs, 0) / goTrials.filter(r => r.responded).length)
    : 0;
  const impulsivityErrors = noGoTrials.filter(r => !r.correct).length;
  const omissionErrors = goTrials.filter(r => !r.correct).length;

  const calculateStars = () => {
    if (accuracy >= 92) return 3;
    if (accuracy >= 85) return 2;
    if (totalCorrect > 0) return 1;
    return 0;
  };

  // Save on results
  useEffect(() => {
    if (gameState === 'results' && results.length > 0) {
      const stars = calculateStars();
      endSession?.({
        score: accuracy,
        accuracy,
        timeSpent: duration - timeRemaining,
        correctMoves: totalCorrect,
        totalMoves: results.length,
        reactionTimes: goTrials.filter(r => r.responded).map(r => r.responseTimeMs),
        phaseId,
        stars,
        impulsivityErrors,
        omissionErrors,
        avgResponseTime,
      });
    }
  }, [gameState]);

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <Card className="max-w-lg w-full p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">🎯 {phase.name}</h1>
            <p className="text-muted-foreground">{phase.description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Instruções:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Quando ver um <strong>CÍRCULO (●), LOSANGO (◆) ou TRIÂNGULO (▲)</strong> → pressione <strong>Responder</strong></li>
              <li>• Quando ver um <strong>QUADRADO (■) ou X (✖)</strong> → <strong>NÃO</strong> pressione</li>
              <li>• Seja rápido, mas controle seus impulsos!</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Objetivos da Fase:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {phase.objectives.map((obj, i) => (
                <li key={i}>🎯 {obj}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <GameExitButton
              returnTo="/games/executive-processing-phases"
              variant="back"
              className="flex-1"
            />
            <Button onClick={startGame} className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Iniciar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'results') {
    const stars = calculateStars();
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <Card className="max-w-lg w-full p-6 space-y-6">
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto text-warning mb-2" />
            <h2 className="text-2xl font-bold">Fase Concluída!</h2>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3].map(i => (
                <Star key={i} className={`w-8 h-8 ${i <= stars ? 'fill-warning text-warning' : 'text-muted'}`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Precisão</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{avgResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">Tempo Médio</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-destructive">{impulsivityErrors}</div>
              <div className="text-xs text-muted-foreground">Erros Impulsivos</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-warning">{omissionErrors}</div>
              <div className="text-xs text-muted-foreground">Omissões</div>
            </div>
          </div>

          {phase.rewards && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">✨ +{phase.rewards.xp} XP</span>
              {phase.rewards.coins && <span className="flex items-center gap-1">🪙 +{phase.rewards.coins}</span>}
              {phase.rewards.badge && <span className="flex items-center gap-1">🏅 {phase.rewards.badge}</span>}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={startGame} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" />
              Repetir
            </Button>
            <Button 
              onClick={() => navigate(`/games/executive-processing-phases${childProfileIdParam ? `?childProfileId=${childProfileIdParam}` : ''}`)} 
              className="flex-1"
            >
              Voltar às Fases
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Playing state
  const trial = trials[currentTrialIndex];
  const progressValue = ((currentTrialIndex + 1) / trials.length) * 100;

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <GameExitButton
            returnTo="/games/executive-processing-phases"
            variant="quit"
            size="sm"
            showProgress
            currentProgress={currentTrialIndex}
            totalProgress={trials.length}
          />
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4 text-warning" />
            {timeRemaining}s
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Tentativa {currentTrialIndex + 1}/{trials.length}</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Stimulus area */}
        <Card className="flex-1 flex items-center justify-center min-h-[300px] mb-6">
          {showStimulus && trial ? (
            <div className={`w-32 h-32 rounded-2xl ${trial.color} flex items-center justify-center text-7xl text-primary-foreground animate-in fade-in zoom-in duration-150`}>
              {trial.symbol}
            </div>
          ) : (
            <div className="w-32 h-32 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-muted-foreground/30 animate-pulse" />
            </div>
          )}
        </Card>

        {/* Response button */}
        <Button
          size="lg"
          className="w-full py-6 text-lg gap-2"
          onClick={handleResponse}
          disabled={!showStimulus || responded}
        >
          <Zap className="w-5 h-5" />
          Responder
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Pressione quando ver ● ◆ ▲ — Não pressione quando ver ■ ✖
        </p>
      </div>
    </div>
  );
}
