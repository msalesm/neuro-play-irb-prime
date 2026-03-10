import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Brain, BookOpen, Puzzle, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClassEvolutionChartProps {
  classId: string;
  className?: string;
}

const DOMAIN_COLORS: Record<string, string> = {
  attention: 'hsl(var(--chart-1))',
  memory: 'hsl(var(--chart-2))',
  language: 'hsl(var(--chart-3))',
  executive: 'hsl(var(--chart-4))',
};

export function ClassEvolutionChart({ classId, className }: ClassEvolutionChartProps) {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['class-cognitive-evolution', classId],
    queryFn: async () => {
      // Get all completed scan sessions for this class
      const { data: sessions } = await supabase
        .from('classroom_scan_sessions')
        .select('id, completed_at, class_results, students_completed')
        .eq('class_id', classId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });

      if (!sessions?.length) return [];

      return sessions.map((s: any) => {
        const r = s.class_results || {};
        return {
          date: format(new Date(s.completed_at), 'dd/MM', { locale: ptBR }),
          attention: r.avg_attention || 0,
          memory: r.avg_memory || 0,
          language: r.avg_language || 0,
          executive: r.avg_executive || 0,
          students: s.students_completed || 0,
        };
      });
    },
    enabled: !!classId,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (chartData.length < 2) return null;

  // Calculate overall trend
  const first = chartData[0];
  const last = chartData[chartData.length - 1];
  const overallTrend = Math.round(
    ((last.attention + last.memory + last.language + last.executive) -
     (first.attention + first.memory + first.language + first.executive)) / 4
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Evolução da Turma
          </CardTitle>
          <Badge variant="outline" className={`text-xs ${
            overallTrend > 0 ? 'text-chart-3' : overallTrend < 0 ? 'text-destructive' : ''
          }`}>
            {overallTrend > 0 ? '+' : ''}{overallTrend} pts média
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {chartData.length} triagens • {className}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
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
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Eye className="h-3 w-3 text-chart-1" />
            <span>Atenção</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Brain className="h-3 w-3 text-chart-2" />
            <span>Memória</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <BookOpen className="h-3 w-3 text-chart-3" />
            <span>Linguagem</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Puzzle className="h-3 w-3 text-chart-4" />
            <span>F. Executiva</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
