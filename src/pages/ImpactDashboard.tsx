import { useState } from 'react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImpactEvidence } from '@/hooks/useImpactEvidence';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, Users, Target, FileText, 
  RefreshCw, Download, CheckCircle
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ImpactDashboard() {
  const { measurements, effectiveness, reports, loading, generateImpactReport, publishReport, refresh } = useImpactEvidence();
  const [reportType, setReportType] = useState('monthly');

  const handleGenerateReport = () => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (reportType) {
      case 'quarterly':
        startDate = subMonths(endDate, 3);
        break;
      case 'annual':
        startDate = subMonths(endDate, 12);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }
    
    generateImpactReport(
      reportType,
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    );
  };

  // Aggregate measurements by domain
  const domainData = ['cognitive', 'behavioral', 'socioemotional'].map(domain => {
    const domainMeasurements = measurements.filter(m => m.domain === domain);
    const avgScore = domainMeasurements.length > 0
      ? domainMeasurements.reduce((sum, m) => sum + (m.score_normalized || 0), 0) / domainMeasurements.length
      : 0;
    return {
      domain: domain === 'cognitive' ? 'Cognitivo' : domain === 'behavioral' ? 'Comportamental' : 'Socioemocional',
      score: Math.round(avgScore),
      fullMark: 100
    };
  });

  const effectivenessData = effectiveness.map(e => ({
    intervention: e.intervention_type,
    cognitivo: e.avg_improvement_cognitive || 0,
    comportamental: e.avg_improvement_behavioral || 0,
    socioemocional: e.avg_improvement_socioemotional || 0,
    amostra: e.sample_size
  }));

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Evidência e Impacto</h1>
            <p className="text-muted-foreground">Análise de resultados clínicos e efetividade</p>
          </div>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xl font-bold">{measurements.length}</p>
                  <p className="text-xs text-muted-foreground">Medições Registradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{effectiveness.length}</p>
                  <p className="text-xs text-muted-foreground">Intervenções Avaliadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">{reports.length}</p>
                  <p className="text-xs text-muted-foreground">Relatórios Gerados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-xl font-bold">
                    {domainData.length > 0 ? Math.round(domainData.reduce((s, d) => s + d.score, 0) / domainData.length) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Score Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="outcomes">
          <TabsList>
            <TabsTrigger value="outcomes">Resultados</TabsTrigger>
            <TabsTrigger value="effectiveness">Efetividade</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="outcomes" className="mt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Perfil de Resultados por Domínio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={domainData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="domain" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar 
                        name="Score" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.5} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Medições Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {measurements.slice(0, 10).map(m => (
                      <div key={m.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{m.domain}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(m.measured_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-lg font-bold">{m.score_normalized?.toFixed(1) || '-'}</span>
                          {m.percentile && (
                            <span className="text-sm text-muted-foreground">
                              Percentil {m.percentile}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="effectiveness" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Melhoria Média por Tipo de Intervenção</CardTitle>
              </CardHeader>
              <CardContent>
                {effectivenessData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado de efetividade disponível
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={effectivenessData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="intervention" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="cognitivo" name="Cognitivo" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="comportamental" name="Comportamental" fill="hsl(var(--chart-2))" />
                      <Bar dataKey="socioemocional" name="Socioemocional" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relatórios de Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum relatório gerado ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reports.map(report => (
                      <div key={report.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Relatório {report.report_type === 'monthly' ? 'Mensal' : 
                                report.report_type === 'quarterly' ? 'Trimestral' : 'Anual'}
                            </span>
                            {report.is_published ? (
                              <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                            ) : (
                              <Badge variant="outline">Rascunho</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(report.period_start), 'dd/MM/yyyy', { locale: ptBR })} - 
                            {format(new Date(report.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                          <p className="text-sm mt-1">
                            {report.total_patients_served} pacientes | {report.completed_interventions} intervenções
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!report.is_published && (
                            <Button size="sm" onClick={() => publishReport(report.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Publicar
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
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
    </ModernPageLayout>
  );
}
