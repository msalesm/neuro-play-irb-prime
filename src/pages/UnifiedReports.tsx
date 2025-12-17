import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Stethoscope, 
  GraduationCap, 
  Users,
  Calendar,
  Brain,
  Loader2,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTelemetry } from '@/hooks/useTelemetry';
import { toast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportData {
  type: 'clinical' | 'pedagogical' | 'familiar';
  period: string;
  generatedAt: string;
  summary: {
    overallProgress: number;
    sessionsCompleted: number;
    averageAccuracy: number;
    totalPlayTime: number;
    strengths: string[];
    areasOfConcern: string[];
    recommendations: string[];
  };
  cognitiveProfile: {
    attention: number;
    memory: number;
    language: number;
    logic: number;
    emotion: number;
    coordination: number;
  };
  alerts: Array<{
    type: 'warning' | 'success' | 'info';
    message: string;
  }>;
}

interface PatientOption {
  id: string;
  name: string;
}

const reportTypes = [
  {
    type: 'familiar' as const,
    title: 'Relatório Familiar',
    description: 'Progresso semanal/mensal, conquistas e próximos passos',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    type: 'clinical' as const,
    title: 'Relatório Clínico',
    description: 'Evolução terapêutica, alertas de risco e plano automatizado',
    icon: Stethoscope,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    type: 'pedagogical' as const,
    title: 'Relatório Pedagógico',
    description: 'Evolução cognitiva, desempenho por área e atividades sugeridas',
    icon: GraduationCap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export default function UnifiedReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isTherapist, isParent } = useUserRole();
  const { trackScreenView } = useTelemetry();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [reports, setReports] = useState<Record<string, ReportData | null>>({
    clinical: null,
    pedagogical: null,
    familiar: null,
  });

  useEffect(() => {
    trackScreenView('unified_reports');
    if (isTherapist) {
      loadPatients();
    }
  }, [trackScreenView, isTherapist]);

  const loadPatients = async () => {
    if (!user) return;
    setLoadingPatients(true);
    try {
      const { data, error } = await supabase
        .from('child_access')
        .select(`child_id, children (id, name)`)
        .eq('professional_id', user.id)
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      if (error) throw error;
      const list = (data || [])
        .filter((a: any) => a.children)
        .map((a: any) => ({ id: a.children.id, name: a.children.name }));
      setPatients(list);
      if (list.length > 0 && !selectedPatient) {
        setSelectedPatient(list[0].id);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const generateReport = async (type: 'clinical' | 'pedagogical' | 'familiar') => {
    if (!user) return;

    // Therapist must select a patient
    if (isTherapist && !selectedPatient) {
      toast({
        title: 'Selecione um paciente',
        description: 'É necessário selecionar um paciente para gerar o relatório.',
      });
      return;
    }

    setGenerating(type);
    
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(selectedPeriod));

      const { data, error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          userId: isTherapist ? selectedPatient : user.id,
          childId: isTherapist ? selectedPatient : undefined,
          reportType: type,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });

      if (error) {
        const errorBody = error.context?.body || error.message;
        if (typeof errorBody === 'string' && errorBody.includes('Nenhum dado encontrado')) {
          toast({
            title: 'Nenhum dado encontrado',
            description: 'Complete alguns jogos primeiro para gerar um relatório.',
          });
          return;
        }
        throw error;
      }

      if (data?.status === 'error') {
        toast({
          title: data.message || 'Erro ao gerar relatório',
          description: data.suggestion || 'Tente novamente mais tarde.',
        });
        return;
      }

      const apiData = data.data || data;
      const generalData = apiData?.general || {};
      const aiAnalysis = apiData?.aiAnalysis || {};
      const cognitiveData = apiData?.cognitive || {};
      
      const transformedReport: ReportData = {
        type,
        period: `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
        generatedAt: new Date().toISOString(),
        summary: {
          overallProgress: Number(generalData.avgAccuracy) || 0,
          sessionsCompleted: Number(generalData.totalSessions) || 0,
          averageAccuracy: Number(generalData.avgAccuracy) || 0,
          totalPlayTime: Number(generalData.totalPlayTime) || 0,
          strengths: Array.isArray(aiAnalysis.strengths) && aiAnalysis.strengths.length > 0 
            ? aiAnalysis.strengths 
            : ['Engajamento consistente'],
          areasOfConcern: Array.isArray(aiAnalysis.areasOfConcern) 
            ? aiAnalysis.areasOfConcern 
            : [],
          recommendations: Array.isArray(aiAnalysis.recommendations) && aiAnalysis.recommendations.length > 0 
            ? aiAnalysis.recommendations 
            : ['Continuar praticando regularmente'],
        },
        cognitiveProfile: {
          attention: Number(cognitiveData.attention) || 0,
          memory: Number(cognitiveData.memory) || 0,
          language: Number(cognitiveData.language) || 0,
          logic: Number(cognitiveData.logic) || 0,
          emotion: Number(cognitiveData.emotion) || 0,
          coordination: Number(cognitiveData.coordination) || 0,
        },
        alerts: transformAlerts(aiAnalysis),
      };

      setReports(prev => ({ ...prev, [type]: transformedReport }));

      toast({
        title: 'Relatório gerado',
        description: `Relatório ${getReportTypeName(type)} gerado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const transformAlerts = (aiAnalysis: any): ReportData['alerts'] => {
    const alerts: ReportData['alerts'] = [];
    
    if (aiAnalysis?.areasOfConcern?.length > 0) {
      aiAnalysis.areasOfConcern.forEach((concern: string) => {
        alerts.push({ type: 'warning' as const, message: concern });
      });
    }
    
    if (aiAnalysis?.strengths?.length > 0) {
      alerts.push({ 
        type: 'success' as const, 
        message: `Ponto forte: ${aiAnalysis.strengths[0]}` 
      });
    }
    
    return alerts.length > 0 ? alerts : [
      { type: 'info' as const, message: 'Continue praticando para receber insights personalizados!' }
    ];
  };

  const getReportTypeName = (type: string) => {
    const names: Record<string, string> = {
      clinical: 'Clínico',
      pedagogical: 'Pedagógico',
      familiar: 'Familiar',
    };
    return names[type] || type;
  };

  const generateAllReports = async () => {
    for (const reportType of reportTypes) {
      await generateReport(reportType.type);
    }
  };

  // For therapists, show only clinical report
  const displayReportTypes = isTherapist 
    ? reportTypes.filter(r => r.type === 'clinical')
    : reportTypes;

  const selectedPatientName = patients.find(p => p.id === selectedPatient)?.name;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {isTherapist ? 'Relatório Clínico' : 'Relatórios'}
              </h1>
              {isAdmin && <Badge variant="secondary">Admin</Badge>}
            </div>
            <p className="text-muted-foreground">
              {isTherapist ? 'Gerar relatório clínico do paciente' : 'Visão unificada de todos os relatórios'}
            </p>
          </div>
        </div>

        {/* Therapist: Patient Selector */}
        {isTherapist && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Selecionar Paciente</label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="w-full">
                      <UserCircle className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={loadingPatients ? "Carregando..." : "Selecione um paciente"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[160px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="90">3 meses</SelectItem>
                      <SelectItem value="180">6 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Non-therapist: Period selector in header */}
        {!isTherapist && (
          <div className="flex justify-end gap-2 mb-6">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">3 meses</SelectItem>
                <SelectItem value="180">6 meses</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={generateAllReports} disabled={generating !== null}>
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Gerar Todos
            </Button>
          </div>
        )}

        {/* Report Cards Grid */}
        <div className={`grid gap-6 ${isTherapist ? 'md:grid-cols-1 max-w-lg mx-auto' : 'md:grid-cols-3'}`}>
          {displayReportTypes.map((reportType) => {
            const report = reports[reportType.type];
            const Icon = reportType.icon;
            const isGenerating = generating === reportType.type;

            return (
              <motion.div
                key={reportType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayReportTypes.indexOf(reportType) * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${reportType.bgColor}`}>
                        <Icon className={`h-5 w-5 ${reportType.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {reportType.title}
                          {isTherapist && selectedPatientName && (
                            <span className="font-normal text-muted-foreground"> - {selectedPatientName}</span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {reportType.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-4">
                    {report ? (
                      <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Progresso</p>
                            <p className="text-lg font-bold">{report.summary.overallProgress}%</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Sessões</p>
                            <p className="text-lg font-bold">{report.summary.sessionsCompleted}</p>
                          </div>
                        </div>

                        {/* Alerts */}
                        <div className="flex-1 space-y-2">
                          {report.alerts.slice(0, 2).map((alert, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                                alert.type === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                                alert.type === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                                'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {alert.type === 'warning' ? <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" /> :
                               alert.type === 'success' ? <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" /> :
                               <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                              <span className="line-clamp-2">{alert.message}</span>
                            </div>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Precisão média</span>
                            <span>{report.summary.averageAccuracy}%</span>
                          </div>
                          <Progress value={report.summary.averageAccuracy} className="h-2" />
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                          Período: {report.period}
                        </p>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                        <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Nenhum relatório gerado
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clique em gerar para criar
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      variant={report ? 'outline' : 'default'}
                      size="sm"
                      className="w-full"
                      onClick={() => generateReport(reportType.type)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : report ? (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Atualizar
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Gerar Relatório
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recommendations Section */}
        {reports.clinical && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Recomendações {isTherapist && selectedPatientName ? `- ${selectedPatientName}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reports.clinical.summary.recommendations.slice(0, 5).map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
