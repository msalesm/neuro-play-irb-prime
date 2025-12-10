import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import type { CognitiveMetrics } from '@/hooks/useUnifiedPatientData';

interface CognitiveMapRadarProps {
  current: CognitiveMetrics;
  previous?: CognitiveMetrics;
  showComparison?: boolean;
}

export function CognitiveMapRadar({ current, previous, showComparison = true }: CognitiveMapRadarProps) {
  const data = useMemo(() => [
    { 
      domain: 'Atenção', 
      current: current.attention, 
      previous: previous?.attention || 0,
      fullMark: 100 
    },
    { 
      domain: 'Memória', 
      current: current.memory, 
      previous: previous?.memory || 0,
      fullMark: 100 
    },
    { 
      domain: 'Flexibilidade', 
      current: current.flexibility, 
      previous: previous?.flexibility || 0,
      fullMark: 100 
    },
    { 
      domain: 'Controle Inibitório', 
      current: current.inhibitoryControl, 
      previous: previous?.inhibitoryControl || 0,
      fullMark: 100 
    },
    { 
      domain: 'Processamento', 
      current: current.processing, 
      previous: previous?.processing || 0,
      fullMark: 100 
    },
    { 
      domain: 'Planejamento', 
      current: current.planning, 
      previous: previous?.planning || 0,
      fullMark: 100 
    }
  ], [current, previous]);

  const overallScore = useMemo(() => {
    const values = Object.values(current);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [current]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Mapa Cognitivo
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Score Geral</span>
            <p className="text-2xl font-bold text-primary">{overallScore}%</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="domain" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              {showComparison && previous && (
                <Radar
                  name="Semana Anterior"
                  dataKey="previous"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.3}
                />
              )}
              <Radar
                name="Atual"
                dataKey="current"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
              />
              {showComparison && previous && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Domain Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {data.map((item) => {
            const change = previous ? item.current - item.previous : 0;
            return (
              <div 
                key={item.domain}
                className="p-3 rounded-lg bg-muted/50"
              >
                <p className="text-xs text-muted-foreground">{item.domain}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{item.current}%</span>
                  {change !== 0 && (
                    <span className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {change > 0 ? '+' : ''}{change}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
