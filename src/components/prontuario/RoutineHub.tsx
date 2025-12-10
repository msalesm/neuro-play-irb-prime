import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Activity, Brain, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useRoutineData } from '@/hooks/useRoutineData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RoutineHubProps {
  childId: string;
}

const MOOD_COLORS: Record<string, string> = {
  feliz: 'hsl(var(--chart-1))',
  calmo: 'hsl(var(--chart-2))',
  neutro: 'hsl(var(--chart-3))',
  ansioso: 'hsl(var(--chart-4))',
  triste: 'hsl(var(--chart-5))'
};

export const RoutineHub = ({ childId }: RoutineHubProps) => {
  const { data, isLoading } = useRoutineData(childId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const moodData = Object.entries(data.moodDistribution).map(([name, value]) => ({
    name,
    value,
    color: MOOD_COLORS[name] || 'hsl(var(--muted))'
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Hub da Rotina Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sleep Card */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Sono Médio</span>
                </div>
                <div className="text-2xl font-bold">{data.avgSleepHours}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Impacto no desempenho: {(data.sleepImpact * 100).toFixed(0)}%
                </p>
              </CardContent>
            </Card>

            {/* Stress Card */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Nível de Estresse</span>
                </div>
                <div className="text-2xl font-bold">{data.avgStressLevel.toFixed(1)}/5</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.avgStressLevel > 3 ? 'Acima do ideal' : 'Dentro do esperado'}
                </p>
              </CardContent>
            </Card>

            {/* Mood Distribution */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Distribuição de Humor</span>
                </div>
                {moodData.length > 0 ? (
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={35}
                          dataKey="value"
                        >
                          {moodData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem dados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Insights de Correlação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.insights.length > 0 ? (
            <div className="space-y-3">
              {data.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {insight.type === 'positive' ? (
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : insight.type === 'negative' ? (
                    <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{insight.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {insight.factor}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Correlação: {(insight.correlation * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Registre mais dados de rotina para gerar insights
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
