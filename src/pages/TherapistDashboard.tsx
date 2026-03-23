import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft, FileText, Sparkles, Target, AlertCircle,
  TrendingUp, BarChart3, ClipboardList, Calendar, Download,
  Activity, BookOpen, Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientPhotoUpload } from '@/components/clinical/PatientPhotoUpload';
import { BehavioralProfileWidget } from '@/components/dashboard/BehavioralProfileWidget';
import { ReportGeneratorWidget } from '@/components/dashboard/ReportGeneratorWidget';
import { useTherapistPatientData } from '@/hooks/useTherapistPatientData';

export default function TherapistDashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const {
    patient, sessions, reports, insights, loading,
    avgAccuracy, totalSessions, totalPlayTime,
    generateReport, saveSessionNotes,
  } = useTherapistPatientData(patientId);

  const [activeTab, setActiveTab] = useState('resumo');
  const [sessionNotes, setSessionNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handleSaveSession = async () => {
    if (!sessionNotes.trim()) { toast.error('Adicione notas da sessão'); return; }
    setSavingNotes(true);
    try { await saveSessionNotes(sessionNotes); setSessionNotes(''); }
    catch { toast.error('Erro ao salvar sessão'); }
    finally { setSavingNotes(false); }
  };

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  if (!patient) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">Paciente não encontrado</p>
          <Button onClick={() => navigate('/therapist/patients')}>Voltar</Button>
        </div>
      </ModernPageLayout>
    );
  }

  const currentPhoto = photoUrl || patient.avatar_url;

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/therapist/patients')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Pacientes
        </Button>

        {/* Patient Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <PatientPhotoUpload
                patientId={patient.id}
                currentPhotoUrl={currentPhoto}
                patientName={patient.name}
                size="xl"
                onPhotoUpdated={setPhotoUrl}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{patient.name}</h1>
                <p className="text-muted-foreground">{patient.age} anos</p>
                {patient.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {patient.conditions.map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                )}
              </div>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 text-center shrink-0">
                <div>
                  <p className="text-2xl font-bold text-primary">{totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Sessões</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{avgAccuracy}%</p>
                  <p className="text-xs text-muted-foreground">Acurácia</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{totalPlayTime}m</p>
                  <p className="text-xs text-muted-foreground">Tempo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Hub */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex overflow-x-auto gap-1 h-auto flex-wrap">
            <TabsTrigger value="resumo" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Activity className="h-3.5 w-3.5" /> Resumo
            </TabsTrigger>
            <TabsTrigger value="prontuario" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <FileText className="h-3.5 w-3.5" /> Prontuário
            </TabsTrigger>
            <TabsTrigger value="anamnese" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ClipboardList className="h-3.5 w-3.5" /> Anamnese
            </TabsTrigger>
            <TabsTrigger value="inventario" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5" /> Inventário
            </TabsTrigger>
            <TabsTrigger value="pei" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Target className="h-3.5 w-3.5" /> PEI
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5" /> Relatórios
            </TabsTrigger>
            <TabsTrigger value="alertas" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <AlertCircle className="h-3.5 w-3.5" /> Alertas
            </TabsTrigger>
          </TabsList>

          {/* Resumo */}
          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BehavioralProfileWidget childId={patientId!} />
              <ReportGeneratorWidget childId={patientId!} childName={patient.name} />
            </div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Registrar Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Notas da sessão: observações, progressos, dificuldades..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleSaveSession} className="w-full mt-3" size="sm" disabled={savingNotes}>
                  {savingNotes ? 'Salvando...' : 'Salvar Sessão'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prontuário */}
          <TabsContent value="prontuario" className="mt-4">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Acesse o prontuário eletrônico completo do paciente</p>
                <Button onClick={() => navigate(`/prontuario/${patientId}`)}>
                  <FileText className="w-4 h-4 mr-2" /> Abrir Prontuário Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anamnese */}
          <TabsContent value="anamnese" className="mt-4">
            <Card>
              <CardContent className="p-6 text-center">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Anamnese de desenvolvimento infantil</p>
                <Button onClick={() => navigate(`/anamnese/${patientId}`)}>
                  <ClipboardList className="w-4 h-4 mr-2" /> Abrir Anamnese
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventário */}
          <TabsContent value="inventario" className="mt-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Inventário de habilidades do paciente</p>
                <Button onClick={() => navigate(`/inventario-habilidades?child=${patientId}`)}>
                  <BookOpen className="w-4 h-4 mr-2" /> Abrir Inventário
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PEI */}
          <TabsContent value="pei" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" /> Plano Educacional Individualizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    { name: 'Melhorar atenção sustentada para 5 minutos', value: 70 },
                    { name: 'Reduzir eventos de frustração em 50%', value: 45 },
                  ].map((goal, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between gap-4">
                      <span className="text-sm flex-1">{goal.name}</span>
                      <Progress value={goal.value} className="w-24" />
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant="outline" onClick={() => navigate(`/pei/${patientId}`)}>
                  <Target className="w-4 h-4 mr-2" /> Editar PEI Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="relatorios" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Relatórios Clínicos</h3>
              <Button size="sm" onClick={generateReport}>
                <Sparkles className="w-4 h-4 mr-1" /> Gerar com IA
              </Button>
            </div>
            {reports.length > 0 ? (
              <div className="space-y-2">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{report.report_type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(report.generated_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        {report.summary_insights && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{report.summary_insights}</p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhum relatório gerado. Clique em "Gerar com IA" para criar.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Alertas */}
          <TabsContent value="alertas" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                {insights.length > 0 ? insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.severity === 'high' ? 'bg-destructive/10 border-l-destructive'
                      : insight.severity === 'medium' ? 'bg-accent/10 border-l-accent'
                      : 'bg-primary/10 border-l-primary'
                    }`}
                  >
                    <p className="font-semibold">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(insight.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Nenhum alerta. Continue acompanhando para gerar insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}
