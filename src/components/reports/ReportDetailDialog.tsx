import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, FileText, AlertCircle, CheckCircle2, Download, 
  TrendingUp, TrendingDown, Minus, Lightbulb, Target,
  Calendar, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface ReportDetailDialogProps {
  report: {
    id: string;
    report_type: string;
    generated_date: string;
    report_period_start: string;
    report_period_end: string;
    summary_insights: string;
    detailed_analysis: any;
    progress_indicators: any;
    intervention_recommendations: any[];
    alert_flags: any[];
    generated_by_ai: boolean;
    reviewed_by_professional: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportTypeLabels: Record<string, string> = {
  comprehensive: 'Completo',
  cognitive: 'Cognitivo',
  behavioral: 'Comportamental',
  clinical: 'Clínico',
  pedagogical: 'Pedagógico',
  familiar: 'Familiar'
};

const getTrendIcon = (trend?: string) => {
  if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

export function ReportDetailDialog({ report, open, onOpenChange }: ReportDetailDialogProps) {
  if (!report) return null;

  const cognitiveScores = report.detailed_analysis?.cognitiveScores || {};
  const progressIndicators = report.progress_indicators || {};

  const domainLabels: Record<string, string> = {
    attention: 'Atenção',
    memory: 'Memória',
    language: 'Linguagem',
    logic: 'Lógica',
    emotion: 'Emoções',
    coordination: 'Coordenação',
    flexibility: 'Flexibilidade',
    inhibition: 'Controle Inibitório',
  };
  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF();
      const margin = 20;
      let y = margin;
      
      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(10, 30, 53);
      pdf.text(`Relatório ${reportTypeLabels[report.report_type] || report.report_type}`, margin, y);
      y += 10;
      
      // Period
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Período: ${new Date(report.report_period_start).toLocaleDateString('pt-BR')} - ${new Date(report.report_period_end).toLocaleDateString('pt-BR')}`, margin, y);
      y += 5;
      pdf.text(`Gerado em: ${new Date(report.generated_date).toLocaleDateString('pt-BR')}`, margin, y);
      y += 15;
      
      // Summary
      if (report.summary_insights) {
        pdf.setFontSize(12);
        pdf.setTextColor(10, 30, 53);
        pdf.text('Resumo', margin, y);
        y += 7;
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        const summaryLines = pdf.splitTextToSize(report.summary_insights, 170);
        pdf.text(summaryLines, margin, y);
        y += summaryLines.length * 5 + 10;
      }
      
      // Cognitive Scores
      if (Object.keys(cognitiveScores).length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(10, 30, 53);
        pdf.text('Perfil Cognitivo', margin, y);
        y += 7;
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        Object.entries(cognitiveScores).forEach(([key, value]) => {
          pdf.text(`${key}: ${Math.round(Number(value))}/100`, margin, y);
          y += 5;
        });
        y += 10;
      }
      
      // Recommendations
      if (report.intervention_recommendations?.length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(10, 30, 53);
        pdf.text('Recomendações', margin, y);
        y += 7;
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        report.intervention_recommendations.forEach((rec, idx) => {
          const text = typeof rec === 'string' ? rec : rec.recommendation || rec.title || JSON.stringify(rec);
          const lines = pdf.splitTextToSize(`${idx + 1}. ${text}`, 170);
          pdf.text(lines, margin, y);
          y += lines.length * 5 + 3;
        });
        y += 5;
      }
      
      // Alerts
      if (report.alert_flags?.length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(200, 100, 0);
        pdf.text('Alertas', margin, y);
        y += 7;
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        report.alert_flags.forEach((alert, idx) => {
          const text = typeof alert === 'string' ? alert : alert.message || alert.title || JSON.stringify(alert);
          const lines = pdf.splitTextToSize(`• ${text}`, 170);
          pdf.text(lines, margin, y);
          y += lines.length * 5 + 3;
        });
      }
      
      pdf.save(`relatorio-${report.report_type}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Relatório {reportTypeLabels[report.report_type] || report.report_type}
            {report.generated_by_ai && (
              <Badge variant="secondary" className="ml-2 bg-purple-500/10 text-purple-700">
                <Brain className="w-3 h-3 mr-1" />
                IA
              </Badge>
            )}
            {report.reviewed_by_professional && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Revisado
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Period Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(report.report_period_start).toLocaleDateString('pt-BR')} - {new Date(report.report_period_end).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Gerado em {new Date(report.generated_date).toLocaleDateString('pt-BR')}
              </div>
            </div>

            {/* Summary */}
            {report.summary_insights && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resumo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      let summary = report.summary_insights
                        .replace(/```json\s*/gi, '')
                        .replace(/```\s*/g, '')
                        .trim();
                      
                      // Try to extract executiveSummary from JSON if present
                      try {
                        const parsed = JSON.parse(summary);
                        return parsed.executiveSummary || summary;
                      } catch {
                        // Not JSON, return cleaned string
                        return summary
                          .replace(/^\s*{\s*"executiveSummary":\s*"/i, '')
                          .replace(/"\s*,?\s*"domainAnalysis".*$/is, '')
                          .trim();
                      }
                    })()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Cognitive Profile */}
            {Object.keys(cognitiveScores).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    Perfil Cognitivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(cognitiveScores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{domainLabels[key] || key.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{Math.round(Number(value))}/100</span>
                      </div>
                      <Progress value={Number(value)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Progress Indicators */}
            {Object.keys(progressIndicators).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Indicadores de Progresso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(progressIndicators).map(([key, data]: [string, any]) => (
                      <div key={key} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                          {getTrendIcon(data?.trend)}
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {typeof data === 'object' ? data.value || data.score || '-' : data}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {report.intervention_recommendations && report.intervention_recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Recomendações de Intervenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.intervention_recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-primary font-medium">{idx + 1}.</span>
                        <span className="text-muted-foreground">
                          {typeof rec === 'string' ? rec : rec.recommendation || rec.title || JSON.stringify(rec)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Alert Flags */}
            {report.alert_flags && report.alert_flags.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                    <AlertCircle className="w-4 h-4" />
                    Alertas e Áreas de Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.alert_flags.map((alert, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-amber-800">
                        <span>•</span>
                        <span>
                          {typeof alert === 'string' ? alert : alert.message || alert.title || JSON.stringify(alert)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis */}
            {report.detailed_analysis && Object.keys(report.detailed_analysis).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Análise Detalhada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {report.detailed_analysis.totalSessions !== undefined && (
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{report.detailed_analysis.totalSessions}</p>
                        <p className="text-xs text-muted-foreground">Sessões Totais</p>
                      </div>
                    )}
                    {report.detailed_analysis.averageScore !== undefined && (
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{Math.round(report.detailed_analysis.averageScore)}</p>
                        <p className="text-xs text-muted-foreground">Pontuação Média</p>
                      </div>
                    )}
                    {report.detailed_analysis.completionRate !== undefined && (
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{Math.round(report.detailed_analysis.completionRate)}%</p>
                        <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                      </div>
                    )}
                    {report.detailed_analysis.gamesPlayed !== undefined && (
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{report.detailed_analysis.gamesPlayed}</p>
                        <p className="text-xs text-muted-foreground">Jogos Realizados</p>
                      </div>
                    )}
                    {report.detailed_analysis.totalPlayTime !== undefined && (
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{report.detailed_analysis.totalPlayTime}</p>
                        <p className="text-xs text-muted-foreground">Tempo Total (min)</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Download Button */}
            <div className="flex justify-end">
              <Button onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
