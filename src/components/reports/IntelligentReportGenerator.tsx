import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Stethoscope, 
  GraduationCap, 
  Users,
  Download,
  Loader2,
  Calendar,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { announce } from '@/components/accessibility';

interface ReportData {
  type: 'clinical' | 'pedagogical' | 'familiar';
  period: string;
  childId?: string;
  childName?: string;
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
  temporalEvolution: Array<{
    date: string;
    score: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'success' | 'info';
    message: string;
  }>;
}

export function IntelligentReportGenerator() {
  const { user } = useAuth();
  const { role, isAdmin, isTherapist, isParent } = useUserRole();
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [generating, setGenerating] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, ReportData | null>>({
    clinical: null,
    pedagogical: null,
    familiar: null,
  });

  // Determine which tab to show based on role
  const getDefaultTab = () => {
    if (isParent) return 'familiar';
    if (isTherapist) return 'clinical';
    return 'pedagogical'; // teacher
  };

  const canViewTab = (tab: string) => {
    if (isAdmin) return true;
    if (isParent && tab === 'familiar') return true;
    if (isTherapist && tab === 'clinical') return true;
    if (!isParent && !isTherapist && tab === 'pedagogical') return true; // teacher
    return false;
  };

  const generateReport = async (type: 'clinical' | 'pedagogical' | 'familiar') => {
    if (!user) return;

    setGenerating(type);
    announce(`Gerando relatório ${getReportTypeName(type)}...`, 'polite');
    
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(selectedPeriod));

      const { data, error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          userId: user.id,
          childId: selectedChild || undefined,
          reportType: type,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });

      // Handle error responses from the edge function (including 404)
      if (error) {
        // Check if the error contains the response body (for non-2xx responses)
        const errorBody = error.context?.body || error.message;
        if (typeof errorBody === 'string' && errorBody.includes('Nenhum dado encontrado')) {
          toast({
            title: 'Nenhum dado encontrado',
            description: 'Complete alguns jogos de diagnóstico primeiro para gerar um relatório.',
            variant: 'default',
          });
          return;
        }
        throw error;
      }

      // Check if the response indicates an error status
      if (data?.status === 'error') {
        toast({
          title: data.message || 'Erro ao gerar relatório',
          description: data.suggestion || 'Tente novamente mais tarde.',
          variant: 'default',
        });
        return;
      }

      // Transform API response to our report format
      const apiData = data.data || data;
      
      // Safely extract values with proper fallbacks
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
        temporalEvolution: Array.isArray(apiData?.temporal) ? apiData.temporal : [],
        alerts: transformAlerts(aiAnalysis),
      };

      setReports(prev => ({
        ...prev,
        [type]: transformedReport,
      }));

      announce(`Relatório ${getReportTypeName(type)} gerado com sucesso`, 'polite');
      toast({
        title: 'Relatório gerado',
        description: `Relatório ${getReportTypeName(type)} gerado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      
      // Check for "no data" error in catch block as well
      const errorMessage = error?.message || error?.context?.body || '';
      if (errorMessage.includes('Nenhum dado encontrado') || errorMessage.includes('No data')) {
        announce('Nenhum dado encontrado para gerar relatório', 'polite');
        toast({
          title: 'Nenhum dado encontrado',
          description: 'Complete alguns jogos de diagnóstico primeiro para gerar um relatório.',
          variant: 'default',
        });
      } else {
        announce('Erro ao gerar relatório', 'assertive');
        toast({
          title: 'Erro ao gerar relatório',
          description: 'Não foi possível gerar o relatório. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setGenerating(null);
    }
  };

  const transformAlerts = (aiAnalysis: any): ReportData['alerts'] => {
    const alerts: ReportData['alerts'] = [];
    
    if (aiAnalysis?.areasOfConcern?.length > 0) {
      aiAnalysis.areasOfConcern.forEach((concern: string) => {
        alerts.push({ type: 'warning', message: concern });
      });
    }
    
    if (aiAnalysis?.strengths?.length > 0) {
      alerts.push({ 
        type: 'success', 
        message: `Ponto forte identificado: ${aiAnalysis.strengths[0]}` 
      });
    }
    
    return alerts.length > 0 ? alerts : [
      { type: 'info', message: 'Continue praticando para receber insights personalizados!' }
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

  const downloadReport = (type: string) => {
    const report = reports[type];
    if (!report) {
      toast({
        title: 'Relatório não disponível',
        description: 'Gere um relatório primeiro antes de exportar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Sanitize the report data to ensure it's valid JSON
      const sanitizedReport = {
        ...report,
        summary: {
          ...report.summary,
          overallProgress: report.summary.overallProgress || 0,
          sessionsCompleted: report.summary.sessionsCompleted || 0,
          averageAccuracy: report.summary.averageAccuracy || 0,
          totalPlayTime: report.summary.totalPlayTime || 0,
          strengths: Array.isArray(report.summary.strengths) ? report.summary.strengths : [],
          areasOfConcern: Array.isArray(report.summary.areasOfConcern) ? report.summary.areasOfConcern : [],
          recommendations: Array.isArray(report.summary.recommendations) ? report.summary.recommendations : [],
        },
        cognitiveProfile: report.cognitiveProfile || {},
        temporalEvolution: Array.isArray(report.temporalEvolution) ? report.temporalEvolution : [],
        alerts: Array.isArray(report.alerts) ? report.alerts : [],
      };

      const content = JSON.stringify(sanitizedReport, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório exportado',
        description: 'O relatório foi baixado com sucesso.',
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar o relatório. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Relatórios Inteligentes
          </h2>
          <p className="text-muted-foreground">
            Geração automática de relatórios multidisciplinares
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs defaultValue={getDefaultTab()} className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {canViewTab('clinical') && (
            <TabsTrigger value="clinical" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Clínico</span>
            </TabsTrigger>
          )}
          {canViewTab('pedagogical') && (
            <TabsTrigger value="pedagogical" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Pedagógico</span>
            </TabsTrigger>
          )}
          {canViewTab('familiar') && (
            <TabsTrigger value="familiar" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Familiar</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Clinical Report */}
        <TabsContent value="clinical">
          <ReportPanel
            type="clinical"
            title="Relatório Clínico"
            description="Telemetria emocional, evolução terapêutica, alertas de risco e plano terapêutico automatizado"
            icon={<Stethoscope className="h-5 w-5" />}
            report={reports.clinical}
            generating={generating === 'clinical'}
            onGenerate={() => generateReport('clinical')}
            onDownload={() => downloadReport('clinical')}
          />
        </TabsContent>

        {/* Pedagogical Report */}
        <TabsContent value="pedagogical">
          <ReportPanel
            type="pedagogical"
            title="Relatório Pedagógico"
            description="Evolução cognitiva, desempenho por área, atividades sugeridas e comparativo com a turma"
            icon={<GraduationCap className="h-5 w-5" />}
            report={reports.pedagogical}
            generating={generating === 'pedagogical'}
            onGenerate={() => generateReport('pedagogical')}
            onDownload={() => downloadReport('pedagogical')}
          />
        </TabsContent>

        {/* Familiar Report */}
        <TabsContent value="familiar">
          <ReportPanel
            type="familiar"
            title="Relatório Familiar"
            description="Visão simplificada do progresso semanal/mensal, conquistas e próximos passos"
            icon={<Users className="h-5 w-5" />}
            report={reports.familiar}
            generating={generating === 'familiar'}
            onGenerate={() => generateReport('familiar')}
            onDownload={() => downloadReport('familiar')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ReportPanelProps {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  report: ReportData | null;
  generating: boolean;
  onGenerate: () => void;
  onDownload: () => void;
}

function ReportPanel({ 
  type, 
  title, 
  description, 
  icon, 
  report, 
  generating, 
  onGenerate, 
  onDownload 
}: ReportPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
              {report && (
                <Button variant="outline" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      {report && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Resumo do Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso Geral</p>
                  <p className="text-2xl font-bold">{report.summary.overallProgress}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessões</p>
                  <p className="text-2xl font-bold">{report.summary.sessionsCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precisão Média</p>
                  <p className="text-2xl font-bold">{report.summary.averageAccuracy}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                  <p className="text-2xl font-bold">{Math.round(report.summary.totalPlayTime / 60)}min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cognitive Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Perfil Cognitivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(report.cognitiveProfile).map(([domain, value]) => (
                <div key={domain}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{domain}</span>
                    <span>{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths & Concerns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Pontos Fortes e Atenção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2 text-green-600">Pontos Fortes</h4>
                <div className="flex flex-wrap gap-2">
                  {report.summary.strengths.map((strength, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2 text-amber-600">Áreas de Atenção</h4>
                <div className="flex flex-wrap gap-2">
                  {report.summary.areasOfConcern.map((concern, i) => (
                    <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertas Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm ${
                    alert.type === 'warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : alert.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recomendações Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.summary.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!report && !generating && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">Nenhum relatório gerado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clique em "Gerar Relatório" para criar um relatório com análise de IA
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
