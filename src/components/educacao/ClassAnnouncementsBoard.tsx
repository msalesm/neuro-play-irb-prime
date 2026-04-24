import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Megaphone, Pin, Plus, Calendar, BookOpen, Bell, PartyPopper, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  classId: string;
  className?: string;
  /** When true, only allows reading (parent view). */
  readOnly?: boolean;
}

const CATEGORY_META: Record<string, { label: string; Icon: any; tone: string }> = {
  general: { label: 'Geral', Icon: MessageSquare, tone: 'bg-muted text-foreground' },
  event: { label: 'Evento', Icon: Calendar, tone: 'bg-primary/10 text-primary' },
  reminder: { label: 'Lembrete', Icon: Bell, tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  pedagogical: { label: 'Pedagógico', Icon: BookOpen, tone: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  celebration: { label: 'Celebração', Icon: PartyPopper, tone: 'bg-pink-500/15 text-pink-700 dark:text-pink-400' },
};

export function ClassAnnouncementsBoard({ classId, className, readOnly = false }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', category: 'general', pinned: false });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['class-announcements', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_announcements')
        .select('*')
        .eq('class_id', classId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!classId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');
      if (!form.title.trim() || !form.message.trim()) throw new Error('Preencha título e mensagem');
      const { error } = await supabase.from('class_announcements').insert({
        class_id: classId,
        teacher_id: user.id,
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        pinned: form.pinned,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Aviso publicado para os pais');
      setForm({ title: '', message: '', category: 'general', pinned: false });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['class-announcements', classId] });
    },
    onError: (e: any) => toast.error(e.message || 'Não foi possível publicar'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('class_announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Aviso removido');
      queryClient.invalidateQueries({ queryKey: ['class-announcements', classId] });
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Megaphone className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="text-base sm:text-lg truncate">
              Avisos {className ? `– ${className}` : 'da turma'}
            </CardTitle>
          </div>
          {!readOnly && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo aviso</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Publicar aviso</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label>
                    <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_META).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Título</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Ex: Reunião de pais na próxima sexta"
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Mensagem</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Detalhes que os pais precisam saber..."
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pinned}
                      onChange={(e) => setForm(f => ({ ...f, pinned: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    Fixar no topo
                  </label>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Publicando...' : 'Publicar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
        ) : announcements.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {readOnly ? 'Nenhum aviso ainda.' : 'Publique o primeiro aviso para os pais.'}
          </div>
        ) : (
          announcements.map((a: any) => {
            const meta = CATEGORY_META[a.category] || CATEGORY_META.general;
            const Icon = meta.Icon;
            return (
              <div
                key={a.id}
                className={`p-3 rounded-xl border ${a.pinned ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Badge variant="secondary" className={`gap-1 ${meta.tone} border-0`}>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                    {a.pinned && (
                      <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
                        <Pin className="h-3 w-3" /> Fixado
                      </Badge>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm('Remover este aviso?')) deleteMutation.mutate(a.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1">{a.title}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{a.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {format(new Date(a.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}