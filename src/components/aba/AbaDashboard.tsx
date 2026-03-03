import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAbaIntegration } from '@/hooks/useAbaIntegration';
import { RefreshCw, Users, Activity, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AbaAprendizDetail } from './AbaAprendizDetail';

export function AbaDashboard() {
  const { aprendizes, syncLogs, neuroScores, alerts, loading, syncing, triggerSync } = useAbaIntegration();
  const [selectedAprendiz, setSelectedAprendiz] = useState<string | null>(null);

  if (selectedAprendiz) {
    return (
      <AbaAprendizDetail
        codigoAprendiz={selectedAprendiz}
        onBack={() => setSelectedAprendiz(null)}
      />
    );
  }

  const avgScore = neuroScores.length > 0
    ? Math.round(neuroScores.reduce((s, n) => s + (n.score || 0), 0) / neuroScores.length)
    : 0;

  const activeAlerts = alerts.filter((a: any) => a.alert_type);
  const lastSync = syncLogs[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Integração ABA+
          </h2>
          <p className="text-muted-foreground">
            Dados sincronizados do prontuário ABAMais
          </p>
        </div>
        <Button onClick={() => triggerSync()} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{aprendizes.length}</p>
                <p className="text-sm text-muted-foreground">Aprendizes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{avgScore}</p>
                <p className="text-sm text-muted-foreground">Score Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {lastSync
                    ? format(new Date(lastSync.started_at), "dd/MM HH:mm", { locale: ptBR })
                    : 'Nunca'}
                </p>
                <p className="text-sm text-muted-foreground">Última Sync</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="aprendizes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="aprendizes">Aprendizes</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="aprendizes">
          <Card>
            <CardHeader>
              <CardTitle>Aprendizes ABA+</CardTitle>
              <CardDescription>Clique em um aprendiz para ver detalhes</CardDescription>
            </CardHeader>
            <CardContent>
              {aprendizes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum aprendiz sincronizado. Clique em "Sincronizar Agora".
                </p>
              ) : (
                <div className="space-y-2">
                  {aprendizes.map((ap: any) => {
                    const score = neuroScores.find(
                      (s: any) => s.codigo_aprendiz === ap.codigo_aprendiz
                    );
                    return (
                      <div
                        key={ap.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedAprendiz(ap.codigo_aprendiz)}
                      >
                        <div>
                          <p className="font-medium">{ap.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Código: {ap.codigo_aprendiz}
                            {ap.convenio && ` • ${ap.convenio}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {score && (
                            <Badge
                              variant={
                                score.score >= 70
                                  ? 'default'
                                  : score.score >= 40
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              Score: {score.score}
                            </Badge>
                          )}
                          {score?.alert_type && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Risco</CardTitle>
              <CardDescription>Aprendizes que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum alerta ativo.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert: any) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-4 border rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {(alert as any).aba_aprendizes?.nome || alert.codigo_aprendiz}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alert.alert_message}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {alert.alert_type === 'faltas_consecutivas'
                            ? 'Faltas Consecutivas'
                            : alert.alert_type === 'queda_desempenho'
                            ? 'Queda de Desempenho'
                            : alert.alert_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronização</CardTitle>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma sincronização realizada.
                </p>
              ) : (
                <div className="space-y-2">
                  {syncLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : log.status === 'partial' ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : log.status === 'started' ? (
                          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{log.sync_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.started_at), "dd/MM/yyyy HH:mm:ss", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                          {log.records_synced || 0} registros
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
