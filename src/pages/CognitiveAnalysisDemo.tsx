import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCognitiveAnalysis } from '@/hooks/useCognitiveAnalysis';
import { CognitiveReportCard } from '@/components/CognitiveReportCard';
import { Brain, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { GamePerformanceData } from '@/types/cognitive-analysis';

export default function CognitiveAnalysisDemo() {
  const { isAnalyzing, report, generateReport } = useCognitiveAnalysis();
  const [selectedProfile, setSelectedProfile] = useState<string>('');

  const sampleData: GamePerformanceData[] = [
    {
      gameId: 'attention-sustained',
      gameName: 'Atenção Sustentada',
      sessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        reactionTime: 850,
        accuracy: 78,
        consistency: 65,
        focusTime: 180,
        errorsCount: 5,
        correctAnswers: 18,
        totalAttempts: 23
      }
    },
    {
      gameId: 'memory-workload',
      gameName: 'Memória de Trabalho',
      sessionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        reactionTime: 1200,
        accuracy: 82,
        consistency: 71,
        persistence: 8,
        errorsCount: 3,
        correctAnswers: 14,
        totalAttempts: 17
      }
    },
    {
      gameId: 'cognitive-flexibility',
      gameName: 'Flexibilidade Cognitiva',
      sessionDate: new Date().toISOString(),
      metrics: {
        reactionTime: 950,
        accuracy: 88,
        consistency: 85,
        focusTime: 240,
        errorsCount: 2,
        correctAnswers: 22,
        totalAttempts: 25
      }
    }
  ];

  const handleAnalyze = async (profile: string) => {
    try {
      setSelectedProfile(profile);
      await generateReport(sampleData, 8, profile);
      toast.success('Análise cognitiva gerada com sucesso!');
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-10 h-10 text-primary" />
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Análise Cognitiva com IA
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Demonstração do sistema de análise cognitiva usando Lovable AI (gemini-2.5-pro) para gerar insights personalizados
          </p>
        </div>

        {/* Sample Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Dados de Exemplo
            </CardTitle>
            <CardDescription>
              Performance em 3 sessões de jogos cognitivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleData.map((game, idx) => (
                <Card key={idx} className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{game.gameName}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(game.sessionDate).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acurácia:</span>
                      <span className="font-semibold">{game.metrics.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reação:</span>
                      <span className="font-semibold">{game.metrics.reactionTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consistência:</span>
                      <span className="font-semibold">{game.metrics.consistency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acertos:</span>
                      <span className="font-semibold">
                        {game.metrics.correctAnswers}/{game.metrics.totalAttempts}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Selection & Analysis Trigger */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar Análise com IA</CardTitle>
            <CardDescription>
              Selecione um perfil para análise contextualizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleAnalyze('TDAH')}
                disabled={isAnalyzing}
                variant={selectedProfile === 'TDAH' ? 'default' : 'outline'}
                className="w-full"
              >
                {isAnalyzing && selectedProfile === 'TDAH' && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Perfil TDAH
              </Button>
              <Button
                onClick={() => handleAnalyze('TEA')}
                disabled={isAnalyzing}
                variant={selectedProfile === 'TEA' ? 'default' : 'outline'}
                className="w-full"
              >
                {isAnalyzing && selectedProfile === 'TEA' && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Perfil TEA
              </Button>
              <Button
                onClick={() => handleAnalyze('Dislexia')}
                disabled={isAnalyzing}
                variant={selectedProfile === 'Dislexia' ? 'default' : 'outline'}
                className="w-full"
              >
                {isAnalyzing && selectedProfile === 'Dislexia' && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Perfil Dislexia
              </Button>
              <Button
                onClick={() => handleAnalyze('Típico')}
                disabled={isAnalyzing}
                variant={selectedProfile === 'Típico' ? 'default' : 'outline'}
                className="w-full"
              >
                {isAnalyzing && selectedProfile === 'Típico' && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Perfil Típico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <Brain className="w-16 h-16 text-primary animate-pulse" />
                <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-ping" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Analisando Padrões Cognitivos...</h3>
                <p className="text-sm text-muted-foreground">
                  Lovable AI (gemini-2.5-pro) está processando os dados de performance
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Display */}
        {report && !isAnalyzing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Relatório gerado com sucesso usando IA avançada</span>
            </div>
            <CognitiveReportCard report={report} />
          </div>
        )}
      </div>
    </div>
  );
}