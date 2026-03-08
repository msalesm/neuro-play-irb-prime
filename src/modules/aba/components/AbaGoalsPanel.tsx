import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAbaGoals, useCreateGoal, useUpdateGoalStatus } from '@/hooks/useAbaNeuroPlay';
import { Target, Plus, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  active: { label: 'Ativa', variant: 'default', icon: Target },
  achieved: { label: 'Alcançada', variant: 'secondary', icon: CheckCircle },
  revised: { label: 'Revisada', variant: 'outline', icon: RotateCcw },
  discontinued: { label: 'Descontinuada', variant: 'destructive', icon: XCircle },
};

interface Props {
  programId: string;
}

export function AbaGoalsPanel({ programId }: Props) {
  const { data: goals, isLoading } = useAbaGoals(programId);
  const createGoal = useCreateGoal();
  const updateStatus = useUpdateGoalStatus();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    goal_description: '',
    success_criteria: '',
    target_date: '',
  });

  const handleCreate = async () => {
    if (!form.goal_description) return;
    await createGoal.mutateAsync({
      program_id: programId,
      goal_description: form.goal_description,
      success_criteria: form.success_criteria || undefined,
      target_date: form.target_date || undefined,
    });
    setOpen(false);
    setForm({ goal_description: '', success_criteria: '', target_date: '' });
  };

  const activeGoals = goals?.filter((g: any) => g.status === 'active') || [];
  const completedGoals = goals?.filter((g: any) => g.status !== 'active') || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas do Programa
          </CardTitle>
          <CardDescription>
            {activeGoals.length} ativa{activeGoals.length !== 1 ? 's' : ''} · {completedGoals.length} concluída{completedGoals.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Meta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Meta</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Descrição da Meta</Label>
                <Textarea
                  value={form.goal_description}
                  onChange={e => setForm(f => ({ ...f, goal_description: e.target.value }))}
                  placeholder="Ex: Criança responder ao próprio nome em 3 tentativas consecutivas"
                />
              </div>
              <div>
                <Label>Critério de Sucesso</Label>
                <Input
                  value={form.success_criteria}
                  onChange={e => setForm(f => ({ ...f, success_criteria: e.target.value }))}
                  placeholder="Ex: 80% acerto em 3 sessões consecutivas"
                />
              </div>
              <div>
                <Label>Data Alvo</Label>
                <Input
                  type="date"
                  value={form.target_date}
                  onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                />
              </div>
              <Button onClick={handleCreate} disabled={createGoal.isPending} className="w-full">
                Adicionar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : !goals?.length ? (
          <p className="text-center text-muted-foreground py-6">
            Nenhuma meta definida. Adicione metas para acompanhar o progresso.
          </p>
        ) : (
          <div className="space-y-3">
            {(goals as any[]).map((g) => {
              const config = STATUS_CONFIG[g.status] || STATUS_CONFIG.active;
              const StatusIcon = config.icon;
              return (
                <div key={g.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${g.status === 'achieved' ? 'text-emerald-600' : g.status === 'discontinued' ? 'text-destructive' : 'text-primary'}`} />
                      <div>
                        <p className="text-sm font-medium">{g.goal_description}</p>
                        {g.success_criteria && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Critério: {g.success_criteria}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={config.variant} className="text-xs shrink-0">
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {g.target_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Meta: {format(new Date(g.target_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                      {g.achieved_at && (
                        <span className="text-emerald-600">
                          ✓ Alcançada em {format(new Date(g.achieved_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    {g.status === 'active' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-emerald-600"
                          onClick={() => updateStatus.mutate({ goalId: g.id, status: 'achieved' })}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Alcançada
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => updateStatus.mutate({ goalId: g.id, status: 'revised' })}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Revisar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
