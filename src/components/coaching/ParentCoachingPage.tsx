import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Heart, Brain, Users, Lightbulb, BookOpen, Target,
  CheckCircle2, Clock, ArrowRight, Sparkles, Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CoachingTip {
  id: string;
  category: string;
  title: string;
  description: string;
  actionSteps: string[];
  difficulty: 'easy' | 'medium' | 'advanced';
  timeEstimate: string;
  icon: string;
}

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  steps: { text: string; done: boolean }[];
  childName?: string;
  category: string;
}

const coachingTips: CoachingTip[] = [
  {
    id: '1', category: 'emocional', title: 'Validação Emocional',
    description: 'Aprenda a validar os sentimentos da criança sem julgamento, criando um espaço seguro para expressão emocional.',
    actionSteps: ['Nomeie a emoção observada: "Parece que você está frustrado"', 'Valide sem minimizar: "Faz sentido se sentir assim"', 'Ofereça suporte: "Estou aqui com você"'],
    difficulty: 'easy', timeEstimate: '5 min/dia', icon: 'heart',
  },
  {
    id: '2', category: 'comportamental', title: 'Rotina Visual Estruturada',
    description: 'Crie rotinas visuais previsíveis que reduzem ansiedade e aumentam a autonomia da criança.',
    actionSteps: ['Monte um quadro visual com as atividades do dia', 'Use imagens ou pictogramas para cada etapa', 'Celebre cada etapa concluída com reforço positivo'],
    difficulty: 'medium', timeEstimate: '30 min setup', icon: 'target',
  },
  {
    id: '3', category: 'cognitivo', title: 'Tempo de Atenção Graduada',
    description: 'Técnica para aumentar progressivamente o tempo de foco da criança em atividades estruturadas.',
    actionSteps: ['Comece com 3-5 min de atividade focada', 'Aumente 1-2 min por semana', 'Use timer visual (ampulheta ou app)', 'Intercale com pausas sensoriais'],
    difficulty: 'medium', timeEstimate: '15 min/dia', icon: 'brain',
  },
  {
    id: '4', category: 'social', title: 'Scripts Sociais para Brincadeiras',
    description: 'Ensine habilidades sociais através de scripts simples que a criança pode usar em interações com pares.',
    actionSteps: ['Pratique frases como "Posso brincar?" em casa', 'Use bonecos para role-play de situações sociais', 'Reforce tentativas de interação, mesmo imperfeitas'],
    difficulty: 'easy', timeEstimate: '10 min/dia', icon: 'users',
  },
  {
    id: '5', category: 'sensorial', title: 'Kit de Regulação Sensorial',
    description: 'Monte um kit personalizado de objetos sensoriais para ajudar na autorregulação em momentos de sobrecarga.',
    actionSteps: ['Identifique os estímulos preferidos da criança (tátil, visual, auditivo)', 'Monte um kit portátil com 3-5 objetos reguladores', 'Ensine a criança a usar o kit antes da crise escalar'],
    difficulty: 'easy', timeEstimate: '20 min setup', icon: 'shield',
  },
  {
    id: '6', category: 'comunicacao', title: 'Comunicação Aumentativa em Casa',
    description: 'Estratégias para expandir a comunicação da criança usando suportes visuais e linguagem simplificada.',
    actionSteps: ['Use frases curtas e claras com apoio visual', 'Ofereça escolhas com dois objetos concretos', 'Espere 5-10 segundos antes de repetir a instrução', 'Celebre qualquer forma de comunicação (gestos, olhar, vocalizações)'],
    difficulty: 'advanced', timeEstimate: 'Contínuo', icon: 'book',
  },
];

const categoryIcons: Record<string, any> = {
  emocional: Heart,
  comportamental: Target,
  cognitivo: Brain,
  social: Users,
  sensorial: Shield,
  comunicacao: BookOpen,
};

const categoryLabels: Record<string, string> = {
  emocional: 'Emocional',
  comportamental: 'Comportamental',
  cognitivo: 'Cognitivo',
  social: 'Social',
  sensorial: 'Sensorial',
  comunicacao: 'Comunicação',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  advanced: 'bg-info/10 text-info border-info/20',
};

const difficultyLabels: Record<string, string> = {
  easy: 'Iniciante',
  medium: 'Intermediário',
  advanced: 'Avançado',
};

export default function ParentCoachingPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchChildren();
      loadActionPlans();
    }
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('child_profiles')
      .select('id, name')
      .eq('parent_user_id', user.id);
    setChildren(data || []);
  };

  const loadActionPlans = () => {
    const stored = localStorage.getItem(`coaching_plans_${user?.id}`);
    if (stored) setActionPlans(JSON.parse(stored));
  };

  const savePlans = (plans: ActionPlan[]) => {
    setActionPlans(plans);
    localStorage.setItem(`coaching_plans_${user?.id}`, JSON.stringify(plans));
  };

  const createActionPlan = (tip: CoachingTip) => {
    const plan: ActionPlan = {
      id: crypto.randomUUID(),
      title: tip.title,
      description: tip.description,
      steps: tip.actionSteps.map(text => ({ text, done: false })),
      category: tip.category,
      childName: children[0]?.name,
    };
    const updated = [...actionPlans, plan];
    savePlans(updated);
    toast.success('Plano de ação criado!');
  };

  const toggleStep = (planId: string, stepIdx: number) => {
    const updated = actionPlans.map(p => {
      if (p.id === planId) {
        const steps = [...p.steps];
        steps[stepIdx] = { ...steps[stepIdx], done: !steps[stepIdx].done };
        return { ...p, steps };
      }
      return p;
    });
    savePlans(updated);
  };

  const removePlan = (planId: string) => {
    savePlans(actionPlans.filter(p => p.id !== planId));
    toast.success('Plano removido');
  };

  const filteredTips = activeCategory === 'all'
    ? coachingTips
    : coachingTips.filter(t => t.category === activeCategory);

  const completedPlans = actionPlans.filter(p => p.steps.every(s => s.done)).length;
  const activePlans = actionPlans.filter(p => !p.steps.every(s => s.done));

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">Coaching Parental</span>
        </div>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Estratégias baseadas em evidências para apoiar o desenvolvimento do seu filho em casa
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-bold">{coachingTips.length}</p>
            <p className="text-xs text-muted-foreground">Dicas Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{activePlans.length}</p>
            <p className="text-xs text-muted-foreground">Planos Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold">{completedPlans}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tips">
        <TabsList className="w-full">
          <TabsTrigger value="tips" className="flex-1">
            <Lightbulb className="h-4 w-4 mr-2" />
            Dicas
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Meus Planos ({actionPlans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-4 space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              Todos
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key];
              return (
                <Button
                  key={key}
                  variant={activeCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(key)}
                  className="whitespace-nowrap"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              );
            })}
          </div>

          {/* Tips Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTips.map((tip) => {
              const Icon = categoryIcons[tip.category] || Lightbulb;
              const alreadyAdded = actionPlans.some(p => p.title === tip.title);

              return (
                <Card key={tip.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{tip.title}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              {categoryLabels[tip.category]}
                            </Badge>
                            <Badge className={`text-[10px] ${difficultyColors[tip.difficulty]}`}>
                              {difficultyLabels[tip.difficulty]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1" />
                        {tip.timeEstimate}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{tip.description}</p>
                    <div className="space-y-1.5 mb-3">
                      {tip.actionSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyAdded ? 'secondary' : 'default'}
                      className="w-full"
                      disabled={alreadyAdded}
                      onClick={() => createActionPlan(tip)}
                    >
                      {alreadyAdded ? 'Já adicionado' : 'Criar Plano de Ação'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-4 space-y-4">
          {actionPlans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum plano criado ainda</p>
                <p className="text-sm mt-2">Explore as dicas e crie seu primeiro plano de ação!</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {actionPlans.map((plan) => {
                  const completedSteps = plan.steps.filter(s => s.done).length;
                  const progress = Math.round((completedSteps / plan.steps.length) * 100);
                  const Icon = categoryIcons[plan.category] || Target;
                  const allDone = plan.steps.every(s => s.done);

                  return (
                    <Card key={plan.id} className={allDone ? 'border-success/30 bg-success/5' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${allDone ? 'text-success' : 'text-primary'}`} />
                            <CardTitle className="text-sm">{plan.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {completedSteps}/{plan.steps.length}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-destructive h-6"
                              onClick={() => removePlan(plan.id)}
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                        {plan.childName && (
                          <CardDescription className="text-xs">
                            Para: {plan.childName}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="w-full bg-muted rounded-full h-1.5 mb-3">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="space-y-2">
                          {plan.steps.map((step, idx) => (
                            <button
                              key={idx}
                              onClick={() => toggleStep(plan.id, idx)}
                              className="flex items-start gap-2 w-full text-left text-sm hover:bg-muted/50 rounded p-1.5 transition-colors"
                            >
                              <CheckCircle2
                                className={`h-4 w-4 mt-0.5 shrink-0 ${
                                  step.done ? 'text-success' : 'text-muted-foreground/30'
                                }`}
                              />
                              <span className={step.done ? 'line-through text-muted-foreground' : ''}>
                                {step.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
