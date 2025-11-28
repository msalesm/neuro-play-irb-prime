import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, TrendingUp, Award, Calendar, Download, 
  ArrowLeft, Heart, Target, Sparkles, Activity,
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  profile?: string;
  avatar_url?: string;
}

interface SessionData {
  id: string;
  game_type: string;
  duration: number;
  score: number;
  created_at: string;
  performance_data: any;
}

interface CognitiveScores {
  attention: number;
  memory: number;
  language: number;
  logic: number;
  emotion: number;
  coordination: number;
}

export default function DashboardPais() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [cognitiveScores, setCognitiveScores] = useState<CognitiveScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      // Load children from children table
      const { data: childrenData, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user?.id);

      if (error) throw error;

      if (childrenData && childrenData.length > 0) {
        const childProfiles: ChildProfile[] = childrenData.map((child: any) => {
          // Calculate age from birth_date
          let calculatedAge = 0;
          if (child.birth_date) {
            const birthDate = new Date(child.birth_date);
            const today = new Date();
            calculatedAge = today.getFullYear() - birthDate.getFullYear();
          }

          return {
            id: child.id,
            name: child.name || 'Sem nome',
            age: calculatedAge,
            profile: undefined,
            avatar_url: child.avatar_url
          };
        });
        setChildren(childProfiles);
        setSelectedChild(childProfiles[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Erro ao carregar perfis');
    }
  };

  const loadChildData = async (childId: string) => {
    setLoading(true);
    try {
      // Load sessions from game_sessions table (real data)
      const { data: gameSessionsData, error: gameSessionsError } = await supabase
        .from('game_sessions')
        .select(`
          id,
          game_id,
          score,
          accuracy_percentage,
          avg_reaction_time_ms,
          duration_seconds,
          created_at,
          completed,
          session_data,
          cognitive_games (
            name,
            game_id
          )
        `)
        .eq('child_profile_id', childId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (gameSessionsError) {
        console.error('Error loading game sessions:', gameSessionsError);
      }
      
      // Transform game sessions to match SessionData interface
      const transformedSessions: SessionData[] = (gameSessionsData || []).map((session: any) => ({
        id: session.id,
        game_type: session.cognitive_games?.name || session.cognitive_games?.game_id || 'Jogo',
        duration: session.duration_seconds || 0,
        score: session.score || 0,
        created_at: session.created_at,
        performance_data: {
          score: session.score,
          accuracy: session.accuracy_percentage,
          reactionTime: session.avg_reaction_time_ms,
          ...session.session_data
        }
      }));
      
      setSessions(transformedSessions);

      // Calculate cognitive scores from real session data
      if (transformedSessions.length > 0) {
        const domainScores: Record<string, number[]> = {
          attention: [],
          memory: [],
          language: [],
          logic: [],
          emotion: [],
          coordination: []
        };

        transformedSessions.forEach(session => {
          const accuracy = session.performance_data?.accuracy || 0;
          const gameType = session.game_type.toLowerCase();
          
          // Map game types to cognitive domains
          if (gameType.includes('atenção') || gameType.includes('foco') || gameType.includes('attention')) {
            domainScores.attention.push(accuracy);
          }
          if (gameType.includes('memória') || gameType.includes('memory')) {
            domainScores.memory.push(accuracy);
          }
          if (gameType.includes('linguagem') || gameType.includes('leitura') || gameType.includes('language') || gameType.includes('phonological')) {
            domainScores.language.push(accuracy);
          }
          if (gameType.includes('lógica') || gameType.includes('raciocínio') || gameType.includes('logic') || gameType.includes('executive')) {
            domainScores.logic.push(accuracy);
          }
          if (gameType.includes('emoção') || gameType.includes('social') || gameType.includes('emotion')) {
            domainScores.emotion.push(accuracy);
          }
          if (gameType.includes('coordenação') || gameType.includes('motor') || gameType.includes('spatial')) {
            domainScores.coordination.push(accuracy);
          }
        });

        // Calculate averages
        const scores: CognitiveScores = {
          attention: domainScores.attention.length > 0
            ? Math.round(domainScores.attention.reduce((a, b) => a + b, 0) / domainScores.attention.length)
            : 0,
          memory: domainScores.memory.length > 0
            ? Math.round(domainScores.memory.reduce((a, b) => a + b, 0) / domainScores.memory.length)
            : 0,
          language: domainScores.language.length > 0
            ? Math.round(domainScores.language.reduce((a, b) => a + b, 0) / domainScores.language.length)
            : 0,
          logic: domainScores.logic.length > 0
            ? Math.round(domainScores.logic.reduce((a, b) => a + b, 0) / domainScores.logic.length)
            : 0,
          emotion: domainScores.emotion.length > 0
            ? Math.round(domainScores.emotion.reduce((a, b) => a + b, 0) / domainScores.emotion.length)
            : 0,
          coordination: domainScores.coordination.length > 0
            ? Math.round(domainScores.coordination.reduce((a, b) => a + b, 0) / domainScores.coordination.length)
            : 0
        };

        setCognitiveScores(scores);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedChild) return;

    try {
      toast.info('Gerando relatório clínico...');
      
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          userId: selectedChild,
          startDate,
          endDate,
          reportType: 'comprehensive'
        }
      });

      if (error) throw error;

      toast.success('Relatório gerado com sucesso!');
      // Could navigate to a report view page
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  const selectedChildData = children.find(c => c.id === selectedChild);
  const totalSessions = sessions.length;
  const avgScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length)
    : 0;
  const totalHours = Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600);

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dashboard da Família
          </h1>
          <p className="text-xl text-muted-foreground">
            Acompanhe o desenvolvimento e progresso do seu filho
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Child Selector */}
            {selectedChildData && (
              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <ChildAvatarDisplay
                      avatar={selectedChildData.avatar_url}
                      name={selectedChildData.name}
                      size="xl"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedChildData.name}</h2>
                      <p className="text-muted-foreground">
                        {selectedChildData.age} anos
                        {selectedChildData.profile && ` • ${selectedChildData.profile}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/avatar-evolution')}
                    >
                      ✨ Customizar Avatar
                    </Button>
                    <Button onClick={generateReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-primary" />
                  <span className="text-3xl font-bold">{totalSessions}</span>
                </div>
                <p className="text-sm text-muted-foreground">Sessões Completadas</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-secondary" />
                  <span className="text-3xl font-bold">{avgScore}</span>
                </div>
                <p className="text-sm text-muted-foreground">Pontuação Média</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-accent" />
                  <span className="text-3xl font-bold">{totalHours}h</span>
                </div>
                <p className="text-sm text-muted-foreground">Tempo de Prática</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <span className="text-3xl font-bold">+{Math.round(avgScore * 0.15)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Melhoria Geral</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary"
                  onClick={() => navigate('/sistema-planeta-azul')}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a1e35] to-[#005a70] flex items-center justify-center text-2xl">
                    🪐
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Sistema Planeta Azul</p>
                    <p className="text-xs text-muted-foreground">Explore universos terapêuticos</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-secondary/10 hover:border-secondary"
                  onClick={() => navigate('/games')}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Jogos Cognitivos</p>
                    <p className="text-xs text-muted-foreground">Praticar habilidades</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent/10 hover:border-accent"
                  onClick={() => navigate('/diagnostic-tests')}
                >
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Testes Diagnósticos</p>
                    <p className="text-xs text-muted-foreground">Avaliações completas</p>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="cognitive" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cognitive">Perfil Cognitivo</TabsTrigger>
                <TabsTrigger value="progress">Progresso</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="cognitive">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Perfil Cognitivo</h3>
                  {cognitiveScores ? (
                    <div className="space-y-6">
                      {Object.entries(cognitiveScores).map(([key, value]) => {
                        const labels: Record<string, string> = {
                          attention: 'Atenção e Foco',
                          memory: 'Memória',
                          language: 'Linguagem',
                          logic: 'Raciocínio Lógico',
                          emotion: 'Regulação Emocional',
                          coordination: 'Coordenação Motora'
                        };
                        return (
                          <div key={key}>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{labels[key]}</span>
                              <span className="text-muted-foreground">{value}/100</span>
                            </div>
                            <Progress value={value} className="h-3" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Complete mais sessões para visualizar o perfil cognitivo
                    </p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Evolução do Progresso</h3>
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-medium">{session.game_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{session.score || 0}</p>
                          <p className="text-sm text-muted-foreground">pontos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Histórico de Sessões</h3>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.game_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{session.score || 0} pts</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(session.duration / 60)} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </ModernPageLayout>
  );
}
