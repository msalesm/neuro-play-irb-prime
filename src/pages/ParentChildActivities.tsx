import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCooperativeActivities } from '@/hooks/useCooperativeActivities';
import { useBondingMetrics } from '@/hooks/useBondingMetrics';
import { useCooperativeRecommendations } from '@/hooks/useCooperativeRecommendations';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Users, Clock, Trophy, Star, Sparkles, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface CooperativeActivity {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  ageRange: string;
  bondingFocus: string;
  difficulty: number;
  completed: boolean;
  stars?: number;
}

export default function ParentChildActivities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    activities: realActivities, 
    loading, 
    isActivityCompleted, 
    getActivityStars 
  } = useCooperativeActivities(user?.id);
  
  const { metrics, loading: metricsLoading } = useBondingMetrics(user?.id);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const { recommendations } = useCooperativeRecommendations(user?.id, selectedChild || undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSelectedChild();
  }, [user]);

  const loadSelectedChild = async () => {
    if (!user) return;
    
    const { data: children } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('parent_user_id', user.id)
      .limit(1);

    if (children && children.length > 0) {
      setSelectedChild(children[0].id);
    }
  };

  // Map real activities with completion status
  const activities: CooperativeActivity[] = realActivities.map(activity => ({
    ...activity,
    completed: isActivityCompleted(activity.game_id),
    stars: isActivityCompleted(activity.game_id) ? getActivityStars(activity.game_id) : undefined
  }));

  // Fallback mock data if no real activities
  useEffect(() => {
    if (!loading && activities.length === 0) {
      // Show message that activities will be available soon
    }
  }, [loading, activities.length]);

  const startActivity = async (gameId: string, gameName: string) => {
    if (!selectedChild) {
      toast.error('Nenhum perfil de criança selecionado');
      return;
    }

    toast.loading('Criando sala cooperativa...');
    
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: session, error } = await supabase
        .from('cooperative_sessions')
        .insert({
          session_code: code,
          game_id: gameId,
          host_profile_id: selectedChild,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      toast.dismiss();
      toast.success('Sala criada!', {
        description: `Código: ${code}`
      });

      // Navigate to the specific game
      if (gameName.includes('Quebra-Cabeça')) {
        navigate(`/games/cooperative-puzzle?session=${session.id}`);
      } else {
        navigate(`/games/social-scenarios?session=${session.id}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.dismiss();
      toast.error('Erro ao criar sala cooperativa');
    }
  };

  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : activities.filter(a => a.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(activities.map(a => a.category)))];

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Atividades Parent-Child</h1>
          <p className="text-muted-foreground">Jogos cooperativos para fortalecer o vínculo entre pais e filhos</p>
        </div>
        
        <div className="space-y-6">
        {/* Bonding Metrics Dashboard */}
        {metrics && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Qualidade do Vínculo Parent-Child
              </CardTitle>
              <CardDescription>
                Métricas baseadas em {metrics.totalActivitiesCompleted} atividades cooperativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Qualidade Geral</span>
                    <span className="text-2xl font-bold text-red-500">{metrics.qualityScore}%</span>
                  </div>
                  <Progress value={metrics.qualityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Colaboração</span>
                    <span className="text-2xl font-bold text-blue-500">{metrics.collaborationRate}%</span>
                  </div>
                  <Progress value={metrics.collaborationRate} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Comunicação</span>
                    <span className="text-2xl font-bold text-green-500">{metrics.communicationScore}%</span>
                  </div>
                  <Progress value={metrics.communicationScore} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{metrics.totalActivitiesCompleted}</div>
                  <div className="text-xs text-muted-foreground">Atividades</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{metrics.totalTimeSpent}m</div>
                  <div className="text-xs text-muted-foreground">Tempo Junto</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{metrics.averageDuration}m</div>
                  <div className="text-xs text-muted-foreground">Duração Média</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    {metrics.recentTrend === 'improving' && <TrendingUp className="w-5 h-5 text-green-500" />}
                    <span className={
                      metrics.recentTrend === 'improving' ? 'text-green-500' :
                      metrics.recentTrend === 'declining' ? 'text-red-500' : 'text-blue-500'
                    }>
                      {metrics.recentTrend === 'improving' ? '+' : metrics.recentTrend === 'declining' ? '-' : '='}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Tendência</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1">
                    {metrics.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Áreas de Melhoria
                  </h4>
                  <ul className="space-y-1">
                    {metrics.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-500">→</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Recomendações Personalizadas
              </CardTitle>
              <CardDescription>
                Atividades selecionadas especialmente para o perfil do seu filho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' : 
                          rec.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {rec.priority === 'high' ? '🔥 Alta' : 
                           rec.priority === 'medium' ? '⭐ Média' : '💡 Baixa'}
                        </Badge>
                        <span className="font-semibold">{rec.gameName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rec.estimatedDuration}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {rec.bondingFocus}
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => startActivity(rec.gameId, rec.gameName)}
                      size="sm"
                    >
                      Iniciar
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map(activity => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1">{activity.name}</CardTitle>
                    <CardDescription className="text-xs">{activity.category}</CardDescription>
                  </div>
                  {activity.completed && (
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      {activity.stars && (
                        <span className="flex gap-0.5">
                          {Array.from({ length: activity.stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </span>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{activity.duration} minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{activity.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span>{activity.bondingFocus}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < activity.difficulty ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => startActivity(activity.id, activity.name)}
                    disabled={activity.completed}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {activity.completed ? 'Completado' : 'Iniciar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </ModernPageLayout>
  );
}
