import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BreathingPattern } from '@/types/biofeedback';

interface BreathingExerciseProps {
  pattern: BreathingPattern;
  onComplete: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause' | 'complete';

export function BreathingExercise({ pattern, onComplete, onSkip, autoStart = true }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(pattern.inhale);
  const [totalTime, setTotalTime] = useState(pattern.inhale);

  const phaseSequence: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'pause'];
  
  const getPhaseText = (phase: BreathingPhase) => {
    const texts = {
      inhale: 'Inspire',
      hold: 'Segure',
      exhale: 'Expire',
      pause: 'Pausa',
      complete: 'Completo'
    };
    return texts[phase];
  };

  const getPhaseInstructions = (phase: BreathingPhase) => {
    const instructions = {
      inhale: 'Respire devagar pelo nariz',
      hold: 'Mantenha o ar nos pulmões',
      exhale: 'Solte o ar pela boca lentamente',
      pause: 'Relaxe antes do próximo ciclo',
      complete: 'Exercício concluído!'
    };
    return instructions[phase];
  };

  const getPhaseDuration = (phase: BreathingPhase) => {
    const durations = {
      inhale: pattern.inhale,
      hold: pattern.hold,
      exhale: pattern.exhale,
      pause: pattern.pause,
      complete: 0
    };
    return durations[phase];
  };

  const getCircleScale = () => {
    const progress = 1 - (timeRemaining / totalTime);
    
    switch (currentPhase) {
      case 'inhale':
        return 0.5 + (progress * 0.5); // Scale from 0.5 to 1
      case 'hold':
        return 1; // Stay at full size
      case 'exhale':
        return 1 - (progress * 0.5); // Scale from 1 to 0.5
      case 'pause':
        return 0.5; // Stay at small size
      default:
        return 0.5;
    }
  };

  const nextPhase = useCallback(() => {
    const currentIndex = phaseSequence.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phaseSequence.length;
    
    if (nextIndex === 0) {
      // Starting new cycle
      if (currentCycle >= pattern.cycles) {
        setCurrentPhase('complete');
        setIsActive(false);
        setTimeout(onComplete, 1000);
        return;
      }
      setCurrentCycle(prev => prev + 1);
    }
    
    const nextPhase = phaseSequence[nextIndex];
    setCurrentPhase(nextPhase);
    
    const duration = getPhaseDuration(nextPhase);
    if (duration > 0) {
      setTimeRemaining(duration);
      setTotalTime(duration);
    }
  }, [currentPhase, currentCycle, pattern.cycles, onComplete]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setCurrentCycle(1);
    setTimeRemaining(pattern.inhale);
    setTotalTime(pattern.inhale);
  };

  const skipExercise = () => {
    setIsActive(false);
    onSkip?.();
  };

  useEffect(() => {
    if (!isActive || currentPhase === 'complete') return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 100) {
          nextPhase();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, currentPhase, nextPhase]);

  if (!isActive && !autoStart) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-soft">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Exercício de Respiração</h3>
            <p className="text-sm text-muted-foreground">{pattern.description}</p>
          </div>
          <div className="space-y-3">
            <Button onClick={startExercise} className="w-full">
              Iniciar Exercício
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={skipExercise} className="w-full">
                Pular por Agora
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto shadow-glow border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Vamos Respirar Juntos</h2>
            <p className="text-sm text-muted-foreground">{pattern.description}</p>
          </div>

          {/* Breathing Circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
            <div 
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                "bg-gradient-to-br from-primary to-primary-glow transition-all duration-1000 ease-in-out",
                "flex items-center justify-center shadow-glow"
              )}
              style={{
                width: `${getCircleScale() * 160}px`,
                height: `${getCircleScale() * 160}px`,
              }}
            >
              <div className="text-primary-foreground text-center">
                <div className="text-2xl font-bold mb-1">
                  {getPhaseText(currentPhase)}
                </div>
                <div className="text-sm opacity-90">
                  {Math.ceil(timeRemaining / 1000)}s
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <p className="text-lg font-medium mb-2">
              {getPhaseInstructions(currentPhase)}
            </p>
            <p className="text-sm text-muted-foreground">
              Ciclo {currentCycle} de {pattern.cycles}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
              style={{ 
                width: `${((currentCycle - 1) / pattern.cycles + (1 - timeRemaining / totalTime) / pattern.cycles) * 100}%` 
              }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-2">
            {onSkip && (
              <Button 
                variant="outline" 
                onClick={skipExercise}
                className="w-full text-sm"
              >
                Pular Exercício
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}