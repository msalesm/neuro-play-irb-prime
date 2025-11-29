import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, CheckCircle, X, Loader2 } from "lucide-react";
import { useGameRecommendations } from "@/hooks/useGameRecommendations";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIGameRecommendationsProps {
  childProfileId: string;
}

export function AIGameRecommendations({ childProfileId }: AIGameRecommendationsProps) {
  const navigate = useNavigate();
  const { 
    recommendations, 
    loading, 
    generating,
    generateRecommendations, 
    applyRecommendation,
    dismissRecommendation 
  } = useGameRecommendations(childProfileId);

  const priorityColors = {
    1: 'bg-red-500/10 text-red-700 border-red-500/20',
    2: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    3: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
  };

  const priorityLabels = {
    1: 'Alta Prioridade',
    2: 'Prioridade Média',
    3: 'Prioridade Baixa'
  };

  const handlePlayGame = async (rec: typeof recommendations[0]) => {
    await applyRecommendation(rec.id);
    
    // Navegar para o jogo (assumindo que o game_id está no formato correto)
    const gameId = rec.suggested_actions.game_id;
    navigate(`/games/${gameId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando recomendações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Recomendações IA
            </CardTitle>
            <CardDescription className="mt-2">
              Jogos personalizados baseados no perfil cognitivo
            </CardDescription>
          </div>
          <Button
            onClick={() => generateRecommendations(childProfileId)}
            disabled={generating}
            size="sm"
            className="gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Novas
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Clique em "Gerar Novas" para receber recomendações personalizadas de jogos baseadas na análise cognitiva.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Estratégia Geral */}
            {recommendations[0]?.suggested_actions?.overall_strategy && (
              <Alert className="bg-primary/5 border-primary/20">
                <Target className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <strong>Estratégia Terapêutica:</strong> {recommendations[0].suggested_actions.overall_strategy}
                </AlertDescription>
              </Alert>
            )}

            {/* Lista de Recomendações */}
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Cabeçalho */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={priorityColors[rec.priority as keyof typeof priorityColors]}
                        >
                          {priorityLabels[rec.priority as keyof typeof priorityLabels]}
                        </Badge>
                      </div>

                      {/* Nome do Jogo */}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          🎮 {rec.suggested_actions.game_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Nível {rec.suggested_actions.suggested_difficulty}
                        </Badge>
                      </div>

                      {/* Justificativa */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {rec.reasoning}
                      </p>

                      {/* Domínios Alvo */}
                      <div className="flex flex-wrap gap-1.5">
                        {rec.suggested_actions.target_domains.map((domain, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePlayGame(rec)}
                        className="gap-2 whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Jogar Agora
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissRecommendation(rec.id)}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                        Descartar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
