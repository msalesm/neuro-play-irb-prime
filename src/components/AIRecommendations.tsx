import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, TrendingUp, Target, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  recommendation_type: string;
  reasoning: string;
  priority: number;
  status: string;
  recommended_games: string[] | null;
  created_at: string;
}

interface AIRecommendationsProps {
  childProfileId: string;
  onGameSelect?: (gameId: string) => void;
}

export function AIRecommendations({ childProfileId, onGameSelect }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [childProfileId]);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationStatus = async (id: string, status: 'applied' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ 
          status,
          applied_at: status === 'applied' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      setRecommendations(prev => prev.filter(r => r.id !== id));
      toast.success(status === 'applied' ? 'Recomendação aplicada!' : 'Recomendação dispensada');
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast.error('Erro ao atualizar recomendação');
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-600 bg-red-50 border-red-200";
    if (priority >= 6) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'difficulty_adjustment':
        return <Target className="w-5 h-5" />;
      case 'difficulty_advancement':
        return <TrendingUp className="w-5 h-5" />;
      case 'session_duration':
        return <Brain className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      difficulty_adjustment: 'Ajuste de Dificuldade',
      difficulty_advancement: 'Avançar Nível',
      session_duration: 'Duração da Sessão',
      game_recommendation: 'Jogo Recomendado'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recomendações Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Carregando recomendações...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recomendações Inteligentes
          </CardTitle>
          <CardDescription>
            Baseadas no desempenho e análise cognitiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground">
              Complete mais sessões de jogos para receber recomendações personalizadas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Recomendações Inteligentes
        </CardTitle>
        <CardDescription>
          Sugestões personalizadas baseadas em análise de desempenho
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className={cn("border-2", getPriorityColor(rec.priority))}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn("p-2 rounded-lg", getPriorityColor(rec.priority))}>
                    {getTypeIcon(rec.recommendation_type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(rec.recommendation_type)}
                    </Badge>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Prioridade {rec.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{rec.description}</p>
              
              {rec.reasoning && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Análise:</strong> {rec.reasoning}
                  </p>
                </div>
              )}

              {rec.recommended_games && rec.recommended_games.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rec.recommended_games.map((gameId) => (
                    <Button
                      key={gameId}
                      variant="outline"
                      size="sm"
                      onClick={() => onGameSelect?.(gameId)}
                    >
                      Jogar agora
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => updateRecommendationStatus(rec.id, 'applied')}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Aplicar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateRecommendationStatus(rec.id, 'dismissed')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
