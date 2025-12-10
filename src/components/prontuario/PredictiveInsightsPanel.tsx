import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, AlertTriangle, Clock, TrendingUp, 
  ChevronRight, Brain, Lightbulb 
} from 'lucide-react';
import type { PredictiveInsight } from '@/hooks/useUnifiedPatientData';

interface PredictiveInsightsPanelProps {
  insights: PredictiveInsight[];
  correlations: Array<{ factor: string; impact: string; correlation: number }>;
}

const insightIcons: Record<string, React.ReactNode> = {
  regression_risk: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  optimal_time: <Clock className="w-5 h-5 text-blue-500" />,
  recommendation: <Lightbulb className="w-5 h-5 text-yellow-500" />,
  progress: <TrendingUp className="w-5 h-5 text-green-500" />
};

const severityColors: Record<string, string> = {
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-700',
  warning: 'bg-orange-500/10 border-orange-500/30 text-orange-700',
  critical: 'bg-red-500/10 border-red-500/30 text-red-700'
};

export function PredictiveInsightsPanel({ insights, correlations }: PredictiveInsightsPanelProps) {
  const sortedInsights = [...insights].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="space-y-4">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c7923e]" />
            Insights Preditivos (IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedInsights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Coletando dados para gerar insights...</p>
              <p className="text-sm">Continue usando a plataforma para análises preditivas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedInsights.map((insight, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border ${severityColors[insight.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    {insightIcons[insight.type]}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confiança
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90">{insight.description}</p>
                      {insight.actionable && (
                        <div className="mt-2 p-2 rounded bg-background/50">
                          <p className="text-xs font-medium flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            Ação Sugerida:
                          </p>
                          <p className="text-sm">{insight.actionable}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correlations */}
      {correlations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Correlações Identificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {correlations.map((corr, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{corr.factor}</p>
                    <p className="text-xs text-muted-foreground">→ {corr.impact}</p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${corr.correlation * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(corr.correlation * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
              <p className="font-medium mb-1">💡 Como interpretar:</p>
              <p>Correlações acima de 70% indicam forte relação entre fatores. 
              Use essas informações para ajustar rotinas e intervenções.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
