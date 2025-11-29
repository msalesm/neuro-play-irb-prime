import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCooperativeActivities } from '@/hooks/useCooperativeActivities';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Clock, Heart, Trophy, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Map real activities with completion status
  const activities: CooperativeActivity[] = realActivities.map(activity => ({
    ...activity,
    completed: isActivityCompleted(activity.game_id),
    stars: isActivityCompleted(activity.game_id) ? getActivityStars(activity.game_id) : undefined
  }));

  const startActivity = async (gameId: string, gameName: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para jogar');
      return;
    }

    toast.success('🎮 Modo Teste - Iniciando atividade cooperativa');
    
    // Navigate directly to the game in test mode
    if (gameName.includes('Quebra-Cabeça')) {
      navigate(`/games/cooperative-puzzle`);
    } else {
      navigate(`/games/social-scenarios`);
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Atividades Parent-Child</h1>
            <Badge variant="secondary" className="text-xs">
              🎮 Modo Teste Ativo
            </Badge>
          </div>
          <p className="text-muted-foreground">Jogos cooperativos disponíveis para todos os usuários em modo teste</p>
        </div>
        
        <div className="space-y-6">
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
