import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { TrendingUp, Brain, Target, Zap, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TemporalData {
  date: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  sessionsCount: number;
}

interface TemporalEvolutionChartsProps {
  childProfileId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

export function TemporalEvolutionCharts({
  childProfileId,
  timeRange = 'month'
}: TemporalEvolutionChartsProps) {
  const [data, setData] = useState<TemporalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(timeRange);

  useEffect(() => {
    fetchTemporalData();
  }, [childProfileId, selectedRange]);

  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    const days = ranges[selectedRange];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return startDate.toISOString();
  };

  const fetchTemporalData = async () => {
    try {
      setLoading(true);
      const startDate = getDateRange();

      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select('completed_at, score, accuracy_percentage, avg_reaction_time_ms')
        .eq('child_profile_id', childProfileId)
        .eq('completed', true)
        .gte('completed_at', startDate)
        .order('completed_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData = sessions?.reduce((acc, session) => {
        const date = new Date(session.completed_at!).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });

        if (!acc[date]) {
          acc[date] = {
            date,
            totalScore: 0,
            totalAccuracy: 0,
            totalReactionTime: 0,
            count: 0
          };
        }

        acc[date].totalScore += session.score || 0;
        acc[date].totalAccuracy += session.accuracy_percentage || 0;
        acc[date].totalReactionTime += session.avg_reaction_time_ms || 0;
        acc[date].count += 1;

        return acc;
      }, {} as Record<string, any>);

      // Calculate averages
      const temporalData: TemporalData[] = Object.values(groupedData || {}).map((item: any) => ({
        date: item.date,
        score: Math.round(item.totalScore / item.count),
        accuracy: Math.round(item.totalAccuracy / item.count),
        reactionTime: Math.round(item.totalReactionTime / item.count),
        sessionsCount: item.count
      }));

      setData(temporalData);
    } catch (error) {
      console.error('Error fetching temporal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (metric: 'score' | 'accuracy' | 'reactionTime') => {
    if (data.length < 2) return 0;
    const firstValue = data[0][metric];
    const lastValue = data[data.length - 1][metric];
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600';
    if (trend < -5) return 'text-red-600';
    return 'text-yellow-600';
  };

  const scoreTrend = calculateTrend('score');
  const accuracyTrend = calculateTrend('accuracy');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evolução Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Carregando dados...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evolução Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground">
              Dados insuficientes para o período selecionado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução Temporal
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso ao longo do tempo
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <Badge
                key={range}
                variant={selectedRange === range ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedRange(range)}
              >
                {range === 'week' ? '7d' : range === 'month' ? '30d' : range === 'quarter' ? '90d' : '1a'}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tendência de Pontuação</p>
                  <p className={`text-2xl font-bold ${getTrendColor(scoreTrend)}`}>
                    {scoreTrend > 0 ? '+' : ''}{scoreTrend.toFixed(1)}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tendência de Precisão</p>
                  <p className={`text-2xl font-bold ${getTrendColor(accuracyTrend)}`}>
                    {accuracyTrend > 0 ? '+' : ''}{accuracyTrend.toFixed(1)}%
                  </p>
                </div>
                <Brain className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Sessões</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {data.reduce((sum, d) => sum + d.sessionsCount, 0)}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="accuracy">Precisão</TabsTrigger>
            <TabsTrigger value="speed">Velocidade</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Pontuação"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="accuracy" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Precisão (%)"
                  stroke="hsl(142 71% 45%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(142 71% 45%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="speed" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="reactionTime"
                  name="Tempo de Reação (ms)"
                  fill="hsl(280 65% 60%)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
