import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/useUserRole';
import { useAbaNativeData } from '@/hooks/useAbaNativeData';
import { useAbaIntegration } from '@/hooks/useAbaIntegration';
import { 
  Brain, BookOpen, Users, BarChart3, FileText,
  Activity, AlertTriangle, TrendingUp, Clock, 
  CheckCircle, Percent, RefreshCw, Loader2
} from 'lucide-react';
import { AbaProgramsList } from './AbaProgramsList';
import { AbaSkillsLibrary } from './AbaSkillsLibrary';
import { AbaTrialCollector } from './AbaTrialCollector';
import { AbaProgramDetail } from './AbaProgramDetail';
import { AbaReportsPanel } from './AbaReportsPanel';

export function AbaNeuroPlayDashboard() {
  const { isTherapist, isAdmin } = useUserRole();
  const { aprendizes, profissionais, atendimentos, desempenho, loading, kpis } = useAbaNativeData();
  const { triggerSync, syncing, syncLogs } = useAbaIntegration();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  if (selectedProgramId && selectedChildId) {
    return (
      <AbaProgramDetail
        programId={selectedProgramId}
        childId={selectedChildId}
        onBack={() => { setSelectedProgramId(null); setSelectedChildId(null); }}
      />
    );
  }

  const isTherapistOrAdmin = isTherapist || isAdmin;
  const regressoes = kpis.regressoes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            ABA+
          </h2>
          <p className="text-muted-foreground">
            Integração e dados clínicos ABA+
          </p>
        </div>
        {isTherapistOrAdmin && (
          <Button 
            onClick={() => triggerSync()} 
            disabled={syncing}
            size="sm"
            className="gap-2"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {syncing ? 'Sincronizando...' : 'Sincronizar ABA+'}
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
                <p className="text-2xl font-bold">{kpis.totalAprendizes}</p>
                <p className="text-sm text-muted-foreground">Aprendizes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{kpis.avgIndependencia}%</p>
                <p className="text-sm text-muted-foreground">Independência</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Percent className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{100 - kpis.taxaFaltas}%</p>
                <p className="text-sm text-muted-foreground">Comparecimento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{regressoes.length}</p>
                <p className="text-sm text-muted-foreground">Regressões</p>
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
          <TabsTrigger value="desempenho" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Desempenho
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          {isTherapistOrAdmin && (
            <TabsTrigger value="collect" className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Coleta Rápida
            </TabsTrigger>
          )}
        </TabsList>

        {/* Aprendizes Tab */}
        <TabsContent value="aprendizes">
          <Card>
            <CardHeader>
              <CardTitle>Aprendizes (Dados Nativos)</CardTitle>
              <CardDescription>Pacientes cadastrados na plataforma NeuroPlay</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : aprendizes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum paciente cadastrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {aprendizes.map((ap) => (
                    <div
                      key={ap.codigoAprendiz}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{ap.aprendiz}</p>
                        <p className="text-sm text-muted-foreground">
                          {ap.convenio && `${ap.convenio} • `}
                          {ap.nivelSuporte && `Nível ${ap.nivelSuporte} • `}
                          {ap.dataNascimento}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {ap.convenio && <Badge variant="outline">{ap.convenio}</Badge>}
                      </div>
                    </div>
                  ))}
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

        {/* Desempenho Tab */}
        <TabsContent value="desempenho">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Programa ABA</CardTitle>
              <CardDescription>Métricas calculadas a partir das tentativas registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {desempenho.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma tentativa registrada. Use a aba "Coleta Rápida" para registrar.
                </p>
              ) : (
                <div className="space-y-3">
                  {desempenho.map((d, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{d.programa}</p>
                          <p className="text-sm text-muted-foreground">{d.habilidade}</p>
                        </div>
                        <Badge
                          variant={
                            d.nivelIndependencia === 'Excelente' ? 'default' :
                            d.nivelIndependencia === 'Ótimo' ? 'default' :
                            d.nivelIndependencia === 'Bom' ? 'secondary' : 'destructive'
                          }
                        >
                          {d.nivelIndependencia}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="font-bold text-destructive">{d.percentualErro}%</p>
                          <p className="text-xs text-muted-foreground">Erro</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-bold text-warning">{d.percentualAjuda}%</p>
                          <p className="text-xs text-muted-foreground">Ajuda</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-bold text-primary">{d.percentualIndependencia}%</p>
                          <p className="text-xs text-muted-foreground">Independência</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{d.totalTrials} tentativas registradas</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <AbaReportsPanel kpis={kpis} />
        </TabsContent>

        {/* Collect Tab */}
        {isTherapistOrAdmin && (
          <TabsContent value="collect">
            <AbaTrialCollector />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
