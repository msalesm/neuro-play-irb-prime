import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Download, Sparkles, AlertTriangle, Info } from 'lucide-react';
import type { BehavioralProfile } from '@/types/cognitive-analysis';
import { VALIDATION_STATUS } from '@/modules/games/cognitive-engine';

interface CognitiveReportCardProps {
  report: BehavioralProfile;
  onDownload?: () => void;
}

export function CognitiveReportCard({ report, onDownload }: CognitiveReportCardProps) {
  const dimensions = [
    { name: 'Atenção Sustentada', value: report.domains.attention.score, color: 'hsl(var(--primary))' },
    { name: 'Controle Inibitório', value: report.domains.inhibition.score, color: 'hsl(var(--secondary))' },
    { name: 'Memória Operacional', value: report.domains.memory.score, color: 'hsl(var(--accent))' },
    { name: 'Flexibilidade Cognitiva', value: report.domains.flexibility.score, color: '#10b981' },
    { name: 'Coordenação Visuomotora', value: report.domains.coordination.score, color: '#f59e0b' },
    { name: 'Persistência Comportamental', value: report.domains.persistence.score, color: '#8b5cf6' },
  ];

  const classificationLabels: Record<string, { label: string; color: string }> = {
    adequate: { label: 'Adequado', color: 'bg-success/20 text-success' },
    monitoring: { label: 'Monitoramento', color: 'bg-warning/20 text-warning' },
    attention: { label: 'Atenção', color: 'bg-accent/20 text-accent-foreground' },
    intervention: { label: 'Intervenção', color: 'bg-destructive/20 text-destructive' },
  };

  return (
    <div className="space-y-6">
      {/* Provisional Baseline Disclaimer */}
      {!VALIDATION_STATUS.isScientificallyValidated && (
        <Alert variant="default" className="border-muted-foreground/20 bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            {VALIDATION_STATUS.disclaimer}
          </AlertDescription>
        </Alert>
      )}

      {/* Disclaimer */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-warning mb-1">
                Ferramenta de Análise Comportamental Educacional
              </p>
              <p className="text-muted-foreground">
                Este perfil apresenta padrões comportamentais observados durante atividades estruturadas. 
                Não constitui avaliação clínica e não substitui análise por profissional qualificado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Perfil Interpretativo Educacional</h2>
                <p className="text-muted-foreground">
                  Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            {onDownload && (
              <Button onClick={onDownload} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>

          <div className="text-center">
            <Badge className="mb-2" variant="secondary">
              <Sparkles className="w-4 h-4 mr-2" />
              Análise Comportamental
            </Badge>
            <div className="text-6xl font-bold text-primary mb-2">{report.overallScore}</div>
            <p className="text-lg text-muted-foreground">Score Geral</p>
            <Badge className="mt-2" variant={report.evolutionTrend === 'improving' ? 'default' : 'secondary'}>
              {report.evolutionTrend === 'improving' ? '📈 Evolução positiva' : 
               report.evolutionTrend === 'declining' ? '📉 Em declínio' : '📊 Estável'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Domain Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Perfil por Domínio Cognitivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dimensions.map((dim) => {
              const domainKey = Object.keys(report.domains).find(k => {
                const labels: Record<string, string> = {
                  attention: 'Atenção Sustentada',
                  inhibition: 'Controle Inibitório',
                  memory: 'Memória Operacional',
                  flexibility: 'Flexibilidade Cognitiva',
                  coordination: 'Coordenação Visuomotora',
                  persistence: 'Persistência Comportamental',
                };
                return labels[k] === dim.name;
              }) as keyof typeof report.domains | undefined;
              
              const classification = domainKey ? report.domains[domainKey].classification : 'monitoring';
              const cls = classificationLabels[classification];

              return (
                <div key={dim.name}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-medium">{dim.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${cls.color}`}>{cls.label}</Badge>
                      <span className="font-bold">{dim.value}</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dim.value}%`,
                        backgroundColor: dim.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interpretative Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Análise Interpretativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {report.interpretativeAnalysis}
          </p>
        </CardContent>
      </Card>

      {/* Behavioral Indicators */}
      {report.behavioralIndicators.length > 0 && (
        <Card className="border-info/20 bg-info/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-info">
              <AlertCircle className="w-5 h-5" />
              Indicadores Comportamentais Observados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.behavioralIndicators.filter(i => i.observed).map((ind, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div>
                    <span>{ind.indicator}</span>
                    {ind.frequency && (
                      <Badge className="ml-2 text-xs" variant="outline">
                        {ind.frequency === 'frequent' ? 'Frequente' : ind.frequency === 'occasional' ? 'Ocasional' : 'Raro'}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            Pontos Fortes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Areas for Development */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertCircle className="w-5 h-5" />
            Áreas em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.areasForDevelopment.map((area, index) => (
              <li key={index} className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-info/20 bg-info/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-info">
            <Lightbulb className="w-5 h-5" />
            Recomendações Educacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.educationalRecommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Suggested Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {report.suggestedActivities.map((activity, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {activity}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
