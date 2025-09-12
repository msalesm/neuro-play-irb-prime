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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white pb-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto p-6 space-y-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                Painel 
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Clínico
                </span>
              </h1>
            </div>
            <p className="text-white/70 mt-2">
              Análise avançada de padrões comportamentais para diagnóstico de TEA, TDAH e Dislexia
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              asChild
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg"
            >
              <Link to="/dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Meu Progresso
              </Link>
            </Button>
            <Button 
              onClick={generateClinicalReport} 
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </div>

      {loading && (
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
              <span className="text-white">Analisando padrões comportamentais...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {currentReport && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="patterns" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Padrões</TabsTrigger>
            <TabsTrigger value="trends" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Tendências</TabsTrigger>
            <TabsTrigger value="interventions" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Intervenções</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Risk Assessment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-white/10 border-white/20 relative overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-50" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">Risco TEA</CardTitle>
                  <Brain className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold mb-2 text-white">
                    {(currentReport.overallRiskAssessment.tea * 100).toFixed(1)}%
                  </div>
                  <Badge variant={getRiskLevel(currentReport.overallRiskAssessment.tea).variant} className="mb-3">
                    {getRiskLevel(currentReport.overallRiskAssessment.tea).level}
                  </Badge>
                  <Progress 
                    value={currentReport.overallRiskAssessment.tea * 100} 
                    className="mt-3 bg-white/20"
                  />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/10 border-white/20 relative overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-50" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">Risco TDAH</CardTitle>
                  <Activity className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold mb-2 text-white">
                    {(currentReport.overallRiskAssessment.tdah * 100).toFixed(1)}%
                  </div>
                  <Badge variant={getRiskLevel(currentReport.overallRiskAssessment.tdah).variant} className="mb-3">
                    {getRiskLevel(currentReport.overallRiskAssessment.tdah).level}
                  </Badge>
                  <Progress 
                    value={currentReport.overallRiskAssessment.tdah * 100} 
                    className="mt-3 bg-white/20"
                  />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/10 border-white/20 relative overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-50" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">Risco Dislexia</CardTitle>
                  <FileText className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold mb-2 text-white">
                    {(currentReport.overallRiskAssessment.dislexia * 100).toFixed(1)}%
                  </div>
                  <Badge variant={getRiskLevel(currentReport.overallRiskAssessment.dislexia).variant} className="mb-3">
                    {getRiskLevel(currentReport.overallRiskAssessment.dislexia).level}
                  </Badge>
                  <Progress 
                    value={currentReport.overallRiskAssessment.dislexia * 100} 
                    className="mt-3 bg-white/20"
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
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardContent className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-white/50" />
            <h3 className="text-lg font-semibold mb-2 text-white">Nenhum Dado Disponível</h3>
            <p className="text-white/70 mb-4">
              Complete alguns jogos diagnósticos para ver a análise comportamental
            </p>
            <Button 
              variant="outline" 
              asChild
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Link to="/games">Ir para Jogos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};