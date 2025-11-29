import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Brain, 
  Users, 
  Trophy, 
  Target,
  ChevronRight,
  CheckCircle2,
  Heart,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tips?: string[];
}

interface OnboardingFlowProps {
  onComplete?: () => void;
  userName?: string;
}

export default function OnboardingFlow({ onComplete, userName = "usuário" }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: OnboardingStep[] = [
    {
      title: "Bem-vindo à NeuroPlay!",
      description: "Uma plataforma clínica-terapêutica para desenvolvimento cognitivo e emocional infantil baseada em evidências científicas.",
      icon: <Sparkles className="w-12 h-12" />,
      color: "text-primary",
      tips: [
        "Jogos baseados em neurociência",
        "Análise de desempenho em tempo real",
        "Recomendações personalizadas por IA"
      ]
    },
    {
      title: "Crie o Perfil da Criança",
      description: "Para começar, você precisará criar um perfil para a criança. Isso nos ajuda a personalizar os jogos e acompanhar o progresso.",
      icon: <Users className="w-12 h-12" />,
      color: "text-blue-600",
      tips: [
        "Informações sobre idade e condições diagnosticadas",
        "Perfil sensorial e preferências",
        "Configurações de acessibilidade"
      ]
    },
    {
      title: "Jogos Terapêuticos",
      description: "Acesse jogos cognitivos organizados por categorias: atenção, memória, flexibilidade, linguagem, emoção e coordenação.",
      icon: <Brain className="w-12 h-12" />,
      color: "text-purple-600",
      tips: [
        "Dificuldade adaptativa automática",
        "Métricas detalhadas de desempenho",
        "Feedback educacional imediato"
      ]
    },
    {
      title: "Acompanhe o Progresso",
      description: "Visualize relatórios detalhados, conquistas e evolução cognitiva através do dashboard parental.",
      icon: <Trophy className="w-12 h-12" />,
      color: "text-amber-600",
      tips: [
        "Gráficos de evolução temporal",
        "Identificação de pontos fortes",
        "Áreas que precisam de reforço"
      ]
    },
    {
      title: "Recomendações Inteligentes",
      description: "Nossa IA analisa o desempenho e sugere próximos passos, ajustes de dificuldade e intervenções personalizadas.",
      icon: <Target className="w-12 h-12" />,
      color: "text-green-600",
      tips: [
        "Sugestões baseadas em padrões",
        "Alertas de regressão ou progresso",
        "Orientações para pais e terapeutas"
      ]
    },
    {
      title: "Educação Parental",
      description: "Acesse módulos educacionais sobre TEA, TDAH, dislexia e estratégias de intervenção domiciliar.",
      icon: <BookOpen className="w-12 h-12" />,
      color: "text-rose-600",
      tips: [
        "Vídeos curtos e práticos",
        "Quizzes interativos",
        "Certificados de conclusão"
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    onComplete?.();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-2xl shadow-2xl border-2">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Passo {currentStep + 1} de {steps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-muted-foreground"
            >
              Pular
            </Button>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center gap-4">
            <div className={cn("p-4 rounded-xl bg-gradient-to-br from-background to-muted", step.color)}>
              {step.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
              <CardDescription className="text-base">
                {step.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step.tips && step.tips.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">O que você vai encontrar:</span>
              </div>
              {step.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                Anterior
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Começar
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {currentStep === 0 && (
            <p className="text-center text-sm text-muted-foreground pt-2">
              Olá, {userName}! Vamos conhecer a plataforma juntos? 🚀
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
