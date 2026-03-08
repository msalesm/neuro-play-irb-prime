import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, BookOpen, Gamepad2, Clock, Plus, CheckCircle } from 'lucide-react';
import { usePEI } from '@/hooks/usePEI';
import { useChildAbaSummary, useAbaPrograms, useAbaInterventions } from '@/hooks/useAbaNeuroPlay';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PeiIntegrationTabProps {
  childId: string;
}

const SKILL_TO_RECOMMENDATION: Record<string, { type: string; icon: any; label: string; suggestion: string }[]> = {
  'comunicacao_funcional': [
    { type: 'story', icon: BookOpen, label: 'História Social', suggestion: 'Pedir ajuda' },
    { type: 'game', icon: Gamepad2, label: 'Jogo', suggestion: 'Jogo de comunicação' },
  ],
  'interacao_social': [
    { type: 'story', icon: BookOpen, label: 'História Social', suggestion: 'Esperar a vez' },
    { type: 'game', icon: Gamepad2, label: 'Jogo', suggestion: 'Jogo cooperativo' },
  ],
  'regulacao_emocional': [
    { type: 'story', icon: BookOpen, label: 'História Social', suggestion: 'Lidar com frustração' },
    { type: 'routine', icon: Clock, label: 'Rotina', suggestion: 'Pausa sensorial' },
  ],
  'atencao_conjunta': [
    { type: 'game', icon: Gamepad2, label: 'Jogo', suggestion: 'Atenção sustentada' },
    { type: 'routine', icon: Clock, label: 'Rotina', suggestion: 'Atividade guiada' },
  ],
  'autonomia': [
    { type: 'routine', icon: Clock, label: 'Rotina', suggestion: 'Rotina independente' },
    { type: 'game', icon: Gamepad2, label: 'Jogo', suggestion: 'Sequência de tarefas' },
  ],
  'flexibilidade_cognitiva': [
    { type: 'game', icon: Gamepad2, label: 'Jogo', suggestion: 'Troca de regras' },
  ],
  'imitacao': [
    { type: 'game', icon: Gamepad2, label: 'Jogo', suggestion: 'Espelho cognitivo' },
  ],
  'instrucoes_simples': [
    { type: 'routine', icon: Clock, label: 'Rotina', suggestion: 'Seguir instruções' },
    { type: 'game', icon: Gamepad2, label: 'Jogo', suggestion: 'Comando e ação' },
  ],
};

export function PeiIntegrationTab({ childId }: PeiIntegrationTabProps) {
  const { loading: peiLoading, currentPlan, getAllPEIsForUser, updatePEI } = usePEI();
  const { data: programs, isLoading: progsLoading } = useAbaPrograms(childId);

  useEffect(() => {
    getAllPEIsForUser(childId);
  }, [childId]);

  const loading = peiLoading || progsLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const handleAddGoalFromAba = async (skillName: string, category: string) => {
    if (!currentPlan) {
      toast.error('Nenhum PEI encontrado. Crie um PEI primeiro.');
      return;
    }
    const existingGoals = Array.isArray(currentPlan.goals) ? currentPlan.goals : [];
    const newGoal = {
      id: crypto.randomUUID(),
      title: `Melhorar: ${skillName}`,
      category,
      source: 'aba_neuroplay',
      status: 'em_andamento',
      created_at: new Date().toISOString(),
    };
    await updatePEI(currentPlan.id, { goals: [...existingGoals, newGoal] });
  };

  return (
    <div className="space-y-6">
      {/* PEI Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            PEI - Plano Educacional Individualizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="default">{currentPlan.status === 'active' ? 'Ativo' : currentPlan.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  {Array.isArray(currentPlan.goals) ? currentPlan.goals.length : 0} metas
                </span>
              </div>

              {Array.isArray(currentPlan.goals) && currentPlan.goals.length > 0 && (
                <div className="space-y-2">
                  {currentPlan.goals.map((goal: any, idx: number) => (
                    <div key={goal.id || idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <CheckCircle className={`w-4 h-4 ${goal.status === 'concluido' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm flex-1">{goal.title}</span>
                      {goal.source === 'aba_neuroplay' && (
                        <Badge variant="outline" className="text-xs">ABA</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum PEI encontrado para esta criança</p>
          )}
        </CardContent>
      </Card>

      {/* ABA Skills → PEI Goals Recommendations */}
      {programs && programs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recomendações ABA → PEI</CardTitle>
            <p className="text-xs text-muted-foreground">
              Habilidades ABA que podem se tornar metas do PEI
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programs.map((prog: any) => (
                <ProgramRecommendations 
                  key={prog.id} 
                  programId={prog.id} 
                  programName={prog.program_name}
                  onAddGoal={handleAddGoalFromAba}
                  peiExists={!!currentPlan}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProgramRecommendations({ programId, programName, onAddGoal, peiExists }: { 
  programId: string; programName: string; onAddGoal: (name: string, cat: string) => void; peiExists: boolean 
}) {
  const { data: interventions } = useAbaInterventions(programId);

  if (!interventions || interventions.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{programName}</p>
      {interventions.map((inv: any) => {
        const cat = inv.aba_np_skills?.skill_category || '';
        const recs = SKILL_TO_RECOMMENDATION[cat] || [];
        return (
          <div key={inv.id} className="p-3 rounded-lg border border-border/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{inv.aba_np_skills?.skill_name}</span>
              {peiExists && (
                <Button 
                  size="sm" variant="ghost" className="h-7 text-xs"
                  onClick={() => onAddGoal(inv.aba_np_skills?.skill_name || '', cat)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Meta PEI
                </Button>
              )}
            </div>
            {recs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recs.map((r, i) => (
                  <Badge key={i} variant="outline" className="text-xs gap-1">
                    <r.icon className="w-3 h-3" />
                    {r.suggestion}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
