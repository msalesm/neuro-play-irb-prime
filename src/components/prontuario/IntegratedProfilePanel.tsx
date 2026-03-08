import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Calendar, Heart, Layers, TrendingUp, AlertCircle } from 'lucide-react';
import { useIntegratedProfile } from '@/hooks/useIntegratedProfile';

interface IntegratedProfilePanelProps {
  childId: string;
}

export const IntegratedProfilePanel = ({ childId }: IntegratedProfilePanelProps) => {
  const { profile, isLoading } = useIntegratedProfile(childId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-5 w-5 text-primary" />
            Perfil Integrado 360°
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Perfil integrado ainda não gerado. Complete atividades nos três módulos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const layers = [
    {
      name: 'Bateria Cognitiva',
      icon: Brain,
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
      score: profile.cognitive_overall,
      count: profile.layer1_sessions_count,
      details: [
        { label: 'Atenção', value: profile.cognitive_attention },
        { label: 'Inibição', value: profile.cognitive_inhibition },
        { label: 'Memória', value: profile.cognitive_memory },
        { label: 'Flexibilidade', value: profile.cognitive_flexibility },
        { label: 'Coordenação', value: profile.cognitive_coordination },
        { label: 'Persistência', value: profile.cognitive_persistence },
      ],
    },
    {
      name: 'Organização Executiva',
      icon: Calendar,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      score: profile.executive_organization_index,
      count: profile.layer2_executions_count,
      details: [
        { label: 'Autonomia', value: profile.executive_autonomy_score },
        { label: 'Conclusão', value: profile.executive_completion_rate },
        { label: 'Consistência', value: profile.executive_consistency_score },
      ],
    },
    {
      name: 'Socioemocional',
      icon: Heart,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      score: profile.socioemotional_overall,
      count: profile.layer3_decisions_count,
      details: [
        { label: 'Empatia', value: profile.socioemotional_empathy },
        { label: 'Controle Inibitório', value: profile.socioemotional_impulse_control },
        { label: 'Flexibilidade Social', value: profile.socioemotional_flexibility },
      ],
    },
  ];

  const activeScores = layers.filter(l => l.score !== null).map(l => l.score!);
  const globalScore = activeScores.length > 0 
    ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length) 
    : null;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Perfil Integrado 360°
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Global Score */}
          {globalScore !== null && (
            <div className="text-center mb-6 p-4 rounded-xl bg-muted/50">
              <div className={`text-5xl font-bold ${getScoreColor(globalScore)}`}>
                {globalScore}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Score Global Integrado</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {layers.map((l, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full ${l.score !== null ? l.bgColor : 'bg-muted'}`}
                    title={`${l.name}: ${l.score ?? 'N/A'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Layer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {layers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <Card key={idx} className={`border-2 ${layer.score !== null ? layer.borderColor : 'border-muted'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-4 w-4 ${layer.color}`} />
                      <span className="text-sm font-medium">{layer.name}</span>
                    </div>

                    {layer.score !== null ? (
                      <>
                        <div className={`text-2xl font-bold ${getScoreColor(layer.score)}`}>
                          {Math.round(layer.score)}%
                        </div>
                        <Progress value={layer.score} className="mt-2 h-1.5" />
                        <div className="mt-3 space-y-1">
                          {layer.details.map((d, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{d.label}</span>
                              <span className={getScoreColor(d.value)}>{d.value !== null ? `${Math.round(d.value)}%` : '-'}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{layer.count} registros</p>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Dados insuficientes</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Interpretation */}
          {profile.interpretation && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Interpretação</span>
              </div>
              <p className="text-sm text-muted-foreground">{profile.interpretation}</p>
            </div>
          )}

          {/* Recommendations */}
          {profile.recommendations && (profile.recommendations as string[]).length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-sm font-medium">Recomendações</span>
              {(profile.recommendations as string[]).map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                  <span className="text-xs text-primary font-bold mt-0.5">{i + 1}</span>
                  <p className="text-xs text-muted-foreground">{rec}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            Gerado em {new Date(profile.generated_at).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
