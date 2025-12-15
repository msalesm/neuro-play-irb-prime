import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Download, Trash2, Shield, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

const PrivacyPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteAcknowledgements, setDeleteAcknowledgements] = useState({
    understand: false,
    irreversible: false,
    dataLoss: false
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para exportar seus dados.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all user data from various tables
      const [
        profileResult,
        childrenResult,
        sessionsResult,
        emotionalResult,
        consentsResult
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id),
        supabase.from("children").select("*").eq("parent_id", user.id),
        supabase.from("learning_sessions").select("*").eq("user_id", user.id),
        supabase.from("emotional_checkins").select("*").eq("user_id", user.id),
        supabase.from("data_consents").select("*").eq("user_id", user.id)
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        userData: {
          profile: profileResult.data?.[0] || null,
          email: user.email
        },
        children: childrenResult.data || [],
        learningSessions: sessionsResult.data || [],
        emotionalCheckins: emotionalResult.data || [],
        consents: consentsResult.data || []
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neuroplay-dados-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Seus dados foram exportados com sucesso."
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar seus dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (deleteConfirmation !== "DELETAR MINHA CONTA") {
      toast({
        title: "Confirmação incorreta",
        description: "Digite exatamente 'DELETAR MINHA CONTA' para confirmar.",
        variant: "destructive"
      });
      return;
    }

    if (!deleteAcknowledgements.understand || !deleteAcknowledgements.irreversible || !deleteAcknowledgements.dataLoss) {
      toast({
        title: "Confirmações necessárias",
        description: "Você precisa marcar todas as confirmações para prosseguir.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Call edge function to handle complete data deletion
      const { error } = await supabase.functions.invoke("delete-user-data", {
        body: { userId: user.id, confirmDeletion: true }
      });

      if (error) throw error;

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: "Conta deletada",
        description: "Sua conta e todos os dados foram removidos permanentemente."
      });

      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Erro ao deletar",
        description: "Ocorreu um erro ao deletar sua conta. Entre em contato com o suporte.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portal de Privacidade</h1>
            <p className="text-muted-foreground">Gerencie seus dados conforme a LGPD</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Rights Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Seus Direitos LGPD
              </CardTitle>
              <CardDescription>
                A Lei Geral de Proteção de Dados garante seus direitos sobre informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Acesso aos Dados</h4>
                    <p className="text-sm text-muted-foreground">Você pode solicitar uma cópia de todos os seus dados</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Portabilidade</h4>
                    <p className="text-sm text-muted-foreground">Exporte seus dados em formato legível</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Eliminação</h4>
                    <p className="text-sm text-muted-foreground">Solicite a exclusão de seus dados pessoais</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Consentimento</h4>
                    <p className="text-sm text-muted-foreground">Revogue consentimentos a qualquer momento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Meus Dados
              </CardTitle>
              <CardDescription>
                Baixe uma cópia completa de todas as suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                O arquivo exportado incluirá: perfil, dados das crianças cadastradas, sessões de aprendizado, 
                check-ins emocionais e registros de consentimento.
              </p>
              <Button onClick={handleExportData} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exportando..." : "Exportar Dados (JSON)"}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Excluir Minha Conta
              </CardTitle>
              <CardDescription>
                Remova permanentemente sua conta e todos os dados associados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ação Irreversível</AlertTitle>
                <AlertDescription>
                  Esta ação não pode ser desfeita. Todos os seus dados, incluindo perfis de crianças, 
                  histórico de sessões e progresso serão permanentemente removidos.
                </AlertDescription>
              </Alert>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Solicitar Exclusão
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-destructive">Confirmar Exclusão da Conta</DialogTitle>
                    <DialogDescription>
                      Esta ação é permanente e não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="understand"
                          checked={deleteAcknowledgements.understand}
                          onCheckedChange={(checked) => 
                            setDeleteAcknowledgements(prev => ({ ...prev, understand: !!checked }))
                          }
                        />
                        <Label htmlFor="understand" className="text-sm">
                          Entendo que minha conta será excluída permanentemente
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="irreversible"
                          checked={deleteAcknowledgements.irreversible}
                          onCheckedChange={(checked) => 
                            setDeleteAcknowledgements(prev => ({ ...prev, irreversible: !!checked }))
                          }
                        />
                        <Label htmlFor="irreversible" className="text-sm">
                          Entendo que esta ação é irreversível
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="dataLoss"
                          checked={deleteAcknowledgements.dataLoss}
                          onCheckedChange={(checked) => 
                            setDeleteAcknowledgements(prev => ({ ...prev, dataLoss: !!checked }))
                          }
                        />
                        <Label htmlFor="dataLoss" className="text-sm">
                          Entendo que perderei todos os dados de progresso e histórico
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmation">
                        Digite <strong>DELETAR MINHA CONTA</strong> para confirmar:
                      </Label>
                      <Input
                        id="confirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETAR MINHA CONTA"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Excluindo..." : "Excluir Permanentemente"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Contact DPO */}
          <Card>
            <CardHeader>
              <CardTitle>Contato com Encarregado de Dados (DPO)</CardTitle>
              <CardDescription>
                Para dúvidas ou solicitações adicionais sobre seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email: <a href="mailto:privacidade@neuroplay.com.br" className="text-primary hover:underline">
                  privacidade@neuroplay.com.br
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tempo de resposta: até 15 dias úteis conforme LGPD
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPortal;
