/**
 * BehavioralProfileWidget
 * 
 * Displays the unified behavioral profile summary in dashboards.
 * Uses the core behavioral-profile-engine via useBehavioralProfile hook.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Heart, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useBehavioralProfile } from '@/hooks/useBehavioralProfile';
import type { DomainScore } from '@/modules/behavioral/engine';

interface BehavioralProfileWidgetProps {
  childId: string;
  compact?: boolean;
}

const trendIcon = (trend: string) => {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-success" />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const classificationBadge = (classification: string) => {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    adequate: { label: 'Adequado', variant: 'default' },
    monitoring: { label: 'Monitorar', variant: 'secondary' },
    attention: { label: 'Atenção', variant: 'outline' },
    intervention: { label: 'Intervenção', variant: 'destructive' },
  };
  const info = map[classification] || { label: classification, variant: 'outline' as const };
  return <Badge variant={info.variant} className="text-[10px] px-1.5 py-0">{info.label}</Badge>;
};

function DomainRow({ label, domain }: { label: string; domain: DomainScore }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          {trendIcon(domain.trend)}
          <span className="text-xs font-medium">{domain.score}</span>
        </div>
      </div>
      <Progress value={domain.score} className="h-1" />
    </div>
  );
}

export function BehavioralProfileWidget({ childId, compact = false }: BehavioralProfileWidgetProps) {
  const { data: profile, isLoading } = useBehavioralProfile(childId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-1/3 mb-3" />
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Dados insuficientes para perfil comportamental</p>
        </CardContent>
      </Card>
    );
  }

  const trendLabel = profile.evolutionTrend === 'improving' ? 'Em melhora' : profile.evolutionTrend === 'declining' ? 'Em declínio' : 'Estável';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Perfil Comportamental
          </span>
          <div className="flex items-center gap-1.5">
            {trendIcon(profile.evolutionTrend === 'improving' ? 'up' : profile.evolutionTrend === 'declining' ? 'down' : 'stable')}
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-3xl font-bold text-primary">{profile.overallScore}</div>
          <p className="text-xs text-muted-foreground">Score Geral</p>
        </div>

        {!compact && (
          <>
            {/* Cognitive */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Brain className="h-3.5 w-3.5 text-info" />
                <span className="text-xs font-medium">Cognitivo</span>
              </div>
              <div className="space-y-2 pl-5">
                <DomainRow label="Atenção" domain={profile.cognitive.attention} />
                <DomainRow label="Memória" domain={profile.cognitive.memory} />
                <DomainRow label="Flexibilidade" domain={profile.cognitive.flexibility} />
                <DomainRow label="Inibição" domain={profile.cognitive.inhibition} />
              </div>
            </div>

            {/* Socioemotional */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Heart className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-medium">Socioemocional</span>
              </div>
              <div className="space-y-2 pl-5">
                <DomainRow label="Empatia" domain={profile.socioemotional.empathy} />
                <DomainRow label="Regulação" domain={profile.socioemotional.emotionalRegulation} />
              </div>
            </div>

            {/* Executive */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-medium">Função Executiva</span>
              </div>
              <div className="space-y-2 pl-5">
                <DomainRow label="Organização" domain={profile.executive.organization} />
                <DomainRow label="Autonomia" domain={profile.executive.autonomy} />
              </div>
            </div>
          </>
        )}

        {/* Strengths & Alerts */}
        {profile.strengths.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.strengths.slice(0, 3).map((s, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">✓ {s}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
