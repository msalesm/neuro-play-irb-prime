import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAbaInterventions, useCreateIntervention, useAbaSkills, useAbaProgressStats } from '@/hooks/useAbaNeuroPlay';
import { useUserRole } from '@/hooks/useUserRole';
import { ArrowLeft, Plus, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AbaTrialCollector } from './AbaTrialCollector';
import { AbaProgressChart } from './AbaProgressChart';
import { AbaGameIntegration } from './AbaGameIntegration';

const METHOD_LABELS: Record<string, string> = {
  dtt: 'Discrete Trial Training (DTT)',
  net: 'Natural Environment Teaching (NET)',
  task_analysis: 'Análise de Tarefas',
  prompting: 'Prompting',
  shaping: 'Shaping',
};

const METHOD_SHORT: Record<string, string> = {
  dtt: 'DTT',
  net: 'NET',
  task_analysis: 'Análise de Tarefas',
  prompting: 'Prompting',
  shaping: 'Shaping',
};

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'Em Progresso',
  mastered: 'Dominada',
  paused: 'Pausada',
  discontinued: 'Descontinuada',
};

interface Props {
  programId: string;
  childId: string;
  onBack: () => void;
}

export function AbaProgramDetail({ programId, childId, onBack }: Props) {
  const { isTherapist, isAdmin } = useUserRole();
  const { data: interventions, isLoading } = useAbaInterventions(programId);
  const { data: skills } = useAbaSkills();
  const createIntervention = useCreateIntervention();
  const [open, setOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<string | null>(null);
  const [form, setForm] = useState({
    skill_id: '',
    teaching_method: 'dtt',
    target_level: '80',
    success_criteria: '',
  });

  const isTherapistOrAdmin = isTherapist || isAdmin;

  const handleAdd = async () => {
    if (!form.skill_id) return;
    await createIntervention.mutateAsync({
      program_id: programId,
      skill_id: form.skill_id,
      teaching_method: form.teaching_method as any,
      target_level: parseInt(form.target_level),
      success_criteria: form.success_criteria,
    });
    setOpen(false);
    setForm({ skill_id: '', teaching_method: 'dtt', target_level: '80', success_criteria: '' });
  };

  if (selectedIntervention) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedIntervention(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Programa
        </Button>
        <AbaProgressChart interventionId={selectedIntervention} />
        {isTherapistOrAdmin && (
          <AbaTrialCollector
            preSelectedInterventionId={selectedIntervention}
            preSelectedChildId={childId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div>
          <h2 className="text-xl font-bold">Detalhes do Programa</h2>
          <p className="text-muted-foreground text-sm">Habilidades e intervenções</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Habilidades-Alvo
            </CardTitle>
            <CardDescription>Clique para ver progresso e registrar tentativas</CardDescription>
          </div>
          {isTherapistOrAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Habilidade</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Habilidade</Label>
                    <Select value={form.skill_id} onValueChange={v => setForm(f => ({ ...f, skill_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {(skills || []).map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.skill_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Método de Ensino</Label>
                    <Select value={form.teaching_method} onValueChange={v => setForm(f => ({ ...f, teaching_method: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(METHOD_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Meta de Acerto (%)</Label>
                    <Input
                      type="number"
                      value={form.target_level}
                      onChange={e => setForm(f => ({ ...f, target_level: e.target.value }))}
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
                  <Button onClick={handleAdd} disabled={createIntervention.isPending} className="w-full">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-6">Carregando...</p>
          ) : !interventions?.length ? (
            <p className="text-center text-muted-foreground py-6">
              Nenhuma habilidade adicionada. Clique em "Adicionar" para começar.
            </p>
          ) : (
            <div className="space-y-2">
              {interventions.map((i: any) => (
                <InterventionRow
                  key={i.id}
                  intervention={i}
                  onClick={() => setSelectedIntervention(i.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InterventionRow({ intervention, onClick }: { intervention: any; onClick: () => void }) {
  const stats = useAbaProgressStats(intervention.id);
  const TrendIcon = stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stats.trend === 'up' ? 'text-success' : stats.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div
      className="flex flex-col gap-2 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{intervention.aba_np_skills?.skill_name || 'Habilidade'}</p>
          <p className="text-xs text-muted-foreground">
            {METHOD_SHORT[intervention.teaching_method] || intervention.teaching_method} •
            Meta: {intervention.target_level}%
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.totalTrials > 0 && (
            <>
              <div className="text-right text-sm">
                <p className="font-medium">{stats.accuracy}%</p>
                <p className="text-xs text-muted-foreground">acerto</p>
              </div>
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            </>
          )}
          <Badge variant={intervention.status === 'mastered' ? 'default' : 'secondary'}>
            {STATUS_LABELS[intervention.status]}
          </Badge>
        </div>
      </div>
      {intervention.aba_np_skills?.skill_category && (
        <div onClick={e => e.stopPropagation()}>
          <AbaGameIntegration skillCategory={intervention.aba_np_skills.skill_category} compact />
        </div>
      )}
    </div>
  );
}
