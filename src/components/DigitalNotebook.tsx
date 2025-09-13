import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Lightbulb,
  User
} from 'lucide-react';
import { useEducationalSystem } from '@/hooks/useEducationalSystem';

const categoryInfo = {
  memory: {
    name: 'Memória',
    icon: Brain,
    color: 'text-primary',
    description: 'Desenvolvimento da capacidade de reter e recuperar informações'
  },
  attention: {
    name: 'Atenção',
    icon: Target,
    color: 'text-blue-600',
    description: 'Fortalecimento do foco e concentração'
  },
  logic: {
    name: 'Lógica',
    icon: Lightbulb,
    color: 'text-yellow-600',
    description: 'Raciocínio lógico e resolução de problemas'
  },
  math: {
    name: 'Matemática',
    icon: Calculator,
    color: 'text-green-600',
    description: 'Habilidades numéricas e cálculos'
  },
  language: {
    name: 'Linguagem',
    icon: BookOpen,
    color: 'text-purple-600',
    description: 'Comunicação e processamento da linguagem'
  },
  executive: {
    name: 'Funções Executivas',
    icon: User,
    color: 'text-red-600',
    description: 'Planejamento, organização e controle inibitório'
  }
};

const neurodiversityConditions = {
  'autism_spectrum': {
    name: 'Transtorno do Espectro Autista (TEA)',
    strategies: [
      'Rotinas estruturadas e previsíveis',
      'Pausas sensoriais quando necessário',
      'Instruções claras e diretas',
      'Tempo adicional para processamento'
    ]
  },
  'adhd': {
    name: 'Transtorno do Déficit de Atenção (TDAH)',
    strategies: [
      'Quebrar tarefas em partes menores',
      'Usar lembretes visuais',
      'Permitir movimento durante o aprendizado',
      'Feedback frequente e positivo'
    ]
  },
  'dyslexia': {
    name: 'Dislexia',
    strategies: [
      'Usar fontes maiores e mais claras',
      'Suporte auditivo para textos',
      'Métodos multissensoriais',
      'Tempo adicional para leitura'
    ]
  },
  'dyscalculia': {
    name: 'Discalculia',
    strategies: [
      'Usar recursos visuais para matemática',
      'Praticar com manipulativos',
      'Quebrar problemas complexos',
      'Permitir uso de calculadora'
    ]
  }
};

function Calculator({ className }: { className?: string }) {
  return <div className={`w-5 h-5 ${className}`}>📊</div>;
}

export function DigitalNotebook() {
  const { 
    learningTrails, 
    neurodiversityProfile, 
    recentSessions, 
    loading,
    getOverallProgress 
  } = useEducationalSystem();

  const [activeTab, setActiveTab] = useState('profile');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const detectedConditions = neurodiversityProfile?.detected_conditions || [];
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          📚 Caderno Digital Inteligente
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso educacional personalizado e trilhas de aprendizado
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil Cognitivo</TabsTrigger>
          <TabsTrigger value="trails">Trilhas de Aprendizado</TabsTrigger>
          <TabsTrigger value="diary">Diário de Progresso</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Perfil Cognitivo */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progresso Geral */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Progresso Geral</h3>
                  <p className="text-sm text-muted-foreground">
                    Desenvolvimento cognitivo
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={overallProgress} className="h-3" />
                <p className="text-center text-lg font-bold text-primary">
                  {overallProgress}% Completo
                </p>
              </div>
            </Card>

            {/* Sessões Completadas */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Sessões</h3>
                  <p className="text-sm text-muted-foreground">
                    Exercícios realizados
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {recentSessions.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total de sessões
              </p>
            </Card>

            {/* Pontos de Experiência */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Experiência</h3>
                  <p className="text-sm text-muted-foreground">
                    Pontos conquistados
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {learningTrails.reduce((sum, trail) => sum + trail.total_xp, 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                XP total
              </p>
            </Card>
          </div>

          {/* Perfil de Neurodiversidade */}
          {neurodiversityProfile && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Perfil de Aprendizado</h3>
              </div>
              
              {detectedConditions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">
                      Características identificadas para personalização do aprendizado:
                    </span>
                  </div>
                  
                  {detectedConditions.map((condition, index) => {
                    const conditionInfo = neurodiversityConditions[condition as keyof typeof neurodiversityConditions];
                    if (!conditionInfo) return null;
                    
                    return (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-primary">
                            {conditionInfo.name}
                          </h4>
                          <Badge variant="secondary">Detectado</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Estratégias recomendadas:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {conditionInfo.strategies.map((strategy, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {strategy}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Continue praticando para que possamos identificar seu perfil de aprendizado único
                  </p>
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Trilhas de Aprendizado */}
        <TabsContent value="trails" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningTrails.map((trail) => {
              const category = categoryInfo[trail.cognitive_category as keyof typeof categoryInfo];
              const Icon = category?.icon || BookOpen;
              
              return (
                <Card key={trail.id} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-primary/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${category?.color || 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category?.name || trail.cognitive_category}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category?.description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Nível {trail.current_level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso do Nível</span>
                        <span>{trail.completed_exercises}/5 exercícios</span>
                      </div>
                      <Progress value={(trail.completed_exercises / 5) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{trail.total_xp} XP</span>
                      </div>
                      <div className="text-muted-foreground">
                        Máximo nível: {trail.max_level_unlocked}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Diário de Progresso */}
        <TabsContent value="diary" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Histórico de Atividades</h3>
            </div>
            
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{session.game_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Nível {session.level}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        <Badge variant={session.completed ? "default" : "secondary"}>
                          {session.completed ? 'Completo' : 'Em andamento'}
                        </Badge>
                      </div>
                    </div>
                    
                    {session.session_duration_seconds && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          Duração: {Math.round(session.session_duration_seconds / 60)} minutos
                        </span>
                      </div>
                    )}
                    
                    {session.improvements_noted.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-green-600 mb-1">
                          🎉 Melhorias observadas:
                        </p>
                        <ul className="text-sm text-muted-foreground">
                          {session.improvements_noted.map((improvement, idx) => (
                            <li key={idx}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma atividade registrada ainda. Comece a jogar para ver seu progresso!
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Conquistas Recentes</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Sistema de conquistas será implementado em breve
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Análise de Desempenho</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Relatórios detalhados serão gerados automaticamente
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}