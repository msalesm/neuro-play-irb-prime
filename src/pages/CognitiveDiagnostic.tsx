import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Brain, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCognitiveAnalysis } from '@/hooks/useCognitiveAnalysis';
import { CognitiveReportCard } from '@/components/CognitiveReportCard';
import type { GamePerformanceData } from '@/types/cognitive-analysis';

export default function CognitiveDiagnostic() {
  const [userAge, setUserAge] = useState<number>();
  const [userProfile, setUserProfile] = useState<string>();
  const { isAnalyzing, report, generateReport } = useCognitiveAnalysis();

  // Mock data for demo - in production, this would come from actual game sessions
  const mockPerformanceData: GamePerformanceData[] = [
    {
      gameId: 'foco-rapido',
      gameName: 'Foco Rápido',
      sessionDate: new Date().toISOString(),
      metrics: {
        reactionTime: 285,
        accuracy: 94,
        consistency: 88,
        focusTime: 720,
        correctAnswers: 47,
        totalAttempts: 50,
      }
    },
    {
      gameId: 'memoria-emocoes',
      gameName: 'Memória das Emoções',
      sessionDate: new Date().toISOString(),
      metrics: {
        accuracy: 92,
        consistency: 85,
        correctAnswers: 23,
        totalAttempts: 25,
      }
    },
    {
      gameId: 'palavra-magica',
      gameName: 'Palavra Mágica',
      sessionDate: new Date().toISOString(),
      metrics: {
        reactionTime: 1200,
        accuracy: 78,
        consistency: 72,
        correctAnswers: 39,
        totalAttempts: 50,
      }
    },
  ];

  const handleGenerateReport = async () => {
    await generateReport(mockPerformanceData, userAge, userProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        {!report ? (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <Brain className="w-8 h-8 text-primary" />
                Diagnóstico Cognitivo com IA
              </CardTitle>
              <p className="text-muted-foreground">
                Gere um relatório completo baseado no desempenho nos jogos
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="age">Idade (opcional)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 10"
                    value={userAge || ''}
                    onChange={(e) => setUserAge(parseInt(e.target.value) || undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="profile">Perfil (opcional)</Label>
                  <Select value={userProfile} onValueChange={setUserProfile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tdah">TDAH</SelectItem>
                      <SelectItem value="tea">TEA (Autismo)</SelectItem>
                      <SelectItem value="dislexia">Dislexia</SelectItem>
                      <SelectItem value="alta-sensibilidade">Alta Sensibilidade</SelectItem>
                      <SelectItem value="nenhum">Nenhum diagnóstico específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Dados que serão analisados:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {mockPerformanceData.length} sessões de jogos recentes</li>
                  <li>• Métricas de atenção, memória e linguagem</li>
                  <li>• Padrões de desempenho e consistência</li>
                </ul>
              </div>

              <Button 
                onClick={handleGenerateReport} 
                disabled={isAnalyzing}
                size="lg"
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Gerar Relatório Diagnóstico
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                A análise é realizada por IA e pode levar alguns segundos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nova Análise
            </Button>
            <CognitiveReportCard report={report} />
          </div>
        )}
      </div>
    </div>
  );
}
