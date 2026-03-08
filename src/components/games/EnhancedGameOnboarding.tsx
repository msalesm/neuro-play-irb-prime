import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, SkipForward, ChevronLeft, ChevronRight, 
  Target, Clock, Trophy, Brain, Lightbulb, 
  CheckCircle, ArrowRight, Sparkles, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameStep {
  id: string;
  title: string;
  description: string;
  visual?: React.ReactNode;
  interactionType: 'demonstration' | 'practice' | 'explanation';
  tips?: string[];
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface EnhancedGameOnboardingProps {
  gameTitle: string;
  gameDescription: string;
  gameIcon: React.ReactNode;
  steps: GameStep[];
  onComplete: () => void;
  onSkip: () => void;
  estimatedDuration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

export function EnhancedGameOnboarding({
  gameTitle,
  gameDescription,
  gameIcon,
  steps,
  onComplete,
  onSkip,
  estimatedDuration = "5-10 min",
  difficulty = "medium",
  category = "Cognitivo"
}: EnhancedGameOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    if (isLastStep) {
      if (dontShowAgain) {
        localStorage.setItem(`onboarding-${gameTitle}`, 'completed');
      }
      setTimeout(() => {
        onComplete();
      }, 300);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem(`onboarding-${gameTitle}`, 'skipped');
    }
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'demonstration': return <Play className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'explanation': return <Lightbulb className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl mx-4 bg-card/95 backdrop-blur-sm border border-border/50 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  {gameIcon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{gameTitle}</h2>
                  <p className="text-sm text-muted-foreground">{gameDescription}</p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Pular
              </Button>
            </div>

            {/* Game Info */}
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {estimatedDuration}
              </Badge>
              <Badge className={cn("gap-1", getDifficultyColor(difficulty))}>
                <Trophy className="w-3 h-3" />
                {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Brain className="w-3 h-3" />
                {category}
              </Badge>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  Passo {currentStep + 1} de {steps.length}
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  currentStepData.interactionType === 'demonstration' && "bg-blue-500/10 text-blue-500",
                  currentStepData.interactionType === 'practice' && "bg-green-500/10 text-green-500",
                  currentStepData.interactionType === 'explanation' && "bg-yellow-500/10 text-yellow-500"
                )}>
                  {getInteractionIcon(currentStepData.interactionType)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{currentStepData.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {currentStepData.interactionType === 'demonstration' && 'Demonstração'}
                    {currentStepData.interactionType === 'practice' && 'Prática'}
                    {currentStepData.interactionType === 'explanation' && 'Explicação'}
                  </p>
                </div>
              </div>

              <p className="text-foreground mb-4 leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Visual Content */}
              {currentStepData.visual && (
                <div className="bg-accent/10 rounded-lg p-4 mb-4">
                  {currentStepData.visual}
                </div>
              )}

              {/* Tips */}
              {currentStepData.tips && currentStepData.tips.length > 0 && (
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-primary">Dicas importantes:</span>
                  </div>
                  <ul className="space-y-1">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 space-y-3">
            {/* Don't show again option */}
            <div className="flex items-center gap-2 px-2 pb-3 border-b border-border/20">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <label
                htmlFor="dont-show"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                Não mostrar este tutorial novamente
              </label>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === currentStep && "bg-primary w-6",
                      index < currentStep && "bg-green-500",
                      index > currentStep && "bg-muted"
                    )}
                  />
                ))}
              </div>

              <Button 
                onClick={handleNext}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all"
              >
                {isLastStep ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Começar!
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}