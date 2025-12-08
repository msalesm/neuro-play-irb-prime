import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, BookOpen, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface InstitutionProgressTabProps {
  institutionId: string;
}

interface ProgressData {
  weeklyActivity: { day: string; sessions: number; stories: number }[];
  monthlyTrend: { month: string; users: number; sessions: number }[];
  topGames: { name: string; plays: number }[];
  completionRate: number;
  avgSessionDuration: number;
}

export function InstitutionProgressTab({ institutionId }: InstitutionProgressTabProps) {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData>({
    weeklyActivity: [
      { day: 'Seg', sessions: 45, stories: 12 },
      { day: 'Ter', sessions: 52, stories: 18 },
      { day: 'Qua', sessions: 38, stories: 15 },
      { day: 'Qui', sessions: 61, stories: 22 },
      { day: 'Sex', sessions: 55, stories: 19 },
      { day: 'Sáb', sessions: 32, stories: 8 },
      { day: 'Dom', sessions: 28, stories: 5 }
    ],
    monthlyTrend: [
      { month: 'Jan', users: 45, sessions: 320 },
      { month: 'Fev', users: 52, sessions: 410 },
      { month: 'Mar', users: 58, sessions: 485 },
      { month: 'Abr', users: 65, sessions: 520 },
      { month: 'Mai', users: 72, sessions: 610 },
      { month: 'Jun', users: 78, sessions: 680 }
    ],
    topGames: [
      { name: 'Torre Perfeita', plays: 245 },
      { name: 'Sequência Cósmica', plays: 198 },
      { name: 'Crystal Match', plays: 156 },
      { name: 'Foco Floresta', plays: 134 },
      { name: 'Memória Visual', plays: 112 }
    ],
    completionRate: 85,
    avgSessionDuration: 12
  });

  useEffect(() => {
    // In a real implementation, fetch data from Supabase based on institutionId
    setLoading(false);
  }, [institutionId, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Visão Geral do Progresso
        </h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{data.completionRate}%</p>
            <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500">{data.avgSessionDuration}min</p>
            <p className="text-sm text-muted-foreground">Duração Média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">127</p>
            <p className="text-sm text-muted-foreground">Histórias Lidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">458</p>
            <p className="text-sm text-muted-foreground">Jogos Completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade Semanal</CardTitle>
            <CardDescription>Sessões e histórias por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessões" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stories" fill="hsl(var(--chart-2))" name="Histórias" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendência Mensal</CardTitle>
            <CardDescription>Crescimento de usuários e sessões</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Usuários"
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Sessões"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Games */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Jogos Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topGames.map((game, index) => (
              <div key={game.name} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{game.name}</span>
                    <span className="text-muted-foreground">{game.plays} jogadas</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(game.plays / data.topGames[0].plays) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
