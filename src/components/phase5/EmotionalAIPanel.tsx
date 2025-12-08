import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Sparkles, AlertTriangle, Lightbulb, RefreshCw, Heart, Zap, Moon } from 'lucide-react';
import { useEmotionalAI } from '@/hooks/useEmotionalAI';

interface EmotionalAIPanelProps {
  childId?: string;
}

const moodIcons: Record<string, React.ReactNode> = {
  happy: <Heart className="h-5 w-5 text-pink-500" />,
  calm: <Moon className="h-5 w-5 text-blue-400" />,
  focused: <Zap className="h-5 w-5 text-yellow-500" />,
  tired: <Moon className="h-5 w-5 text-gray-400" />,
  anxious: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  neutral: <Brain className="h-5 w-5 text-purple-500" />
};

const moodLabels: Record<string, string> = {
  happy: 'Feliz',
  calm: 'Calmo',
  focused: 'Focado',
  tired: 'Cansado',
  anxious: 'Ansioso',
  neutral: 'Neutro'
};

const moodColors: Record<string, string> = {
  happy: 'bg-pink-100 text-pink-800 border-pink-200',
  calm: 'bg-blue-100 text-blue-800 border-blue-200',
  focused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  tired: 'bg-gray-100 text-gray-800 border-gray-200',
  anxious: 'bg-orange-100 text-orange-800 border-orange-200',
  neutral: 'bg-purple-100 text-purple-800 border-purple-200'
};

export function EmotionalAIPanel({ childId }: EmotionalAIPanelProps) {
  const { 
    isAnalyzing, 
    analysis, 
    recommendations, 
    runEmotionalAnalysis, 
    getSmartRecommendations,
    loadLatestAnalysis 
  } = useEmotionalAI(childId);
  
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (childId && !hasLoaded) {
      loadLatestAnalysis();
      setHasLoaded(true);
    }
  }, [childId, hasLoaded, loadLatestAnalysis]);

  const handleRunAnalysis = async () => {
    await runEmotionalAnalysis();
    await getSmartRecommendations();
  };

  if (!childId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Selecione uma criança para ver a análise emocional
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Análise Emocional IA
          </CardTitle>
          <Button 
            size="sm" 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isAnalyzing ? 'Analisando...' : 'Analisar'}
          </Button>
        </CardHeader>
        <CardContent>
          {isAnalyzing && !analysis ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Emotional State */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full border ${moodColors[analysis.emotional_state] || moodColors.neutral}`}>
                  {moodIcons[analysis.emotional_state] || moodIcons.neutral}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    Estado Emocional: {moodLabels[analysis.emotional_state] || 'Neutro'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">Confiança:</span>
                    <Progress value={(analysis.confidence_score || 0) * 100} className="flex-1 h-2" />
                    <span className="text-sm font-medium">
                      {Math.round((analysis.confidence_score || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Detected Patterns */}
              {analysis.detected_patterns && analysis.detected_patterns.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Padrões Detectados
                  </h4>
                  <div className="space-y-2">
                    {analysis.detected_patterns.slice(0, 3).map((pattern: any, i: number) => (
                      <div key={i} className="text-sm p-2 bg-muted rounded-md">
                        <span className="font-medium">{pattern.pattern}:</span> {pattern.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recomendações</h4>
                  <div className="space-y-2">
                    {analysis.recommendations.slice(0, 3).map((rec: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <span>{rec.title}: {rec.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Última análise: {new Date(analysis.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma análise disponível</p>
              <p className="text-sm">Clique em "Analisar" para gerar insights</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recomendações Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Recommendation */}
            {recommendations.modeRecommendation && recommendations.modeRecommendation !== 'normal' && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-medium">
                  Modo recomendado: {recommendations.modeRecommendation === 'calm' ? '🌙 Calmo' : '⚡ Foco'}
                </p>
              </div>
            )}

            {/* Recommended Games */}
            {recommendations.recommendedGames && recommendations.recommendedGames.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Jogos Recomendados</h4>
                <div className="space-y-2">
                  {recommendations.recommendedGames.slice(0, 3).map((game: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm">{game.reason}</span>
                      <Badge>Nível {game.suggestedDifficulty}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Insight */}
            {recommendations.overallInsight && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{recommendations.overallInsight}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
