import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Target, Timer, Network, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const neuroplasticityModules = [
  {
    id: 'rapid-reasoning',
    title: 'Raciocínio Rápido',
    description: 'Treinamento de velocidade de processamento mental e tomada de decisões rápidas',
    icon: Zap,
    category: 'Velocidade Cognitiva',
    level: 1,
    sessions: 12,
    avgImprovement: '35%',
    color: 'from-yellow-400 to-orange-500',
    route: '/neuroplasticity/rapid-reasoning',
    unlocked: true
  },
  {
    id: 'cognitive-shifting',
    title: 'Pensamento Flexível',
    description: 'Exercícios de alternância de tarefas e adaptabilidade cognitiva',
    icon: Network,
    category: 'Flexibilidade Mental',
    level: 1,
    sessions: 15,
    avgImprovement: '42%',
    color: 'from-purple-400 to-blue-500',
    route: '/neuroplasticity/cognitive-shifting',
    unlocked: true
  },
  {
    id: 'multistream-tracking',
    title: 'Rastreamento Multifluxo',
    description: 'Treinamento de atenção dividida e processamento simultâneo',
    icon: Target,
    category: 'Atenção Dividida',
    level: 1,
    sessions: 18,
    avgImprovement: '38%',
    color: 'from-green-400 to-teal-500',
    route: '/neuroplasticity/multistream-tracking',
    unlocked: false
  },
  {
    id: 'inhibition-control',
    title: 'Controle Inibitório',
    description: 'Desenvolvimento de autorregulação e controle de impulsos',
    icon: Brain,
    category: 'Controle Executivo',
    level: 1,
    sessions: 20,
    avgImprovement: '45%',
    color: 'from-red-400 to-pink-500',
    route: '/neuroplasticity/inhibition-control',
    unlocked: false
  },
  {
    id: 'working-memory',
    title: 'Memória de Trabalho',
    description: 'Exercícios de capacidade de processamento e retenção simultânea',
    icon: Timer,
    category: 'Memória Operacional',
    level: 1,
    sessions: 16,
    avgImprovement: '40%',
    color: 'from-indigo-400 to-purple-500',
    route: '/neuroplasticity/working-memory',
    unlocked: false
  },
  {
    id: 'executive-planning',
    title: 'Função Executiva',
    description: 'Treinamento de planejamento, organização e resolução complexa',
    icon: Lightbulb,
    category: 'Planejamento',
    level: 1,
    sessions: 22,
    avgImprovement: '48%',
    color: 'from-cyan-400 to-blue-500',
    route: '/neuroplasticity/executive-planning',
    unlocked: false
  }
];

export default function Neuroplasticity() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-hero bg-clip-text text-transparent">
              Login Necessário
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Faça login para acessar o treinamento de neuroplasticidade.
            </p>
            <Button asChild className="w-full">
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Neuroplasticidade Clínica</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold gradient-hero bg-clip-text text-transparent text-balance">
            Treinamento Cognitivo Avançado
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Módulos especializados baseados em neurociência para desenvolvimento de habilidades cognitivas específicas. 
            Cada exercício é projetado para estimular neuroplasticidade e melhorar funções executivas.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="shadow-card gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Seu Progresso de Neuroplasticidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2/6</div>
                <div className="text-sm text-muted-foreground">Módulos Desbloqueados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">27</div>
                <div className="text-sm text-muted-foreground">Sessões Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">+38%</div>
                <div className="text-sm text-muted-foreground">Melhoria Média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Neuroplasticity Modules */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Módulos de Treinamento</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada módulo foca em aspectos específicos da cognição, com exercícios progressivos baseados em evidências científicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {neuroplasticityModules.map((module) => {
              const Icon = module.icon;
              return (
                <Card key={module.id} className="shadow-card hover:shadow-glow transition-all duration-300 border-0 overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${module.color} text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {module.category}
                          </Badge>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {module.title}
                          </CardTitle>
                        </div>
                      </div>
                      {!module.unlocked && (
                        <div className="text-muted-foreground">
                          🔒
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {module.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-primary">Nível {module.level}</div>
                        <div className="text-xs text-muted-foreground">Atual</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-primary">{module.sessions}</div>
                        <div className="text-xs text-muted-foreground">Sessões</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-primary">{module.avgImprovement}</div>
                        <div className="text-xs text-muted-foreground">Melhoria</div>
                      </div>
                    </div>

                    <Button 
                      asChild={module.unlocked} 
                      disabled={!module.unlocked}
                      className="w-full"
                      variant={module.unlocked ? "default" : "secondary"}
                    >
                      {module.unlocked ? (
                        <Link to={module.route}>
                          Iniciar Treinamento
                        </Link>
                      ) : (
                        <span>Complete módulos anteriores</span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Scientific Background */}
        <Card className="shadow-card gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Base Científica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nossos módulos de neuroplasticidade são baseados em décadas de pesquisa em neurociência cognitiva. 
              Cada exercício foi desenvolvido para estimular circuitos neurais específicos e promover mudanças 
              estruturais e funcionais no cérebro.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Princípios Aplicados:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Especificidade de treinamento</li>
                  <li>• Progressão adaptativa</li>
                  <li>• Transferência de habilidades</li>
                  <li>• Consolidação de memória</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Métricas Acompanhadas:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Velocidade de processamento</li>
                  <li>• Precisão de resposta</li>
                  <li>• Tempo de reação</li>
                  <li>• Consistência de desempenho</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}