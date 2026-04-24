import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lightbulb, Heart } from 'lucide-react';
import { useTraitProfile } from '@/hooks/useTraitProfile';
import { traitToneClass } from '@/modules/behavioral/trait-profile-engine';

interface StudentTraitProfileProps {
  childId: string | undefined;
  studentName?: string;
  /** Compact mode renders a tighter card (used inside lists) */
  compact?: boolean;
}

export function StudentTraitProfile({ childId, studentName, compact = false }: StudentTraitProfileProps) {
  const { data, isLoading } = useTraitProfile(childId);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.dominantTraits.length === 0) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Ainda estamos conhecendo {studentName || 'este aluno'}.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Após algumas atividades, o perfil de traços aparece aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Perfil de Traços
          {studentName && (
            <span className="text-sm font-normal text-muted-foreground">• {studentName}</span>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          {data.narrative}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dominant traits */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Traços marcantes
          </p>
          <div className="flex flex-wrap gap-2">
            {data.dominantTraits.map((trait) => (
              <Badge
                key={trait.id}
                variant="outline"
                className={`px-3 py-1.5 text-sm gap-1.5 ${traitToneClass(trait.intensity)}`}
              >
                <span className="text-base leading-none">{trait.emoji}</span>
                <span className="font-semibold">{trait.name}</span>
                <span className="opacity-70 text-xs">{trait.intensity}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Emerging traits */}
        {data.emergingTraits.length > 0 && !compact && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Em desenvolvimento
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.emergingTraits.map((trait) => (
                <Badge key={trait.id} variant="outline" className="text-xs gap-1 bg-muted/50">
                  <span>{trait.emoji}</span>
                  <span>{trait.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick wins */}
        {data.classroomQuickWins.length > 0 && (
          <div className="rounded-xl bg-card border border-border/60 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-chart-4" />
              <p className="text-xs font-semibold text-foreground">Sugestões para hoje em sala</p>
            </div>
            <ul className="space-y-1.5">
              {data.classroomQuickWins.map((tip, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <Heart className="h-3.5 w-3.5 text-primary shrink-0 mt-1" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.dataCompleteness < 0.4 && (
          <p className="text-[11px] text-muted-foreground italic text-center">
            Perfil parcial — mais atividades aumentam a precisão.
          </p>
        )}
      </CardContent>
    </Card>
  );
}