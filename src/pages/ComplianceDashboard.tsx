import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Shield, FileText, Users, Clock, Search, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  user_id: string | null;
  professional_id: string | null;
  child_id: string | null;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  action_details: unknown;
  created_at: string;
}

interface ConsentStats {
  total_users: number;
  users_with_consents: number;
  pending_consents: number;
  revoked_consents: number;
}

export default function ComplianceDashboard() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<ConsentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load audit logs
      const { data: logs, error: logsError } = await supabase
        .from('clinical_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setAuditLogs(logs || []);

      // Load consent stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: usersWithConsents } = await supabase
        .from('user_consents')
        .select('user_id', { count: 'exact', head: true })
        .is('revoked_at', null);

      const { count: revokedConsents } = await supabase
        .from('user_consents')
        .select('*', { count: 'exact', head: true })
        .not('revoked_at', 'is', null);

      setStats({
        total_users: totalUsers || 0,
        users_with_consents: usersWithConsents || 0,
        pending_consents: (totalUsers || 0) - (usersWithConsents || 0),
        revoked_consents: revokedConsents || 0
      });
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      view_record: 'Visualizar Registro',
      edit_record: 'Editar Registro',
      create_assessment: 'Criar Avaliação',
      complete_assessment: 'Completar Avaliação',
      schedule_teleconsult: 'Agendar Teleconsulta',
      start_teleconsult: 'Iniciar Teleconsulta',
      end_teleconsult: 'Encerrar Teleconsulta',
      generate_report: 'Gerar Relatório',
      export_data: 'Exportar Dados',
      share_access: 'Compartilhar Acesso',
      revoke_access: 'Revogar Acesso',
      add_note: 'Adicionar Nota',
      edit_note: 'Editar Nota',
      delete_note: 'Excluir Nota'
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('revoke')) return 'destructive';
    if (action.includes('create') || action.includes('add')) return 'default';
    if (action.includes('view')) return 'secondary';
    return 'outline';
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = actionFilter === 'all' || log.action_type === actionFilter;
    return matchesSearch && matchesFilter;
  });

  const uniqueActions = [...new Set(auditLogs.map(l => l.action_type))];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard de Compliance</h1>
              <p className="text-muted-foreground">Monitoramento LGPD e auditoria</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.users_with_consents || 0}</p>
                  <p className="text-sm text-muted-foreground">Com Consentimento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pending_consents || 0}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.revoked_consents || 0}</p>
                  <p className="text-sm text-muted-foreground">Revogados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Logs de Auditoria Clínica
                </CardTitle>
                <CardDescription>
                  Registro imutável de todas as ações clínicas
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>
                        {getActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum log de auditoria encontrado</p>
                  </div>
                ) : (
                  filteredLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getActionColor(log.action_type) as "default" | "destructive" | "outline" | "secondary"}>
                          {getActionLabel(log.action_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.resource_type}
                          {log.resource_id && (
                            <span className="ml-1 text-xs opacity-60">
                              ({log.resource_id.slice(0, 8)}...)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {log.user_id && (
                          <span className="text-xs">
                            User: {log.user_id.slice(0, 8)}...
                          </span>
                        )}
                        <span>
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
