import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, Clock, AlertTriangle, TrendingUp, 
  Bell, CheckCircle, XCircle, RefreshCw, BarChart3, Settings, Calendar
} from 'lucide-react';
import { QueueManagement } from './QueueManagement';
import { PerformanceMetrics } from './PerformanceMetrics';
import { EscalationPanel } from './EscalationPanel';
import { InstitutionalSettings } from './InstitutionalSettings';
import { useOperationalScaling } from '@/hooks/useOperationalScaling';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OperationalAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  is_acknowledged: boolean;
  created_at: string;
}

interface WorkloadSummary {
  professional_id: string;
  full_name: string;
  current_active_cases: number;
  max_daily_cases: number;
  availability_status: string;
}

export function OperationalDashboard({ institutionId }: { institutionId?: string }) {
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [workloads, setWorkloads] = useState<WorkloadSummary[]>([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    avgWaitTime: 0,
    completedToday: 0,
    slaCompliance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [institutionId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load alerts
      const { data: alertsData } = await supabase
        .from('operational_alerts')
        .select('*')
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);

      setAlerts(alertsData || []);

      // Load workloads
      const { data: workloadData } = await supabase
        .from('professional_workload')
        .select(`
          professional_id,
          current_active_cases,
          max_daily_cases,
          availability_status,
          profiles:professional_id(full_name)
        `);

      if (workloadData) {
        setWorkloads(workloadData.map(w => ({
          professional_id: w.professional_id,
          full_name: (w.profiles as any)?.full_name || 'Profissional',
          current_active_cases: w.current_active_cases || 0,
          max_daily_cases: w.max_daily_cases || 10,
          availability_status: w.availability_status || 'available'
        })));
      }

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todayItems } = await supabase
        .from('queue_items')
        .select('*')
        .gte('created_at', today);

      if (todayItems) {
        const completed = todayItems.filter(i => i.status === 'completed');
        const slaOk = todayItems.filter(i => !i.sla_breached);
        
        setStats({
          totalToday: todayItems.length,
          avgWaitTime: 45, // Would calculate from actual data
          completedToday: completed.length,
          slaCompliance: todayItems.length > 0 ? Math.round((slaOk.length / todayItems.length) * 100) : 100
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('operational_alerts')
        .update({ 
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      toast.success('Alerta reconhecido');
      loadDashboardData();
    } catch (error) {
      toast.error('Erro ao reconhecer alerta');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sla_warning: 'Aviso de SLA',
      sla_breach: 'Violação de SLA',
      queue_overload: 'Fila Sobrecarregada',
      professional_overload: 'Profissional Sobrecarregado',
      bottleneck: 'Gargalo Detectado'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Operacional</h1>
          <p className="text-muted-foreground">Gestão de filas e operação em escala</p>
        </div>
        <Button variant="outline" onClick={loadDashboardData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalToday}</p>
                <p className="text-xs text-muted-foreground">Atendimentos Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgWaitTime}min</p>
                <p className="text-xs text-muted-foreground">Tempo Médio Espera</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.slaCompliance}%</p>
                <p className="text-xs text-muted-foreground">Conformidade SLA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-600" />
              Alertas Operacionais ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map(alert => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getAlertTypeLabel(alert.alert_type)}
                      </Badge>
                      <span className="font-medium text-sm">{alert.title}</span>
                    </div>
                    <p className="text-xs mt-1">{alert.description}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Fila de Atendimento
          </TabsTrigger>
          <TabsTrigger value="workload" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Carga de Trabalho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <QueueManagement institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="workload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição de Carga por Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              {workloads.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum profissional configurado</p>
              ) : (
                <div className="space-y-4">
                  {workloads.map(prof => {
                    const loadPercent = Math.round((prof.current_active_cases / prof.max_daily_cases) * 100);
                    return (
                      <div key={prof.professional_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(prof.availability_status)}`} />
                            <span className="font-medium">{prof.full_name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {prof.current_active_cases}/{prof.max_daily_cases} casos
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              loadPercent > 90 ? 'bg-red-500' : 
                              loadPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(loadPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
