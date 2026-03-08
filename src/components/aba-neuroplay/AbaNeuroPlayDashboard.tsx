import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/useUserRole';
import { useAbaIntegration } from '@/hooks/useAbaIntegration';
import { 
  Brain, BookOpen, Users, BarChart3, RefreshCw, 
  Activity, AlertTriangle, TrendingUp, Clock, 
  CheckCircle, XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AbaProgramsList } from './AbaProgramsList';
import { AbaSkillsLibrary } from './AbaSkillsLibrary';
import { AbaTrialCollector } from './AbaTrialCollector';
import { AbaProgramDetail } from './AbaProgramDetail';
import { AbaAprendizDetail } from '@/components/aba/AbaAprendizDetail';

export function AbaNeuroPlayDashboard() {
  const { isTherapist, isAdmin } = useUserRole();
  const { aprendizes, syncLogs, neuroScores, alerts, loading, syncing, triggerSync } = useAbaIntegration();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedAprendiz, setSelectedAprendiz] = useState<string | null>(null);

  // Detail views
  if (selectedProgramId && selectedChildId) {
    return (
      <AbaProgramDetail
        programId={selectedProgramId}
        childId={selectedChildId}
        onBack={() => { setSelectedProgramId(null); setSelectedChildId(null); }}
      />
    );
  }

  if (selectedAprendiz) {
    return (
      <AbaAprendizDetail
        codigoAprendiz={selectedAprendiz}
        onBack={() => setSelectedAprendiz(null)}
      />
    );
  }

  const isTherapistOrAdmin = isTherapist || isAdmin;

  const avgScore = neuroScores.length > 0
    ? Math.round(neuroScores.reduce((s: number, n: any) => s + (n.score || 0), 0) / neuroScores.length)
    : 0;

  const activeAlerts = alerts.filter((a: any) => a.alert_type);
  const lastSync = syncLogs[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            ABA NeuroPlay
          </h2>
          <p className="text-muted-foreground">
            Programas ABA integrados com dados do prontuário ABAMais
          </p>
        </div>
        {isTherapistOrAdmin && (
          <Button onClick={() => triggerSync()} disabled={syncing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">Alertas</p>
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

      {/* Tabs */}
      <Tabs defaultValue="aprendizes" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="aprendizes" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Aprendizes
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            Programas
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Habilidades
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Alertas
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          {isTherapistOrAdmin && (
            <TabsTrigger value="collect" className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Coleta Rápida
            </TabsTrigger>
          )}
          <TabsTrigger value="sync" className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Sincronização
          </TabsTrigger>
        </TabsList>

        {/* Aprendizes Tab */}
        <TabsContent value="aprendizes">
          <Card>
            <CardHeader>
              <CardTitle>Aprendizes ABA</CardTitle>
              <CardDescription>Clique em um aprendiz para ver detalhes e relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : aprendizes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum aprendiz sincronizado. Clique em "Sincronizar".
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
                            {ap.nivel_suporte && ` • Nível ${ap.nivel_suporte}`}
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

        {/* Programs Tab */}
        <TabsContent value="programs">
          <AbaProgramsList
            onSelectProgram={(programId, childId) => {
              setSelectedProgramId(programId);
              setSelectedChildId(childId);
            }}
          />
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <AbaSkillsLibrary />
        </TabsContent>

        {/* Alerts Tab */}
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

        {/* Collect Tab */}
        {isTherapistOrAdmin && (
          <TabsContent value="collect">
            <AbaTrialCollector />
          </TabsContent>
        )}

        {/* Sync Tab */}
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronização</CardTitle>
              <CardDescription>Dados importados do ABA+</CardDescription>
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
