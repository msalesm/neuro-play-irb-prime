import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Pause, ThumbsUp, Gamepad2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Intervention {
  id: string;
  type: 'pause' | 'positive_reinforcement' | 'difficulty_change' | 'break';
  trigger: string;
  suggestion: string;
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface ImmediateInterventionsProps {
  childId: string;
}

export const ImmediateInterventions = ({ childId }: ImmediateInterventionsProps) => {
  const { data: interventions, isLoading } = useQuery({
    queryKey: ['interventions', childId],
    queryFn: async (): Promise<Intervention[]> => {
      // Analyze recent sessions to detect intervention needs
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const results: Intervention[] = [];

      if (!sessions || sessions.length === 0) return results;

      const recentSession = sessions[0];

      // Check for low accuracy
      if (recentSession.accuracy_percentage && recentSession.accuracy_percentage < 50) {
        results.push({
          id: '1',
          type: 'difficulty_change',
          trigger: 'Precisão abaixo de 50%',
          suggestion: 'Trocar para jogo de menor carga cognitiva',
          urgency: 'medium',
          timestamp: new Date(recentSession.created_at || Date.now())
        });
      }

      // Check for frustration events
      if (recentSession.frustration_events && recentSession.frustration_events > 3) {
        results.push({
          id: '2',
          type: 'pause',
          trigger: 'Múltiplos eventos de frustração',
          suggestion: 'Sugira uma pausa de 2-3 minutos',
          urgency: 'high',
          timestamp: new Date(recentSession.created_at || Date.now())
        });
      }

      // Check for long session without break
      if (recentSession.duration_seconds && recentSession.duration_seconds > 1800) {
        results.push({
          id: '3',
          type: 'break',
          trigger: 'Sessão longa sem pausa',
          suggestion: 'Recomende uma pausa para descanso',
          urgency: 'low',
          timestamp: new Date(recentSession.created_at || Date.now())
        });
      }

      // Check for improving performance - positive reinforcement
      const accuracies = sessions
        .filter(s => s.accuracy_percentage !== null)
        .map(s => s.accuracy_percentage!);
      
      if (accuracies.length >= 3) {
        const recent = accuracies.slice(0, 3);
        const isImproving = recent[0] > recent[1] && recent[1] > recent[2];
        
        if (isImproving) {
          results.push({
            id: '4',
            type: 'positive_reinforcement',
            trigger: 'Melhoria consistente detectada',
            suggestion: 'Ofereça reforço positivo pelo progresso!',
            urgency: 'low',
            timestamp: new Date()
          });
        }
      }

      return results;
    },
    enabled: !!childId
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'pause': return <Pause className="h-4 w-4" />;
      case 'positive_reinforcement': return <ThumbsUp className="h-4 w-4" />;
      case 'difficulty_change': return <Gamepad2 className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Intervenções Imediatas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {interventions && interventions.length > 0 ? (
          <div className="space-y-3">
            {interventions.map((intervention) => (
              <div
                key={intervention.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="p-2 rounded-full bg-muted">
                  {getIcon(intervention.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getUrgencyColor(intervention.urgency) as "destructive" | "secondary" | "outline"}>
                      {intervention.urgency === 'high' ? 'Urgente' : 
                       intervention.urgency === 'medium' ? 'Moderado' : 'Baixo'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {intervention.trigger}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{intervention.suggestion}</p>
                </div>
                <Button size="sm" variant="outline">
                  Aplicar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Nenhuma intervenção necessária no momento</p>
            <p className="text-xs mt-1">O desempenho está dentro do esperado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
