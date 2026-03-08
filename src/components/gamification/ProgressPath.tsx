import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, Circle, Lock, Star, Trophy, 
  Brain, Target, Sparkles, ChevronRight,
  Clock, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface PathStep {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'test' | 'milestone' | 'achievement';
  status: 'completed' | 'current' | 'locked' | 'available';
  progress?: number;
  href?: string;
  duration?: string;
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

interface ProgressPathProps {
  title: string;
  description?: string;
  steps: PathStep[];
  className?: string;
}

export function ProgressPath({ 
  title, 
  description, 
  steps, 
  className 
}: ProgressPathProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const getStepIcon = (step: PathStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (step.status === 'locked') {
      return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
    
    switch (step.type) {
      case 'game':
        return <Brain className="w-5 h-5 text-blue-500" />;
      case 'test':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'milestone':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-orange-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: PathStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/50 bg-green-500/10';
      case 'current':
        return 'border-primary bg-primary/10 ring-2 ring-primary/20';
      case 'available':
        return 'border-border hover:border-primary/50 bg-card';
      case 'locked':
        return 'border-border/30 bg-muted/30';
      default:
        return 'border-border bg-card';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500 bg-green-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'hard':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalProgress = (completedSteps / steps.length) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{completedSteps} de {steps.length}</span>
            </div>
            <Progress value={totalProgress} className="w-32" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{Math.round(totalProgress)}% Completo</span>
          </div>
          {steps.some(s => s.points) && (
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{steps.filter(s => s.status === 'completed').reduce((acc, s) => acc + (s.points || 0), 0)} pontos</span>
            </div>
          )}
        </div>
      </Card>

      {/* Steps */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border">
          <div 
            className="w-full bg-primary transition-all duration-1000"
            style={{ height: `${totalProgress}%` }}
          />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card 
              key={step.id}
              className={cn(
                "relative ml-12 transition-all duration-300 cursor-pointer hover-scale",
                getStatusColor(step.status),
                selectedStep === step.id && "ring-2 ring-primary/30",
                step.status === 'locked' && "cursor-not-allowed opacity-60"
              )}
              onClick={() => step.status !== 'locked' && setSelectedStep(step.id)}
            >
              {/* Step Icon */}
              <div className="absolute -left-12 top-6 w-6 h-6 bg-background rounded-full border-2 border-current flex items-center justify-center">
                {getStepIcon(step)}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      
                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {step.difficulty && (
                          <Badge className={cn("text-xs", getDifficultyColor(step.difficulty))}>
                            {step.difficulty}
                          </Badge>
                        )}
                        
                        {step.category && (
                          <Badge variant="outline" className="text-xs">
                            {step.category}
                          </Badge>
                        )}
                        
                        {step.points && (
                          <Badge variant="secondary" className="text-xs">
                            +{step.points} pts
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {step.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{step.duration}</span>
                        </div>
                      )}
                      
                      <Badge variant="outline" className="text-xs capitalize">
                        {step.type === 'game' && 'Jogo'}
                        {step.type === 'test' && 'Teste'}
                        {step.type === 'milestone' && 'Marco'}
                        {step.type === 'achievement' && 'Conquista'}
                      </Badge>
                    </div>

                    {/* Progress Bar for Current Step */}
                    {step.status === 'current' && step.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {step.href && step.status !== 'locked' && (
                    <Link to={step.href}>
                      <Button 
                        size="sm" 
                        variant={step.status === 'current' ? 'default' : 'outline'}
                        className="ml-4"
                      >
                        {step.status === 'completed' ? 'Revisar' : 
                         step.status === 'current' ? 'Continuar' : 'Iniciar'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}