import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  Gamepad2,
  TrendingUp,
  Clock,
  Star,
  Users,
  Loader2
} from 'lucide-react';

interface AnalyticsData {
  routinesCompleted: number;
  storiesViewed: number;
  gamesPlayed: number;
  totalTimeMinutes: number;
  avgAccuracy: number;
  streak: number;
  favoriteActivity: string;
  weeklyProgress: { day: string; completed: number }[];
}

export default function SimpleAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    routinesCompleted: 0,
    storiesViewed: 0,
    gamesPlayed: 0,
    totalTimeMinutes: 0,
    avgAccuracy: 0,
    streak: 0,
    favoriteActivity: 'Jogos',
    weeklyProgress: [],
  });

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startDate = new Date();
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }

      // Get story progress
      const { data: storyProgress } = await supabase
        .from('story_progress')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString());

      // Get learning sessions (games)
      const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString());

      // Get gamification data
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Calculate metrics
      const storiesViewed = storyProgress?.length || 0;
      const gamesPlayed = sessions?.length || 0;
      const totalTimeSeconds = sessions?.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) || 0;
      
      const accuracies = sessions?.map(s => {
        const perfData = s.performance_data as Record<string, any> | null;
        return perfData?.accuracy ?? perfData?.score ?? null;
      }).filter((a): a is number => a !== null) || [];
      
      const avgAccuracy = accuracies.length > 0
        ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
        : 0;

      // Calculate weekly progress
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weeklyProgress = days.map((day, idx) => {
        const dayDate = new Date();
        dayDate.setDate(now.getDate() - (now.getDay() - idx));
        dayDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(dayDate);
        nextDay.setDate(dayDate.getDate() + 1);

        const dayActivities = [
          ...(storyProgress?.filter(s => {
            const d = new Date(s.created_at);
            return d >= dayDate && d < nextDay;
          }) || []),
          ...(sessions?.filter(s => {
            const d = new Date(s.created_at);
            return d >= dayDate && d < nextDay;
          }) || []),
        ];

        return { day, completed: dayActivities.length };
      });

      // Determine favorite activity
      let favoriteActivity = 'Jogos';
      if (storiesViewed > gamesPlayed) {
        favoriteActivity = 'Histórias';
      }

      setAnalytics({
        routinesCompleted: 0, // Would need routine_progress table
        storiesViewed,
        gamesPlayed,
        totalTimeMinutes: Math.round(totalTimeSeconds / 60),
        avgAccuracy,
        streak: gamification?.current_streak || 0,
        favoriteActivity,
        weeklyProgress,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxProgress = Math.max(...analytics.weeklyProgress.map(p => p.completed), 1);

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                Relatório de Progresso
              </h1>
              <p className="text-muted-foreground">
                Acompanhe o desempenho e engajamento
              </p>
            </div>
          </div>
          <Select value={period} onValueChange={(v: 'week' | 'month') => setPeriod(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-700">{analytics.routinesCompleted}</p>
              <p className="text-sm text-green-600">Rotinas Completas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-700">{analytics.storiesViewed}</p>
              <p className="text-sm text-blue-600">Histórias Lidas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Gamepad2 className="h-10 w-10 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-700">{analytics.gamesPlayed}</p>
              <p className="text-sm text-purple-600">Jogos Jogados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200">
            <CardContent className="p-6 text-center">
              <Clock className="h-10 w-10 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-700">{analytics.totalTimeMinutes}</p>
              <p className="text-sm text-amber-600">Minutos de Uso</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atividades na Semana
            </CardTitle>
            <CardDescription>
              Total de atividades completadas por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
              {analytics.weeklyProgress.map((day, idx) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary/20 rounded-t-lg transition-all relative"
                    style={{ 
                      height: `${(day.completed / maxProgress) * 100}%`,
                      minHeight: day.completed > 0 ? '20px' : '4px',
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-primary rounded-t-lg"
                      style={{ opacity: day.completed > 0 ? 1 : 0.3 }}
                    />
                    {day.completed > 0 && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-medium">
                        {day.completed}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Destaques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Dias Consecutivos</span>
                </div>
                <Badge className="bg-green-500">{analytics.streak} dias</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span>Precisão Média</span>
                </div>
                <Badge variant="outline">{analytics.avgAccuracy.toFixed(0)}%</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span>Atividade Favorita</span>
                </div>
                <Badge variant="secondary">{analytics.favoriteActivity}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.gamesPlayed === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Experimente jogar um jogo cognitivo hoje! Ajuda a desenvolver atenção e memória.
                  </p>
                </div>
              )}

              {analytics.storiesViewed === 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700">
                    📚 Que tal ler uma história social? Elas ajudam a entender situações do dia a dia.
                  </p>
                </div>
              )}

              {analytics.streak >= 3 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    🎉 Parabéns! {analytics.streak} dias seguidos! Continue assim!
                  </p>
                </div>
              )}

              {analytics.avgAccuracy >= 80 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    ⭐ Excelente precisão! Você pode tentar níveis mais difíceis.
                  </p>
                </div>
              )}

              {analytics.gamesPlayed === 0 && analytics.storiesViewed === 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    🌟 Comece sua jornada! Explore as histórias e jogos disponíveis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernPageLayout>
  );
}
