import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsents } from '@/hooks/useConsents';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, FileText, Check, X, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConsentManagement() {
  const { t } = useLanguage();
  const { documents, consents, loading, giveConsent, revokeConsent, getConsentForDocument } = useConsents();
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; consentId: string; documentTitle: string }>({
    open: false,
    consentId: '',
    documentTitle: ''
  });
  const [revokeReason, setRevokeReason] = useState('');
  const [viewDocument, setViewDocument] = useState<{ open: boolean; title: string; content: string }>({
    open: false,
    title: '',
    content: ''
  });

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      terms_of_use: 'Termos de Uso',
      privacy_policy: 'Política de Privacidade',
      clinical_disclaimer: 'Declaração Clínica',
      data_processing: 'Processamento de Dados',
      research_consent: 'Pesquisa Científica'
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (type: string) => {
    if (type === 'privacy_policy') return Shield;
    return FileText;
  };

  const isRequired = (type: string) => {
    return ['terms_of_use', 'privacy_policy'].includes(type);
  };

  const handleGiveConsent = async (documentId: string) => {
    await giveConsent(documentId);
  };

  const handleRevokeConsent = async () => {
    if (revokeDialog.consentId && revokeReason) {
      await revokeConsent(revokeDialog.consentId, revokeReason);
      setRevokeDialog({ open: false, consentId: '', documentTitle: '' });
      setRevokeReason('');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Consentimentos</h1>
            <p className="text-muted-foreground">Gerencie seus consentimentos conforme a LGPD</p>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Seus Direitos (LGPD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Acesso:</strong> Você pode solicitar cópia de todos os seus dados</li>
              <li>• <strong>Correção:</strong> Você pode corrigir dados incorretos ou incompletos</li>
              <li>• <strong>Portabilidade:</strong> Você pode exportar seus dados para outra plataforma</li>
              <li>• <strong>Eliminação:</strong> Você pode solicitar a exclusão dos seus dados</li>
              <li>• <strong>Revogação:</strong> Você pode revogar consentimentos opcionais a qualquer momento</li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {documents.map(doc => {
            const Icon = getDocumentIcon(doc.document_type);
            const consent = getConsentForDocument(doc.id);
            const required = isRequired(doc.document_type);

            return (
              <Card key={doc.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{doc.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            v{doc.version}
                          </Badge>
                          {required && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.summary}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDocumentTypeLabel(doc.document_type)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {consent ? (
                        <>
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                            <Check className="h-3 w-3 mr-1" />
                            Consentido
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(consent.consented_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewDocument({ open: true, title: doc.title, content: doc.content })}
                            >
                              Ver Documento
                            </Button>
                            {!required && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setRevokeDialog({ open: true, consentId: consent.id, documentTitle: doc.title })}
                              >
                                Revogar
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary" className="text-muted-foreground">
                            <X className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewDocument({ open: true, title: doc.title, content: doc.content })}
                            >
                              Ver Documento
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleGiveConsent(doc.id)}
                            >
                              Aceitar
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revoke Dialog */}
        <Dialog open={revokeDialog.open} onOpenChange={(open) => !open && setRevokeDialog({ open: false, consentId: '', documentTitle: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revogar Consentimento</DialogTitle>
              <DialogDescription>
                Você está revogando o consentimento para: <strong>{revokeDialog.documentTitle}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Por favor, informe o motivo da revogação. Esta ação será registrada para fins de auditoria.
              </p>
              <Textarea
                placeholder="Motivo da revogação..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeDialog({ open: false, consentId: '', documentTitle: '' })}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRevokeConsent}
                disabled={!revokeReason.trim()}
              >
                Confirmar Revogação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog open={viewDocument.open} onOpenChange={(open) => !open && setViewDocument({ open: false, title: '', content: '' })}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{viewDocument.title}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {viewDocument.content.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-semibold mt-3 mb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.trim()) {
                    return <p key={i} className="mb-2">{line}</p>;
                  }
                  return null;
                })}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setViewDocument({ open: false, title: '', content: '' })}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
