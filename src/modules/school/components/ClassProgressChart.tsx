/**
 * Class Progress Chart — Aggregated class evolution
 * 
 * Radar chart showing average scores per domain for a class.
 * Uses educational labels only.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer, Tooltip 
} from 'recharts';
import { Users } from 'lucide-react';
import { EDUCATIONAL_LABELS } from '../constants';

interface ClassDomainScore {
  domain: string;
  average: number;
  previousAverage?: number;
}

interface ClassProgressChartProps {
  className: string;
  studentCount: number;
  domainScores: ClassDomainScore[];
}

export function ClassProgressChart({ className: classLabel, studentCount, domainScores }: ClassProgressChartProps) {
  const chartData = domainScores.map(d => ({
    domain: EDUCATIONAL_LABELS[d.domain as keyof typeof EDUCATIONAL_LABELS] || d.domain,
    atual: d.average,
    anterior: d.previousAverage ?? d.average,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{classLabel}</CardTitle>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">{studentCount} alunos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={chartData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="domain" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fontSize: 9 }}
              />
              <Radar
                name="Anterior"
                dataKey="anterior"
                stroke="hsl(var(--muted-foreground))"
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.1}
                strokeDasharray="4 4"
              />
              <Radar
                name="Atual"
                dataKey="atual"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
            Dados insuficientes para gerar gráfico
          </div>
        )}
      </CardContent>
    </Card>
  );
}
