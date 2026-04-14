import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Shield, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ROLE_BADGES } from '@/core/navigation';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { role, roles } = useUserRole();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const createdAt = user.created_at ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'N/A';
  const roleBadge = role ? ROLE_BADGES[role] : null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="space-y-5">
      {/* Profile header card */}
      <Card className="rounded-[20px] overflow-hidden">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 border-4 border-card shadow-lg mb-3">
            <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-foreground">{userName}</h1>
          <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {roles.map((r) => {
              const badge = ROLE_BADGES[r];
              return badge ? (
                <Badge key={r} variant="outline" className={`text-[10px] py-0.5 px-2 ${badge.gradient}`}>
                  {badge.label}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      </Card>

      {/* Info items */}
      <Card className="rounded-[20px]">
        <CardContent className="p-0 divide-y divide-border/50">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 rounded-xl bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Membro desde</p>
              <p className="text-sm font-medium text-foreground">{createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium text-foreground">
                {user.email_confirmed_at ? '✓ Email verificado' : 'Email não verificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="rounded-[20px]">
        <CardContent className="p-0">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-muted/50 transition-colors"
          >
            <div className="p-2 rounded-xl bg-muted">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">Configurações</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        onClick={handleSignOut}
        className="w-full rounded-xl h-12"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair da Conta
      </Button>
    </div>
  );
};

export default Profile;
