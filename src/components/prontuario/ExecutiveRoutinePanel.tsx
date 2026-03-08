import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useExecutiveRoutine, type ExecutiveMetrics } from '@/hooks/useExecutiveRoutine';

interface ExecutiveRoutinePanelProps {
  childId?: string;
}

export const ExecutiveRoutinePanel = ({ childId }: ExecutiveRoutinePanelProps) => {
  const { getMetrics } = useExecutiveRoutine();
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const m = await getMetrics(childId);
        setMetrics(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId, getMetrics]);

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

  if (!metrics || metrics.totalExecutions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-primary" />
            Organização Executiva Aplicada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma execução de rotina registrada. Complete rotinas para gerar métricas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-success/10 text-success border-success/20">Adequado</Badge>;
    if (score >= 40) return <Badge className="bg-warning/10 text-warning border-warning/20">Monitorar</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Atenção</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Organização Executiva Aplicada
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Main Organization Index */}
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold ${getScoreColor(metrics.organizationIndex)}`}>
              {metrics.organizationIndex}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Índice de Organização Executiva</p>
            {getStatusBadge(metrics.organizationIndex)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Autonomy */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <Target className="h-4 w-4 text-primary mx-auto mb-1" />
                <div className={`text-xl font-bold ${getScoreColor(metrics.autonomyScore)}`}>
                  {metrics.autonomyScore}%
                </div>
                <p className="text-xs text-muted-foreground">Autonomia</p>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="h-4 w-4 text-primary mx-auto mb-1" />
                <div className={`text-xl font-bold ${getScoreColor(metrics.completionRate)}`}>
                  {metrics.completionRate}%
                </div>
                <p className="text-xs text-muted-foreground">Conclusão</p>
              </CardContent>
            </Card>

            {/* Consistency */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                <div className={`text-xl font-bold ${getScoreColor(metrics.consistencyScore)}`}>
                  {metrics.consistencyScore}%
                </div>
                <p className="text-xs text-muted-foreground">Consistência</p>
              </CardContent>
            </Card>

            {/* Abandonment */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <XCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
                <div className={`text-xl font-bold ${getScoreColor(100 - metrics.abandonmentRate)}`}>
                  {metrics.abandonmentRate}%
                </div>
                <p className="text-xs text-muted-foreground">Abandono</p>
              </CardContent>
            </Card>
          </div>

          {/* Reminder Dependency */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Dependência de Lembretes</span>
              </div>
              <span className="text-sm font-medium">{metrics.reminderDependency}%</span>
            </div>
            <Progress value={metrics.reminderDependency} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.reminderDependency < 30 ? 'Boa autonomia' : metrics.reminderDependency < 60 ? 'Moderada dependência' : 'Alta dependência de suporte'}
            </p>
          </div>

          {/* Insights */}
          {metrics.abandonmentRate > 30 && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Taxa de abandono elevada ({metrics.abandonmentRate}%). Considere simplificar as rotinas ou reduzir o número de passos.
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            Baseado em {metrics.totalExecutions} execuções recentes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
