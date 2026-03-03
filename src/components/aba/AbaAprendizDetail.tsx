import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAbaAprendizDetail } from '@/hooks/useAbaIntegration';
import { ArrowLeft, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  codigoAprendiz: string;
  onBack: () => void;
}

export function AbaAprendizDetail({ codigoAprendiz, onBack }: Props) {
  const { aprendiz, desempenhos, atendimentos, scores } = useAbaAprendizDetail(codigoAprendiz);

  const scoreChartData = scores.map((s: any) => ({
    date: format(new Date(s.calculated_at), 'dd/MM', { locale: ptBR }),
    score: s.score,
  }));

  // Aggregate desempenho by habilidade
  const habilidadeMap = new Map<string, { total: number; count: number }>();
  for (const d of desempenhos) {
    const key = d.habilidade || 'N/A';
    const current = habilidadeMap.get(key) || { total: 0, count: 0 };
    current.total += d.percentual_independencia || 0;
    current.count++;
    habilidadeMap.set(key, current);
  }
  const habilidadeData = Array.from(habilidadeMap.entries())
    .map(([name, { total, count }]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      independencia: Math.round(total / count),
    }))
    .sort((a, b) => b.independencia - a.independencia)
    .slice(0, 10);

  const latestScore = scores[scores.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{aprendiz?.nome || codigoAprendiz}</h2>
          <p className="text-muted-foreground">
            Código: {codigoAprendiz}
            {aprendiz?.convenio && ` • ${aprendiz.convenio}`}
            {aprendiz?.nivel_suporte && ` • Nível ${aprendiz.nivel_suporte}`}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{latestScore?.score ?? '—'}</p>
                <p className="text-sm text-muted-foreground">Score Atual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{atendimentos.length}</p>
                <p className="text-sm text-muted-foreground">Atendimentos (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{desempenhos.length}</p>
                <p className="text-sm text-muted-foreground">Registros Desempenho</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Evolution */}
      {scoreChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Score</CardTitle>
            <CardDescription>Neuro Progress Score ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Desempenho por Habilidade */}
      {habilidadeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Independência por Habilidade</CardTitle>
            <CardDescription>% médio de independência nas últimas sessões</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={habilidadeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} fontSize={12} />
                <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                <Tooltip />
                <Bar dataKey="independencia" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Timeline de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {atendimentos.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum atendimento registrado.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {atendimentos.map((at: any) => (
                <div key={at.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{at.tipo || 'Atendimento'}</p>
                    <p className="text-xs text-muted-foreground">
                      {at.data_inicio
                        ? format(new Date(at.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : '—'}
                    </p>
                  </div>
                  <Badge variant={at.falta ? 'destructive' : 'default'}>
                    {at.falta ? 'Falta' : 'Presente'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
