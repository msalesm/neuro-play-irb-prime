import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useContextualAI } from '@/hooks/useContextualAI';
import { Link } from 'react-router-dom';

interface SmartInsightsPanelProps {
  childId?: string;
  compact?: boolean;
}

export function SmartInsightsPanel({ childId, compact = false }: SmartInsightsPanelProps) {
  const { 
    isLoading, 
    recommendations, 
    predictiveInsights,
    childContext,
    generateRecommendations,
    runPredictiveAnalysis,
    fetchChildContext
  } = useContextualAI();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights'>('recommendations');

  useEffect(() => {
    if (childId) {
      fetchChildContext(childId);
      generateRecommendations(childId);
    }
  }, [childId, fetchChildContext, generateRecommendations]);

  const handleRefresh = async () => {
    if (childId) {
      await generateRecommendations(childId);
    }
  };

  const handleRunAnalysis = async (type: 'crisis_detection' | 'behavioral_trend' | 'intervention_recommendation') => {
    if (childId) {
      await runPredictiveAnalysis(childId, type);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'positive': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      default: return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game': return <Target className="h-4 w-4" />;
      case 'intervention': return <Activity className="h-4 w-4" />;
      case 'insight': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Insights IA</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recommendations.slice(0, 3).map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={`p-1 rounded ${getPriorityColor(rec.priority)}`}>
                {getTypeIcon(rec.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{rec.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{rec.description}</p>
              </div>
              {rec.actionUrl && (
                <Link to={rec.actionUrl}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
            </motion.div>
          ))}
          
          {recommendations.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Selecione uma criança para ver recomendações
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">Central de Inteligência</CardTitle>
              <p className="text-sm text-muted-foreground">Análises e recomendações personalizadas</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Child Context Summary */}
        {childContext && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-background/80 rounded-lg p-3 text-center">
              <Activity className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{childContext.recentPerformance.sessionsThisWeek}</p>
              <p className="text-xs text-muted-foreground">Sessões/semana</p>
            </div>
            <div className="bg-background/80 rounded-lg p-3 text-center">
              <Target className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
              <p className="text-lg font-bold">{childContext.recentPerformance.averageAccuracy.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Acurácia média</p>
            </div>
            <div className="bg-background/80 rounded-lg p-3 text-center">
              <Zap className="h-4 w-4 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold capitalize">{childContext.recentPerformance.trend === 'improving' ? '↑' : childContext.recentPerformance.trend === 'declining' ? '↓' : '→'}</p>
              <p className="text-xs text-muted-foreground">Tendência</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('recommendations')}
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Recomendações
          </Button>
          <Button
            variant={activeTab === 'insights' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('insights')}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Análises
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'recommendations' ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority)}`}>
                      {getTypeIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      
                      {rec.reasoning && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          💡 {rec.reasoning}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Confiança:</span>
                          <Progress value={rec.confidence * 100} className="w-20 h-2" />
                          <span className="text-xs">{(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                        
                        {rec.actionUrl && (
                          <Link to={rec.actionUrl}>
                            <Button variant="outline" size="sm">
                              Ver mais
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {recommendations.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma recomendação disponível</p>
                  <p className="text-sm">Selecione uma criança para gerar recomendações personalizadas</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Analysis Triggers */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunAnalysis('crisis_detection')}
                  disabled={isLoading || !childId}
                  className="flex-col h-auto py-3"
                >
                  <AlertTriangle className="h-5 w-5 mb-1 text-destructive" />
                  <span className="text-xs">Detecção de Risco</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunAnalysis('behavioral_trend')}
                  disabled={isLoading || !childId}
                  className="flex-col h-auto py-3"
                >
                  <TrendingUp className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-xs">Tendências</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunAnalysis('intervention_recommendation')}
                  disabled={isLoading || !childId}
                  className="flex-col h-auto py-3"
                >
                  <Sparkles className="h-5 w-5 mb-1 text-amber-500" />
                  <span className="text-xs">Intervenções</span>
                </Button>
              </div>

              {/* Predictive Insights List */}
              {predictiveInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(insight.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={insight.severity === 'critical' ? 'border-destructive text-destructive' :
                                    insight.severity === 'warning' ? 'border-amber-500 text-amber-600' :
                                    insight.severity === 'positive' ? 'border-emerald-500 text-emerald-600' : ''}
                        >
                          {insight.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium">Recomendações:</p>
                          {insight.recommendations.slice(0, 3).map((rec, i) => (
                            <p key={i} className="text-xs text-muted-foreground pl-2 border-l-2 border-primary/30">
                              {rec}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(insight.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {predictiveInsights.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma análise disponível</p>
                  <p className="text-sm">Clique em um dos botões acima para gerar análises</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
