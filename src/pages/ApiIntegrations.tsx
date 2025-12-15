import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useApiManagement } from '@/hooks/useApiManagement';
import { useLanguage } from '@/contexts/LanguageContext';
import { Key, Webhook, Activity, Link2, Plus, Trash2, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const AVAILABLE_PERMISSIONS = [
  { id: 'read:children', label: 'Ler dados de crianças' },
  { id: 'write:children', label: 'Criar/editar crianças' },
  { id: 'read:sessions', label: 'Ler sessões de jogos' },
  { id: 'read:reports', label: 'Ler relatórios' },
  { id: 'write:reports', label: 'Criar relatórios' },
  { id: 'read:assessments', label: 'Ler avaliações' },
  { id: 'write:assessments', label: 'Criar avaliações' },
];

const WEBHOOK_EVENTS = [
  { id: 'session.completed', label: 'Sessão de jogo concluída' },
  { id: 'assessment.completed', label: 'Avaliação concluída' },
  { id: 'report.generated', label: 'Relatório gerado' },
  { id: 'child.created', label: 'Criança cadastrada' },
  { id: 'alert.triggered', label: 'Alerta disparado' },
];

const ApiIntegrations = () => {
  const { t } = useLanguage();
  const { 
    apiKeys, 
    webhooks, 
    webhookDeliveries,
    integrations,
    usageLogs,
    loading,
    createApiKey,
    revokeApiKey,
    createWebhook,
    deleteWebhook,
    refetch
  } = useApiManagement();
  
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    const key = await createApiKey(newKeyName, selectedPermissions);
    if (key) {
      setGeneratedKey(key);
      setNewKeyName('');
      setSelectedPermissions([]);
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) return;
    const result = await createWebhook(newWebhookName, newWebhookUrl, selectedEvents);
    if (result) {
      setWebhookDialogOpen(false);
      setNewWebhookName('');
      setNewWebhookUrl('');
      setSelectedEvents([]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
    );
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
            <Link2 className="h-8 w-8 text-primary" />
            API e Integrações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie chaves API, webhooks e integrações externas
          </p>
        </div>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Chaves API
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Uso da API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Chaves de API</CardTitle>
                <CardDescription>
                  Crie chaves para integrar sistemas externos com a plataforma.
                </CardDescription>
              </div>
              <Dialog open={keyDialogOpen} onOpenChange={(open) => {
                setKeyDialogOpen(open);
                if (!open) setGeneratedKey(null);
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Chave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Chave API</DialogTitle>
                    <DialogDescription>
                      Configure as permissões para a nova chave.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {generatedKey ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-medium">Sua chave API:</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="flex-1 p-2 bg-background rounded text-sm break-all">
                            {showKey ? generatedKey : '•'.repeat(40)}
                          </code>
                          <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedKey)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-destructive">
                        Atenção: Esta chave só será exibida uma vez. Guarde-a em um local seguro.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Nome da Chave</Label>
                        <Input
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Ex: Integração ERP"
                        />
                      </div>
                      <div>
                        <Label>Permissões</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {AVAILABLE_PERMISSIONS.map((perm) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={perm.id}
                                checked={selectedPermissions.includes(perm.id)}
                                onCheckedChange={() => togglePermission(perm.id)}
                              />
                              <label htmlFor={perm.id} className="text-sm">
                                {perm.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    {generatedKey ? (
                      <Button onClick={() => setKeyDialogOpen(false)}>
                        Concluir
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => setKeyDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                          Criar Chave
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma chave API criada.
                </p>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{key.name}</h4>
                          <Badge variant={key.is_active ? 'default' : 'secondary'}>
                            {key.is_active ? 'Ativa' : 'Revogada'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Prefixo: {key.key_prefix}... • Criada em {format(new Date(key.created_at), "dd/MM/yyyy")}
                        </p>
                        {key.last_used_at && (
                          <p className="text-xs text-muted-foreground">
                            Último uso: {format(new Date(key.last_used_at), "dd/MM/yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                      {key.is_active && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => revokeApiKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revogar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>
                  Configure endpoints para receber notificações de eventos.
                </CardDescription>
              </div>
              <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Webhook</DialogTitle>
                    <DialogDescription>
                      Configure o endpoint e os eventos que deseja receber.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={newWebhookName}
                        onChange={(e) => setNewWebhookName(e.target.value)}
                        placeholder="Ex: Notificações ERP"
                      />
                    </div>
                    <div>
                      <Label>URL do Endpoint</Label>
                      <Input
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                        placeholder="https://api.exemplo.com/webhook"
                        type="url"
                      />
                    </div>
                    <div>
                      <Label>Eventos</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {WEBHOOK_EVENTS.map((event) => (
                          <div key={event.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={event.id}
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => toggleEvent(event.id)}
                            />
                            <label htmlFor={event.id} className="text-sm">
                              {event.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateWebhook} 
                      disabled={!newWebhookName.trim() || !newWebhookUrl.trim()}
                    >
                      Criar Webhook
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum webhook configurado.
                </p>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{webhook.name}</h4>
                          <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                            {webhook.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {webhook.last_status && (
                            <Badge variant={webhook.last_status < 300 ? 'outline' : 'destructive'}>
                              {webhook.last_status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {webhook.url}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Uso da API</CardTitle>
              <CardDescription>
                Últimas 100 requisições feitas às suas chaves API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma requisição registrada.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {usageLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{log.method}</Badge>
                        <span className="font-mono">{log.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={log.status_code && log.status_code < 400 ? 'default' : 'destructive'}>
                          {log.status_code || 'N/A'}
                        </Badge>
                        {log.response_time_ms && (
                          <span className="text-muted-foreground">
                            {log.response_time_ms}ms
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM HH:mm")}
                        </span>
                      </div>
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

export default ApiIntegrations;
