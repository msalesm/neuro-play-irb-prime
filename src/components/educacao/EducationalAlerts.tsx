import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Eye, Brain } from 'lucide-react';

interface EducationalAlertsProps {
  students: Array<{
    id: string;
    child_id: string;
    children: { id: string; name: string };
  }>;
  observations: any[];
  allObservations: any[];
}

interface Alert {
  studentName: string;
  childId: string;
  type: 'attention_drop' | 'high_frustration' | 'persistent_difficulty' | 'low_engagement';
  message: string;
  severity: 'warning' | 'critical';
}

export function EducationalAlerts({ students, observations, allObservations }: EducationalAlertsProps) {
  const alerts: Alert[] = [];

  students.forEach(student => {
    const currentObs = observations.find((o: any) => o.child_id === student.child_id) as any;
    const studentHistory = allObservations
      .filter((o: any) => o.child_id === student.child_id)
      .sort((a: any, b: any) => new Date(b.observation_week).getTime() - new Date(a.observation_week).getTime());

    if (!currentObs) return;

    // Check attention drop
    if (currentObs.focus_difficulty >= 3) {
      alerts.push({
        studentName: student.children.name,
        childId: student.child_id,
        type: 'attention_drop',
        message: `${student.children.name} apresentou queda de atenção nas últimas atividades.`,
        severity: 'critical',
      });
    }

    // Check high frustration (aggressiveness or behavior change)
    if (currentObs.aggressiveness >= 3 || currentObs.behavior_change >= 3) {
      alerts.push({
        studentName: student.children.name,
        childId: student.child_id,
        type: 'high_frustration',
        message: `${student.children.name} apresenta sinais de frustração elevada.`,
        severity: 'warning',
      });
    }

    // Check persistent difficulty (2+ weeks with issues)
    if (studentHistory.length >= 2) {
      const recentTwo = studentHistory.slice(0, 2);
      const persistentFocus = recentTwo.every((o: any) => o.focus_difficulty >= 2);
      if (persistentFocus) {
        alerts.push({
          studentName: student.children.name,
          childId: student.child_id,
          type: 'persistent_difficulty',
          message: `${student.children.name} mantém dificuldade persistente há 2+ semanas.`,
          severity: 'critical',
        });
      }
    }

    // Check social isolation
    if (currentObs.social_isolation >= 3) {
      alerts.push({
        studentName: student.children.name,
        childId: student.child_id,
        type: 'low_engagement',
        message: `${student.children.name} apresenta isolamento social acentuado.`,
        severity: 'warning',
      });
    }
  });

  if (alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'attention_drop': return <Eye className="h-4 w-4" />;
      case 'high_frustration': return <AlertTriangle className="h-4 w-4" />;
      case 'persistent_difficulty': return <TrendingDown className="h-4 w-4" />;
      case 'low_engagement': return <Brain className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-warning/20 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas Educacionais
          <Badge variant="outline" className="ml-auto bg-warning/10 text-warning border-warning/20">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert, idx) => (
          <div
            key={`${alert.childId}-${alert.type}-${idx}`}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              alert.severity === 'critical' 
                ? 'bg-destructive/5 border-destructive/20' 
                : 'bg-warning/5 border-warning/20'
            }`}
          >
            <div className={`mt-0.5 ${alert.severity === 'critical' ? 'text-destructive' : 'text-warning'}`}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{alert.message}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`shrink-0 text-xs ${
                alert.severity === 'critical' 
                  ? 'bg-destructive/10 text-destructive border-destructive/20' 
                  : 'bg-warning/10 text-warning border-warning/20'
              }`}
            >
              {alert.severity === 'critical' ? 'Urgente' : 'Atenção'}
            </Badge>
          </div>
        ))}
        {alerts.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            + {alerts.length - 5} alertas adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
}
