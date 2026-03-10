import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Brain, BookOpen, Puzzle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CognitiveEvolutionProps {
  childId: string;
  childName: string;
}

const DOMAIN_COLORS: Record<string, string> = {
  attention: 'hsl(var(--chart-1))',
  memory: 'hsl(var(--chart-2))',
  language: 'hsl(var(--chart-3))',
  executive: 'hsl(var(--chart-4))',
};

const DOMAIN_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  attention: { label: 'Atenção', icon: Eye },
  memory: { label: 'Memória', icon: Brain },
  language: { label: 'Linguagem', icon: BookOpen },
  executive: { label: 'Função Executiva', icon: Puzzle },
};

export function CognitiveEvolution({ childId, childName }: CognitiveEvolutionProps) {
  const { data: evolutionData, isLoading } = useQuery({
    queryKey: ['cognitive-evolution', childId],
    queryFn: async () => {
      // Get all scan results for this student, ordered by date
      const { data, error } = await supabase
        .from('scan_student_results')
        .select(`
          id, attention_score, memory_score, language_score, 
          executive_function_score, overall_score, completed_at,
          session_id,
          classroom_scan_sessions!inner(completed_at, class_id)
        `)
        .eq('child_id', childId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!childId,
  });

  const chartData = useMemo(() => {
    if (!evolutionData?.length) return [];
    return evolutionData.map((d: any) => ({
      date: format(new Date(d.completed_at), 'dd/MM', { locale: ptBR }),
      fullDate: d.completed_at,
      attention: Number(d.attention_score) || 0,
      memory: Number(d.memory_score) || 0,
      language: Number(d.language_score) || 0,
      executive: Number(d.executive_function_score) || 0,
    }));
  }, [evolutionData]);

  const trends = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    return {
      attention: last.attention - first.attention,
      memory: last.memory - first.memory,
      language: last.language - first.language,
      executive: last.executive - first.executive,
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card className="border-border border-dashed">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            Sem dados de evolução para {childName.split(' ')[0]}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Realize triagens semanais para acompanhar o desenvolvimento
          </p>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 5) return <TrendingUp className="h-3 w-3 text-chart-3" />;
    if (value < -5) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Evolução Cognitiva
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {chartData.length} avaliação(ões)
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{childName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="attention" stroke={DOMAIN_COLORS.attention} strokeWidth={2} dot={{ r: 3 }} name="Atenção" />
              <Line type="monotone" dataKey="memory" stroke={DOMAIN_COLORS.memory} strokeWidth={2} dot={{ r: 3 }} name="Memória" />
              <Line type="monotone" dataKey="language" stroke={DOMAIN_COLORS.language} strokeWidth={2} dot={{ r: 3 }} name="Linguagem" />
              <Line type="monotone" dataKey="executive" stroke={DOMAIN_COLORS.executive} strokeWidth={2} dot={{ r: 3 }} name="F. Executiva" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Domain Trends */}
        {trends && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(DOMAIN_LABELS).map(([key, { label, icon: Icon }]) => {
              const trend = trends[key as keyof typeof trends];
              return (
                <div key={key} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs flex-1 truncate">{label}</span>
                  <TrendIcon value={trend} />
                  <span className={`text-xs font-medium ${
                    trend > 5 ? 'text-chart-3' : trend < -5 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {trend > 0 ? '+' : ''}{trend}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {chartData.length === 1 && (
          <p className="text-xs text-muted-foreground text-center">
            Realize mais triagens para visualizar a tendência de evolução
          </p>
        )}
      </CardContent>
    </Card>
  );
}
