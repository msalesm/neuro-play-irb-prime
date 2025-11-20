import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Calendar, TrendingUp, Brain, Heart, Users, Activity, AlertTriangle, Plus, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DuolingoStreak } from "@/components/DuolingoStreak";

interface UserStats {
  total_stars: number;
  level: number;
  experience_points: number;
  current_streak: number;
  longest_streak: number;
  total_sessions?: number;
  total_score?: number;
  avg_accuracy?: number;
}

interface RecentActivity {
  activity_type: string;
  created_at: string;
  topic_name?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentActivities();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Get gamification stats
      const { data: gamificationData, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (gamificationError) throw gamificationError;
      
      // Get child profiles for this parent
      const { data: profiles } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', user?.id);

      const profileIds = profiles?.map(p => p.id) || [];

      // Get real game session stats
      let totalSessions = 0;
      let totalScore = 0;
      let avgAccuracy = 0;

      if (profileIds.length > 0) {
        const { data: sessions } = await supabase
          .from('game_sessions')
          .select('score, accuracy_percentage, completed')
          .in('child_profile_id', profileIds)
          .eq('completed', true);

        if (sessions && sessions.length > 0) {
          totalSessions = sessions.length;
          totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
          avgAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / sessions.length;
        }
      }

      const initialStats = gamificationData || {
        user_id: user?.id,
        total_stars: 0,
        level: 1,
        experience_points: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null
      };

      // Enhance with real data
      setStats({
        ...initialStats,
        total_sessions: totalSessions,
        total_score: totalScore,
        avg_accuracy: Math.round(avgAccuracy)
      });

      if (!gamificationData) {
        const { error: insertError } = await supabase
          .from('user_gamification')
          .insert(initialStats);

        if (insertError) {
          console.error('Error creating initial user stats:', insertError);
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({
        total_stars: 0,
        level: 1,
        experience_points: 0,
        current_streak: 0,
        longest_streak: 0,
        total_sessions: 0,
        total_score: 0,
        avg_accuracy: 0
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('activity_type, created_at, topic_name')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para acessar o dashboard, você precisa fazer login.
            </p>
            <Link to="/auth" className="text-primary hover:underline">
              Fazer Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nextLevelXP = (stats?.level || 1) * 100;
  const currentXP = stats?.experience_points || 0;
  const progressToNext = ((currentXP % 100) / 100) * 100;

  const gameCategories = [
    { name: 'Respiração', icon: Heart, color: 'text-green-600', played: 3 },
    { name: 'Foco', icon: Brain, color: 'text-blue-600', played: 5 },
    { name: 'Social', icon: Users, color: 'text-purple-600', played: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-12 pb-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-4 text-white">
              Olá, {user.user_metadata?.name || user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-xl text-white/70">
              Continue sua jornada de desenvolvimento pessoal
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              asChild
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <Link to="/games">
                <Plus className="w-4 h-4 mr-2" />
                Jogar Agora
              </Link>
            </Button>
          </div>
        </div>

        {/* Clinical Dashboard Card - Destaque Principal */}
        <Card className="mb-8 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-md border-purple-400/40 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  Painel Clínico
                </CardTitle>
                <p className="text-white/70 text-sm mt-1">
                  Análise comportamental e identificação de padrões diagnósticos
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg">
                Inteligência Artificial
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Análise Avançada com IA</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Complete os testes diagnósticos para gerar um relatório clínico detalhado. 
                    Nossa IA analisa padrões comportamentais para identificar características do TEA, TDAH e Dislexia.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-4 backdrop-blur-sm border border-red-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-300" />
                  </div>
                  <h4 className="font-semibold text-white text-sm">TDAH</h4>
                </div>
                <p className="text-white/70 text-xs">Teste de Atenção Sustentada</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg p-4 backdrop-blur-sm border border-indigo-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-indigo-300" />
                  </div>
                  <h4 className="font-semibold text-white text-sm">TEA</h4>
                </div>
                <p className="text-white/70 text-xs">Flexibilidade Cognitiva</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-lg p-4 backdrop-blur-sm border border-teal-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-teal-500/30 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-teal-300" />
                  </div>
                  <h4 className="font-semibold text-white text-sm">Dislexia</h4>
                </div>
                <p className="text-white/70 text-xs">Processamento Fonológico</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                asChild
              >
                <Link to="/clinical" className="flex items-center justify-center gap-2">
                  <Activity className="h-5 w-5" />
                  Acessar Painel Clínico Completo
                </Link>
              </Button>
              <Button 
                variant="outline"
                className="w-full mt-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
                asChild
              >
                <Link to="/learning" className="flex items-center justify-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Meu Aprendizado
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modern Streak Widget - Estilo Duolingo */}
        <div className="mb-8">
          <DuolingoStreak
            currentStreak={stats?.current_streak || 0}
            longestStreak={stats?.longest_streak || 0}
            streakGoal={7}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-50" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Nível Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">{stats?.level || 1}</div>
              <div className="space-y-2">
                <Progress value={progressToNext} className="h-2 bg-white/20" />
                <p className="text-xs text-white/60">
                  {currentXP % 100}/100 XP para próximo nível
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 opacity-50" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Estrelas Coletadas</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-yellow-400">{stats?.total_stars || 0}</div>
              <p className="text-xs text-white/60">
                Total de conquistas
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-50" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Experiência Total</CardTitle>
              <Trophy className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-purple-400">{stats?.experience_points || 0}</div>
              <p className="text-xs text-white/60">
                Pontos de experiência
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Game Categories */}
          <Card className="lg:col-span-2 backdrop-blur-sm bg-white/10 border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-50" />
            <CardHeader className="relative">
              <CardTitle className="text-white">Progresso por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              {gameCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{category.name}</h4>
                        <p className="text-sm text-white/70">
                          {category.played} jogos concluídos
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      Nível {Math.floor(category.played / 2) + 1}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50" />
            <CardHeader className="relative">
              <CardTitle className="text-white">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {activity.activity_type === 'game_completed' ? 'Jogo concluído' :
                           activity.activity_type === 'achievement_earned' ? 'Conquista desbloqueada' :
                           activity.activity_type}
                        </p>
                        {activity.topic_name && (
                          <p className="text-xs text-white/70">
                            {activity.topic_name}
                          </p>
                        )}
                        <p className="text-xs text-white/60">
                          {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/70 text-center py-4">
                  Nenhuma atividade recente.
                  <br />
                  <Link to="/games" className="text-purple-400 hover:underline">
                    Comece jogando agora!
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}