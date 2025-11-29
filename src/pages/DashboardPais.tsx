import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, TrendingUp, Award, Calendar, Download, 
  ArrowLeft, Heart, Target, Sparkles, Activity,
  Clock, CheckCircle2, AlertCircle, FileText, BookOpen
} from 'lucide-react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { AvatarSelectionModal } from '@/components/AvatarSelectionModal';
import { DailyMissionCard } from '@/components/DailyMissionCard';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { BadgeUnlockModal } from '@/components/BadgeUnlockModal';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';

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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { missions, loading: missionsLoading } = useDailyMissions(selectedChild);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{
    name: string;
    description: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadChildren();
      checkAvatarSelection();
    }
  }, [user]);

  const checkAvatarSelection = async () => {
    try {
      const { data: childData, error } = await supabase
        .from('children')
        .select('id, avatar_url')
        .eq('parent_id', user?.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking avatar:', error);
        return;
      }

      if (childData && !childData.avatar_url) {
        setShowAvatarModal(true);
      }
    } catch (error) {
      console.error('Error checking avatar:', error);
    }
  };

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
        .select('id, name, birth_date, avatar_url')
        .eq('parent_id', user?.id);

      if (error) {
        console.error('Error loading children:', error);
        toast.error('Erro ao carregar perfis das crianças');
        setLoading(false);
        return;
      }

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
      <PlatformOnboarding pageName="dashboard-pais" />
      
      <AvatarSelectionModal
        open={showAvatarModal}
        onComplete={() => {
          setShowAvatarModal(false);
          loadChildren();
        }}
        childId={selectedChild || undefined}
      />

      <BadgeUnlockModal
        open={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        badgeName={unlockedBadge?.name || ''}
        badgeDescription={unlockedBadge?.description || ''}
        badgeIcon={unlockedBadge?.icon || '🏆'}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header with Child Selection */}
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
              <Card className="p-6 mb-8" data-tour="avatar-card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <ChildAvatarDisplay
                        avatar={selectedChildData.avatar_url}
                        name={selectedChildData.name}
                        size="xl"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[#c7923e] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-background">
                        5
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedChildData.name}</h2>
                      <p className="text-muted-foreground">
                        {selectedChildData.age} anos
                        {selectedChildData.profile && ` • ${selectedChildData.profile}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-[#005a70]/10 text-[#005a70] px-2 py-1 rounded-full">
                          Nível 5
                        </span>
                        <span className="text-xs bg-[#c7923e]/10 text-[#c7923e] px-2 py-1 rounded-full">
                          🏆 12 Conquistas
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/avatar-evolution')}
                    >
                      ✨ Customizar Avatar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/platform-report')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Relatório Plataforma
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/platform-manual')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Manual
                    </Button>
                    <Button onClick={generateReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Gerar Relatório Clínico
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Emotional Check-in Card */}
            <Card className="mb-8 border-l-4 border-l-[#c7923e]" data-tour="emotional-checkin">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c7923e]/20 to-red-500/20 flex items-center justify-center text-3xl">
                      ❤️
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Como está se sentindo hoje?</h3>
                      <p className="text-sm text-muted-foreground">
                        Faça um check-in emocional rápido - leva apenas 2 minutos
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-[#c7923e] to-red-500"
                    onClick={() => navigate('/therapeutic-chat')}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Registrar Emoções
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Planet */}
                <Card className="border-l-4 border-l-[#005a70]" data-tour="current-planet">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-5 h-5 text-[#005a70]" />
                      <h3 className="text-lg font-semibold">Planeta Atual</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#005a70]/20 to-[#0a1e35]/20 flex items-center justify-center text-3xl">
                        🌍
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">Planeta Aurora</h4>
                        <p className="text-sm text-muted-foreground">Foco em Atenção e Cognição Social</p>
                        <Progress value={65} className="mt-2" />
                      </div>
                      <Button onClick={() => navigate('/sistema-planeta-azul')}>
                        Explorar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Mission */}
                {!missionsLoading && missions.length > 0 && (
                  <div data-tour="daily-mission">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-5 h-5 text-[#c7923e]" />
                      <h3 className="text-lg font-semibold">Missão do Dia</h3>
                    </div>
                    <DailyMissionCard
                      jogo={missions[0].jogo}
                      planetaNome={missions[0].planeta.nome}
                      planetaCor={missions[0].planeta.cor}
                      planetaIcone={missions[0].planeta.icone}
                      recomendadoPorIA={missions[0].recomendadoPorIA}
                    />
                  </div>
                )}

                {/* Quick Report */}
                <Card data-tour="quick-report">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="w-5 h-5 text-[#0a1e35]" />
                      <h3 className="text-lg font-semibold">Relatório Rápido</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Atenção:</strong> Melhora de 15% nas últimas 3 sessões. Continue com exercícios de foco.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Memória de Trabalho:</strong> Progresso constante. Recomendado aumentar dificuldade.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#c7923e] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Flexibilidade Cognitiva:</strong> Área que precisa mais prática. Veja jogos recomendados.
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate('/clinical-dashboard')}
                    >
                      Ver Relatório Completo
                    </Button>
                  </CardContent>
                </Card>

                {/* Weekly History */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-5 h-5 text-[#005a70]" />
                      <h3 className="text-lg font-semibold">Histórico Semanal</h3>
                    </div>
                    <div className="space-y-3">
                      {sessions.length > 0 ? (
                        sessions.slice(0, 5).map((session, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Brain className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{session.game_type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(session.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-[#c7923e]" />
                              <span className="font-semibold text-sm">{session.score}%</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma sessão registrada ainda
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Recommendations & Actions */}
              <div className="space-y-6">
                {/* AI Recommendations */}
                <Card className="border-l-4 border-l-[#c7923e]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-5 h-5 text-[#c7923e]" />
                      <h3 className="text-lg font-semibold">Recomendações IA</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-[#c7923e]/10 border border-[#c7923e]/20">
                        <p className="text-sm font-medium mb-1">Foco em Atenção Sustentada</p>
                        <p className="text-xs text-muted-foreground">
                          Baseado no perfil, jogos de atenção terão melhor resultado nas manhãs
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#005a70]/10 border border-[#005a70]/20">
                        <p className="text-sm font-medium mb-1">Sessões Mais Curtas</p>
                        <p className="text-xs text-muted-foreground">
                          Melhor desempenho em sessões de 10-15 minutos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Microlearning */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="w-5 h-5 text-[#0a1e35]" />
                      <h3 className="text-lg font-semibold">Microlearning</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-[#005a70]/10 to-[#0a1e35]/10 border border-border">
                        <p className="font-medium mb-2 text-sm">Como Apoiar a Atenção em Casa</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Aprenda técnicas práticas para melhorar a atenção no dia a dia
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>5 minutos</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate('/training')}
                    >
                      Ver Mais Conteúdos
                    </Button>
                  </CardContent>
                </Card>

                {/* Parent-Child Activity */}
                <Card className="border-l-4 border-l-[#005a70]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="w-5 h-5 text-[#005a70]" />
                      <h3 className="text-lg font-semibold">Atividade Parent-Child</h3>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-[#005a70]/10 to-[#c7923e]/10 border border-border">
                      <p className="font-medium mb-2 text-sm">🎮 Jogo Cooperativo: Quebra-Cabeça Mágico</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Trabalhem juntos para completar desafios e fortalecer o vínculo
                      </p>
                      <Button size="sm" className="w-full" onClick={() => navigate('/games')}>
                        Jogar Juntos
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="w-6 h-6 text-[#c7923e] mx-auto mb-2" />
                      <p className="text-2xl font-bold">{totalSessions}</p>
                      <p className="text-xs text-muted-foreground">Sessões</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 text-[#005a70] mx-auto mb-2" />
                      <p className="text-2xl font-bold">{avgScore}%</p>
                      <p className="text-xs text-muted-foreground">Média</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gamification */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-5 h-5 text-[#c7923e]" />
                      <h3 className="text-lg font-semibold">Badges Familiares</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['🏆', '⭐', '🎯', '💎', '🔥', '🌟'].map((badge, i) => (
                        <div 
                          key={i}
                          className="aspect-square rounded-lg bg-gradient-to-br from-[#c7923e]/20 to-[#005a70]/20 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer border border-border"
                        >
                          {badge}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
