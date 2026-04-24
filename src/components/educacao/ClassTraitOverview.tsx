/**
 * Class Trait Overview
 *
 * Aggregates trait profiles across the students of a class to show
 * the teacher the dominant pedagogical "personality" of the group.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Users, BookOpen } from 'lucide-react';
import { generateUnifiedProfile, type ProfileDataSources } from '@/modules/behavioral/engine';
import { generateTraitProfile, type TraitId } from '@/modules/behavioral/trait-profile-engine';

interface ClassTraitOverviewProps {
  classId: string;
  className?: string;
}

interface AggregatedTrait {
  id: TraitId;
  name: string;
  emoji: string;
  count: number;
  avgIntensity: number;
  topSuggestion: string;
}

export function ClassTraitOverview({ classId, className }: ClassTraitOverviewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['class-trait-overview', classId],
    queryFn: async (): Promise<AggregatedTrait[]> => {
      // 1. Get students of this class
      const { data: studentRows } = await supabase
        .from('class_students')
        .select('child_id, children!class_students_child_id_fkey(id, name, parent_id)')
        .eq('class_id', classId)
        .eq('is_active', true);

      const students = (studentRows || []).filter((s: any) => s.children);
      if (students.length === 0) return [];

      // 2. Resolve child_profile ids
      const childProfileIds: string[] = [];
      await Promise.all(
        students.map(async (s: any) => {
          const child = s.children as any;
          const { data: byId } = await (supabase
            .from('child_profiles')
            .select('id') as any)
            .eq('child_id', child.id)
            .maybeSingle();
          if (byId) {
            childProfileIds.push(byId.id);
            return;
          }
          if (child.parent_id) {
            const { data: byParent } = await supabase
              .from('child_profiles')
              .select('id')
              .eq('parent_user_id', child.parent_id)
              .eq('name', child.name)
              .maybeSingle();
            if (byParent) childProfileIds.push(byParent.id);
          }
        })
      );

      if (childProfileIds.length === 0) return [];

      // 3. Fetch only game sessions per student (lightweight aggregation)
      const traitTallies: Record<string, { intensities: number[]; meta?: any }> = {};

      await Promise.all(
        childProfileIds.map(async (cpId) => {
          const { data: sessions } = await supabase
            .from('game_sessions')
            .select('game_id, accuracy_percentage, avg_reaction_time_ms, completed_at, cognitive_games(cognitive_domains)')
            .eq('child_profile_id', cpId)
            .eq('completed', true)
            .order('completed_at', { ascending: false })
            .limit(40);

          if (!sessions || sessions.length === 0) return;

          const sources: ProfileDataSources = {
            gameMetrics: sessions.map((s: any) => ({
              gameId: s.game_id,
              date: s.completed_at || '',
              metrics: {
                accuracy: (s.accuracy_percentage || 0) / 100,
                reactionTimeMs: s.avg_reaction_time_ms || 0,
              },
            })),
          };

          const profile = generateUnifiedProfile(cpId, sources);
          const traits = generateTraitProfile(profile);

          for (const t of traits.dominantTraits) {
            if (!traitTallies[t.id]) {
              traitTallies[t.id] = { intensities: [], meta: { name: t.name, emoji: t.emoji, suggestion: t.suggestions[0] } };
            }
            traitTallies[t.id].intensities.push(t.intensity);
          }
        })
      );

      // 4. Aggregate
      const aggregated: AggregatedTrait[] = Object.entries(traitTallies)
        .map(([id, val]) => ({
          id: id as TraitId,
          name: val.meta.name,
          emoji: val.meta.emoji,
          topSuggestion: val.meta.suggestion,
          count: val.intensities.length,
          avgIntensity: Math.round(val.intensities.reduce((a, b) => a + b, 0) / val.intensities.length),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return aggregated;
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-5 w-44" />
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Ainda não temos dados suficientes para o perfil da turma.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Após algumas atividades, os traços dominantes da turma aparecem aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  const top = data[0];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Perfil da Turma
          {className && <span className="text-sm font-normal text-muted-foreground">• {className}</span>}
        </CardTitle>
        <CardDescription className="text-xs">
          Traços que aparecem com mais frequência entre os alunos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {data.map((t) => (
            <Badge
              key={t.id}
              variant="outline"
              className="px-3 py-2 text-sm gap-2 bg-card border-primary/20"
            >
              <span className="text-base leading-none">{t.emoji}</span>
              <span className="font-semibold text-foreground">{t.name}</span>
              <span className="text-xs text-muted-foreground">{t.count} aluno(s)</span>
            </Badge>
          ))}
        </div>

        <div className="rounded-xl bg-card border border-border/60 p-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-chart-2" />
            <p className="text-xs font-semibold text-foreground">Sugestão pedagógica do dia</p>
          </div>
          <p className="text-sm text-foreground">
            Como o traço <strong>{top.name}</strong> aparece em vários alunos hoje:{' '}
            <span className="text-muted-foreground">{top.topSuggestion}.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}