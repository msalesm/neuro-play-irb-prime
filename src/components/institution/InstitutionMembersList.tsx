import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, MoreVertical, UserCog, Trash2, Mail } from 'lucide-react';
import { InstitutionMember } from '@/hooks/useInstitution';

interface InstitutionMembersListProps {
  members: InstitutionMember[];
  onUpdateRole: (memberId: string, newRole: string) => void;
  onRemoveMember: (memberId: string) => void;
  isAdmin: boolean;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordenador',
  therapist: 'Terapeuta',
  teacher: 'Professor',
  member: 'Membro'
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  coordinator: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  therapist: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  teacher: 'bg-green-500/10 text-green-500 border-green-500/20',
  member: 'bg-muted text-muted-foreground border-border'
};

export function InstitutionMembersList({ 
  members, 
  onUpdateRole, 
  onRemoveMember, 
  isAdmin 
}: InstitutionMembersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<InstitutionMember | null>(null);

  const filteredMembers = members.filter(m =>
    m.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = (member: InstitutionMember, newRole: string) => {
    if (newRole !== member.role) {
      onUpdateRole(member.id, newRole);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar membros..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Members List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {member.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{member.profile?.full_name || 'Sem nome'}</p>
                    <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={roleColors[member.role] || roleColors.member}>
                    {roleLabels[member.role] || member.role}
                  </Badge>
                  {member.department && (
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {member.department}
                    </Badge>
                  )}
                  
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Mail className="w-4 h-4" />
                          Enviar Mensagem
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(member, 'admin')}
                          disabled={member.role === 'admin'}
                        >
                          <UserCog className="w-4 h-4 mr-2" />
                          Tornar Administrador
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(member, 'coordinator')}
                          disabled={member.role === 'coordinator'}
                        >
                          <UserCog className="w-4 h-4 mr-2" />
                          Tornar Coordenador
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(member, 'therapist')}
                          disabled={member.role === 'therapist'}
                        >
                          <UserCog className="w-4 h-4 mr-2" />
                          Tornar Terapeuta
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(member, 'teacher')}
                          disabled={member.role === 'teacher'}
                        >
                          <UserCog className="w-4 h-4 mr-2" />
                          Tornar Professor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive gap-2"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover Membro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {memberToRemove?.profile?.full_name || 'este membro'} da instituição?
              Esta ação pode ser desfeita pelo administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (memberToRemove) {
                  onRemoveMember(memberToRemove.id);
                  setMemberToRemove(null);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
