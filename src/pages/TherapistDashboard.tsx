import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  FileText, Sparkles, Target, AlertCircle,
  TrendingUp, BarChart3, ClipboardList, Calendar, Download
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BehavioralProfileWidget } from '@/components/dashboard/BehavioralProfileWidget';
import { ReportGeneratorWidget } from '@/components/dashboard/ReportGeneratorWidget';
import { TherapistPatientHeader } from '@/components/therapist/TherapistPatientHeader';
import { TherapistQuickStats } from '@/components/therapist/TherapistQuickStats';
import { useTherapistPatientData } from '@/hooks/useTherapistPatientData';

export default function TherapistDashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const {
    patient, sessions, reports, insights, loading,
    avgAccuracy, totalSessions, totalPlayTime,
    generateReport, saveSessionNotes,
  } = useTherapistPatientData(patientId);

  const [activeTab, setActiveTab] = useState('prontuario');
  const [sessionNotes, setSessionNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const handleSaveSession = async () => {
    if (!sessionNotes.trim()) {
      toast.error('Adicione notas da sessão');
      return;
    }
    setSavingNotes(true);
    try {
      await saveSessionNotes(sessionNotes);
      setSessionNotes('');
    } catch {
      toast.error('Erro ao salvar sessão');
    } finally {
      setSavingNotes(false);
    }
  };

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
              <Button onClick={() => navigate('/therapist/patients')} className="mt-4">Voltar para Lista</Button>
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
          <TherapistPatientHeader patient={patient} onGenerateReport={generateReport} onSetTab={setActiveTab} />

          <TherapistQuickStats
            totalSessions={totalSessions}
            avgAccuracy={avgAccuracy}
            totalPlayTime={totalPlayTime}
            reportsCount={reports.length}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <BehavioralProfileWidget childId={patientId!} />
            <ReportGeneratorWidget childId={patientId!} childName={patient.name} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} data-tour="clinical-tabs">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="prontuario" className="text-xs sm:text-sm">Prontuário</TabsTrigger>
              <TabsTrigger value="pei" className="text-xs sm:text-sm">PEI</TabsTrigger>
              <TabsTrigger value="evolution" className="text-xs sm:text-sm">Evolução</TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs sm:text-sm">Alertas</TabsTrigger>
            </TabsList>

            {/* Prontuário Tab */}
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
                            <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum relatório gerado ainda</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button className="flex-1" onClick={() => navigate(`/prontuario/${patientId}`)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Abrir Prontuário Completo
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/anamnese/${patientId}`)}>
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Anamnese
                    </Button>
                    <Button variant="outline" onClick={generateReport}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Relatório IA
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                    <Button onClick={handleSaveSession} className="w-full" disabled={savingNotes}>
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
                    <Sparkles className="w-5 h-5 text-accent" />
                    Evolução por Planeta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: 'TEA', progress: 65 },
                      { name: 'TDAH', progress: 78 },
                      { name: 'Dislexia', progress: 52 },
                      { name: 'Regulação Emocional', progress: 70 },
                      { name: 'Funções Executivas', progress: 60 }
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
                            <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                          </div>
                          {report.summary_insights && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{report.summary_insights}</p>
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
                    <AlertCircle className="w-5 h-5 text-accent" />
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
                              ? 'bg-destructive/10 border-l-destructive'
                              : insight.severity === 'medium'
                              ? 'bg-accent/10 border-l-accent'
                              : 'bg-primary/10 border-l-primary'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className={`w-5 h-5 mt-0.5 ${
                              insight.severity === 'high' ? 'text-destructive'
                              : insight.severity === 'medium' ? 'text-accent'
                              : 'text-primary'
                            }`} />
                            <div>
                              <p className="font-semibold">{insight.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(insight.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-4 rounded-lg bg-accent/10 border-l-4 border-l-accent">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                            <div>
                              <p className="font-semibold">Atenção Requerida</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Continue acompanhando o progresso para gerar insights automáticos.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 border-l-4 border-l-primary">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-semibold">Oportunidade de Progressão</p>
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
                      <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
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
