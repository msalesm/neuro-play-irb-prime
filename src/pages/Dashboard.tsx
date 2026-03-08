import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, TrendingUp, Brain, Heart, Users, Activity, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DuolingoStreak, AchievementsList } from '@/components/gamification';
import { SmartInsightsPanel } from '@/components/ai';
import { DashboardSkeleton } from '@/components/Loading';

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
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 pb-28">
        <DashboardSkeleton />
      </div>
    );
  }

  const currentXP = (stats?.experience_points || 0) % 100;
  const progressToNext = (currentXP / 100) * 100;

  const gameCategories = [
    { name: "Atenção", progress: Math.min(100, Math.round((stats?.avg_accuracy || 0) * 0.8)), icon: Heart, color: "text-destructive" },
    { name: "Memória", progress: Math.min(100, Math.round((stats?.avg_accuracy || 0) * 1.1)), icon: Brain, color: "text-info" },
    { name: "Linguagem", progress: Math.min(100, Math.round((stats?.avg_accuracy || 0) * 0.65)), icon: Users, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 pb-28">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Welcome Card */}
        <Card className="backdrop-blur-sm bg-card/80 border-border shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50" />
          <CardHeader className="relative pb-3 md:pb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-xl md:text-3xl font-bold text-foreground mb-1">
                  Bem-vindo de volta! 👋
                </CardTitle>
                <p className="text-muted-foreground text-sm md:text-lg">
                  Continue sua jornada de aprendizado
                </p>
              </div>
              <Button variant="secondary" asChild size="sm" className="shrink-0">
                <Link to="/profile">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <Card className="backdrop-blur-sm bg-card/60 border-border shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <CardHeader className="relative pb-2 md:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground text-lg">Ações Rápidas</CardTitle>
              {stats && stats.total_sessions && stats.total_sessions > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {stats.total_sessions} sessões
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <Button 
                variant="default" 
                className="h-16 md:h-24 shadow-md flex flex-col items-center justify-center gap-1" 
                asChild
              >
                <Link to="/games">
                  <Activity className="w-5 h-5 md:w-8 md:h-8" />
                  <span className="text-xs md:text-sm">Jogar</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 md:h-24 bg-card/50 border-border text-foreground hover:bg-accent flex flex-col items-center justify-center gap-1" 
                asChild
              >
                <Link to="/diagnostico-completo">
                  <AlertTriangle className="w-5 h-5 md:w-8 md:h-8" />
                  <span className="text-xs md:text-sm">Avaliação</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 md:h-24 bg-card/50 border-border text-foreground hover:bg-accent flex flex-col items-center justify-center gap-1" 
                asChild
              >
                <Link to="/learning-dashboard">
                  <Trophy className="w-5 h-5 md:w-8 md:h-8" />
                  <span className="text-xs md:text-sm">Conquistas</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DuolingoStreak />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card className="backdrop-blur-sm bg-card/40 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Nível</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-lg md:text-2xl font-bold text-foreground">{stats?.level || 1}</div>
              <Progress value={progressToNext} className="h-1.5 md:h-2 bg-muted mt-1" />
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                {currentXP % 100}/100 XP
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/40 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Estrelas</CardTitle>
              <Star className="h-3 w-3 md:h-4 md:w-4 text-warning" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-lg md:text-2xl font-bold text-warning">{stats?.total_stars || 0}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Conquistas</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/40 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">XP</CardTitle>
              <Trophy className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-lg md:text-2xl font-bold text-secondary">{stats?.experience_points || 0}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Pontos</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="lg:col-span-2 backdrop-blur-sm bg-card/50 border-border relative overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-primary/5" />
            <CardHeader className="relative pb-2 md:pb-4">
              <CardTitle className="text-foreground text-base md:text-lg">Progresso por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 relative">
              {gameCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className={`p-1.5 md:p-2 rounded-lg bg-muted ${category.color} shrink-0`}>
                      <Icon className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs md:text-sm font-medium text-foreground">{category.name}</span>
                        <span className="text-xs md:text-sm text-muted-foreground">{category.progress}%</span>
                      </div>
                      <Progress value={category.progress} className="h-1.5 md:h-2 bg-muted" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/40 border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5" />
            <CardHeader className="relative pb-2 md:pb-4">
              <CardTitle className="text-foreground text-sm md:text-base">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className="w-2 h-2 bg-gradient-to-r from-secondary to-primary rounded-full mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-medium text-foreground truncate">
                          {activity.activity_type === 'game_completed' ? 'Jogo concluído' :
                           activity.activity_type === 'achievement_earned' ? 'Conquista desbloqueada' :
                           activity.activity_type}
                        </p>
                        {activity.topic_name && (
                          <p className="text-[10px] md:text-xs text-muted-foreground truncate">{activity.topic_name}</p>
                        )}
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground text-center py-4">
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

        {firstChildProfileId && (
          <AchievementsList />
        )}
      </div>
    </div>
  );
}
