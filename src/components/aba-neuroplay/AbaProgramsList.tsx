import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAbaPrograms, useCreateProgram } from '@/hooks/useAbaNeuroPlay';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  onSelectProgram: (programId: string, childId: string) => void;
}

export function AbaProgramsList({ onSelectProgram }: Props) {
  const { profile } = useAuth();
  const { data: programs, isLoading } = useAbaPrograms();
  const createProgram = useCreateProgram();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ child_id: '', program_name: '', notes: '' });

  const isTherapistOrAdmin = profile?.role === 'therapist' || profile?.role === 'admin';

  // Fetch children this user has access to
  const { data: children } = useQuery({
    queryKey: ['user-children-for-aba'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.rpc('get_user_children', { _user_id: user.id });
      if (error) throw error;
      return data;
    },
  });

  const handleCreate = async () => {
    if (!form.child_id || !form.program_name) return;
    await createProgram.mutateAsync(form);
    setOpen(false);
    setForm({ child_id: '', program_name: '', notes: '' });
  };

  const statusColors: Record<string, string> = {
    active: 'default',
    paused: 'secondary',
    completed: 'outline',
    archived: 'destructive',
  };

  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    paused: 'Pausado',
    completed: 'Concluído',
    archived: 'Arquivado',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Programas ABA</CardTitle>
          <CardDescription>Programas individualizados de intervenção</CardDescription>
        </div>
        {isTherapistOrAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Programa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Programa ABA</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Criança</Label>
                  <Select value={form.child_id} onValueChange={v => setForm(f => ({ ...f, child_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {(children || []).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nome do Programa</Label>
                  <Input
                    value={form.program_name}
                    onChange={e => setForm(f => ({ ...f, program_name: e.target.value }))}
                    placeholder="Ex: Comunicação Funcional - Fase 1"
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Notas sobre o programa..."
                  />
                </div>
                <Button onClick={handleCreate} disabled={createProgram.isPending} className="w-full">
                  {createProgram.isPending ? 'Criando...' : 'Criar Programa'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : !programs?.length ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum programa ABA criado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {programs.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onSelectProgram(p.id, p.child_id)}
              >
                <div>
                  <p className="font-medium">{p.program_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Criado por {(p as any).profiles?.full_name || 'Desconhecido'} •{' '}
                    {format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[p.status] as any}>{statusLabels[p.status] || p.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
