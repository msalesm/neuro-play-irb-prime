import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Clock, 
  Zap, 
  Award,
  Users,
  Brain,
  ArrowRight,
  Star,
  Activity
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface SessionMetrics {
  score: number;
  accuracy: number;
  timeSpent: number; // seconds
  level: number;
  correctMoves?: number;
  totalMoves?: number;
  reactionTimeAvg?: number; // milliseconds
  hintsUsed?: number;
}

interface ComparisonData {
  yourAge: {
    avg: number;
    percentile: number;
  };
  allUsers: {
    avg: number;
    percentile: number;
  };
}

interface HistoricalDataPoint {
  date: string;
  score: number;
  accuracy: number;
}

interface CognitiveMetrics {
  attention: number;
  memory: number;
  flexibility: number;
  processing: number;
  inhibition: number;
}

interface AIInsight {
  type: 'strength' | 'improvement' | 'recommendation';
  title: string;
  description: string;
  actionable?: boolean;
}

interface TherapeuticInsight {
  category: 'cognitive' | 'emotional' | 'behavioral' | 'developmental';
  title: string;
  description: string;
  severity: 'info' | 'concern' | 'alert';
  recommendations: string[];
}

interface PersonalizedRecommendation {
  nextGame: string;
  nextGameTitle: string;
  reason: string;
  targetDomain: string;
  estimatedDifficulty: number;
}

export interface GameResultsDashboardProps {
  gameType: string;
  gameTitle: string;
  session: SessionMetrics;
  comparisons?: ComparisonData;
  insights?: string[];
  nextSteps?: { title: string; description: string; action: () => void }[];
  historicalData?: HistoricalDataPoint[];
  cognitiveMetrics?: CognitiveMetrics;
  onClose?: () => void;
  onPlayAgain?: () => void;
  aiInsights?: AIInsight[];
  therapeuticInsights?: TherapeuticInsight[];
  personalizedRecommendations?: PersonalizedRecommendation[];
  evolutionTrend?: 'improving' | 'stable' | 'declining';
}

export const GameResultsDashboard = ({
  gameTitle,
  session,
  comparisons,
  insights = [],
  nextSteps = [],
  historicalData = [],
  cognitiveMetrics,
  onClose,
  onPlayAgain,
  aiInsights = [],
  therapeuticInsights = [],
  personalizedRecommendations = [],
  evolutionTrend
}: GameResultsDashboardProps) => {
  // Generate actionable insights based on session data
  const generatedInsights: AIInsight[] = aiInsights.length > 0 ? aiInsights : generateInsights(session);

  function generateInsights(sessionData: SessionMetrics): AIInsight[] {
    const insights: AIInsight[] = [];

    // Strength identification
    if (sessionData.accuracy >= 85) {
      insights.push({
        type: 'strength',
        title: 'Excelente Precisão!',
        description: `Você acertou ${sessionData.accuracy.toFixed(0)}% das tentativas. Continue praticando para manter esse nível.`,
        actionable: true
      });
    }

    if (sessionData.reactionTimeAvg && sessionData.reactionTimeAvg < 1000) {
      insights.push({
        type: 'strength',
        title: 'Velocidade de Processamento Acima da Média',
        description: `Seu tempo de reação médio foi de ${sessionData.reactionTimeAvg}ms, indicando ótima velocidade cognitiva.`,
        actionable: false
      });
    }

    // Improvement areas
    if (sessionData.accuracy < 60) {
      insights.push({
        type: 'improvement',
        title: 'Precisão Precisa de Atenção',
        description: 'Pratique mais vezes este jogo em um nível mais fácil para fortalecer os fundamentos.',
        actionable: true
      });
    }

    if (sessionData.hintsUsed && sessionData.hintsUsed > 3) {
      insights.push({
        type: 'improvement',
        title: 'Trabalhar Autonomia',
        description: `Você usou ${sessionData.hintsUsed} dicas. Tente completar a próxima sessão com menos ajuda.`,
        actionable: true
      });
    }

    if (sessionData.timeSpent > 600) {
      insights.push({
        type: 'improvement',
        title: 'Atenção Sustentada',
        description: 'Sessões mais curtas (5-10 minutos) podem ajudar a manter o foco.',
        actionable: true
      });
    }

    // Recommendations
    if (sessionData.accuracy >= 85 && sessionData.reactionTimeAvg && sessionData.reactionTimeAvg < 1500) {
      insights.push({
        type: 'recommendation',
        title: 'Pronto para Avançar!',
        description: 'Seu desempenho excelente indica que você pode tentar um nível de dificuldade maior.',
        actionable: true
      });
    } else if (sessionData.accuracy >= 70 && sessionData.accuracy < 85) {
      insights.push({
        type: 'recommendation',
        title: 'Continue Praticando Este Nível',
        description: 'Você está progredindo bem. Mais algumas sessões e estará pronto para o próximo desafio.',
        actionable: false
      });
    }

    return insights;
  }
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { label: "Excelente", color: "text-primary", bg: "bg-primary/10" };
    if (accuracy >= 75) return { label: "Muito Bom", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (accuracy >= 60) return { label: "Bom", color: "text-green-500", bg: "bg-green-500/10" };
    return { label: "Em Progresso", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  };

  const performance = getPerformanceLevel(session.accuracy);

  const radarData = cognitiveMetrics ? [
    { skill: "Atenção", value: cognitiveMetrics.attention },
    { skill: "Memória", value: cognitiveMetrics.memory },
    { skill: "Flexibilidade", value: cognitiveMetrics.flexibility },
    { skill: "Processamento", value: cognitiveMetrics.processing },
    { skill: "Inibição", value: cognitiveMetrics.inhibition }
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Performance */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <Trophy className="w-16 h-16 text-primary animate-bounce" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">{gameTitle}</CardTitle>
            <CardDescription className="text-lg">Sessão Completa!</CardDescription>
          </div>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className={cn("text-lg px-4 py-2", performance.bg, performance.color)}>
              {performance.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-card border">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{session.score}</div>
              <div className="text-sm text-muted-foreground">Pontuação</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card border">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{session.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card border">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatTime(session.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Tempo</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card border">
              <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">Nível {session.level}</div>
              <div className="text-sm text-muted-foreground">Dificuldade</div>
            </div>
          </div>

          {session.reactionTimeAvg && (
            <div className="mt-4 p-4 rounded-lg bg-accent/50 border border-accent">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-semibold">Tempo de Reação Médio:</span>
                <span className="text-lg font-bold">{session.reactionTimeAvg}ms</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs com detalhes */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">
            <Brain className="w-4 h-4 mr-2" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Star className="w-4 h-4 mr-2" />
            Próximos Passos
          </TabsTrigger>
        </TabsList>

        {/* Análise */}
        <TabsContent value="analysis" className="space-y-4">
          {/* Comparações */}
          {comparisons && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Comparação de Performance
                </CardTitle>
                <CardDescription>
                  Veja como você se compara com outros jogadores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sua Faixa Etária (Média: {comparisons.yourAge.avg}%)</span>
                    <span className="font-semibold">Percentil {comparisons.yourAge.percentile}°</span>
                  </div>
                  <Progress value={comparisons.yourAge.percentile} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Todos os Usuários (Média: {comparisons.allUsers.avg}%)</span>
                    <span className="font-semibold">Percentil {comparisons.allUsers.percentile}°</span>
                  </div>
                  <Progress value={comparisons.allUsers.percentile} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métricas Cognitivas */}
          {cognitiveMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Habilidades Cognitivas
                </CardTitle>
                <CardDescription>
                  Radar das competências desenvolvidas nesta sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Performance" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Insights Terapêuticos Detalhados */}
          {therapeuticInsights.length > 0 && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Análise Terapêutica Detalhada
                </CardTitle>
                <CardDescription>
                  Insights clínicos baseados no desempenho e perfil cognitivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {therapeuticInsights.map((insight, index) => {
                  const severityColors = {
                    info: 'bg-blue-50 border-blue-500 dark:bg-blue-950/20',
                    concern: 'bg-orange-50 border-orange-500 dark:bg-orange-950/20',
                    alert: 'bg-red-50 border-red-500 dark:bg-red-950/20'
                  };
                  
                  const categoryIcons = {
                    cognitive: <Brain className="w-5 h-5" />,
                    emotional: <Activity className="w-5 h-5" />,
                    behavioral: <Users className="w-5 h-5" />,
                    developmental: <TrendingUp className="w-5 h-5" />
                  };

                  return (
                    <div 
                      key={index}
                      className={cn(
                        "p-4 rounded-lg border-l-4 animate-fade-in",
                        severityColors[insight.severity]
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="mt-0.5">
                          {categoryIcons[insight.category]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{insight.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {insight.category === 'cognitive' && 'Cognitivo'}
                              {insight.category === 'emotional' && 'Emocional'}
                              {insight.category === 'behavioral' && 'Comportamental'}
                              {insight.category === 'developmental' && 'Desenvolvimento'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.description}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-primary">Recomendações:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {insight.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Insights Acionáveis por IA */}
          {generatedInsights.length > 0 && therapeuticInsights.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Insights Inteligentes
                </CardTitle>
                <CardDescription>
                  Análise automática do seu desempenho com recomendações práticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {generatedInsights.map((insight, index) => {
                  const isStrength = insight.type === 'strength';
                  const isImprovement = insight.type === 'improvement';
                  const isRecommendation = insight.type === 'recommendation';
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border-l-4 animate-fade-in",
                        isStrength && "bg-green-50 border-green-500 dark:bg-green-950/20",
                        isImprovement && "bg-orange-50 border-orange-500 dark:bg-orange-950/20",
                        isRecommendation && "bg-blue-50 border-blue-500 dark:bg-blue-950/20"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="mt-0.5">
                        {isStrength && <Trophy className="w-5 h-5 text-green-600" />}
                        {isImprovement && <Target className="w-5 h-5 text-orange-600" />}
                        {isRecommendation && <TrendingUp className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm">{insight.title}</p>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.actionable && (
                          <Badge variant="secondary" className="text-xs mt-2">
                            Ação recomendada
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Legacy insights support */}
          {insights.length > 0 && generatedInsights.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Insights Educacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-accent animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mt-0.5">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm flex-1">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progresso Histórico */}
        <TabsContent value="progress" className="space-y-4">
          {evolutionTrend && (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tendência de Evolução</p>
                    <p className="text-2xl font-bold">
                      {evolutionTrend === 'improving' && '📈 Melhorando'}
                      {evolutionTrend === 'stable' && '➡️ Estável'}
                      {evolutionTrend === 'declining' && '📉 Atenção Necessária'}
                    </p>
                  </div>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    evolutionTrend === 'improving' && "bg-green-100 text-green-600",
                    evolutionTrend === 'stable' && "bg-blue-100 text-blue-600",
                    evolutionTrend === 'declining' && "bg-orange-100 text-orange-600"
                  )}>
                    {evolutionTrend === 'improving' && <TrendingUp className="w-6 h-6" />}
                    {evolutionTrend === 'stable' && <Activity className="w-6 h-6" />}
                    {evolutionTrend === 'declining' && <Target className="w-6 h-6" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {historicalData.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Evolução da Pontuação e Precisão
                  </CardTitle>
                  <CardDescription>
                    Suas últimas {historicalData.length} sessões
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Pontuação"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        name="Precisão (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {historicalData.some(d => 'reactionTime' in d) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Evolução do Tempo de Reação
                    </CardTitle>
                    <CardDescription>
                      Velocidade de processamento ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={historicalData.filter(d => 'reactionTime' in d)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--foreground))"
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="hsl(var(--foreground))"
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="reactionTime" 
                          stroke="hsl(var(--chart-3))" 
                          strokeWidth={2}
                          name="Tempo de Reação (ms)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Continue jogando para ver sua evolução ao longo do tempo
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recomendações */}
        <TabsContent value="recommendations" className="space-y-4">
          {nextSteps.length > 0 ? (
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <Card 
                  key={index}
                  className="hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {step.description}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={step.action}
                          className="gap-2"
                        >
                          Começar
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Parabéns! Continue explorando outros jogos
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onPlayAgain && (
          <Button 
            size="lg" 
            className="flex-1 gap-2" 
            onClick={onPlayAgain}
          >
            <Trophy className="w-5 h-5" />
            Jogar Novamente
          </Button>
        )}
        {onClose && (
          <Button 
            size="lg" 
            variant="outline" 
            className="flex-1 gap-2" 
            onClick={onClose}
          >
            Ver Outros Jogos
          </Button>
        )}
      </div>
    </div>
  );
};
