import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Brain, Users, Shield, Scale, Timer } from 'lucide-react';
import { useStoryEngine, type SocioemotionalMetrics } from '@/hooks/useStoryEngine';

interface SocioemotionalPanelProps {
  childId?: string;
}

const DIMENSIONS = [
  { key: 'empathyScore', label: 'Empatia Cognitiva', icon: Heart, color: 'text-destructive' },
  { key: 'impulseControlScore', label: 'Controle Inibitório', icon: Shield, color: 'text-info' },
  { key: 'socialFlexibilityScore', label: 'Flexibilidade Social', icon: Users, color: 'text-success' },
  { key: 'moralConsistencyScore', label: 'Consistência Moral', icon: Scale, color: 'text-secondary' },
  { key: 'frustrationToleranceScore', label: 'Tolerância à Frustração', icon: Brain, color: 'text-warning' },
] as const;

export const SocioemotionalPanel = ({ childId }: SocioemotionalPanelProps) => {
  const { getSocioemotionalMetrics } = useStoryEngine();
  const [metrics, setMetrics] = useState<SocioemotionalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const m = await getSocioemotionalMetrics(childId);
        setMetrics(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId, getSocioemotionalMetrics]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics || metrics.totalDecisions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5 text-primary" />
            Perfil Socioemocional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma decisão registrada em histórias interativas. Complete histórias para gerar perfil.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getBarColor = (score: number) => {
    if (score >= 70) return 'bg-success';
    if (score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Perfil Socioemocional
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Overall Score */}
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold ${
              metrics.overallScore >= 70 ? 'text-success' : 
              metrics.overallScore >= 40 ? 'text-warning' : 'text-destructive'
            }`}>
              {metrics.overallScore}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Score Socioemocional Global</p>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            {DIMENSIONS.map(dim => {
              const score = metrics[dim.key as keyof SocioemotionalMetrics] as number;
              const Icon = dim.icon;
              return (
                <div key={dim.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${dim.color}`} />
                      <span className="text-sm">{dim.label}</span>
                    </div>
                    <span className="text-sm font-medium">{score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getBarColor(score)} transition-all`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meta metrics */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.totalDecisions}</div>
              <p className="text-xs text-muted-foreground">Decisões</p>
            </div>
            <div className="text-center">
              <Timer className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <div className="text-lg font-bold">{(metrics.avgDecisionLatencyMs / 1000).toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">Latência Média</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.indecisionRate}%</div>
              <p className="text-xs text-muted-foreground">Indecisão</p>
            </div>
          </div>

          {/* Conflict avoidance alert */}
          {metrics.conflictAvoidanceScore > 70 && (
            <div className="mt-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
              <p className="text-xs text-muted-foreground">
                <strong>Padrão detectado:</strong> Tendência elevada de evitação de conflito ({metrics.conflictAvoidanceScore}%). 
                Pode indicar necessidade de trabalhar assertividade.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
