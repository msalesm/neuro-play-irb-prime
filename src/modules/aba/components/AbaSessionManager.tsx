import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAbaSessions, useCreateSession, useCompleteSession } from '@/hooks/useAbaNeuroPlay';
import { Play, Square, Clock, Calendar, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ENV_LABELS: Record<string, string> = {
  clinic: '🏥 Clínica',
  home: '🏠 Domicílio',
  school: '🏫 Escola',
  telehealth: '💻 Teleconsulta',
};

interface Props {
  programId: string;
  childId: string;
  onSelectSession?: (sessionId: string) => void;
}

export function AbaSessionManager({ programId, childId, onSelectSession }: Props) {
  const { data: sessions, isLoading } = useAbaSessions(programId);
  const createSession = useCreateSession();
  const completeSession = useCompleteSession();
  const [openNew, setOpenNew] = useState(false);
  const [endingSession, setEndingSession] = useState<string | null>(null);
  const [form, setForm] = useState({ environment: 'clinic', notes: '' });
  const [endForm, setEndForm] = useState({ duration: '30', notes: '' });

  const nextSessionNumber = (sessions?.length || 0) + 1;

  const handleCreate = async () => {
    await createSession.mutateAsync({
      program_id: programId,
      child_id: childId,
      session_number: nextSessionNumber,
      environment: form.environment,
      notes: form.notes || undefined,
    });
    setOpenNew(false);
    setForm({ environment: 'clinic', notes: '' });
  };

  const handleComplete = async (sessionId: string) => {
    await completeSession.mutateAsync({
      sessionId,
      durationMinutes: parseInt(endForm.duration),
      notes: endForm.notes || undefined,
    });
    setEndingSession(null);
    setEndForm({ duration: '30', notes: '' });
  };

  const activeSession = sessions?.find((s: any) => s.status === 'in_progress');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Sessões
          </CardTitle>
          <CardDescription>{sessions?.length || 0} sessões registradas</CardDescription>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!!activeSession}>
              <Plus className="h-4 w-4 mr-1" />
              {activeSession ? 'Sessão Ativa' : 'Nova Sessão'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Iniciar Sessão #{nextSessionNumber}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Ambiente</Label>
                <Select value={form.environment} onValueChange={v => setForm(f => ({ ...f, environment: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ENV_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observação inicial</Label>
                <Textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Estado emocional, disposição..."
                  className="h-20"
                />
              </div>
              <Button onClick={handleCreate} disabled={createSession.isPending} className="w-full">
                <Play className="h-4 w-4 mr-2" /> Iniciar Sessão
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : !sessions?.length ? (
          <p className="text-center text-muted-foreground py-6">
            Nenhuma sessão registrada. Inicie a primeira sessão.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onSelectSession?.(s.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'in_progress' ? 'bg-emerald-500 animate-pulse' : s.status === 'completed' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                  <div>
                    <p className="font-medium text-sm">Sessão #{s.session_number}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(s.session_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      {s.environment && (
                        <span className="ml-1">
                          <MapPin className="h-3 w-3 inline" /> {ENV_LABELS[s.environment]?.split(' ')[1] || s.environment}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.duration_minutes && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {s.duration_minutes}min
                    </span>
                  )}
                  {s.status === 'in_progress' ? (
                    <Dialog open={endingSession === s.id} onOpenChange={o => setEndingSession(o ? s.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={e => e.stopPropagation()}>
                          <Square className="h-3 w-3 mr-1" /> Finalizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent onClick={e => e.stopPropagation()}>
                        <DialogHeader><DialogTitle>Finalizar Sessão #{s.session_number}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Duração (minutos)</Label>
                            <Input
                              type="number"
                              value={endForm.duration}
                              onChange={e => setEndForm(f => ({ ...f, duration: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Observações finais</Label>
                            <Textarea
                              value={endForm.notes}
                              onChange={e => setEndForm(f => ({ ...f, notes: e.target.value }))}
                              placeholder="Resumo da sessão..."
                            />
                          </div>
                          <Button onClick={() => handleComplete(s.id)} disabled={completeSession.isPending} className="w-full">
                            Finalizar Sessão
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Badge variant={s.status === 'completed' ? 'secondary' : 'destructive'} className="text-xs">
                      {s.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
