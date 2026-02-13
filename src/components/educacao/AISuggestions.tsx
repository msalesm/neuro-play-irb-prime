import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AISuggestionsProps {
  observations: any[];
  students: any[];
  className?: string;
}

interface Suggestion {
  studentName: string;
  strategies: string[];
  priority: 'low' | 'moderate' | 'high';
}

export function AISuggestions({ observations, students, className }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    if (observations.length === 0) {
      toast.error('Registre observações primeiro.');
      return;
    }

    setLoading(true);
    try {
      const enrichedObs = observations.map((obs: any) => {
        const student = students.find((s: any) => s.child_id === obs.child_id);
        return {
          name: student?.children?.name || 'Aluno',
          risk_level: obs.risk_level,
          participation: obs.participation,
          behavior_change: obs.behavior_change,
          social_isolation: obs.social_isolation,
          aggressiveness: obs.aggressiveness,
          focus_difficulty: obs.focus_difficulty,
          performance_drop: obs.performance_drop,
          persistent_sadness: obs.persistent_sadness,
          notes: obs.notes,
        };
      });

      const { data, error } = await supabase.functions.invoke('education-ai-suggestions', {
        body: { observations: enrichedObs, className },
      });

      if (error) throw error;
      setSuggestions(data?.suggestions || []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar sugestões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-destructive text-destructive-foreground',
    moderate: 'bg-chart-4 text-white',
    low: 'bg-chart-3 text-white',
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Sugestões Inteligentes
            </CardTitle>
            <CardDescription>IA sugere estratégias pedagógicas com base nos check-ins</CardDescription>
          </div>
          <Button
            onClick={generateSuggestions}
            disabled={loading || observations.length === 0}
            size="sm"
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Analisando...' : 'Gerar Sugestões'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {loading ? 'Analisando dados comportamentais...' : 'Clique em "Gerar Sugestões" para obter recomendações pedagógicas.'}
          </p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{s.studentName}</span>
                  <Badge className={priorityColors[s.priority] || ''}>
                    {s.priority === 'high' ? 'Prioridade' : s.priority === 'moderate' ? 'Atenção' : 'Adequado'}
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {s.strategies.map((st, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {st}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
