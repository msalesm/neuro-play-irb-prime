import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Brain, TrendingUp, Award, Calendar, Download, 
  ArrowLeft, Heart, Target, Sparkles, Activity,
  Clock, CheckCircle2, AlertCircle, FileText, BookOpen, Trophy, Shield, UserPlus, Users
} from 'lucide-react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { AvatarSelectionModal } from '@/components/AvatarSelectionModal';
import { DailyMissionSection } from '@/components/DailyMissionSection';
import { RecentScreeningsCard } from '@/components/RecentScreeningsCard';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { BadgeUnlockModal } from '@/components/BadgeUnlockModal';
import { AIGameRecommendations } from '@/components/AIGameRecommendations';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';
import { TourAchievementsPanel } from '@/components/TourAchievementsPanel';
import { useAchievementSystem } from "@/hooks/useAchievementSystem";
import { usePredictiveAnalysis } from '@/hooks/usePredictiveAnalysis';
import { RiskIndicatorCard } from '@/components/RiskIndicatorCard';
import { PreventiveAlertModal } from '@/components/PreventiveAlertModal';
import { AddChildModal } from '@/components/AddChildModal';
import { FamilyProgressSection } from '@/components/FamilyProgressSection';

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
  const { badgeProgress, avatarEvolution, getBadgeIcon, getBadgeColor } = useAchievementSystem(user?.id);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{
    name: string;
    description: string;
    icon: string;
  } | null>(null);
  
  // Predictive Analysis
  const { riskIndicator, analyzing, detectCrisisRisk, reload: reloadPredictiveAnalysis } = usePredictiveAnalysis(selectedChild || undefined);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [preventiveAlert, setPreventiveAlert] = useState<any>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  // Check for high-risk alerts on mount and when risk changes
  useEffect(() => {
    if (riskIndicator && (riskIndicator.level === 'high' || riskIndicator.level === 'critical')) {
      setPreventiveAlert({
        level: riskIndicator.level,
        title: riskIndicator.level === 'critical' ? 'Alerta de Risco Crítico Detectado' : 'Alerta de Risco Alto Detectado',
        message: riskIndicator.level === 'critical' 
          ? 'Nossa análise preditiva identificou sinais preocupantes que requerem atenção imediata.'
          : 'Nossa análise detectou padrões comportamentais que merecem sua atenção.',
        indicators: riskIndicator.indicators,
        urgentActions: riskIndicator.recommendations,
        timeline: riskIndicator.timeline,
      });
      setShowAlertModal(true);
    }
  }, [riskIndicator]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadChildren();
    }
  }, [user]);

  // Reset loading when navigating back
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && loading) {
        setLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading]);

  useEffect(() => {
    if (selectedChild) {
      checkAvatarSelection();
      // Run predictive crisis detection on load
      setTimeout(() => {
        detectCrisisRisk(14); // Analyze last 14 days for crisis patterns
      }, 2000);
    }
  }, [selectedChild]);

  const checkAvatarSelection = async () => {
    if (!selectedChild) return;
    
    try {
      // Check if child has avatar customization data
      const { data: childData, error } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('id', selectedChild)
        .maybeSingle();

      if (error) {
        console.error('Error checking avatar:', error);
        return;
      }

      // Always show avatar modal on first visit if no avatar selected yet
      if (childData && !selectedChildData?.avatar_url) {
        setTimeout(() => {
          setShowAvatarModal(true);
        }, 500);
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

  // Realtime subscription for game sessions
  useEffect(() => {
    if (!selectedChild) return;

    const channel = supabase
      .channel('game-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `child_profile_id=eq.${selectedChild}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // Reload data when new session is inserted or updated
          loadChildData(selectedChild);
          toast.success('Novo progresso detectado!', {
            description: 'Os dados foram atualizados em tempo real.'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChild]);

  // Realtime subscription for learning_sessions (when no child profile)
  useEffect(() => {
    if (selectedChild || !user) return;

    const channel = supabase
      .channel('learning-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Learning session update:', payload);
          loadUserLearningSessions();
          toast.success('Novo progresso detectado!', {
            description: 'Seus dados foram atualizados em tempo real.'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChild, user]);

  const loadChildren = async () => {
    try {
      console.log('[Dashboard] Loading children for user:', user?.id);
      
      // Use unified function to get children from both tables
      const { data: childrenData, error } = await supabase
        .rpc('get_user_children', { _user_id: user?.id });

      if (error) {
        console.error('Error loading children:', error?.message || error);
        // Fallback to direct query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('child_profiles')
          .select('id, name, date_of_birth, diagnosed_conditions')
          .eq('parent_user_id', user?.id);
        
        if (fallbackError) {
          toast.error(`Erro ao carregar perfis das crianças: ${fallbackError?.message || 'erro desconhecido'}`);
          setLoading(false);
          return;
        }
        
        if (fallbackData && fallbackData.length > 0) {
          const childProfiles: ChildProfile[] = fallbackData.map((child: any) => {
            let calculatedAge = 0;
            if (child.date_of_birth) {
              const birthDate = new Date(child.date_of_birth);
              const today = new Date();
              calculatedAge = today.getFullYear() - birthDate.getFullYear();
            }
            return {
              id: child.id,
              name: child.name || 'Sem nome',
              age: calculatedAge,
              profile: child.diagnosed_conditions?.[0],
              avatar_url: undefined
            };
          });
          setChildren(childProfiles);
          setSelectedChild(childProfiles[0].id);
        }
        setLoading(false);
        return;
      }

      console.log('[Dashboard] Children found:', childrenData?.length || 0);

      if (childrenData && childrenData.length > 0) {
        const childProfiles: ChildProfile[] = childrenData.map((child: any) => {
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
            profile: Array.isArray(child.neurodevelopmental_conditions) 
              ? child.neurodevelopmental_conditions[0] 
              : undefined,
            avatar_url: child.avatar_url
          };
        });
        setChildren(childProfiles);
        setSelectedChild(childProfiles[0].id);
        setLoading(false);
      } else {
        console.log('[Dashboard] No children, loading user learning sessions...');
        await loadUserLearningSessions();
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error loading children (exception):', error?.message || error);
      toast.error(`Erro ao carregar perfis das crianças: ${error?.message || 'erro desconhecido'}`);
      setLoading(false);
    }
  };

  // Carregar learning_sessions quando não há perfil de criança
  const loadUserLearningSessions = async () => {
    if (!user?.id) {
      console.log('[Dashboard] No user id, skipping loadUserLearningSessions');
      return;
    }
    
    console.log('[Dashboard] Loading learning sessions for user:', user.id);
    
    try {
      const { data: learningSessions, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('[Dashboard] Learning sessions result:', { 
        count: learningSessions?.length || 0, 
        error: error?.message 
      });

      if (error) {
        console.error('Error loading learning sessions:', error);
        return;
      }

      if (learningSessions && learningSessions.length > 0) {
        // Transformar learning_sessions para SessionData
        const transformedSessions: SessionData[] = learningSessions.map((session: any) => ({
          id: session.id,
          game_type: session.game_type || 'Jogo',
          duration: session.session_duration_seconds || 0,
          score: session.performance_data?.score || 0,
          created_at: session.created_at,
          performance_data: session.performance_data || {}
        }));

        console.log('[Dashboard] Transformed sessions:', transformedSessions.length);
        setSessions(transformedSessions);

        // Calcular scores cognitivos baseado nos dados disponíveis
        const avgAccuracy = transformedSessions.reduce((sum, s) => 
          sum + (s.performance_data?.accuracy || 0), 0) / transformedSessions.length;

        console.log('[Dashboard] Average accuracy:', avgAccuracy);

        setCognitiveScores({
          attention: Math.round(avgAccuracy * 0.9),
          memory: Math.round(avgAccuracy),
          language: Math.round(avgAccuracy * 0.85),
          logic: Math.round(avgAccuracy * 0.95),
          emotion: Math.round(avgAccuracy * 0.8),
          coordination: Math.round(avgAccuracy * 0.9)
        });
      } else {
        console.log('[Dashboard] No learning sessions found for user');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading user learning sessions:', error);
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
      
      {selectedChild && (
        <AvatarSelectionModal
          open={showAvatarModal}
          onComplete={() => {
            setShowAvatarModal(false);
            loadChildren();
            if (selectedChild) {
              loadChildData(selectedChild);
            }
          }}
          childId={selectedChild}
        />
      )}

      <BadgeUnlockModal
        open={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        badgeName={unlockedBadge?.name || ''}
        badgeDescription={unlockedBadge?.description || ''}
        badgeIcon={unlockedBadge?.icon || '🏆'}
      />

      {preventiveAlert && (
        <PreventiveAlertModal
          open={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          alert={preventiveAlert}
        />
      )}

      <AddChildModal
        open={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onSuccess={() => {
          loadChildren();
        }}
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
        ) : children.length === 0 ? (
          /* Empty State - No Children, but show user's sessions */
          <div className="space-y-8">
            {/* Family Progress Section - sempre visível */}
            <FamilyProgressSection />
            
            {/* Show sessions if user has played games */}
            {sessions.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">Seu Histórico de Jogos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-primary/5">
                    <div className="text-2xl font-bold">{sessions.length}</div>
                    <div className="text-sm text-muted-foreground">Jogos Completados</div>
                  </Card>
                  <Card className="p-4 bg-green-500/10">
                    <div className="text-2xl font-bold">
                      {sessions.length > 0 
                        ? Math.round(sessions.reduce((sum, s) => sum + (s.performance_data?.accuracy || 0), 0) / sessions.length)
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Precisão Média</div>
                  </Card>
                  <Card className="p-4 bg-blue-500/10">
                    <div className="text-2xl font-bold">
                      {sessions.reduce((sum, s) => sum + (s.score || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Pontuação Total</div>
                  </Card>
                </div>
                
                <h4 className="font-semibold mb-3">Últimas Sessões</h4>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{session.game_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{session.score} pts</div>
                        <div className="text-sm text-muted-foreground">
                          {session.performance_data?.accuracy?.toFixed(0) || 0}% precisão
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  {sessions.length > 0 ? 'Cadastre seu filho para análises detalhadas' : 'Bem-vindo ao NeuroPlay!'}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {sessions.length > 0 
                    ? 'Ao cadastrar o perfil do seu filho, você terá acesso a relatórios cognitivos detalhados, análise preditiva e recomendações personalizadas.'
                    : 'Para começar a acompanhar o desenvolvimento do seu filho, cadastre o primeiro perfil.'}
                </p>
                <Button size="lg" onClick={() => setShowAddChildModal(true)}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Cadastrar Filho
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Child Selector with Add Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChild === child.id ? 'default' : 'outline'}
                    onClick={() => setSelectedChild(child.id)}
                    className="flex items-center gap-2"
                  >
                    <ChildAvatarDisplay
                      avatar={child.avatar_url}
                      name={child.name}
                      size="sm"
                    />
                    {child.name}
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowAddChildModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Filho
              </Button>
            </div>

            {/* Child Profile Card */}
            {selectedChildData && (
              <Card className="p-6 mb-8" data-tour="avatar-card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                      <ChildAvatarDisplay
                        avatar={selectedChildData.avatar_url}
                        name={selectedChildData.name}
                        size="xl"
                        level={5}
                        showEffects
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[#c7923e] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-background">
                        5
                      </div>
                      {!selectedChildData.avatar_url && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Clique</span>
                        </div>
                      )}
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
                      onClick={() => navigate('/risk-analysis')}
                      className="flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Análise de Risco
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/sistema-planeta-azul')}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#005a70]/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#005a70]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sistema Planeta Azul</h3>
                      <p className="text-sm text-muted-foreground">Universo de jogos terapêuticos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/games/cooperative-puzzle')}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Quebra-Cabeça Cooperativo</h3>
                      <p className="text-sm text-muted-foreground">Jogo cooperativo para pais e filhos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#c7923e]/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-[#c7923e]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Chat Terapêutico</h3>
                      <p className="text-sm text-muted-foreground">Acompanhamento emocional</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Indicator - Show if there's a risk assessment */}
            {riskIndicator && (
              <div className="mb-8" data-tour="risk-indicator">
                <RiskIndicatorCard
                  riskIndicator={riskIndicator}
                  onViewDetails={() => setShowAlertModal(true)}
                  onRefresh={async () => {
                    await detectCrisisRisk(14);
                    await reloadPredictiveAnalysis();
                  }}
                  loading={analyzing}
                />
              </div>
            )}

            {/* Family Progress Section */}
            <div className="mb-8">
              <FamilyProgressSection />
            </div>

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

                {/* Daily Mission with Stories and Games */}
                <div data-tour="daily-mission">
                  <DailyMissionSection
                    missions={missions}
                    loading={missionsLoading}
                  />
                </div>

                {/* Recent Diagnostic Tests */}
                <RecentScreeningsCard />

                {/* Achievement System Preview */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Sistema de Conquistas
                      </h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/achievements">Ver Tudo</Link>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Badge Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Badge Atual</span>
                          <span className="text-2xl">{getBadgeIcon(badgeProgress.level)}</span>
                        </div>
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${getBadgeColor(badgeProgress.level)}`}>
                          <p className="text-white font-semibold capitalize">{badgeProgress.level}</p>
                          <p className="text-white/80 text-xs">{badgeProgress.current} conquistas</p>
                        </div>
                      </div>

                      {/* Avatar Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Avatar</span>
                          <Sparkles className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                          <p className="text-purple-900 font-semibold">Estágio {avatarEvolution.stage}/5</p>
                          <p className="text-purple-700 text-xs">{avatarEvolution.xp} XP</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* AI Game Recommendations */}
                {selectedChild && (
                  <div data-tour="ai-recommendations">
                    <AIGameRecommendations childProfileId={selectedChild} />
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
                <Card data-tour="stats">
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="cognitive">Perfil Cognitivo</TabsTrigger>
                <TabsTrigger value="achievements">Conquistas</TabsTrigger>
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

              <TabsContent value="achievements">
                <TourAchievementsPanel />
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
