import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useClinicalReports } from '@/hooks/useClinicalReports';
import { ClinicalReportCard } from './ClinicalReportCard';
import { toast } from 'sonner';

interface ClinicalStats {
  totalSessions: number;
  completedTests: number;
  averageScore: number;
  activeProfiles: number;
}

export default function ClinicalDashboard() {
  const { user } = useAuth();
  const { role, isAdmin } = useUserRole();
  const [childId, setChildId] = useState<string | null>(null);
  const { reports, loading: reportsLoading, generating, generateReport } = useClinicalReports(childId || undefined);
  const [stats, setStats] = useState<ClinicalStats>({
    totalSessions: 0,
    completedTests: 0,
    averageScore: 0,
    activeProfiles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClinicalData();
    }
  }, [user, isAdmin]);

  const fetchClinicalData = async () => {
    try {
      let childIds: string[] = [];
      let profileIds: string[] = [];
      let totalSessions = 0;
      let averageScore = 0;

      // ADMIN: fetch ALL data without user-specific filters
      if (isAdmin) {
        // Get all children
        const { data: allChildren } = await supabase
          .from('children')
          .select('id')
          .eq('is_active', true);
        
        if (allChildren) {
          childIds = allChildren.map(c => c.id);
          if (allChildren.length > 0) setChildId(allChildren[0].id);
        }

        // Get all child_profiles
        const { data: allProfiles } = await supabase
          .from('child_profiles')
          .select('id');
        
        if (allProfiles) {
          profileIds = allProfiles.map(p => p.id);
        }

        // Get ALL game_sessions
        const { data: allGameSessions } = await supabase
          .from('game_sessions')
          .select('score, completed');
        
        if (allGameSessions && allGameSessions.length > 0) {
          totalSessions = allGameSessions.length;
          averageScore = allGameSessions.reduce((sum, s) => sum + (s.score || 0), 0) / allGameSessions.length;
        }

        // Get ALL learning_sessions
        const { data: allLearningSessions } = await supabase
          .from('learning_sessions')
          .select('performance_data');
        
        if (allLearningSessions && allLearningSessions.length > 0) {
          totalSessions += allLearningSessions.length;
          const scores = allLearningSessions
            .map(s => Number((s.performance_data as any)?.score ?? 0))
            .filter(score => Number.isFinite(score) && score > 0);
          if (scores.length > 0) {
            const learningAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
            averageScore = averageScore > 0 ? (averageScore + learningAvg) / 2 : learningAvg;
          }
        }

        // Get ALL screenings
        const { data: allScreenings } = await supabase
          .from('screenings')
          .select('id');

        const completedTests = allScreenings?.length || 0;
        const activeProfiles = Math.max(childIds.length, profileIds.length);

        setStats({
          totalSessions,
          completedTests,
          averageScore: Math.round(averageScore),
          activeProfiles
        });
      } else {
        // NON-ADMIN: original logic (user-specific)
        
        // Try to get children as parent first
        const { data: parentChildren } = await supabase
          .from('children')
          .select('id')
          .eq('parent_id', user?.id);

        if (parentChildren && parentChildren.length > 0) {
          childIds = parentChildren.map(c => c.id);
          setChildId(parentChildren[0].id);
        }

        // Also get children via child_access (for therapists)
        const { data: accessChildren } = await supabase
          .from('child_access')
          .select('child_id')
          .eq('professional_id', user?.id)
          .eq('is_active', true)
          .eq('approval_status', 'approved');

        if (accessChildren && accessChildren.length > 0) {
          const accessChildIds = accessChildren.map(a => a.child_id);
          childIds = [...new Set([...childIds, ...accessChildIds])];
          if (!childId && accessChildIds.length > 0) {
            setChildId(accessChildIds[0]);
          }
        }

        // Get child_profiles for parent
        const { data: parentProfiles } = await supabase
          .from('child_profiles')
          .select('id')
          .eq('parent_user_id', user?.id);

        if (parentProfiles) {
          profileIds = parentProfiles.map(p => p.id);
        }

        // Get child_profiles linked to accessed children
        if (childIds.length > 0) {
          const { data: linkedProfiles } = await supabase
            .from('child_profiles')
            .select('id')
            .in('id', childIds);

          if (linkedProfiles) {
            profileIds = [...new Set([...profileIds, ...linkedProfiles.map(p => p.id)])];
          }
        }

        // Get sessions from game_sessions table
        if (profileIds.length > 0) {
          const { data: sessions } = await supabase
            .from('game_sessions')
            .select('score, completed')
            .in('child_profile_id', profileIds);

          totalSessions = sessions?.length || 0;
          averageScore = sessions && sessions.length > 0
            ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length
            : 0;
        }

        // Also check learning_sessions for the current authenticated user
        const { data: learningSessions, error: learningSessionsError } = await supabase
          .from('learning_sessions')
          .select('performance_data')
          .eq('user_id', user?.id);

        if (learningSessionsError) throw learningSessionsError;

        if (learningSessions && learningSessions.length > 0) {
          totalSessions += learningSessions.length;

          const scores = learningSessions
            .map(s => Number((s.performance_data as any)?.score ?? 0))
            .filter(score => Number.isFinite(score) && score > 0);

          if (scores.length > 0) {
            const learningAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
            averageScore = averageScore > 0 ? (averageScore + learningAvg) / 2 : learningAvg;
          }
        }

        // Get screenings (screenings are stored per user_id)
        const { data: screenings, error: screeningsError } = await supabase
          .from('screenings')
          .select('id')
          .eq('user_id', user?.id);

        if (screeningsError) throw screeningsError;

        const completedTests = screenings?.length || 0;
        const activeProfiles = Math.max(childIds.length, profileIds.length);

        setStats({
          totalSessions,
          completedTests,
          averageScore: Math.round(averageScore),
          activeProfiles
        });
      }
    } catch (error) {
      console.error('Error fetching clinical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!childId) {
      toast.error('Nenhum perfil de criança encontrado');
      return;
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await generateReport({
      startDate,
      endDate,
      reportType: 'comprehensive'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Por favor, faça login para acessar o painel clínico
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Carregando dados clínicos...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-32">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Painel Clínico</h1>
                <p className="text-muted-foreground">
                  {isAdmin ? 'Visão agregada de todos os pacientes' : 'Análise comportamental com IA'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  <Users className="w-3 h-3 mr-1" aria-hidden="true" />
                  Admin
                </Badge>
              )}
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                <Brain className="w-3 h-3 mr-1" aria-hidden="true" />
                IA Ativada
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Estatísticas clínicas">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sessões Totais</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">Jogos realizados</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Testes Completos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.completedTests}</div>
              <p className="text-xs text-muted-foreground">Avaliações finalizadas</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pontuação Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.averageScore}</div>
              <p className="text-xs text-muted-foreground">Desempenho geral</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Perfis Ativos</CardTitle>
              <Users className="h-4 w-4 text-orange-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.activeProfiles}</div>
              <p className="text-xs text-muted-foreground">Crianças cadastradas</p>
            </CardContent>
          </Card>
        </div>

        {stats.activeProfiles === 0 && !isAdmin && (
          <div className="flex items-start gap-3 p-4 bg-muted/40 border border-border rounded-lg" role="status" aria-live="polite">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Nenhum perfil vinculado</p>
              <p className="text-sm text-muted-foreground">
                Para carregar dados do prontuário e métricas do painel, é necessário ter ao menos uma criança/paciente vinculada ao seu usuário.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                asChild
                aria-label="Realizar nova avaliação diagnóstica"
              >
                <Link to="/diagnostic-tests">
                  <FileText className="w-8 h-8" aria-hidden="true" />
                  <span>Nova Avaliação</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                asChild
                aria-label="Ver relatórios de progresso"
              >
                <Link to="/dashboard">
                  <BarChart3 className="w-8 h-8" aria-hidden="true" />
                  <span>Relatórios</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                asChild
                aria-label="Gerenciar perfis de crianças"
              >
                <Link to="/profile">
                  <Users className="w-8 h-8" aria-hidden="true" />
                  <span>Gerenciar Perfis</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analysis">Análise IA</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Resumo Clínico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Este painel fornece uma visão geral do progresso clínico baseado nas sessões de jogos 
                  e avaliações diagnósticas realizadas. Os dados são analisados automaticamente para 
                  identificar padrões comportamentais e cognitivos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Análise Comportamental com IA</CardTitle>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generating || stats.totalSessions === 0}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    {generating ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Gerar Análise de IA
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.totalSessions === 0 ? (
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-amber-900">
                        Nenhuma sessão de jogo encontrada
                      </p>
                      <p className="text-sm text-amber-700">
                        Complete pelo menos 5 sessões de jogos diferentes para gerar uma análise completa com IA.
                      </p>
                      <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link to="/games">
                          Jogar Agora
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                     <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-900">
                        Sistema de Análise de IA Ativo
                      </p>
                      <p className="text-sm text-blue-700">
                        Com {stats.totalSessions} sessões completadas, você pode gerar um relatório clínico 
                        completo com análise comportamental automatizada por IA.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reportsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Carregando relatórios...</span>
                  </div>
                </CardContent>
              </Card>
            ) : reports.length > 0 ? (
              <div className="grid gap-4">
                {reports.map(report => (
                  <ClinicalReportCard
                    key={report.id}
                    report={report}
                    onView={() => toast.info('Visualização detalhada em desenvolvimento')}
                    onDownload={() => toast.info('Download de PDF em desenvolvimento')}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum relatório gerado ainda</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete jogos e gere seu primeiro relatório clínico com análise de IA
                  </p>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generating || stats.totalSessions === 0}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Gerar Primeiro Relatório
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
