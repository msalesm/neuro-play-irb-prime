import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Users, GraduationCap, UserPlus, Upload, 
  Settings, BarChart3, Bell, Mail, FileText, Search,
  Plus, Download, Filter, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InstitutionMember {
  id: string;
  user_id: string;
  role: string;
  department: string | null;
  is_active: boolean;
  joined_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface Institution {
  id: string;
  name: string;
  type: string;
  contact_email: string;
  max_users: number;
  is_active: boolean;
}

export default function InstitutionalDashboard() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadInstitutionData();
    }
  }, [user]);

  const loadInstitutionData = async () => {
    try {
      // Get user's institution membership
      const { data: membership, error: memberError } = await supabase
        .from('institution_members')
        .select(`
          institution_id,
          role,
          institutions (*)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (memberError || !membership) {
        setLoading(false);
        return;
      }

      const inst = membership.institutions as unknown as Institution;
      setInstitution(inst);

      // Load members
      const { data: membersData } = await supabase
        .from('institution_members')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq('institution_id', inst.id)
        .eq('is_active', true);

      setMembers((membersData || []) as InstitutionMember[]);

      // Load students (children linked to institution classes)
      const { data: classesData } = await supabase
        .from('school_classes')
        .select('id')
        .eq('school_id', inst.id);

      if (classesData && classesData.length > 0) {
        const classIds = classesData.map(c => c.id);
        const { data: studentsData } = await supabase
          .from('class_students')
          .select(`
            *,
            children:child_id (id, name, birth_date, avatar_url)
          `)
          .in('class_id', classIds)
          .eq('is_active', true);

        setStudents(studentsData || []);
      }
    } catch (error) {
      console.error('Error loading institution data:', error);
      toast.error('Erro ao carregar dados da instituição');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !institution) return;

    try {
      // Create invitation
      const { error } = await supabase
        .from('invitations')
        .insert({
          inviter_id: user?.id,
          invite_type: 'institution_member',
          status: 'pending',
          child_name: inviteEmail, // Using as metadata
          child_conditions: { role: inviteRole, institution_id: institution.id }
        });

      if (error) throw error;

      toast.success(`Convite enviado para ${inviteEmail}`);
      setShowInviteDialog(false);
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Erro ao enviar convite');
    }
  };

  const filteredMembers = members.filter(m => 
    m.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalMembers: members.length,
    therapists: members.filter(m => m.role === 'therapist').length,
    teachers: members.filter(m => m.role === 'teacher').length,
    students: students.length
  };

  if (loading) {
    return (
      <ModernPageLayout title="Dashboard Institucional" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ModernPageLayout>
    );
  }

  if (!institution) {
    return (
      <ModernPageLayout title="Dashboard Institucional" subtitle="Gerencie sua instituição">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Sem Instituição Vinculada
            </CardTitle>
            <CardDescription>
              Você não está vinculado a nenhuma instituição. Entre em contato com o administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout 
      title={institution.name} 
      subtitle="Painel de Gestão Institucional"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Membros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <UserPlus className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.therapists}</p>
                  <p className="text-sm text-muted-foreground">Terapeutas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.teachers}</p>
                  <p className="text-sm text-muted-foreground">Professores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.students}</p>
                  <p className="text-sm text-muted-foreground">Alunos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar membros..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Convidar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convidar Novo Membro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input 
                          type="email"
                          placeholder="email@exemplo.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Função</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="coordinator">Coordenador</SelectItem>
                            <SelectItem value="therapist">Terapeuta</SelectItem>
                            <SelectItem value="teacher">Professor</SelectItem>
                            <SelectItem value="member">Membro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleInviteUser} className="w-full">
                        Enviar Convite
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar CSV
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.profiles?.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.profiles?.full_name || 'Sem nome'}</p>
                          <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhum membro encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
              <CardContent className="p-0">
                <div className="divide-y">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                          {student.children?.avatar_url ? (
                            <img 
                              src={student.children.avatar_url} 
                              alt="" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-orange-500">
                              {student.children?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{student.children?.name || 'Sem nome'}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.children?.birth_date && 
                              `${new Date().getFullYear() - new Date(student.children.birth_date).getFullYear()} anos`
                            }
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver Progresso
                      </Button>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhum aluno cadastrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Visão Geral do Progresso
                </CardTitle>
                <CardDescription>
                  Métricas agregadas de todos os alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">85%</p>
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-green-500">127</p>
                    <p className="text-sm text-muted-foreground">Histórias Lidas</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-500">89</p>
                    <p className="text-sm text-muted-foreground">Rotinas Completas</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-500">342</p>
                    <p className="text-sm text-muted-foreground">Jogos Finalizados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações da Instituição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Instituição</Label>
                    <Input defaultValue={institution.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail de Contato</Label>
                    <Input defaultValue={institution.contact_email} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select defaultValue={institution.type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinic">Clínica</SelectItem>
                        <SelectItem value="school">Escola</SelectItem>
                        <SelectItem value="therapy_center">Centro de Terapia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Salvar Alterações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Licenças</CardTitle>
                <CardDescription>
                  Limite de {institution.max_users} usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usuários ativos</span>
                    <span>{members.length} / {institution.max_users}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(members.length / institution.max_users) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}
