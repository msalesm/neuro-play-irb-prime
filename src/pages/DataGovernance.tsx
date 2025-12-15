import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataGovernance } from '@/hooks/useDataGovernance';
import { useLanguage } from '@/contexts/LanguageContext';
import { Database, Download, Trash2, Shield, Clock, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DataGovernance = () => {
  const { t } = useLanguage();
  const { 
    retentionPolicies, 
    exportRequests, 
    deletionRequests, 
    accessLogs,
    loading,
    requestDataExport,
    requestDataDeletion 
  } = useDataGovernance();
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<'full_export' | 'partial_export' | 'child_data'>('full_export');
  const [deleteType, setDeleteType] = useState<'full_account' | 'child_data' | 'specific_data'>('specific_data');
  const [deleteReason, setDeleteReason] = useState('');

  const handleExportRequest = async () => {
    await requestDataExport(exportType);
    setExportDialogOpen(false);
  };

  const handleDeleteRequest = async () => {
    if (!deleteReason.trim()) return;
    await requestDataDeletion(deleteType, deleteReason);
    setDeleteDialogOpen(false);
    setDeleteReason('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'outline',
      approved: 'default',
      rejected: 'destructive',
      failed: 'destructive',
      expired: 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatRetentionDays = (days: number) => {
    if (days >= 365) {
      const years = Math.round(days / 365);
      return `${years} ano${years > 1 ? 's' : ''}`;
    }
    return `${days} dias`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Governança de Dados
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus dados pessoais conforme a LGPD
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Exportação de Dados</DialogTitle>
                <DialogDescription>
                  Você pode solicitar uma cópia de todos os seus dados armazenados na plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Exportação</Label>
                  <Select value={exportType} onValueChange={(v) => setExportType(v as typeof exportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_export">Exportação Completa</SelectItem>
                      <SelectItem value="partial_export">Exportação Parcial</SelectItem>
                      <SelectItem value="child_data">Dados da Criança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleExportRequest}>
                  Solicitar Exportação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Solicitar Exclusão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Solicitar Exclusão de Dados
                </DialogTitle>
                <DialogDescription>
                  Esta ação é irreversível. Seus dados serão permanentemente excluídos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Exclusão</Label>
                  <Select value={deleteType} onValueChange={(v) => setDeleteType(v as typeof deleteType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specific_data">Dados Específicos</SelectItem>
                      <SelectItem value="child_data">Dados da Criança</SelectItem>
                      <SelectItem value="full_account">Conta Completa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Motivo da Solicitação</Label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Descreva o motivo da solicitação..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteRequest}
                  disabled={!deleteReason.trim()}
                >
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="retention" className="space-y-4">
        <TabsList>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Políticas de Retenção
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportações
          </TabsTrigger>
          <TabsTrigger value="deletions" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Exclusões
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Histórico de Acesso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Retenção de Dados</CardTitle>
              <CardDescription>
                Confira por quanto tempo cada tipo de dado é armazenado na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium capitalize">
                        {policy.data_type.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {policy.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {formatRetentionDays(policy.retention_days)}
                      </Badge>
                      {policy.anonymize_after_days && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Anonimiza após {formatRetentionDays(policy.anonymize_after_days)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Exportação</CardTitle>
              <CardDescription>
                Histórico das suas solicitações de exportação de dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma solicitação de exportação encontrada.
                </p>
              ) : (
                <div className="space-y-4">
                  {exportRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">
                          {request.request_type === 'full_export' && 'Exportação Completa'}
                          {request.request_type === 'partial_export' && 'Exportação Parcial'}
                          {request.request_type === 'child_data' && 'Dados da Criança'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        {request.export_url && request.status === 'completed' && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={request.export_url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deletions">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Exclusão</CardTitle>
              <CardDescription>
                Histórico das suas solicitações de exclusão de dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deletionRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma solicitação de exclusão encontrada.
                </p>
              ) : (
                <div className="space-y-4">
                  {deletionRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">
                          {request.request_type === 'full_account' && 'Conta Completa'}
                          {request.request_type === 'child_data' && 'Dados da Criança'}
                          {request.request_type === 'specific_data' && 'Dados Específicos'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        {request.reason && (
                          <p className="text-sm mt-1">{request.reason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(request.status)}
                        {request.rejection_reason && (
                          <p className="text-xs text-destructive mt-1">
                            {request.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Acesso aos Dados</CardTitle>
              <CardDescription>
                Registro de todos os acessos aos seus dados sensíveis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum registro de acesso encontrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {accessLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium capitalize">
                            {log.access_type}
                          </span>
                          <span className="text-muted-foreground"> - </span>
                          <span>{log.data_category}</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataGovernance;
