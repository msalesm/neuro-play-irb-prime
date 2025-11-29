import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePredictiveAnalysis } from '@/hooks/usePredictiveAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, TrendingUp, TrendingDown, Activity, 
  Brain, Heart, Target, Clock, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

export default function RiskAnalysisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  
  const { 
    analyses, 
    riskIndicator, 
    loading, 
    analyzing,
    detectCrisisRisk,
    analyzeBehavioralTrends,
    generateInterventionRecommendations,
    reload
  } = usePredictiveAnalysis(selectedChild || undefined);

  useEffect(() => {
    loadSelectedChild();
  }, [user]);

  const loadSelectedChild = async () => {
    if (!user) return;
    
    const { data: children } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('parent_user_id', user.id)
      .limit(1);

    if (children && children.length > 0) {
      setSelectedChild(children[0].id);
    }
  };

  const getRiskColorClass = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Desconhecido';
    }
  };

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard-pais')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Análise Preditiva de Risco</h1>
          <p className="text-xl text-muted-foreground">
            Detecção antecipada de crises comportamentais e recomendações preventivas
          </p>
        </div>

        {/* Current Risk Overview */}
        {riskIndicator && (
          <Card className={`mb-8 border-l-4 ${getRiskColorClass(riskIndicator.level)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-8 h-8 ${
                    riskIndicator.level === 'critical' ? 'text-red-600' :
                    riskIndicator.level === 'high' ? 'text-orange-600' :
                    riskIndicator.level === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <div>
                    <CardTitle className="text-2xl">
                      Nível de Risco Atual: {getRiskLabel(riskIndicator.level)}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Índice: {riskIndicator.score}% • Timeline: {riskIndicator.timeline}
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={async () => {
                  await detectCrisisRisk(14);
                  await reload();
                }} disabled={analyzing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
                  {analyzing ? 'Analisando...' : 'Atualizar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Indicadores de Risco
                </h4>
                <ul className="space-y-2">
                  {riskIndicator.indicators.map((indicator, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Ações Recomendadas
                </h4>
                <ul className="space-y-2">
                  {riskIndicator.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Detecção de Crise</h3>
                  <p className="text-sm text-muted-foreground">
                    Identifica padrões de risco iminente
                  </p>
                </div>
                <Button 
                  onClick={async () => {
                    await detectCrisisRisk(14);
                    toast.success('Análise de crise concluída');
                  }}
                  disabled={analyzing}
                  className="w-full"
                >
                  {analyzing ? 'Analisando...' : 'Executar Análise'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tendências Comportamentais</h3>
                  <p className="text-sm text-muted-foreground">
                    Analisa evolução ao longo do tempo
                  </p>
                </div>
                <Button 
                  onClick={async () => {
                    await analyzeBehavioralTrends(30);
                    toast.success('Análise de tendências concluída');
                  }}
                  disabled={analyzing}
                  variant="outline"
                  className="w-full"
                >
                  {analyzing ? 'Analisando...' : 'Analisar Tendências'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Intervenções Preventivas</h3>
                  <p className="text-sm text-muted-foreground">
                    Recomendações personalizadas
                  </p>
                </div>
                <Button 
                  onClick={async () => {
                    await generateInterventionRecommendations(30);
                    toast.success('Recomendações geradas');
                  }}
                  disabled={analyzing}
                  variant="outline"
                  className="w-full"
                >
                  {analyzing ? 'Gerando...' : 'Gerar Recomendações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Análises</CardTitle>
            <CardDescription>
              Todas as análises preditivas realizadas nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="crisis">Crises</TabsTrigger>
                <TabsTrigger value="trends">Tendências</TabsTrigger>
                <TabsTrigger value="interventions">Intervenções</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando análises...
                  </div>
                ) : analyses.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma análise preditiva executada ainda.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Execute uma análise usando os botões acima.
                    </p>
                  </div>
                ) : (
                  analyses.map(analysis => (
                    <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={analysis.severity === 'high' ? 'destructive' : 'secondary'}>
                                {analysis.analysisType === 'crisis_detection' ? '🚨 Detecção de Crise' :
                                 analysis.analysisType === 'behavioral_trend' ? '📊 Tendências' :
                                 '🎯 Intervenções'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(analysis.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {analysis.analysis.substring(0, 300)}...
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            toast.info('Análise completa', {
                              description: analysis.analysis,
                              duration: 10000,
                            });
                          }}>
                            Ver Completa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="crisis" className="space-y-4 mt-6">
                {analyses.filter(a => a.analysisType === 'crisis_detection').map(analysis => (
                  <Card key={analysis.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold">Detecção de Crise</span>
                        <Badge variant="destructive">{getRiskLabel(analysis.severity)}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(analysis.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.analysis}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="trends" className="space-y-4 mt-6">
                {analyses.filter(a => a.analysisType === 'behavioral_trend').map(analysis => (
                  <Card key={analysis.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Análise de Tendências</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(analysis.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.analysis}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="interventions" className="space-y-4 mt-6">
                {analyses.filter(a => a.analysisType === 'intervention_recommendation').map(analysis => (
                  <Card key={analysis.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">Recomendações de Intervenção</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(analysis.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.analysis}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ModernPageLayout>
  );
}

function getRiskLabel(severity: string): string {
  switch (severity) {
    case 'high': return 'Alto Risco';
    case 'medium': return 'Risco Moderado';
    case 'low': return 'Baixo Risco';
    default: return 'Risco Desconhecido';
  }
}
