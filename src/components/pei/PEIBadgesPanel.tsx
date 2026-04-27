import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Award, Sparkles, Target, Trophy, Plus, Calendar } from 'lucide-react';

export interface PEIGoalLite {
  id: string;
  area: string;
  objective: string;
  progress: number;
}

export interface PEIMilestone {
  id: string;
  type: 'milestone';
  date: string;
  title: string;
  description: string;
  goal_id?: string;
  created_by?: string;
}

export type ProgressBadgeKey = 'iniciado' | 'em_desenvolvimento' | 'consolidado' | 'conquistado';

const BADGE_DEFS: Record<
  ProgressBadgeKey,
  { label: string; min: number; icon: typeof Award; classes: string }
> = {
  iniciado: {
    label: 'Iniciado',
    min: 25,
    icon: Sparkles,
    classes: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  em_desenvolvimento: {
    label: 'Em desenvolvimento',
    min: 50,
    icon: Target,
    classes: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  consolidado: {
    label: 'Consolidado',
    min: 75,
    icon: Award,
    classes: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  conquistado: {
    label: 'Conquistado',
    min: 100,
    icon: Trophy,
    classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

export function getBadgesForProgress(progress: number): ProgressBadgeKey[] {
  return (Object.keys(BADGE_DEFS) as ProgressBadgeKey[]).filter(
    (k) => progress >= BADGE_DEFS[k].min,
  );
}

interface PEIBadgesPanelProps {
  goals: PEIGoalLite[];
  milestones: PEIMilestone[];
  isEditing: boolean;
  onAddMilestone: (m: Omit<PEIMilestone, 'id' | 'type'>) => void;
}

export function PEIBadgesPanel({
  goals,
  milestones,
  isEditing,
  onAddMilestone,
}: PEIBadgesPanelProps) {
  const [draft, setDraft] = useState({ title: '', description: '', goal_id: '' });

  const totalBadges = goals.reduce(
    (sum, g) => sum + getBadgesForProgress(g.progress).length,
    0,
  );

  const handleAdd = () => {
    if (!draft.title.trim()) return;
    onAddMilestone({
      date: new Date().toISOString(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      goal_id: draft.goal_id || undefined,
    });
    setDraft({ title: '', description: '', goal_id: '' });
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges conquistados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {totalBadges}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Marcos registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {milestones.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Metas consolidadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-500" />
              {goals.filter((g) => g.progress >= 75).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges por meta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Badges por meta</CardTitle>
          <CardDescription>
            Atribuídos automaticamente conforme o progresso registrado em cada meta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma meta cadastrada. Adicione metas na aba "Metas e Objetivos" para começar a
              conquistar badges.
            </p>
          ) : (
            goals.map((g) => {
              const badges = getBadgesForProgress(g.progress);
              return (
                <div
                  key={g.id}
                  className="flex items-start justify-between gap-4 border-b last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{g.area || 'Sem área'}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{g.objective}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 shrink-0 max-w-[60%] justify-end">
                    {badges.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">
                        sem badge ainda
                      </span>
                    ) : (
                      badges.map((k) => {
                        const def = BADGE_DEFS[k];
                        const Icon = def.icon;
                        return (
                          <Badge
                            key={k}
                            variant="outline"
                            className={`gap-1 ${def.classes}`}
                          >
                            <Icon className="h-3 w-3" />
                            {def.label}
                          </Badge>
                        );
                      })
                    )}
                    <span className="text-xs text-muted-foreground self-center ml-2">
                      {g.progress}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Timeline de marcos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linha do tempo de avanços</CardTitle>
          <CardDescription>
            Marcos pedagógicos registrados pelo professor ao longo da execução do plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedMilestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum marco registrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedMilestones.map((m) => (
                <div key={m.id} className="border-l-2 border-primary pl-4 py-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(m.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <p className="text-sm font-medium mt-1">{m.title}</p>
                  {m.description && (
                    <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEditing && (
            <div className="border-t pt-4 space-y-3">
              <div>
                <Label htmlFor="milestone-title">Título do marco</Label>
                <Input
                  id="milestone-title"
                  placeholder="Ex.: Aluno leu sílabas complexas em sala"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="milestone-desc">Detalhes (opcional)</Label>
                <Textarea
                  id="milestone-desc"
                  placeholder="Contexto, observações ou evidências"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={2}
                />
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={!draft.title.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar marco
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}