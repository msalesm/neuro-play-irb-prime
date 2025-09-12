import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Target,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useBehavioralAnalysis, DiagnosticPattern } from '@/hooks/useBehavioralAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export const ClinicalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    metrics, 
    currentReport, 
    patterns, 
    loading, 
    generateClinicalReport 
  } = useBehavioralAnalysis();

  const [selectedPattern, setSelectedPattern] = useState<DiagnosticPattern | null>(null);

  useEffect(() => {
    if (user && metrics.length > 0 && !currentReport) {
      generateClinicalReport();
    }
  }, [user, metrics, currentReport, generateClinicalReport]);

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Faça login para acessar o painel clínico.
        </AlertDescription>
      </Alert>
    );
  }

  const getRiskLevel = (score: number) => {
    if (score < 0.3) return { level: 'Baixo', color: 'bg-green-500', variant: 'default' as const };
    if (score < 0.6) return { level: 'Moderado', color: 'bg-yellow-500', variant: 'secondary' as const };
    return { level: 'Alto', color: 'bg-red-500', variant: 'destructive' as const };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-green-600';
    if (confidence > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-playful bg-clip-text text-transparent">
            Painel Clínico - Análise Comportamental
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise avançada de padrões comportamentais para diagnóstico de TEA, TDAH e Dislexia
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Meu Progresso
            </Link>
          </Button>
          <Button 
            onClick={generateClinicalReport} 
            disabled={loading}
            className="shadow-soft"
          >
            <FileText className="w-4 h-4 mr-2" />
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span>Analisando padrões comportamentais...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {currentReport && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
            <TabsTrigger value="neuroplasticity">Neuroplasticidade</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="interventions">Intervenções</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Risk Assessment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risco TEA</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {(currentReport.overallRiskAssessment.tea * 100).toFixed(1)}%
                  </div>
                  <Badge variant={getRiskLevel(currentReport.overallRiskAssessment.tea).variant}>
                    {getRiskLevel(currentReport.overallRiskAssessment.tea).level}
                  </Badge>
                  <Progress 
                    value={currentReport.overallRiskAssessment.tea * 100} 
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-card gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risco TDAH</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {(currentReport.overallRiskAssessment.tdah * 100).toFixed(1)}%
                  </div>
                  <Badge variant={getRiskLevel(currentReport.overallRiskAssessment.tdah).variant}>
                    {getRiskLevel(currentReport.overallRiskAssessment.tdah).level}
                  </Badge>
                  <Progress 
                    value={currentReport.overallRiskAssessment.tdah * 100} 
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-card gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risco Dislexia</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {(currentReport.overallRiskAssessment.dislexia * 100).toFixed(1)}%
                  </div>
                  <Badge variant={getRiskLevel(currentReport.overallRiskAssessment.dislexia).variant}>
                    {getRiskLevel(currentReport.overallRiskAssessment.dislexia).level}
                  </Badge>
                  <Progress 
                    value={currentReport.overallRiskAssessment.dislexia * 100} 
                    className="mt-3"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Behavioral Trends */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Tendências Comportamentais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Melhorando
                    </h4>
                    {currentReport.behavioralTrends.improving.map((trend, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Estável
                    </h4>
                    {currentReport.behavioralTrends.stable.map((trend, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600 flex items-center">
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Requer Atenção
                    </h4>
                    {currentReport.behavioralTrends.declining.map((trend, index) => (
                      <Badge key={index} variant="destructive" className="mr-2 mb-2">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patterns.map((pattern, index) => (
                <Card 
                  key={index} 
                  className="shadow-card cursor-pointer hover:shadow-glow transition-all"
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {pattern.condition}
                      <Badge 
                        variant={getRiskLevel(pattern.confidence).variant}
                        className={getConfidenceColor(pattern.confidence)}
                      >
                        {(pattern.confidence * 100).toFixed(1)}%
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Confiança: {pattern.confidence > 0.7 ? 'Alta' : pattern.confidence > 0.4 ? 'Média' : 'Baixa'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Indicadores Principais:</h4>
                      {pattern.keyIndicators.slice(0, 3).map((indicator, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-primary" />
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPattern && (
              <Card className="shadow-glow border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Detalhes: {selectedPattern.condition}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedPattern(null)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Indicadores Identificados:</h4>
                    <ul className="space-y-1">
                      {selectedPattern.keyIndicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Recomendações:</h4>
                    <ul className="space-y-1">
                      {selectedPattern.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Target className="w-4 h-4 mr-2 text-green-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Próximos Passos:</h4>
                    <ul className="space-y-1">
                      {selectedPattern.nextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
                <CardDescription>
                  Evolução dos indicadores ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gráficos de tendência serão implementados</p>
                  <p className="text-sm">com base nos dados coletados</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interventions">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Sugestões de Intervenção
                </CardTitle>
                <CardDescription>
                  Recomendações baseadas na análise comportamental
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentReport.interventionSuggestions.map((suggestion, index) => (
                    <Alert key={index}>
                      <Target className="h-4 w-4" />
                      <AlertTitle>Intervenção Recomendada</AlertTitle>
                      <AlertDescription>{suggestion}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {metrics.length === 0 && !loading && (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Dado Disponível</h3>
            <p className="text-muted-foreground mb-4">
              Complete alguns jogos diagnósticos para ver a análise comportamental
            </p>
            <Button variant="outline" asChild>
              <Link to="/games">Ir para Jogos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};