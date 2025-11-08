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

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  profile?: string;
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
      // For now, load user's own profile as the child
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (profile) {
        // Calculate age from date_of_birth if available
        let calculatedAge = 0;
        if (profile.date_of_birth) {
          const birthDate = new Date(profile.date_of_birth);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
        }

        const childProfile: ChildProfile = {
          id: profile.id,
          name: profile.name || 'Sem nome',
          age: calculatedAge,
          profile: undefined
        };
        setChildren([childProfile]);
        setSelectedChild(profile.id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Erro ao carregar perfis');
    }
  };

  const loadChildData = async (childId: string) => {
    setLoading(true);
    try {
      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', childId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;
      
      // Transform sessions data to match our interface
      const transformedSessions: SessionData[] = (sessionsData || []).map(session => ({
        id: session.id,
        game_type: session.game_type,
        duration: session.session_duration_seconds || 0,
        score: (session.performance_data as any)?.score || 0,
        created_at: session.created_at,
        performance_data: session.performance_data
      }));
      
      setSessions(transformedSessions);

      // Calculate cognitive scores from session performance data
      if (transformedSessions.length > 0) {
        const avgScores = {
          attention: 0,
          memory: 0,
          language: 0,
          logic: 0,
          emotion: 0,
          coordination: 0
        };

        // Simple scoring based on performance
        transformedSessions.forEach(session => {
          const perfData = session.performance_data as any;
          const accuracy = perfData?.accuracy || 0;
          
          // Map game types to cognitive domains
          if (session.game_type.includes('atencao') || session.game_type.includes('foco')) {
            avgScores.attention += accuracy;
          } else if (session.game_type.includes('memoria')) {
            avgScores.memory += accuracy;
          } else if (session.game_type.includes('linguagem') || session.game_type.includes('leitura')) {
            avgScores.language += accuracy;
          } else if (session.game_type.includes('logica') || session.game_type.includes('raciocinio')) {
            avgScores.logic += accuracy;
          } else if (session.game_type.includes('emocao') || session.game_type.includes('social')) {
            avgScores.emotion += accuracy;
          } else if (session.game_type.includes('coordenacao') || session.game_type.includes('motor')) {
            avgScores.coordination += accuracy;
          }
        });

        // Average and normalize to 0-100
        const sessionCount = transformedSessions.length;
        setCognitiveScores({
          attention: Math.min(100, Math.round((avgScores.attention / sessionCount) * 10)),
          memory: Math.min(100, Math.round((avgScores.memory / sessionCount) * 10)),
          language: Math.min(100, Math.round((avgScores.language / sessionCount) * 10)),
          logic: Math.min(100, Math.round((avgScores.logic / sessionCount) * 10)),
          emotion: Math.min(100, Math.round((avgScores.emotion / sessionCount) * 10)),
          coordination: Math.min(100, Math.round((avgScores.coordination / sessionCount) * 10))
        });
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
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedChildData.name}</h2>
                      <p className="text-muted-foreground">
                        {selectedChildData.age} anos
                        {selectedChildData.profile && ` • ${selectedChildData.profile}`}
                      </p>
                    </div>
                  </div>
                  <Button onClick={generateReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
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
