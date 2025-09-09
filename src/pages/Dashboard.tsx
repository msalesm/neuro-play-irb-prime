import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Calendar, TrendingUp, Brain, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";

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
      
      setStats(data || {
        total_stars: 0,
        level: 1,
        experience_points: 0,
        current_streak: 0,
        longest_streak: 0,
      });
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
    <div className="min-h-screen bg-gradient-card py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-4xl font-bold mb-4">
            Olá, {user.user_metadata?.name || user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Continue sua jornada de desenvolvimento pessoal
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.level || 1}</div>
              <div className="space-y-2">
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {currentXP % 100}/100 XP para próximo nível
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estrelas Coletadas</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.total_stars || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de conquistas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                Dias consecutivos jogando
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Melhor Sequência</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.longest_streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                Recorde pessoal
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Categories */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle>Progresso por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {gameCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.played} jogos concluídos
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Nível {Math.floor(category.played / 2) + 1}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium">
                          {activity.activity_type === 'game_completed' ? 'Jogo concluído' :
                           activity.activity_type === 'achievement_earned' ? 'Conquista desbloqueada' :
                           activity.activity_type}
                        </p>
                        {activity.topic_name && (
                          <p className="text-xs text-muted-foreground">
                            {activity.topic_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade recente.
                  <br />
                  <Link to="/games" className="text-primary hover:underline">
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