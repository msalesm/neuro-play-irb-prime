import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Users, Clock, AlertTriangle, Play, CheckCircle, 
  ArrowUp, ArrowDown, User, Timer, RefreshCw 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QueueItem {
  id: string;
  child_id: string;
  priority_score: number;
  risk_level: string;
  status: string;
  assigned_to: string | null;
  entered_queue_at: string;
  sla_deadline: string | null;
  sla_breached: boolean;
  notes: string | null;
  children?: { name: string };
  profiles?: { full_name: string };
}

interface Professional {
  id: string;
  full_name: string;
  current_active_cases: number;
  max_daily_cases: number;
  availability_status: string;
}

export function QueueManagement({ institutionId }: { institutionId?: string }) {
  const { user } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadQueueData();
  }, [institutionId]);

  const loadQueueData = async () => {
    setLoading(true);
    try {
      // Load queue items
      const { data: items, error: itemsError } = await supabase
        .from('queue_items')
        .select(`
          *,
          children:child_id(name),
          profiles:assigned_to(full_name)
        `)
        .order('priority_score', { ascending: false })
        .order('entered_queue_at', { ascending: true });

      if (itemsError) throw itemsError;
      setQueueItems(items || []);

      // Load available professionals
      const { data: profs, error: profsError } = await supabase
        .from('professional_workload')
        .select(`
          professional_id,
          current_active_cases,
          max_daily_cases,
          availability_status,
          profiles:professional_id(full_name)
        `)
        .eq('availability_status', 'available');

      if (!profsError && profs) {
        setProfessionals(profs.map(p => ({
          id: p.professional_id,
          full_name: (p.profiles as any)?.full_name || 'Profissional',
          current_active_cases: p.current_active_cases || 0,
          max_daily_cases: p.max_daily_cases || 10,
          availability_status: p.availability_status || 'available'
        })));
      }
    } catch (error) {
      console.error('Error loading queue:', error);
      toast.error('Erro ao carregar fila');
    } finally {
      setLoading(false);
    }
  };

  const assignCase = async (itemId: string, professionalId: string) => {
    try {
      const { error } = await supabase
        .from('queue_items')
        .update({ 
          assigned_to: professionalId, 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      // Log assignment
      await supabase.from('case_assignments').insert({
        queue_item_id: itemId,
        to_professional_id: professionalId,
        assigned_by: user?.id
      });

      toast.success('Caso atribuído com sucesso');
      loadQueueData();
    } catch (error) {
      console.error('Error assigning case:', error);
      toast.error('Erro ao atribuir caso');
    }
  };

  const updatePriority = async (itemId: string, newScore: number) => {
    try {
      const { error } = await supabase
        .from('queue_items')
        .update({ priority_score: newScore })
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Prioridade atualizada');
      loadQueueData();
    } catch (error) {
      toast.error('Erro ao atualizar prioridade');
    }
  };

  const completeCase = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('queue_items')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Atendimento concluído');
      loadQueueData();
    } catch (error) {
      toast.error('Erro ao concluir atendimento');
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const labels = {
      waiting: { label: 'Aguardando', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'Em Atendimento', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
      no_show: { label: 'Não Compareceu', color: 'bg-red-100 text-red-800' }
    };
    return labels[status as keyof typeof labels] || labels.waiting;
  };

  const filteredItems = queueItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'waiting') return item.status === 'waiting';
    if (filter === 'in_progress') return item.status === 'in_progress';
    if (filter === 'critical') return item.risk_level === 'critical' || item.risk_level === 'high';
    if (filter === 'sla_risk') return item.sla_breached || (item.sla_deadline && new Date(item.sla_deadline) < new Date());
    return true;
  });

  const stats = {
    total: queueItems.length,
    waiting: queueItems.filter(i => i.status === 'waiting').length,
    inProgress: queueItems.filter(i => i.status === 'in_progress').length,
    critical: queueItems.filter(i => i.risk_level === 'critical' || i.risk_level === 'high').length,
    slaBreached: queueItems.filter(i => i.sla_breached).length
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total na Fila</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('waiting')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.waiting}</p>
                <p className="text-xs text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('in_progress')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Em Atendimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('critical')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Alto Risco</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('sla_risk')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.slaBreached}</p>
                <p className="text-xs text-muted-foreground">SLA Violado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Fila de Atendimento</CardTitle>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="waiting">Aguardando</SelectItem>
                <SelectItem value="in_progress">Em Atendimento</SelectItem>
                <SelectItem value="critical">Alto Risco</SelectItem>
                <SelectItem value="sla_risk">SLA em Risco</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadQueueData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum item na fila</p>
            ) : (
              filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-lg border ${item.sla_breached ? 'border-red-300 bg-red-50' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{item.children?.name || 'Paciente'}</span>
                        <Badge className={getRiskBadge(item.risk_level)}>
                          {item.risk_level.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusBadge(item.status).color}>
                          {getStatusBadge(item.status).label}
                        </Badge>
                        {item.sla_breached && (
                          <Badge variant="destructive">SLA VIOLADO</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.entered_queue_at), { locale: ptBR, addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" />
                          Prioridade: {item.priority_score}
                        </span>
                        {item.assigned_to && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.profiles?.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'waiting' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updatePriority(item.id, item.priority_score + 10)}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Select onValueChange={(val) => assignCase(item.id, val)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Atribuir a..." />
                            </SelectTrigger>
                            <SelectContent>
                              {professionals.map(prof => (
                                <SelectItem key={prof.id} value={prof.id}>
                                  {prof.full_name} ({prof.current_active_cases}/{prof.max_daily_cases})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                      {item.status === 'in_progress' && (
                        <Button size="sm" onClick={() => completeCase(item.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
