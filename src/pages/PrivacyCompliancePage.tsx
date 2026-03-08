import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useConsents } from '@/hooks/useConsents';
import { useDataGovernance } from '@/hooks/useDataGovernance';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, FileText, Check, X, AlertTriangle, Clock, 
  Download, Trash2, Database, Search, Users, CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PrivacyCompliancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Privacidade e Compliance</h1>
          <p className="text-muted-foreground">LGPD, consentimentos, governança e auditoria</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="privacy" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="consents" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Consentimentos
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            Governança
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="privacy">
          <PrivacyTab />
        </TabsContent>
        <TabsContent value="consents">
          <ConsentsTab />
        </TabsContent>
        <TabsContent value="governance">
          <GovernanceTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Privacy Tab (from PrivacyPortal) ── */
function PrivacyTab() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteAcknowledgements, setDeleteAcknowledgements] = useState({
    understand: false, irreversible: false, dataLoss: false
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const [profileResult, childrenResult, sessionsResult, emotionalResult, consentsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id),
        supabase.from('children').select('*').eq('parent_id', user.id),
        supabase.from('learning_sessions').select('*').eq('user_id', user.id),
        supabase.from('emotional_checkins').select('*').eq('user_id', user.id),
        supabase.from('data_consents').select('*').eq('user_id', user.id)
      ]);
      const exportData = {
        exportDate: new Date().toISOString(),
        userData: { profile: profileResult.data?.[0] || null, email: user.email },
        children: childrenResult.data || [],
        learningSessions: sessionsResult.data || [],
        emotionalCheckins: emotionalResult.data || [],
        consents: consentsResult.data || []
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuroplay-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== 'DELETAR MINHA CONTA') return;
    if (!deleteAcknowledgements.understand || !deleteAcknowledgements.irreversible || !deleteAcknowledgements.dataLoss) return;
    setIsDeleting(true);
    try {
      await supabase.functions.invoke('delete-user-data', { body: { userId: user.id, confirmDeletion: true } });
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Seus Direitos LGPD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Acesso aos Dados', desc: 'Solicite uma cópia de todos os seus dados' },
              { title: 'Portabilidade', desc: 'Exporte seus dados em formato legível' },
              { title: 'Eliminação', desc: 'Solicite a exclusão dos seus dados pessoais' },
              { title: 'Consentimento', desc: 'Revogue consentimentos a qualquer momento' },
            ].map(r => (
              <div key={r.title} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium">{r.title}</h4>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Exportar Meus Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Inclui perfil, crianças, sessões e consentimentos.</p>
          <Button onClick={handleExportData} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar Dados (JSON)'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" />Excluir Minha Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ação Irreversível</AlertTitle>
            <AlertDescription>Todos os seus dados serão permanentemente removidos.</AlertDescription>
          </Alert>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Solicitar Exclusão</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-destructive">Confirmar Exclusão da Conta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {(['understand', 'irreversible', 'dataLoss'] as const).map(key => (
                  <div key={key} className="flex items-start space-x-3">
                    <Checkbox id={key} checked={deleteAcknowledgements[key]} onCheckedChange={c => setDeleteAcknowledgements(p => ({ ...p, [key]: !!c }))} />
                    <Label htmlFor={key} className="text-sm">
                      {key === 'understand' ? 'Entendo que minha conta será excluída permanentemente' :
                       key === 'irreversible' ? 'Entendo que esta ação é irreversível' :
                       'Entendo que perderei todos os dados'}
                    </Label>
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Digite <strong>DELETAR MINHA CONTA</strong> para confirmar:</Label>
                  <Input value={deleteConfirmation} onChange={e => setDeleteConfirmation(e.target.value)} placeholder="DELETAR MINHA CONTA" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? 'Excluindo...' : 'Excluir Permanentemente'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Consents Tab (from ConsentManagement) ── */
function ConsentsTab() {
  const { documents, consents, loading, giveConsent, revokeConsent, getConsentForDocument } = useConsents();
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; consentId: string; documentTitle: string }>({ open: false, consentId: '', documentTitle: '' });
  const [revokeReason, setRevokeReason] = useState('');
  const [viewDocument, setViewDocument] = useState<{ open: boolean; title: string; content: string }>({ open: false, title: '', content: '' });

  const isRequired = (type: string) => ['terms_of_use', 'privacy_policy'].includes(type);

  const handleRevokeConsent = async () => {
    if (revokeDialog.consentId && revokeReason) {
      await revokeConsent(revokeDialog.consentId, revokeReason);
      setRevokeDialog({ open: false, consentId: '', documentTitle: '' });
      setRevokeReason('');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Seus Direitos (LGPD)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• <strong>Acesso:</strong> Solicite cópia dos dados</li>
            <li>• <strong>Portabilidade:</strong> Exporte para outra plataforma</li>
            <li>• <strong>Revogação:</strong> Revogue consentimentos opcionais</li>
          </ul>
        </CardContent>
      </Card>

      {documents.map(doc => {
        const consent = getConsentForDocument(doc.id);
        const required = isRequired(doc.document_type);
        return (
          <Card key={doc.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{doc.title}</h3>
                    <Badge variant="outline" className="text-xs">v{doc.version}</Badge>
                    {required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{doc.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {consent ? (
                    <>
                      <Badge className="bg-success/10 text-success border-success/30"><Check className="h-3 w-3 mr-1" />Consentido</Badge>
                      <p className="text-xs text-muted-foreground">{format(new Date(consent.consented_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewDocument({ open: true, title: doc.title, content: doc.content })}>Ver</Button>
                        {!required && <Button variant="destructive" size="sm" onClick={() => setRevokeDialog({ open: true, consentId: consent.id, documentTitle: doc.title })}>Revogar</Button>}
                      </div>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary"><X className="h-3 w-3 mr-1" />Pendente</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewDocument({ open: true, title: doc.title, content: doc.content })}>Ver</Button>
                        <Button size="sm" onClick={() => giveConsent(doc.id)}>Aceitar</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={revokeDialog.open} onOpenChange={open => !open && setRevokeDialog({ open: false, consentId: '', documentTitle: '' })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Revogar Consentimento</DialogTitle><DialogDescription>Revogando: <strong>{revokeDialog.documentTitle}</strong></DialogDescription></DialogHeader>
          <Textarea placeholder="Motivo da revogação..." value={revokeReason} onChange={e => setRevokeReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog({ open: false, consentId: '', documentTitle: '' })}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRevokeConsent} disabled={!revokeReason.trim()}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDocument.open} onOpenChange={open => !open && setViewDocument({ open: false, title: '', content: '' })}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader><DialogTitle>{viewDocument.title}</DialogTitle></DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {viewDocument.content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold mt-3 mb-2">{line.replace('## ', '')}</h2>;
                if (line.trim()) return <p key={i} className="mb-2">{line}</p>;
                return null;
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Governance Tab (from DataGovernance) ── */
function GovernanceTab() {
  const { retentionPolicies, exportRequests, deletionRequests, accessLogs, loading, requestDataExport, requestDataDeletion } = useDataGovernance();
  const [exportType, setExportType] = useState<'full_export' | 'partial_export' | 'child_data'>('full_export');
  const [deleteType, setDeleteType] = useState<'full_account' | 'child_data' | 'specific_data'>('specific_data');
  const [deleteReason, setDeleteReason] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatRetentionDays = (days: number) => days >= 365 ? `${Math.round(days / 365)} ano${Math.round(days / 365) > 1 ? 's' : ''}` : `${days} dias`;
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = { pending: 'secondary', processing: 'default', completed: 'outline', approved: 'default', rejected: 'destructive', failed: 'destructive' };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-end">
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogTrigger asChild><Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar Dados</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Solicitar Exportação</DialogTitle></DialogHeader>
            <Select value={exportType} onValueChange={v => setExportType(v as typeof exportType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full_export">Exportação Completa</SelectItem>
                <SelectItem value="partial_export">Exportação Parcial</SelectItem>
                <SelectItem value="child_data">Dados da Criança</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => { requestDataExport(exportType); setExportDialogOpen(false); }}>Solicitar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Solicitar Exclusão</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Solicitar Exclusão de Dados</DialogTitle></DialogHeader>
            <Select value={deleteType} onValueChange={v => setDeleteType(v as typeof deleteType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="specific_data">Dados Específicos</SelectItem>
                <SelectItem value="child_data">Dados da Criança</SelectItem>
                <SelectItem value="full_account">Conta Completa</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} placeholder="Motivo..." rows={3} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => { requestDataDeletion(deleteType, deleteReason); setDeleteDialogOpen(false); setDeleteReason(''); }} disabled={!deleteReason.trim()}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Políticas de Retenção</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {retentionPolicies.map(policy => (
              <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium capitalize">{policy.data_type.replace(/_/g, ' ')}</h4>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
                <Badge variant="outline">{formatRetentionDays(policy.retention_days)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {exportRequests.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Exportações</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{r.request_type === 'full_export' ? 'Completa' : r.request_type === 'partial_export' ? 'Parcial' : 'Criança'}</span>
                    <p className="text-sm text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                  {getStatusBadge(r.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {deletionRequests.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Exclusões</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deletionRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{r.request_type === 'full_account' ? 'Conta Completa' : r.request_type === 'child_data' ? 'Criança' : 'Específicos'}</span>
                    <p className="text-sm text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                  {getStatusBadge(r.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Audit Tab (from ComplianceDashboard) ── */
function AuditTab() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: logs } = await supabase.from('clinical_audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      setAuditLogs(logs || []);

      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: usersWithConsents } = await supabase.from('user_consents').select('user_id', { count: 'exact', head: true }).is('revoked_at', null);
      const { count: revokedConsents } = await supabase.from('user_consents').select('*', { count: 'exact', head: true }).not('revoked_at', 'is', null);

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
      view_record: 'Visualizar', edit_record: 'Editar', create_assessment: 'Criar Avaliação',
      generate_report: 'Gerar Relatório', export_data: 'Exportar', share_access: 'Compartilhar',
      revoke_access: 'Revogar'
    };
    return labels[action] || action;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || log.action_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = actionFilter === 'all' || log.action_type === actionFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total_users}</p><p className="text-xs text-muted-foreground">Usuários</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-success">{stats.users_with_consents}</p><p className="text-xs text-muted-foreground">Com Consentimento</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-warning">{stats.pending_consents}</p><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{stats.revoked_consents}</p><p className="text-xs text-muted-foreground">Revogados</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Logs de Auditoria</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum log encontrado</p>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{getActionLabel(log.action_type)}</Badge>
                      <span className="text-sm text-muted-foreground">{log.resource_type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
