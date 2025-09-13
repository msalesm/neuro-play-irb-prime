import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Sparkles,
  Heart,
  ChevronRight
} from 'lucide-react';

interface FeedbackData {
  correct: boolean;
  explanation: string;
  skillImproved: string;
  tip?: string;
  encouragement: string;
  nextAction?: string;
  pedagogicalNote: string;
}

interface EducationalFeedbackProps {
  feedback: FeedbackData;
  onContinue?: () => void;
  showEncouragement?: boolean;
  category?: 'memory' | 'attention' | 'logic' | 'language' | 'math' | 'social';
}

export function EducationalFeedback({ 
  feedback, 
  onContinue, 
  showEncouragement = true,
  category = 'memory'
}: EducationalFeedbackProps) {
  const [currentPhase, setCurrentPhase] = useState<'result' | 'explanation' | 'encouragement'>('result');

  useEffect(() => {
    const phases = ['result', 'explanation', 'encouragement'];
    let phaseIndex = 0;
    
    const timer = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setCurrentPhase(phases[phaseIndex] as typeof currentPhase);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const getCategoryColor = (cat: string) => {
    const colors = {
      memory: 'text-green-600',
      attention: 'text-blue-600', 
      logic: 'text-purple-600',
      language: 'text-pink-600',
      math: 'text-red-600',
      social: 'text-orange-600'
    };
    return colors[cat as keyof typeof colors] || 'text-primary';
  };

  const getCategoryGradient = (cat: string) => {
    const gradients = {
      memory: 'gradient-memory',
      attention: 'gradient-focus',
      logic: 'gradient-problem',
      language: 'gradient-language',
      math: 'gradient-math',
      social: 'gradient-social'
    };
    return gradients[cat as keyof typeof gradients] || 'gradient-playful';
  };

  return (
    <Card className={`shadow-glow border-2 ${feedback.correct ? 'border-green-200' : 'border-orange-200'}`}>
      <CardContent className="p-6 space-y-4">
        {/* Result Phase */}
        {currentPhase === 'result' && (
          <div className="text-center space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              feedback.correct ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {feedback.correct ? 
                <CheckCircle className="w-8 h-8" /> : 
                <AlertCircle className="w-8 h-8" />
              }
            </div>
            
            <div>
              <h3 className="text-lg font-bold">
                {feedback.correct ? '🎉 Muito bem!' : '🤔 Quase lá!'}
              </h3>
              <p className="text-muted-foreground">
                {feedback.correct ? 'Resposta correta!' : 'Vamos aprender juntos!'}
              </p>
            </div>

            <Badge variant={feedback.correct ? 'default' : 'secondary'} className="text-sm">
              <Brain className="w-3 h-3 mr-1" />
              {feedback.skillImproved}
            </Badge>
          </div>
        )}

        {/* Explanation Phase */}
        {currentPhase === 'explanation' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryGradient(category)} text-white`}>
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Por que isso desenvolve seu cérebro:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feedback.explanation}
                </p>
              </div>
            </div>

            {feedback.tip && (
              <div className="bg-accent/30 rounded-lg p-4 border border-accent">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent-foreground mt-0.5" />
                  <div>
                    <h5 className="font-medium text-accent-foreground mb-1">Dica de Aprendizado:</h5>
                    <p className="text-sm text-accent-foreground/80">
                      {feedback.tip}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Encouragement Phase */}
        {currentPhase === 'encouragement' && showEncouragement && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-playful flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Você está crescendo!</h4>
              <p className="text-sm text-muted-foreground">
                {feedback.encouragement}
              </p>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium text-primary mb-1">Conexão Pedagógica:</h5>
                  <p className="text-xs text-primary/80">
                    {feedback.pedagogicalNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {feedback.nextAction && (
            <Button variant="outline" size="sm" className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              {feedback.nextAction}
            </Button>
          )}
          
          {onContinue && (
            <Button onClick={onContinue} size="sm" className="flex-1">
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Phase Indicator */}
        <div className="flex justify-center gap-2">
          {['result', 'explanation', 'encouragement'].map((phase, index) => (
            <div
              key={phase}
              className={`w-2 h-2 rounded-full transition-smooth ${
                currentPhase === phase ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}