import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertTriangle, Bell, CheckCircle, Brain, 
  Heart, Users, TrendingUp, TrendingDown, 
  Activity, Eye, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClinicalPatternAlertsProps {
  childId: string;
}

interface PatternAlert {
  id: string;
  alert_type: string;
  severity: string;
  domain: string;
  title: string;
  description: string;
  detected_pattern: any;
  recommendations: any;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  action_taken?: string;
  created_at: string;
}

const SEVERITY_STYLES = {
  low: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500', label: 'Baixo' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500', label: 'Médio' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500', label: 'Alto' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500', label: 'Crítico' }
};

const DOMAIN_ICONS = {
  cognitive: Brain,
  behavioral: Users,
  socioemotional: Heart,
  global: Activity
};

const ALERT_TYPE_ICONS = {
  regression: TrendingDown,
  improvement: TrendingUp,
  anomaly: AlertTriangle,
  threshold: Bell,
  pattern: Eye
};

export function ClinicalPatternAlerts({ childId }: ClinicalPatternAlertsProps) {
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<PatternAlert | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [childId]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('clinical_pattern_alerts')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async () => {
    if (!selectedAlert) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('clinical_pattern_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id,
          action_taken: actionNote || 'Alerta revisado pelo profissional'
        })
        .eq('id', selectedAlert.id);

      if (error) throw error;

      toast.success('Alerta reconhecido');
      setSelectedAlert(null);
      setActionNote('');
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Erro ao reconhecer alerta');
    } finally {
      setSaving(false);
    }
  };

  const unacknowledgedCount = alerts.filter(a => !a.is_acknowledged).length;

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando alertas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alertas de Padrões Clínicos
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unacknowledgedCount} novo{unacknowledgedCount > 1 ? 's' : ''}
            </Badge>
          )}
        </h3>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-muted-foreground">Nenhum alerta detectado</p>
            <p className="text-sm text-muted-foreground mt-1">
              O sistema monitora continuamente os padrões do paciente
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const severity = SEVERITY_STYLES[alert.severity as keyof typeof SEVERITY_STYLES];
            const DomainIcon = DOMAIN_ICONS[alert.domain as keyof typeof DOMAIN_ICONS] || Activity;
            const TypeIcon = ALERT_TYPE_ICONS[alert.alert_type as keyof typeof ALERT_TYPE_ICONS] || Bell;
            
            return (
              <Card 
                key={alert.id} 
                className={`${!alert.is_acknowledged ? severity.border + ' border-l-4' : 'opacity-70'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${severity.bg}`}>
                        <TypeIcon className={`w-5 h-5 ${severity.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          {alert.is_acknowledged && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={severity.text}>
                            {severity.label}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <DomainIcon className="w-3 h-3" />
                            {alert.domain === 'cognitive' ? 'Cognitivo' :
                             alert.domain === 'behavioral' ? 'Comportamental' :
                             alert.domain === 'socioemotional' ? 'Socioemocional' : 'Global'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        {alert.action_taken && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Ação: {alert.action_taken}
                          </p>
                        )}
                      </div>
                    </div>
                    {!alert.is_acknowledged && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        Revisar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Reconhecimento */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reconhecer Alerta</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium">{selectedAlert.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedAlert.description}
                </p>
              </div>

              {selectedAlert.recommendations && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Recomendações do Sistema:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {Array.isArray(selectedAlert.recommendations) 
                      ? selectedAlert.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {rec}
                          </li>
                        ))
                      : <li>{JSON.stringify(selectedAlert.recommendations)}</li>
                    }
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Ação Tomada (opcional)</label>
                <Textarea
                  placeholder="Descreva a ação tomada ou plano de intervenção..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Cancelar
                </Button>
                <Button onClick={acknowledgeAlert} disabled={saving}>
                  {saving ? 'Salvando...' : 'Reconhecer Alerta'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
