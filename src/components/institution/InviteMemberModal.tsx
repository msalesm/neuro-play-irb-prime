import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: string, department?: string) => Promise<any>;
}

export function InviteMemberModal({ open, onOpenChange, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [department, setDepartment] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast.error('E-mail é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const result = await onInvite(email, role, department || undefined);
      if (result?.invite_code) {
        setInviteCode(result.invite_code);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/aceitar-convite?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAndClose = () => {
    setEmail('');
    setRole('member');
    setDepartment('');
    setInviteCode('');
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convidar Novo Membro
          </DialogTitle>
          <DialogDescription>
            Envie um convite para adicionar um novo membro à instituição
          </DialogDescription>
        </DialogHeader>

        {!inviteCode ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={role} onValueChange={setRole}>
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

            <div className="space-y-2">
              <Label htmlFor="department">Departamento (opcional)</Label>
              <Input
                id="department"
                placeholder="Ex: Psicologia, Educação Especial"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={resetAndClose}>
                Cancelar
              </Button>
              <Button onClick={handleInvite} disabled={loading}>
                {loading ? 'Enviando...' : 'Gerar Convite'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-500">Convite Gerado!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Compartilhe o link abaixo com {email}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Código do Convite</Label>
              <div className="flex gap-2">
                <Input value={inviteCode} readOnly className="font-mono" />
                <Button variant="outline" onClick={copyInviteLink}>
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link de Convite</Label>
              <div className="p-2 bg-muted rounded-lg text-xs font-mono break-all">
                {window.location.origin}/aceitar-convite?code={inviteCode}
              </div>
            </div>

            <Button className="w-full" onClick={resetAndClose}>
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
