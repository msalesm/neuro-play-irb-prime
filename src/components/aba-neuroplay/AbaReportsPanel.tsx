import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, BarChart3, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(0 84% 60%)',
  'hsl(262 83% 58%)',
  'hsl(199 89% 48%)',
];

interface AbaReportsPanelProps {
  kpis: {
    totalAprendizes: number;
    totalProfissionais: number;
    totalAtendimentos: number;
    totalFaltas: number;
    taxaFaltas: number;
    avgIndependencia: number;
    regressoes: any[];
    programasComMaiorErro: any[];
    programasComMaiorIndep: any[];
    sessoesPorProfissional: Record<string, number>;
    porConvenio: Record<string, number>;
    porNivelSuporte: Record<string, number>;
  };
}

export function AbaReportsPanel({ kpis }: AbaReportsPanelProps) {
  const convenioData = Object.entries(kpis.porConvenio).map(([name, value]) => ({ name, value }));
  const suporteData = Object.entries(kpis.porNivelSuporte).map(([name, value]) => ({ name, value }));
  const profissionalData = Object.entries(kpis.sessoesPorProfissional)
    .sort(([, a], [, b]) => b - a)
    .map(([name, sessoes]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, sessoes }));

  const atendimentoData = [
    { name: 'Compareceram', value: kpis.totalAtendimentos - kpis.totalFaltas, fill: 'hsl(142 76% 36%)' },
    { name: 'Faltaram', value: kpis.totalFaltas, fill: 'hsl(0 84% 60%)' },
  ];

  const desempenhoBarData = kpis.programasComMaiorErro.map((p) => ({
    name: (p.programa || p.habilidade || '').slice(0, 18),
    erro: p.percentualErro,
    independencia: p.percentualIndependencia,
  }));

  return (
    <Tabs defaultValue="aprendizes-report" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="aprendizes-report">Aprendizes</TabsTrigger>
        <TabsTrigger value="sessoes-report">Sessões</TabsTrigger>
        <TabsTrigger value="atendimentos-report">Atendimentos</TabsTrigger>
        <TabsTrigger value="desempenho-report">Desempenho ABA</TabsTrigger>
      </TabsList>

      {/* Report 1: Resumo de Aprendizes */}
      <TabsContent value="aprendizes-report">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Resumo de Aprendizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de Pacientes</span>
                <span className="text-2xl font-bold">{kpis.totalAprendizes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Profissionais Ativos</span>
                <span className="text-2xl font-bold">{kpis.totalProfissionais}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Convênio</CardTitle>
            </CardHeader>
            <CardContent>
              {convenioData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={convenioData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {convenioData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Distribuição por Nível de Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              {suporteData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={suporteData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Pacientes" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Report 2: Sessões */}
      <TabsContent value="sessoes-report">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Sessões por Profissional
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profissionalData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem sessões registradas</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, profissionalData.length * 40)}>
                <BarChart data={profissionalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sessoes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Sessões" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Report 3: Atendimentos */}
      <TabsContent value="atendimentos-report">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold">{kpis.totalAtendimentos}</p>
              <p className="text-sm text-muted-foreground">Total de Atendimentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{kpis.taxaFaltas}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Faltas</p>
              <p className="text-xs text-muted-foreground mt-1">{kpis.totalFaltas} faltas</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{100 - kpis.taxaFaltas}%</p>
              <p className="text-sm text-muted-foreground">Comparecimento</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Comparecimento vs Faltas</CardTitle>
            </CardHeader>
            <CardContent>
              {kpis.totalAtendimentos > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={atendimentoData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {atendimentoData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados de atendimento</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Report 4: Desempenho ABA */}
      <TabsContent value="desempenho-report">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold">{kpis.avgIndependencia}%</p>
              <p className="text-sm text-muted-foreground">Independência Média</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-3xl font-bold">{kpis.regressoes.length}</p>
              <p className="text-sm text-muted-foreground">Programas em Regressão</p>
            </CardContent>
          </Card>

          {desempenhoBarData.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Erro vs Independência por Programa</CardTitle>
                <CardDescription>Comparativo dos programas com maior taxa de erro</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={desempenhoBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Bar dataKey="erro" fill="hsl(0 84% 60%)" name="% Erro" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="independencia" fill="hsl(var(--primary))" name="% Independência" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Programas com Maior Erro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpis.programasComMaiorErro.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              ) : (
                kpis.programasComMaiorErro.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[180px]">{p.programa || p.habilidade}</span>
                    <Badge variant="destructive">{p.percentualErro}% erro</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Programas com Maior Independência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpis.programasComMaiorIndep.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              ) : (
                kpis.programasComMaiorIndep.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[180px]">{p.programa || p.habilidade}</span>
                    <Badge variant="default">{p.percentualIndependencia}%</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
