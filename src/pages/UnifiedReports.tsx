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
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  UserCircle,
  Sparkles,
  BarChart3
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
    gradient: 'from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    type: 'clinical' as const,
    title: 'Relatório Clínico',
    description: 'Evolução terapêutica, alertas de risco e plano automatizado',
    icon: Stethoscope,
    gradient: 'from-emerald-500 to-teal-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    type: 'pedagogical' as const,
    title: 'Relatório Pedagógico',
    description: 'Evolução cognitiva, desempenho por área e atividades sugeridas',
    icon: GraduationCap,
    gradient: 'from-violet-500 to-purple-500',
    lightBg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
  },
];

const cognitiveLabels: Record<string, string> = {
  attention: 'Atenção',
  memory: 'Memória',
  language: 'Linguagem',
  logic: 'Lógica',
  emotion: 'Emoção',
  coordination: 'Coordenação',
};

export default function UnifiedReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isTherapist, isParent, isTeacher } = useUserRole();
  const { trackScreenView } = useTelemetry();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [children, setChildren] = useState<PatientOption[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [reports, setReports] = useState<Record<string, ReportData | null>>({
    clinical: null,
    pedagogical: null,
    familiar: null,
  });

  useEffect(() => {
    trackScreenView('unified_reports');
    if (isAdmin) {
      loadAllChildren();
    } else if (isTherapist) {
      loadPatientsForTherapist();
    } else if (isParent) {
      loadChildrenForParent();
    } else if (isTeacher) {
      loadStudentsForTeacher();
    }
  }, [trackScreenView, isAdmin, isTherapist, isParent, isTeacher]);

  const loadAllChildren = async () => {
    if (!user) return;
    setLoadingChildren(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
        .limit(200);

      if (error) throw error;
      setChildren(data || []);
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadPatientsForTherapist = async () => {
    if (!user) return;
    setLoadingChildren(true);
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
      setChildren(list);
      if (list.length > 0 && !selectedChild) {
        setSelectedChild(list[0].id);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadChildrenForParent = async () => {
    if (!user) return;
    setLoadingChildren(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setChildren(data || []);
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadStudentsForTeacher = async () => {
    if (!user) return;
    setLoadingChildren(true);
    try {
      const { data: classes } = await supabase
        .from('school_classes')
        .select('id')
        .eq('teacher_id', user.id);
      
      if (!classes || classes.length === 0) {
        setChildren([]);
        return;
      }

      const { data, error } = await supabase
        .from('class_students')
        .select('child_id, children!class_students_child_id_fkey(id, name)')
        .in('class_id', classes.map(c => c.id))
        .eq('is_active', true);

      if (error) throw error;
      const list = (data || [])
        .filter((d: any) => d.children)
        .map((d: any) => ({ id: d.children.id, name: d.children.name }));
      const unique = Array.from(new Map(list.map((s: any) => [s.id, s])).values());
      setChildren(unique);
      if (unique.length > 0 && !selectedChild) {
        setSelectedChild(unique[0].id);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoadingChildren(false);
    }
  };

  const generateReport = async (type: 'clinical' | 'pedagogical' | 'familiar') => {
    if (!user) return;

    if ((isAdmin || isTherapist || isParent || isTeacher) && !selectedChild) {
      toast({
        title: isTherapist ? 'Selecione um paciente' : isTeacher ? 'Selecione um aluno' : isAdmin ? 'Selecione uma criança' : 'Selecione um filho',
        description: 'É necessário selecionar para gerar o relatório.',
      });
      return;
    }

    setGenerating(type);
    
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(selectedPeriod));

      const targetId = (isTherapist || isParent || isTeacher) ? selectedChild : user.id;

      const { data, error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          userId: targetId,
          childId: (isTherapist || isParent || isTeacher) ? selectedChild : undefined,
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

  // Each role sees only their own report type
  const displayReportTypes = isTherapist 
    ? reportTypes.filter(r => r.type === 'clinical')
    : isParent 
      ? reportTypes.filter(r => r.type === 'familiar')
      : isTeacher
        ? reportTypes.filter(r => r.type === 'pedagogical')
        : isAdmin
          ? reportTypes
          : reportTypes.filter(r => r.type === 'familiar');

  const selectedChildName = children.find(c => c.id === selectedChild)?.name;

  const getPageTitle = () => {
    if (isTherapist) return 'Relatório Clínico';
    if (isParent) return 'Relatório Familiar';
    if (isTeacher) return 'Relatório Pedagógico';
    return 'Relatórios';
  };

  const getPageDescription = () => {
    if (isTherapist) return 'Gere relatórios detalhados com análise de IA para acompanhamento terapêutico';
    if (isParent) return 'Acompanhe o progresso do seu filho com relatórios simples e claros';
    if (isTeacher) return 'Relatórios pedagógicos para acompanhamento escolar do aluno';
    return 'Visão unificada de todos os relatórios da plataforma';
  };

  const hasAnyReport = Object.values(reports).some(r => r !== null);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
                  <p className="text-sm text-muted-foreground">{getPageDescription()}</p>
                </div>
              </div>
            </div>
            {isAdmin && <Badge variant="secondary" className="shrink-0">Admin</Badge>}
          </div>
        </motion.div>

        {/* Controls Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-primary/20 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                {/* Child Selector */}
                {(isTherapist || isParent || isTeacher) && (
                  <div className="flex-1 w-full">
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      {isTherapist ? 'Paciente' : isTeacher ? 'Aluno' : 'Filho(a)'}
                    </label>
                    <Select value={selectedChild} onValueChange={setSelectedChild}>
                      <SelectTrigger className="w-full">
                        <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder={loadingChildren ? "Carregando..." : "Selecione..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Period */}
                <div className={`${(isTherapist || isParent || isTeacher) ? '' : 'flex-1'} w-full sm:w-auto`}>
                  <label className="text-sm font-medium mb-2 block text-foreground">Período</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="90">3 meses</SelectItem>
                      <SelectItem value="180">6 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate All (admin only) */}
                {isAdmin && (
                  <Button 
                    onClick={generateAllReports} 
                    disabled={generating !== null}
                    className="shrink-0"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Gerar Todos
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Report Cards */}
        <div className={`grid gap-6 ${displayReportTypes.length === 1 ? 'max-w-xl mx-auto' : 'md:grid-cols-3'}`}>
          {displayReportTypes.map((reportType, idx) => {
            const report = reports[reportType.type];
            const Icon = reportType.icon;
            const isGenerating = generating === reportType.type;

            return (
              <motion.div
                key={reportType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.1 }}
              >
                <Card className={`h-full flex flex-col overflow-hidden transition-all hover:shadow-md ${report ? reportType.border : 'border-border'}`}>
                  {/* Gradient Header */}
                  <div className={`h-1.5 bg-gradient-to-r ${reportType.gradient}`} />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${reportType.lightBg}`}>
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {reportType.title}
                        </CardTitle>
                        {selectedChildName && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{selectedChildName}</p>
                        )}
                        <CardDescription className="text-xs mt-1 line-clamp-2">
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
                          <div className="text-center p-3 bg-muted/50 rounded-xl">
                            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Progresso</p>
                            <p className="text-xl font-bold text-foreground">{report.summary.overallProgress}%</p>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-xl">
                            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Sessões</p>
                            <p className="text-xl font-bold text-foreground">{report.summary.sessionsCompleted}</p>
                          </div>
                        </div>

                        {/* Cognitive Mini Profile */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Perfil Cognitivo</p>
                          {Object.entries(report.cognitiveProfile)
                            .filter(([_, v]) => v > 0)
                            .slice(0, 4)
                            .map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-20 truncate">{cognitiveLabels[key] || key}</span>
                                <Progress value={value} className="h-1.5 flex-1" />
                                <span className="text-xs font-medium w-8 text-right">{value}%</span>
                              </div>
                          ))}
                        </div>

                        {/* Alerts */}
                        <div className="space-y-1.5">
                          {report.alerts.slice(0, 2).map((alert, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-start gap-2 text-xs p-2.5 rounded-lg ${
                                alert.type === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                                alert.type === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                                'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {alert.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> :
                               alert.type === 'success' ? <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> :
                               <Target className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />}
                              <span className="line-clamp-2">{alert.message}</span>
                            </div>
                          ))}
                        </div>

                        {/* Accuracy */}
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>Precisão média</span>
                            <span className="font-medium text-foreground">{report.summary.averageAccuracy}%</span>
                          </div>
                          <Progress value={report.summary.averageAccuracy} className="h-2" />
                        </div>

                        <p className="text-[11px] text-muted-foreground text-center">
                          {report.period}
                        </p>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <div className={`p-4 rounded-2xl ${reportType.lightBg} mb-4`}>
                          <FileText className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          Nenhum relatório gerado
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                          Clique abaixo para gerar com análise de IA
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      variant={report ? 'outline' : 'default'}
                      className={`w-full ${!report ? `bg-gradient-to-r ${reportType.gradient} text-white border-0 hover:opacity-90` : ''}`}
                      onClick={() => generateReport(reportType.type)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gerando com IA...
                        </>
                      ) : report ? (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Atualizar Relatório
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
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
        {hasAnyReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  Recomendações {selectedChildName ? `para ${selectedChildName}` : ''}
                </CardTitle>
                <CardDescription>Sugestões baseadas na análise dos dados coletados</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(reports.clinical || reports.familiar || reports.pedagogical)?.summary.recommendations.slice(0, 5).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <span className="text-muted-foreground">{rec}</span>
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
