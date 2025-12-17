import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Brain, TrendingUp, AlertCircle, Calendar, MessageSquare,
  FileText, ArrowLeft, Download, Sparkles, Target, Activity,
  Clock, Star, BarChart3
} from 'lucide-react';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientData {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  conditions: string[];
}

interface SessionData {
  id: string;
  game_id: string;
  completed_at: string;
  accuracy_percentage: number;
  duration_seconds: number;
  score: number;
  difficulty_level: number;
}

interface ClinicalReport {
  id: string;
  report_type: string;
  generated_date: string;
  summary_insights: string;
}

interface BehavioralInsight {
  id: string;
  title: string;
  description: string;
  severity: string;
  insight_type: string;
  created_at: string;
}

export default function TherapistDashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prontuario');
  const [sessionNotes, setSessionNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadAllPatientData();
    }
  }, [patientId]);

  const loadAllPatientData = async () => {
    try {
      setLoading(true);

      // IMPORTANT: load patient first (we need name/id) then load the rest
      const child = await loadPatientData();

      await Promise.all([
        loadGameSessions(child),
        loadClinicalReports(),
        loadBehavioralInsights()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async () => {
    try {
      const { data: childData, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', patientId)
        .maybeSingle();

      if (error) throw error;
      if (!childData) return null;

      const birthDate = new Date(childData.birth_date);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const conditions: string[] = Array.isArray(childData.neurodevelopmental_conditions)
        ? childData.neurodevelopmental_conditions.filter((c): c is string => typeof c === 'string')
        : [];

      setPatient({
        id: childData.id,
        name: childData.name,
        age,
        avatar_url: childData.avatar_url,
        conditions
      });

      return childData;
    } catch (error) {
      console.error('Error loading patient:', error);
      toast.error('Erro ao carregar dados do paciente');
      return null;
    }
  };

  const loadGameSessions = async (childData?: any | null) => {
    try {
      if (!patientId) return;

      // 1) Prefer direct linkage: children.id == game_sessions.child_profile_id (common in sample data)
      const { data: directSessions, error: directError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', patientId)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (directError) throw directError;

      if (directSessions && directSessions.length > 0) {
        setSessions(directSessions);
        return;
      }

      // 2) Fallback: resolve a child_profile by name (when children.id != child_profiles.id)
      const childName = childData?.name || patient?.name;
      if (!childName) return;

      const { data: childProfile, error: profileError } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('name', childName)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!childProfile?.id) return;

      const { data: sessionData, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', childProfile.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions(sessionData || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  const loadClinicalReports = async () => {
    try {
      const { data, error } = await supabase
        .from('clinical_reports')
        .select('*')
        .order('generated_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadBehavioralInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('behavioral_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const generateReport = async () => {
    toast.info('Gerando relatório clínico com IA...');
    try {
      const { error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          childId: patientId,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reportType: 'comprehensive'
        }
      });

      if (error) throw error;
      toast.success('Relatório gerado com sucesso!');
      loadClinicalReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  const saveSession = async () => {
    if (!sessionNotes.trim()) {
      toast.error('Adicione notas da sessão');
      return;
    }

    setSavingNotes(true);
    try {
      // Save session notes to behavioral_insights
      const { error } = await supabase
        .from('behavioral_insights')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          child_profile_id: patientId,
          title: `Sessão Terapêutica - ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
          description: sessionNotes,
          insight_type: 'session_notes',
          severity: 'info'
        });

      if (error) throw error;
      toast.success('Sessão registrada com sucesso');
      setSessionNotes('');
      loadBehavioralInsights();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Erro ao salvar sessão');
    } finally {
      setSavingNotes(false);
    }
  };

  // Calculate statistics from sessions
  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / sessions.length)
    : 0;

  const totalSessions = sessions.length;
  const totalPlayTime = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  if (!patient) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Paciente não encontrado</p>
              <Button onClick={() => navigate('/therapist/patients')} className="mt-4">
                Voltar para Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <>
      <PlatformOnboarding pageName="therapist-dashboard" />
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/therapist/patients')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Pacientes
            </Button>

            <Card data-tour="patient-info">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <ChildAvatarDisplay
                      avatar={patient.avatar_url}
                      name={patient.name}
                      size="xl"
                    />
                    <div>
                      <h1 className="text-3xl font-bold">{patient.name}</h1>
                      <p className="text-muted-foreground">{patient.age} anos</p>
                      <div className="flex gap-2 mt-2">
                        {patient.conditions.map((condition, idx) => (
                          <Badge key={idx} variant="secondary">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={generateReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Relatório IA
                    </Button>
                    <Button onClick={() => setActiveTab('chat')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat com Pais
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sessões</p>
                    <p className="text-2xl font-bold">{totalSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-[#c7923e]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Precisão Média</p>
                    <p className="text-2xl font-bold">{avgAccuracy}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-[#005a70]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Total</p>
                    <p className="text-2xl font-bold">{totalPlayTime} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Relatórios</p>
                    <p className="text-2xl font-bold">{reports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tabs simplificadas */}
          <Tabs value={activeTab} onValueChange={setActiveTab} data-tour="clinical-tabs">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prontuario">Prontuário</TabsTrigger>
              <TabsTrigger value="pei">PEI</TabsTrigger>
              <TabsTrigger value="evolution">Evolução</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            {/* Prontuário Tab - Nova aba central */}
            <TabsContent value="prontuario" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Prontuário Eletrônico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Última Consulta</h4>
                      <p className="text-sm text-muted-foreground">
                        {sessions.length > 0 
                          ? format(new Date(sessions[0].completed_at), "dd/MM/yyyy", { locale: ptBR })
                          : 'Nenhuma sessão registrada'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Total de Sessões</h4>
                      <p className="text-sm text-muted-foreground">{totalSessions} sessões registradas</p>
                    </div>
                  </div>

                  {/* Relatórios Integrados */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Relatórios Clínicos
                    </h4>
                    {reports.length > 0 ? (
                      <div className="space-y-2">
                        {reports.slice(0, 3).map((report) => (
                          <div key={report.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium capitalize">{report.report_type.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(report.generated_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum relatório gerado ainda</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={() => navigate(`/prontuario/${patientId}`)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Abrir Prontuário Completo
                    </Button>
                    <Button variant="outline" onClick={generateReport}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Relatório IA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Registrar Notas da Sessão */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Registrar Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Notas da sessão: observações, progressos, dificuldades..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={saveSession} className="w-full" disabled={savingNotes}>
                      {savingNotes ? 'Salvando...' : 'Salvar Sessão'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Evolution Tab */}
            <TabsContent value="evolution" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#c7923e]" />
                    Evolução por Planeta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: 'TEA', progress: 65, color: 'bg-purple-500' },
                      { name: 'TDAH', progress: 78, color: 'bg-blue-500' },
                      { name: 'Dislexia', progress: 52, color: 'bg-yellow-500' },
                      { name: 'Regulação Emocional', progress: 70, color: 'bg-green-500' },
                      { name: 'Funções Executivas', progress: 60, color: 'bg-orange-500' }
                    ].map((planeta, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{planeta.name}</span>
                          <span className="text-sm text-muted-foreground">{planeta.progress}%</span>
                        </div>
                        <Progress value={planeta.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reports */}
              {reports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Relatórios Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reports.slice(0, 3).map((report) => (
                        <div key={report.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium capitalize">{report.report_type.replace('_', ' ')}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(report.generated_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          {report.summary_insights && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {report.summary_insights}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>


            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#c7923e]" />
                    Alertas e Insights Comportamentais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.length > 0 ? (
                      insights.map((insight) => (
                        <div
                          key={insight.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            insight.severity === 'high'
                              ? 'bg-red-500/10 border-l-red-500'
                              : insight.severity === 'medium'
                              ? 'bg-yellow-500/10 border-l-yellow-500'
                              : 'bg-blue-500/10 border-l-blue-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className={`w-5 h-5 mt-0.5 ${
                              insight.severity === 'high'
                                ? 'text-red-500'
                                : insight.severity === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                            }`} />
                            <div>
                              <p className="font-semibold">{insight.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {insight.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(insight.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-4 rounded-lg bg-yellow-500/10 border-l-4 border-l-yellow-500">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                                Atenção Requerida
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Continue acompanhando o progresso para gerar insights automáticos.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-l-blue-500">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-blue-700 dark:text-blue-400">
                                Oportunidade de Progressão
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Mais sessões são necessárias para análise preditiva.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PEI Tab */}
            <TabsContent value="pei" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Plano Educacional Individualizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Objetivos Terapêuticos</h3>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Melhorar atenção sustentada para 5 minutos</span>
                            <Progress value={70} className="w-24" />
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Reduzir eventos de frustração em 50%</span>
                            <Progress value={45} className="w-24" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Trilha Recomendada IA</h3>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-[#005a70]/10 to-[#c7923e]/10 border border-border">
                        <p className="font-medium mb-2">🎯 Trilha: Atenção e Controle Executivo</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Sequência otimizada de 12 jogos durante 4 semanas
                        </p>
                        <Button size="sm">Ver Trilha Completa</Button>
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => navigate(`/pei-view?child=${patientId}`)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Editar PEI Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ModernPageLayout>
    </>
  );
}
