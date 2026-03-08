import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Play, SkipForward } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  visual?: React.ReactNode;
  tips?: string[];
}

interface GameOnboardingProps {
  gameName: string;
  gameIcon: string;
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export const GameOnboarding: React.FC<GameOnboardingProps> = ({
  gameName,
  gameIcon,
  steps,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl animate-scale-in">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="text-6xl mb-2">{gameIcon}</div>
          <CardTitle className="text-xl">
            Como Jogar: {gameName}
          </CardTitle>
          <div className="flex justify-center gap-1 mt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-3">
              Passo {currentStep + 1} de {steps.length}
            </Badge>
            <h3 className="font-semibold text-lg mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {currentStepData.description}
            </p>
          </div>

          {currentStepData.visual && (
            <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
              {currentStepData.visual}
            </div>
          )}

          {currentStepData.tips && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">💡 Dicas:</h4>
              <ul className="space-y-1">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            
            {!isLastStep ? (
              <Button
                variant="outline"
                onClick={handleSkip}
                className="px-3"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            ) : null}
            
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {isLastStep ? (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Começar a Jogar!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};