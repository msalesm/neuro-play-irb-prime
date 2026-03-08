import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { useChildAbaSummary, useAbaPrograms, useAbaInterventions } from '@/hooks/useAbaNeuroPlay';
import { Skeleton } from '@/components/ui/skeleton';

interface AbaHistoryTabProps {
  childId: string;
}

function ProgramInterventions({ programId }: { programId: string }) {
  const { data: interventions, isLoading } = useAbaInterventions(programId);

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  if (!interventions || interventions.length === 0) return <p className="text-xs text-muted-foreground">Sem intervenções cadastradas</p>;

  return (
    <div className="space-y-2">
      {interventions.map((inv: any) => (
        <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm font-medium">{inv.aba_np_skills?.skill_name}</p>
            <p className="text-xs text-muted-foreground">{inv.aba_np_skills?.skill_category}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={inv.status === 'mastered' ? 'default' : 'secondary'} className="text-xs">
              {inv.status === 'mastered' ? 'Dominada' : inv.status === 'active' ? 'Ativa' : inv.status}
            </Badge>
            {inv.current_level != null && inv.target_level != null && (
              <span className="text-xs text-muted-foreground">
                {inv.current_level}/{inv.target_level}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AbaHistoryTab({ childId }: AbaHistoryTabProps) {
  const { data: summary, isLoading: summaryLoading } = useChildAbaSummary(childId);
  const { data: programs, isLoading: programsLoading } = useAbaPrograms(childId);

  if (summaryLoading || programsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{summary?.activePrograms || 0}</p>
            <p className="text-xs text-muted-foreground">Programas Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold">{summary?.totalTrials || 0}</p>
            <p className="text-xs text-muted-foreground">Tentativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">{summary?.accuracy || 0}%</p>
            <p className="text-xs text-muted-foreground">Taxa de Acerto</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{summary?.independence || 0}%</p>
            <p className="text-xs text-muted-foreground">Independência</p>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      {programs && programs.length > 0 ? (
        <div className="space-y-4">
          {programs.map((prog: any) => (
            <Card key={prog.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{prog.program_name}</span>
                  <Badge variant={prog.status === 'active' ? 'default' : 'secondary'}>
                    {prog.status === 'active' ? 'Ativo' : prog.status}
                  </Badge>
                </CardTitle>
                {prog.notes && <p className="text-xs text-muted-foreground">{prog.notes}</p>}
              </CardHeader>
              <CardContent>
                <ProgramInterventions programId={prog.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum programa ABA registrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
