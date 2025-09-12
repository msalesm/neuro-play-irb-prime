import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calculator,
  Music,
  MessageCircle,
  Eye,
  Hand,
  Clock,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { useNeuroplasticity } from '@/hooks/useNeuroplasticity';
import { Link } from 'react-router-dom';

interface NeuroplasticityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NeuroplasticityModal({ open, onOpenChange }: NeuroplasticityModalProps) {
  const { 
    neuroplasticityData, 
    skillMetrics, 
    history, 
    loading, 
    getCategoryProgress,
    getSkillProgress,
    getCategoryTrend 
  } = useNeuroplasticity();

  const categories = [
    { 
      key: 'memory_score' as const, 
      name: 'Memória', 
      icon: Brain, 
      color: 'text-blue-600',
      gradient: 'gradient-memory',
      description: 'Capacidade de armazenar e recuperar informações'
    },
    { 
      key: 'logic_score' as const, 
      name: 'Lógica', 
      icon: Lightbulb, 
      color: 'text-purple-600',
      gradient: 'gradient-problem',
      description: 'Raciocínio lógico e resolução de problemas'
    },
    { 
      key: 'math_score' as const, 
      name: 'Matemática', 
      icon: Calculator, 
      color: 'text-red-600',
      gradient: 'gradient-math',
      description: 'Habilidades numéricas e raciocínio matemático'
    },
    { 
      key: 'music_score' as const, 
      name: 'Música/Ritmo', 
      icon: Music, 
      color: 'text-indigo-600',
      gradient: 'gradient-playful',
      description: 'Processamento auditivo e coordenação temporal'
    },
    { 
      key: 'language_score' as const, 
      name: 'Linguagem', 
      icon: MessageCircle, 
      color: 'text-green-600',
      gradient: 'gradient-language',
      description: 'Processamento e compreensão da linguagem'
    },
    { 
      key: 'focus_score' as const, 
      name: 'Foco & Atenção', 
      icon: Target, 
      color: 'text-blue-500',
      gradient: 'gradient-focus',
      description: 'Concentração e atenção sustentada'
    },
    { 
      key: 'coordination_score' as const, 
      name: 'Coordenação', 
      icon: Hand, 
      color: 'text-orange-600',
      gradient: 'gradient-social',
      description: 'Coordenação motora e integração sensorial'
    }
  ];

  const skills = [
    { 
      key: 'quick_reasoning' as const, 
      name: 'Raciocínio Rápido', 
      icon: Zap, 
      color: 'text-yellow-600',
      description: 'Velocidade de processamento mental'
    },
    { 
      key: 'flexible_thinking' as const, 
      name: 'Pensamento Flexível', 
      icon: Brain, 
      color: 'text-purple-600',
      description: 'Adaptabilidade e mudança de perspectiva'
    },
    { 
      key: 'tracking_ability' as const, 
      name: 'Rastreamento', 
      icon: Eye, 
      color: 'text-blue-600',
      description: 'Atenção visual e espacial'
    },
    { 
      key: 'memory_thinking' as const, 
      name: 'Pensamento de Memória', 
      icon: BookOpen, 
      color: 'text-green-600',
      description: 'Memória de trabalho e recall'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Avançado', color: 'text-green-600' };
    if (score >= 60) return { level: 'Proficiente', color: 'text-blue-600' };
    if (score >= 40) return { level: 'Desenvolvendo', color: 'text-yellow-600' };
    return { level: 'Iniciante', color: 'text-orange-600' };
  };

  const overallScore = Math.round(neuroplasticityData.overall_score);
  const overallLevel = getScoreLevel(overallScore);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-primary" />
            Sistema de Neuroplasticidade
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="skills">Habilidades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Score Geral */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Neuroplasticidade Geral</span>
                  <Badge variant="outline" className={overallLevel.color}>
                    {overallLevel.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">{overallScore}%</span>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{neuroplasticityData.games_completed} jogos completados</p>
                    <p>{neuroplasticityData.total_sessions} sessões totais</p>
                  </div>
                </div>
                <Progress value={overallScore} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Seu desenvolvimento cognitivo está no nível <strong className={overallLevel.color}>{overallLevel.level}</strong>.
                  Continue jogando para fortalecer suas conexões neurais!
                </p>
              </CardContent>
            </Card>

            {/* Resumo das Categorias */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Resumo por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map(category => {
                    const score = Math.round(getCategoryProgress(category.key));
                    const trend = getCategoryTrend(category.key);
                    const Icon = category.icon;
                    
                    return (
                      <div key={category.key} className="text-center p-3 rounded-lg bg-muted/30">
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${category.color}`} />
                        <p className="text-xs font-medium mb-1">{category.name}</p>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm font-bold">{score}%</span>
                          {getTrendIcon(trend)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="shadow-card gradient-card">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Continue Desenvolvendo sua Neuroplasticidade</h3>
                  <p className="text-sm text-muted-foreground">
                    Quanto mais você joga, mais suas conexões neurais se fortalecem!
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button asChild>
                      <Link to="/games">
                        <Target className="w-4 h-4 mr-2" />
                        Jogar Agora
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/diagnostic-tests">
                        <Clock className="w-4 h-4 mr-2" />
                        Testes Diagnósticos
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4">
              {categories.map(category => {
                const score = Math.round(getCategoryProgress(category.key));
                const trend = getCategoryTrend(category.key);
                const level = getScoreLevel(score);
                const Icon = category.icon;
                
                return (
                  <Card key={category.key} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${category.color}`} />
                          {category.name}
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend)}
                          <Badge variant="outline" className={level.color}>
                            {level.level}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="grid gap-4">
              {skills.map(skill => {
                const score = Math.round(getSkillProgress(skill.key));
                const level = getScoreLevel(score);
                const Icon = skill.icon;
                
                return (
                  <Card key={skill.key} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${skill.color}`} />
                          {skill.name}
                        </div>
                        <Badge variant="outline" className={level.color}>
                          {level.level}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Explicação das Habilidades */}
            <Card className="shadow-card bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Sobre as Habilidades Específicas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Baseado no App Clever:</strong> Essas métricas são inspiradas no sistema de avaliação 
                  cognitiva do aplicativo Clever, adaptadas para o contexto terapêutico do NeuroPlay.
                </p>
                <p>
                  Cada habilidade é desenvolvida através de diferentes jogos e exercícios, 
                  proporcionando um desenvolvimento cognitivo abrangente e personalizado.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}