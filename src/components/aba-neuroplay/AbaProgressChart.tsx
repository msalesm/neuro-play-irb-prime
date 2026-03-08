import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAbaProgressStats } from '@/hooks/useAbaNeuroPlay';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';

interface Props {
  interventionId: string;
}

export function AbaProgressChart({ interventionId }: Props) {
  const stats = useAbaProgressStats(interventionId);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.independence}%</p>
                <p className="text-sm text-muted-foreground">Independência</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTrials}</p>
                <p className="text-sm text-muted-foreground">Total Tentativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {stats.sessions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução por Sessão</CardTitle>
            <CardDescription>Taxa de acerto e independência ao longo das sessões</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.sessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" label={{ value: 'Sessão', position: 'insideBottom', offset: -5 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'accuracy' ? 'Acerto' : 'Independência',
                  ]}
                />
                <ReferenceLine y={80} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label="Meta" />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="accuracy"
                />
                <Line
                  type="monotone"
                  dataKey="independence"
                  stroke="hsl(142 76% 36%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="independence"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
