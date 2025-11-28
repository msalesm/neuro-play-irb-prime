import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Users, Clock, Trophy, Star } from 'lucide-react';
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
  const [activities, setActivities] = useState<CooperativeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Mock activities for now - will be replaced with real data
      const mockActivities: CooperativeActivity[] = [
        {
          id: '1',
          name: 'Construção Cooperativa',
          description: 'Construam juntos estruturas usando blocos virtuais, desenvolvendo comunicação e trabalho em equipe.',
          category: 'Criatividade',
          duration: 15,
          ageRange: '5-10 anos',
          bondingFocus: 'Comunicação e colaboração',
          difficulty: 2,
          completed: false
        },
        {
          id: '2',
          name: 'Caça ao Tesouro Emocional',
          description: 'Explorem juntos um mapa emocional, identificando e nomeando sentimentos ao longo do caminho.',
          category: 'Emocional',
          duration: 20,
          ageRange: '6-12 anos',
          bondingFocus: 'Inteligência emocional e expressão',
          difficulty: 3,
          completed: true,
          stars: 5
        },
        {
          id: '3',
          name: 'Ritmo em Dupla',
          description: 'Criem padrões rítmicos juntos, alternando turnos e sincronizando movimentos.',
          category: 'Musical',
          duration: 10,
          ageRange: '5-15 anos',
          bondingFocus: 'Sincronização e atenção compartilhada',
          difficulty: 1,
          completed: false
        },
        {
          id: '4',
          name: 'Histórias Compartilhadas',
          description: 'Construam uma história colaborativa, alternando quem adiciona cada parte da narrativa.',
          category: 'Linguagem',
          duration: 20,
          ageRange: '7-14 anos',
          bondingFocus: 'Criatividade narrativa e escuta ativa',
          difficulty: 2,
          completed: false
        },
        {
          id: '5',
          name: 'Desafio de Memória Cooperativa',
          description: 'Trabalhem juntos para lembrar sequências cada vez mais longas, apoiando um ao outro.',
          category: 'Cognitivo',
          duration: 15,
          ageRange: '6-12 anos',
          bondingFocus: 'Suporte mútuo e celebração de conquistas',
          difficulty: 3,
          completed: false
        },
        {
          id: '6',
          name: 'Quebra-Cabeça em Dupla',
          description: 'Resolvam quebra-cabeças complexos juntos, cada um controlando metade das peças.',
          category: 'Lógica',
          duration: 25,
          ageRange: '8-16 anos',
          bondingFocus: 'Paciência e resolução conjunta de problemas',
          difficulty: 4,
          completed: true,
          stars: 4
        }
      ];

      setActivities(mockActivities);
    } catch (error: any) {
      console.error('Error loading activities:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const startActivity = (activityId: string) => {
    toast.success('Iniciando atividade cooperativa...', {
      description: 'Preparando ambiente para você e seu filho'
    });
    // Navigate to cooperative game session
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
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades Disponíveis</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.completed).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.completed).reduce((sum, a) => sum + a.duration, 0)} min
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualidade do Vínculo</CardTitle>
              <Heart className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">Excelente</p>
            </CardContent>
          </Card>
        </div>

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
                    onClick={() => startActivity(activity.id)}
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
