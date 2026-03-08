import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, BarChart3, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

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
            <CardContent className="space-y-3">
              {Object.entries(kpis.porConvenio).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              ) : (
                Object.entries(kpis.porConvenio).map(([conv, count]) => (
                  <div key={conv} className="flex justify-between items-center">
                    <span className="text-sm">{conv}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Distribuição por Nível de Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(kpis.porNivelSuporte).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              ) : (
                Object.entries(kpis.porNivelSuporte).map(([nivel, count]) => (
                  <div key={nivel} className="flex items-center gap-3">
                    <span className="text-sm min-w-[120px]">{nivel}</span>
                    <Progress value={kpis.totalAprendizes > 0 ? (count / kpis.totalAprendizes) * 100 : 0} className="flex-1" />
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Report 2: Sessões Diárias */}
      <TabsContent value="sessoes-report">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Sessões por Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(kpis.sessoesPorProfissional).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem sessões registradas</p>
              ) : (
                Object.entries(kpis.sessoesPorProfissional)
                  .sort(([, a], [, b]) => b - a)
                  .map(([prof, count]) => (
                    <div key={prof} className="flex items-center gap-3">
                      <span className="text-sm min-w-[180px] truncate">{prof}</span>
                      <Progress value={Math.min(100, (count / Math.max(...Object.values(kpis.sessoesPorProfissional))) * 100)} className="flex-1" />
                      <Badge>{count}</Badge>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Report 3: Atendimentos por Período */}
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
              <p className="text-sm text-muted-foreground">Taxa de Comparecimento</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Report 4: Desempenho por Programa */}
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
