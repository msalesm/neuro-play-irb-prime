import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, Zap, Heart, Home, FileText, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import type { ScreeningResult } from '@/hooks/useScreening';

export default function ScreeningResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as ScreeningResult | undefined;

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Resultado não encontrado</CardTitle>
            <CardDescription>Não foi possível carregar os resultados da triagem.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/screening">
                Voltar para Triagens
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getIcon = () => {
    switch (result.type) {
      case 'dislexia': return BookOpen;
      case 'tdah': return Zap;
      case 'tea': return Heart;
      default: return FileText;
    }
  };

  const getColor = () => {
    switch (result.type) {
      case 'dislexia': return 'from-blue-500 to-cyan-500';
      case 'tdah': return 'from-yellow-500 to-orange-500';
      case 'tea': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTitle = () => {
    switch (result.type) {
      case 'dislexia': return 'Triagem de Dislexia';
      case 'tdah': return 'Triagem de TDAH';
      case 'tea': return 'Triagem de TEA';
      default: return 'Resultado da Triagem';
    }
  };

  const getPerformanceDisplay = () => {
    const score = result.score;
    if (score >= 75) return { label: 'Acima da Média', color: 'text-green-600', icon: CheckCircle2, variant: 'default' as const };
    if (score >= 50) return { label: 'Dentro da Média', color: 'text-blue-600', icon: Info, variant: 'default' as const };
    if (score >= 30) return { label: 'Atenção Recomendada', color: 'text-yellow-600', icon: AlertTriangle, variant: 'destructive' as const };
    return { label: 'Encaminhamento Recomendado', color: 'text-red-600', icon: AlertTriangle, variant: 'destructive' as const };
  };

  const Icon = getIcon();
  const performance = getPerformanceDisplay();
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pb-32">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Clinical Disclaimer Banner */}
        <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
            Triagem de Rastreio — Não é Diagnóstico
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm mt-1">
            Este instrumento é uma <strong>triagem de rastreio inicial</strong>, sem validação normativa em população brasileira. 
            Os resultados indicam áreas que merecem atenção, mas <strong>não substituem avaliação clínica</strong> por 
            profissional especializado (neuropsicólogo, neuropediatra ou equipe multidisciplinar). 
            Para diagnóstico, utilize instrumentos padronizados e validados como CPT-3, M-CHAT, SCQ, PROLEC ou similares.
          </AlertDescription>
        </Alert>

        <div className="mb-8 text-center">
          <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${getColor()} text-white mb-4`}>
            <Icon className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Triagem Concluída</h1>
          <p className="text-muted-foreground">{getTitle()}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pontuação</CardTitle>
              <CardDescription>Relativa ao instrumento interno</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary mb-2">
                {Math.round(result.score)}
              </div>
              <p className="text-sm text-muted-foreground">de 100 pontos</p>
              <Progress value={result.score} className="h-2 mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PerformanceIcon className={`h-5 w-5 ${performance.color}`} />
                Nível de Desempenho
              </CardTitle>
              <CardDescription>Classificação interna da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className={performance.color} variant="outline">
                {performance.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-3">
                Esta classificação é baseada no desempenho no instrumento interno da plataforma, 
                não em dados normativos populacionais.
              </p>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong className="font-semibold">Orientação:</strong>
            <p className="mt-1 whitespace-pre-line">{result.recommended_action}</p>
          </AlertDescription>
        </Alert>

        {result.gameData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalhes da Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Duração</p>
                  <p className="font-semibold">{Math.round(result.duration || 0)} segundos</p>
                </div>
                {result.gameData.correctAnswers !== undefined && (
                  <div>
                    <p className="text-muted-foreground">Acertos</p>
                    <p className="font-semibold">
                      {result.gameData.correctAnswers} de {result.gameData.questions || result.gameData.totalTrials}
                    </p>
                  </div>
                )}
                {result.gameData.averageResponseTime && (
                  <div>
                    <p className="text-muted-foreground">Tempo Médio de Resposta</p>
                    <p className="font-semibold">{Math.round(result.gameData.averageResponseTime)} ms</p>
                  </div>
                )}
                {result.gameData.impulsivityErrors !== undefined && (
                  <div>
                    <p className="text-muted-foreground">Erros de Impulsividade</p>
                    <p className="font-semibold">{result.gameData.impulsivityErrors}</p>
                  </div>
                )}
                {result.gameData.omissionErrors !== undefined && (
                  <div>
                    <p className="text-muted-foreground">Erros de Omissão</p>
                    <p className="font-semibold">{result.gameData.omissionErrors}</p>
                  </div>
                )}
              </div>

              {result.gameData.byType && (
                <div className="space-y-3 pt-4 border-t">
                  <p className="font-semibold text-sm">Desempenho por Categoria:</p>
                  {Object.entries(result.gameData.byType).map(([type, accuracy]: [string, any]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <span className="font-semibold">{Math.round(accuracy)}%</span>
                      </div>
                      <Progress value={accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {result.score < 50
                ? 'Um Plano Educacional Individualizado (PEI) foi gerado com sugestões de atividades e estratégias pedagógicas. Recomendamos compartilhar este resultado com um profissional especializado.'
                : 'Continue acompanhando o desenvolvimento através de novas triagens periódicas e dos jogos cognitivos da plataforma.'}
            </p>
            {result.score < 50 && (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <strong>Importante:</strong> Recomendamos encaminhamento para avaliação profissional especializada 
                    com instrumentos validados. Compartilhe este resultado com a equipe clínica.
                  </AlertDescription>
                </Alert>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/pei?screening=${result.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar PEI Gerado
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" asChild className="flex-1">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/screening">
              Nova Triagem
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
