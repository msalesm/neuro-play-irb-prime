import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Clock, Calendar, Target, Gamepad2, TrendingUp } from 'lucide-react';
import { type InterventionRecommendation } from '@/modules/intervention-protocols';

interface InterventionRecommendationsProps {
  recommendations: InterventionRecommendation[];
  context?: 'student' | 'class';
}

const PRIORITY_STYLES = {
  high: 'border-destructive/30 bg-destructive/5',
  medium: 'border-chart-4/30 bg-chart-4/5',
  low: 'border-primary/20 bg-primary/5',
};

const PRIORITY_LABELS = {
  high: { label: 'Alta', color: 'text-destructive' },
  medium: { label: 'Média', color: 'text-chart-4' },
  low: { label: 'Baixa', color: 'text-primary' },
};

const EVIDENCE_LABELS = {
  high: 'Evidência forte',
  moderate: 'Evidência moderada',
  emerging: 'Evidência emergente',
};

export function InterventionRecommendations({ recommendations, context = 'class' }: InterventionRecommendationsProps) {
  if (!recommendations.length) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="p-6 text-center">
          <Stethoscope className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Nenhuma intervenção recomendada</p>
          <p className="text-xs text-muted-foreground mt-1">
            Todos os domínios estão dentro do esperado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          Protocolos de Intervenção Recomendados
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {context === 'class'
            ? 'Baseado no perfil cognitivo médio da turma'
            : 'Baseado no perfil cognitivo individual'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => {
          const p = rec.protocol;
          const pStyle = PRIORITY_STYLES[rec.priority];
          const pLabel = PRIORITY_LABELS[rec.priority];

          return (
            <div key={p.id} className={`rounded-xl border p-4 space-y-3 ${pStyle}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold">{p.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${pLabel.color}`}>
                  Prioridade {pLabel.label}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground">{p.description}</p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {p.duration}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {p.frequency} · {p.durationWeeks} semanas
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  +{p.targetImprovement}% esperado
                </span>
              </div>

              {/* Activities */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Atividades
                </p>
                {p.activities.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-background/60 rounded-lg px-3 py-2">
                    {act.gameId ? (
                      <Gamepad2 className="h-3 w-3 text-primary shrink-0" />
                    ) : (
                      <Target className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{act.name}</span>
                      <span className="text-muted-foreground ml-1">· {act.durationMinutes}min</span>
                    </div>
                    {act.gameId && (
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        No app
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Evidence */}
              <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                📊 {EVIDENCE_LABELS[p.evidenceLevel]}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
