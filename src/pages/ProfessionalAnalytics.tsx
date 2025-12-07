import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, Users, BookOpen, Gamepad2,
  ListChecks, Download, Calendar, Clock, Target,
  AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { toast } from 'sonner';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalyticsData {
  daily: any[];
  byContent: any[];
  engagement: any[];
  alerts: any[];
}

export default function ProfessionalAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    daily: [],
    byContent: [],
    engagement: [],
    alerts: []
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  useEffect(() => {
    loadAnalytics();
  }, [period, user]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);

      // Load user analytics
      const { data: userAnalytics } = await supabase
        .from('user_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date');

      // Load learning sessions
      const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Load story progress
      const { data: storyProgress } = await supabase
        .from('story_progress')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Load abandonment alerts
      const { data: alerts } = await supabase
        .from('abandonment_alerts')
        .select('*, children:child_id (name)')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      // Process data for charts
      const dailyData = processDaily(userAnalytics || [], sessions || [], storyProgress || []);
      const contentData = processContentData(sessions || [], storyProgress || []);
      const engagementData = processEngagement(userAnalytics || []);

      setAnalyticsData({
        daily: dailyData,
        byContent: contentData,
        engagement: engagementData,
        alerts: alerts || []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  const processDaily = (analytics: any[], sessions: any[], stories: any[]) => {
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const days = [];
    
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd/MM');
      
      const dayAnalytics = analytics.filter(a => a.date === dateStr);
      const daySessions = sessions.filter(s => 
        s.created_at.split('T')[0] === dateStr
      );
      const dayStories = stories.filter(s => 
        s.created_at?.split('T')[0] === dateStr
      );

      days.push({
        date: displayDate,
        jogos: daySessions.length,
        historias: dayStories.length,
        rotinas: dayAnalytics.reduce((sum, a) => sum + (a.routines_completed || 0), 0),
        engajamento: dayAnalytics.reduce((sum, a) => sum + (a.engagement_score || 0), 0) / Math.max(dayAnalytics.length, 1)
      });
    }
    
    return days;
  };

  const processContentData = (sessions: any[], stories: any[]) => {
    const gameTypes: Record<string, number> = {};
    sessions.forEach(s => {
      const type = s.game_type || 'Outros';
      gameTypes[type] = (gameTypes[type] || 0) + 1;
    });

    return Object.entries(gameTypes).map(([name, value]) => ({ name, value })).slice(0, 5);
  };

  const processEngagement = (analytics: any[]) => {
    const weeklyData: Record<string, number[]> = {};
    
    analytics.forEach(a => {
      const week = format(startOfWeek(new Date(a.date)), 'dd/MM');
      if (!weeklyData[week]) weeklyData[week] = [];
      weeklyData[week].push(a.engagement_score || 0);
    });

    return Object.entries(weeklyData).map(([week, scores]) => ({
      week,
      media: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100
    }));
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Data', 'Jogos', 'Histórias', 'Rotinas', 'Engajamento'].join(','),
      ...analyticsData.daily.map(d => 
        [d.date, d.jogos, d.historias, d.rotinas, d.engajamento.toFixed(2)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Relatório exportado!');
  };

  const totalGames = analyticsData.daily.reduce((sum, d) => sum + d.jogos, 0);
  const totalStories = analyticsData.daily.reduce((sum, d) => sum + d.historias, 0);
  const totalRoutines = analyticsData.daily.reduce((sum, d) => sum + d.rotinas, 0);
  const avgEngagement = analyticsData.daily.length > 0 
    ? analyticsData.daily.reduce((sum, d) => sum + d.engajamento, 0) / analyticsData.daily.length
    : 0;

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-4">Analytics Profissional</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Analytics Profissional</h1>
          <p className="text-white/70">Métricas detalhadas de engajamento e progresso</p>
        </div>
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalGames}</p>
                  <p className="text-sm text-muted-foreground">Jogos Jogados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStories}</p>
                  <p className="text-sm text-muted-foreground">Histórias Lidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ListChecks className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalRoutines}</p>
                  <p className="text-sm text-muted-foreground">Rotinas Completas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Engajamento Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Activity Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Atividade ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="jogos" stroke="#8884d8" name="Jogos" />
                    <Line type="monotone" dataKey="historias" stroke="#82ca9d" name="Histórias" />
                    <Line type="monotone" dataKey="rotinas" stroke="#ffc658" name="Rotinas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Content Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Distribuição por Tipo de Jogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.byContent}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.byContent.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement by Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Engajamento Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.engagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="media" fill="#8884d8" name="Engajamento Médio" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Abandonment Alerts */}
        {analyticsData.alerts.length > 0 && (
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Abandono
              </CardTitle>
              <CardDescription>
                Usuários que precisam de atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.alerts.map((alert: any) => (
                  <div 
                    key={alert.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                      >
                        {alert.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{alert.children?.name || 'Usuário'}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.days_inactive} dias inativo
                      </span>
                      <Button size="sm" variant="outline">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernPageLayout>
  );
}
