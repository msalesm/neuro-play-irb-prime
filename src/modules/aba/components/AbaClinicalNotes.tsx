import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAbaClinicalNotes, useCreateClinicalNote } from '@/hooks/useAbaNeuroPlay';
import { FileText, Plus, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NOTE_TYPES: Record<string, { label: string; color: string }> = {
  observation: { label: 'Observação', color: 'bg-primary/10 text-primary' },
  behavioral: { label: 'Comportamental', color: 'bg-amber-500/10 text-amber-700' },
  environmental: { label: 'Ambiental', color: 'bg-emerald-500/10 text-emerald-700' },
  family_report: { label: 'Relato Familiar', color: 'bg-violet-500/10 text-violet-700' },
};

interface Props {
  childId: string;
  programId?: string;
  sessionId?: string;
}

export function AbaClinicalNotes({ childId, programId, sessionId }: Props) {
  const { data: notes, isLoading } = useAbaClinicalNotes(childId, sessionId);
  const createNote = useCreateClinicalNote();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content: '', note_type: 'observation' });

  const handleSubmit = async () => {
    if (!form.content.trim()) return;
    await createNote.mutateAsync({
      child_id: childId,
      program_id: programId,
      session_id: sessionId,
      note_type: form.note_type,
      content: form.content,
    });
    setForm({ content: '', note_type: 'observation' });
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Observações Clínicas
          </CardTitle>
          <CardDescription>{notes?.length || 0} registros</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-3 border rounded-lg space-y-3 bg-muted/30">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={form.note_type} onValueChange={v => setForm(f => ({ ...f, note_type: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(NOTE_TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Descreva a observação clínica..."
              className="h-20 text-sm"
            />
            <Button size="sm" onClick={handleSubmit} disabled={createNote.isPending || !form.content.trim()}>
              <Send className="h-3 w-3 mr-1" /> Registrar
            </Button>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
        ) : !notes?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma observação registrada.
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(notes as any[]).map((n) => {
              const typeConfig = NOTE_TYPES[n.note_type] || NOTE_TYPES.observation;
              return (
                <div key={n.id} className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] ${typeConfig.color}`}>
                      {typeConfig.label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(n.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm">{n.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
