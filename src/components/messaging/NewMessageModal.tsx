import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (params: { recipientId: string; childId?: string; subject?: string; content: string }) => Promise<any>;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  type: 'parent' | 'therapist' | 'teacher';
}

export function NewMessageModal({ open, onOpenChange, onSend }: NewMessageModalProps) {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadRecipients();
      loadChildren();
    }
  }, [open, user]);

  const loadRecipients = async () => {
    setLoadingRecipients(true);
    try {
      // Get all profiles except current user
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user?.id || '');

      if (profiles && profiles.length > 0) {
        const profileIds = profiles.map(p => p.id);
        
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', profileIds);

        const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

        setRecipients(profiles.map(p => ({
          id: p.id,
          name: p.full_name || 'Usuário',
          email: p.email || '',
          type: (roleMap.get(p.id) as 'parent' | 'therapist' | 'teacher') || 'parent'
        })));
      } else {
        setRecipients([]);
      }
    } catch (error) {
      console.error('Error loading recipients:', error);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const loadChildren = async () => {
    try {
      const { data } = await supabase
        .from('children')
        .select('id, name')
        .eq('parent_id', user?.id)
        .eq('is_active', true);

      // Also check child_access for therapists
      const { data: accessData } = await supabase
        .from('child_access')
        .select('child_id, children(id, name)')
        .eq('professional_id', user?.id)
        .eq('is_active', true);

      const childrenMap = new Map<string, { id: string; name: string }>();
      
      data?.forEach(c => childrenMap.set(c.id, { id: c.id, name: c.name }));
      accessData?.forEach((access: any) => {
        if (access.children) {
          childrenMap.set(access.children.id, { id: access.children.id, name: access.children.name });
        }
      });

      setChildren(Array.from(childrenMap.values()));
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handleSend = async () => {
    if (!selectedRecipient || !content.trim()) {
      toast.error('Selecione um destinatário e escreva uma mensagem');
      return;
    }

    setLoading(true);
    try {
      await onSend({
        recipientId: selectedRecipient,
        childId: selectedChild || undefined,
        subject: subject || undefined,
        content: content.trim()
      });
      
      resetForm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRecipient('');
    setSelectedChild('');
    setSubject('');
    setContent('');
  };

  const getRoleLabel = (type: string) => {
    switch (type) {
      case 'therapist': return 'Terapeuta';
      case 'teacher': return 'Professor';
      default: return 'Responsável';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogDescription>
            Envie uma mensagem segura para um profissional ou responsável
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Destinatário *</Label>
            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
              <SelectTrigger>
                <SelectValue placeholder={loadingRecipients ? 'Carregando...' : 'Selecione o destinatário'} />
              </SelectTrigger>
              <SelectContent>
                {recipients.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex items-center gap-2">
                      <span>{r.name}</span>
                      <span className="text-xs text-muted-foreground">({getRoleLabel(r.type)})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {children.length > 0 && (
            <div className="space-y-2">
              <Label>Sobre qual criança? (opcional)</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma criança" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma específica</SelectItem>
                  {children.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Assunto (opcional)</Label>
            <Input
              placeholder="Assunto da mensagem"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Mensagem *</Label>
            <Textarea
              placeholder="Escreva sua mensagem..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading || !selectedRecipient || !content.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
