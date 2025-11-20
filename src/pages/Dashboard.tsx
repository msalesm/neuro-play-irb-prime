import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, TrendingUp, Brain, Heart, Users, Activity, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DuolingoStreak } from "@/components/DuolingoStreak";
import { AIRecommendations } from "@/components/AIRecommendations";
import { AchievementsList } from "@/components/AchievementsList";
import { TemporalEvolutionCharts } from "@/components/TemporalEvolutionCharts";

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
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstChildProfileId, setFirstChildProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentActivities();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const { data: gamificationData, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (gamificationError) throw gamificationError;
      
      const { data: profiles } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', user?.id);

      const profileIds = profiles?.map(p => p.id) || [];
      
      if (profiles && profiles.length > 0) {
        setFirstChildProfileId(profiles[0].id);
      }

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

        if (insertError) console.error('Error creating gamification:', insertError);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentXP = (stats?.experience_points || 0) % 100;
  const progressToNext = (currentXP / 100) * 100;

  const gameCategories = [
    { name: "Atenção", progress: 45, icon: Heart, color: "text-red-500" },
    { name: "Memória", progress: 60, icon: Brain, color: "text-blue-500" },
    { name: "Linguagem", progress: 35, icon: Users, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 pb-24">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Card */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  Bem-vindo de volta! 👋
                </CardTitle>
                <p className="text-white/80">
                  Continue sua jornada de aprendizado
                </p>
              </div>
              <Button variant="secondary" asChild>
                <Link to="/profile">
                  <Users className="w-4 h-4 mr-2" />
                  Perfil
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
              {stats && stats.total_sessions && stats.total_sessions > 0 && (
                <Badge variant="secondary">
                  {stats.total_sessions} sessões completadas
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="default" size="lg" className="h-24" asChild>
                <Link to="/games">
                  <div className="text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <div>Jogar Agora</div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-24 bg-card/50 border-border text-foreground hover:bg-accent" asChild>
                <Link to="/diagnostico-completo">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <div>Avaliação</div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-24 bg-card/50 border-border text-foreground hover:bg-accent" asChild>
                <Link to="/learning">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2" />
                    <div>Conquistas</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DuolingoStreak
          currentStreak={stats?.current_streak || 0}
          longestStreak={stats?.longest_streak || 0}
          streakGoal={7}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all">
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

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 opacity-50" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Estrelas</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-yellow-400">{stats?.total_stars || 0}</div>
              <p className="text-xs text-white/60">Conquistas</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-50" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Experiência</CardTitle>
              <Trophy className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-purple-400">{stats?.experience_points || 0}</div>
              <p className="text-xs text-white/60">Pontos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-white/10 ${category.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-white">{category.name}</span>
                          <span className="text-sm text-white/70">{category.progress}%</span>
                        </div>
                        <Progress value={category.progress} className="h-2 bg-white/20" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

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
                          <p className="text-xs text-white/70">{activity.topic_name}</p>
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

        {firstChildProfileId && (
          <div className="space-y-6">
            <AIRecommendations 
              childProfileId={firstChildProfileId}
              onGameSelect={() => navigate('/games')}
            />
            
            <AchievementsList userId={user?.id || ''} />
            
            <TemporalEvolutionCharts 
              childProfileId={firstChildProfileId}
              timeRange="month"
            />
          </div>
        )}
      </div>
    </div>
  );
}
