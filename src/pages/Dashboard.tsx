import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Calendar, TrendingUp, Brain, Heart, Users, Activity, AlertTriangle, Plus } from "lucide-react";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface UserStats {
  total_stars: number;
  level: number;
  experience_points: number;
  current_streak: number;
  longest_streak: number;
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
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Criar registro inicial para o usuário
        const initialStats = {
          user_id: user?.id,
          total_stars: 0,
          level: 1,
          experience_points: 0,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null
        };

        const { error: insertError } = await supabase
          .from('user_gamification')
          .insert(initialStats);

        if (insertError) {
          console.error('Error creating initial user stats:', insertError);
        }

        setStats(initialStats);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({
        total_stars: 0,
        level: 1,
        experience_points: 0,
        current_streak: 0,
        longest_streak: 0,
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
            <Button 
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <Link to="/clinical">
                <Brain className="w-4 h-4 mr-2" />
                Análise Clínica
              </Link>
            </Button>
          </div>
        </div>

        {/* Educational Dashboard Link */}
        <div className="mb-8 flex justify-center">
          <Button 
            variant="outline" 
            asChild
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            <Link to="/educational-dashboard">
              <Trophy className="w-4 h-4 mr-2" />
              Meu Aprendizado
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-50" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Sequência Atual</CardTitle>
              <Calendar className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-green-400">{stats?.current_streak || 0}</div>
              <p className="text-xs text-white/60">
                Dias consecutivos jogando
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-50" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Melhor Sequência</CardTitle>
              <Trophy className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-purple-400">{stats?.longest_streak || 0}</div>
              <p className="text-xs text-white/60">
                Recorde pessoal
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clinical Analysis Quick View */}
          <Card className="lg:col-span-3 backdrop-blur-sm bg-white/10 border-white/20 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center text-white">
                  <Brain className="w-5 h-5 mr-2" />
                  Análise Comportamental
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Link to="/clinical">Ver Completo</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <h4 className="font-semibold mb-1 text-white">Jogos Diagnósticos</h4>
                  <p className="text-sm text-white/70">Complete jogos para análise comportamental</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 bg-white/10 border-white/30 text-white hover:bg-white/20" 
                    asChild
                  >
                    <Link to="/games">Começar</Link>
                  </Button>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <h4 className="font-semibold mb-1 text-white">Padrões Identificados</h4>
                  <p className="text-sm text-white/70">Análise em tempo real dos seus resultados</p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                  <h4 className="font-semibold mb-1 text-white">Relatórios Automáticos</h4>
                  <p className="text-sm text-white/70">Relatórios detalhados baseados em IA</p>
                </div>
              </div>
            </CardContent>
          </Card>

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