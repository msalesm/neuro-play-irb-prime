import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Eye, AlertCircle, CheckCircle2, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClinicalReportCardProps {
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
  };
  onView?: () => void;
  onDownload?: () => void;
}

const reportTypeLabels = {
  comprehensive: 'Completo',
  cognitive: 'Cognitivo',
  behavioral: 'Comportamental'
};

export const ClinicalReportCard = ({ report, onView, onDownload }: ClinicalReportCardProps) => {
  const cognitiveScores = report.detailed_analysis?.cognitiveScores || {};
  const avgScore = Object.values(cognitiveScores).length > 0
    ? (Object.values(cognitiveScores).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number) / Object.values(cognitiveScores).length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Relatório {reportTypeLabels[report.report_type as keyof typeof reportTypeLabels]}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Período: {new Date(report.report_period_start).toLocaleDateString('pt-BR')} -{' '}
                {new Date(report.report_period_end).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div className="flex gap-1">
              {report.generated_by_ai && (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                  <Brain className="w-3 h-3 mr-1" />
                  IA
                </Badge>
              )}
              {report.reviewed_by_professional && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Revisado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary */}
          {report.summary_insights && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {report.summary_insights
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .replace(/^\s*{\s*"executiveSummary":\s*"/i, '')
                .replace(/"\s*,?\s*"domainAnalysis".*$/is, '')
                .trim()}
            </p>
          )}

          {/* Cognitive Score */}
          {avgScore > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Performance Geral</span>
                <span className="text-muted-foreground">{Math.round(avgScore)}/100</span>
              </div>
              <Progress value={avgScore} className="h-2" />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {report.detailed_analysis?.totalSessions || 0}
              </p>
              <p className="text-xs text-muted-foreground">Sessões</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-secondary">
                {report.intervention_recommendations?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Recomendações</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-accent">
                {report.alert_flags?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Alertas</p>
            </div>
          </div>

          {/* Alert Flags */}
          {report.alert_flags && report.alert_flags.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Áreas de Atenção</p>
                <p className="text-xs text-amber-700">
                  {report.alert_flags.length} indicador(es) requerem acompanhamento
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onView}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              onClick={onDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
