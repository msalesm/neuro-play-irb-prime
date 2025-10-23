import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Download, Sparkles } from 'lucide-react';
import type { DiagnosticReport } from '@/types/cognitive-analysis';

interface CognitiveReportCardProps {
  report: DiagnosticReport;
  onDownload?: () => void;
}

export function CognitiveReportCard({ report, onDownload }: CognitiveReportCardProps) {
  const dimensions = [
    { name: 'Atenção', value: report.cognitiveProfile.attention, color: 'hsl(var(--primary))' },
    { name: 'Memória', value: report.cognitiveProfile.memory, color: 'hsl(var(--secondary))' },
    { name: 'Linguagem', value: report.cognitiveProfile.language, color: 'hsl(var(--accent))' },
    { name: 'Lógica', value: report.cognitiveProfile.logic, color: '#10b981' },
    { name: 'Emoção', value: report.cognitiveProfile.emotion, color: '#f59e0b' },
    { name: 'Coordenação', value: report.cognitiveProfile.coordination, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Relatório Cognitivo</h2>
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
              Análise por IA
            </Badge>
            <div className="text-6xl font-bold text-primary mb-2">{report.overallScore}</div>
            <p className="text-lg text-muted-foreground">Pontuação Geral</p>
          </div>
        </CardContent>
      </Card>

      {/* Cognitive Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Perfil Cognitivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dimensions.map((dim) => (
              <div key={dim.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{dim.name}</span>
                  <span className="font-bold">{dim.value}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-smooth"
                    style={{
                      width: `${dim.value}%`,
                      backgroundColor: dim.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Análise Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {report.detailedAnalysis}
          </p>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            Pontos Fortes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <AlertCircle className="w-5 h-5" />
            Áreas de Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.areasForImprovement.map((area, index) => (
              <li key={index} className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Lightbulb className="w-5 h-5" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Suggested Games */}
      <Card>
        <CardHeader>
          <CardTitle>Jogos Recomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {report.suggestedGames.map((game, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {game}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
