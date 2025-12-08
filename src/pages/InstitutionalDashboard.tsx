import { useState } from 'react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, UserPlus, Upload, Settings, BarChart3, Download, Plus } from 'lucide-react';
import { useInstitution } from '@/hooks/useInstitution';
import { InstitutionStatsCards } from '@/components/institution/InstitutionStatsCards';
import { InstitutionMembersList } from '@/components/institution/InstitutionMembersList';
import { InstitutionProgressTab } from '@/components/institution/InstitutionProgressTab';
import { InstitutionSettingsTab } from '@/components/institution/InstitutionSettingsTab';
import { InviteMemberModal } from '@/components/institution/InviteMemberModal';
import { BulkImportModal } from '@/components/institution/BulkImportModal';

export default function InstitutionalDashboard() {
  const { institution, members, stats, loading, isAdmin, isCoordinator, inviteMember, updateMemberRole, removeMember, reload } = useInstitution();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard Institucional</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </ModernPageLayout>
    );
  }

  if (!institution) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard Institucional</h1>
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Sem Instituição Vinculada
              </CardTitle>
              <CardDescription>
                Você não está vinculado a nenhuma instituição. Entre em contato com o administrador para receber um convite.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Se você recebeu um código de convite, acesse a página de aceitar convite para se vincular a uma instituição.
              </p>
            </CardContent>
          </Card>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{institution.name}</h1>
          <p className="text-muted-foreground">Painel de Gestão Institucional</p>
        </div>

        {/* Stats Cards */}
        <InstitutionStatsCards stats={stats} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4 hidden sm:inline" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <UserPlus className="w-4 h-4 hidden sm:inline" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <BarChart3 className="w-4 h-4 hidden sm:inline" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4 hidden sm:inline" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <h3 className="text-lg font-semibold">Membros da Instituição</h3>
              {isCoordinator && (
                <div className="flex gap-2">
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar
                  </Button>
                  <Button variant="outline" onClick={() => setShowImportModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                </div>
              )}
            </div>

            <InstitutionMembersList
              members={members}
              onUpdateRole={updateMemberRole}
              onRemoveMember={removeMember}
              isAdmin={isAdmin}
            />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Alunos Cadastrados</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Aluno
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum aluno cadastrado ainda</p>
                <p className="text-sm mt-2">Adicione alunos através do botão acima ou importando um CSV</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <InstitutionProgressTab institutionId={institution.id} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <InstitutionSettingsTab 
              institution={institution} 
              isAdmin={isAdmin} 
              onUpdate={reload}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvite={inviteMember}
      />

      <BulkImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        institutionId={institution.id}
        onImportComplete={reload}
      />
    </ModernPageLayout>
  );
}
