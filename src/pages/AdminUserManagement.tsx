import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Shield, UserPlus, Trash2, Search, RefreshCw } from 'lucide-react';
import { Loading } from '@/components/Loading';

type UserWithRole = {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
};

type AppRole = 'admin' | 'therapist' | 'parent' | 'user' | 'patient';

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  therapist: 'Terapeuta',
  parent: 'Pai/Mãe',
  user: 'Professor',
  patient: 'Paciente',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  therapist: 'bg-blue-100 text-blue-800 border-blue-200',
  parent: 'bg-green-100 text-green-800 border-green-200',
  user: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  patient: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from auth.users and their roles
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users_with_roles');

      if (usersError) {
        // Fallback: fetch from profiles and user_roles tables
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) throw authError;

        const usersWithRoles = await Promise.all(
          authUsers.users.map(async (authUser) => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', authUser.id)
              .single();

            return {
              id: authUser.id,
              email: authUser.email || 'Sem email',
              created_at: authUser.created_at,
              role: roleData?.role || null,
            };
          })
        );

        setUsers(usersWithRoles);
      } else {
        setUsers(usersData);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      // First, delete ALL existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      toast.success(`Role ${ROLE_LABELS[role]} atribuído com sucesso`);
      await fetchUsers();
      setSelectedUserId(null);
      setSelectedRole('');
    } catch (error: any) {
      console.error('Erro ao atribuir role:', error);
      toast.error(error.message || 'Erro ao atribuir role');
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as AppRole);

      if (error) throw error;

      toast.success('Role removido com sucesso');
      await fetchUsers();
    } catch (error: any) {
      console.error('Erro ao remover role:', error);
      toast.error('Erro ao remover role');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (roleLoading || loading) {
    return <Loading />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-irb-blue" />
          <h1 className="text-3xl font-bold text-irb-petrol">Gerenciamento de Usuários</h1>
        </div>
        <p className="text-muted-foreground">
          Administre roles e permissões de todos os usuários da plataforma
        </p>
      </div>

      <Card className="shadow-strong">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Usuários do Sistema</CardTitle>
              <CardDescription>
                {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchUsers}
                title="Atualizar lista"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role Atual</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge
                            variant="outline"
                            className={ROLE_COLORS[user.role as AppRole]}
                          >
                            {ROLE_LABELS[user.role as AppRole]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-500">
                            Sem role
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {selectedUserId === user.id ? (
                            <>
                              <Select
                                value={selectedRole}
                                onValueChange={(value) => setSelectedRole(value as AppRole)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Escolher role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="therapist">Terapeuta</SelectItem>
                                  <SelectItem value="parent">Pai/Mãe</SelectItem>
                                  <SelectItem value="patient">Paciente</SelectItem>
                                  <SelectItem value="user">Professor</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => selectedRole && assignRole(user.id, selectedRole)}
                                disabled={!selectedRole}
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUserId(null);
                                  setSelectedRole('');
                                }}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setSelectedRole((user.role as AppRole) || '');
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Alterar
                              </Button>
                              {user.role && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeRole(user.id, user.role!)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-secondary/20 border-irb-blue/20">
        <CardHeader>
          <CardTitle className="text-lg">Hierarquia de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className={ROLE_COLORS.admin}>Administrador</Badge>
              <span className="text-muted-foreground">
                Acesso total ao sistema, gerenciamento de usuários e rede
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={ROLE_COLORS.therapist}>Terapeuta</Badge>
              <span className="text-muted-foreground">
                Gestão de pacientes, relatórios clínicos e PEI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={ROLE_COLORS.parent}>Pai/Mãe</Badge>
              <span className="text-muted-foreground">
                Acompanhamento do desenvolvimento da criança e educação parental
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={ROLE_COLORS.user}>Usuário</Badge>
              <span className="text-muted-foreground">
                Acesso básico aos recursos da plataforma
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
