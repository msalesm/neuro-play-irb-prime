import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Activity, ChevronRight, CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Screening {
  id: string;
  type: string;
  score: number;
  percentile: number;
  recommended_action: string;
  created_at: string;
  duration: number | null;
}

export const RecentScreeningsCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadScreenings();
    }
  }, [user]);

  const loadScreenings = async () => {
    try {
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setScreenings(data || []);
    } catch (error) {
      console.error('Error loading screenings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tea': return 'TEA';
      case 'tdah': return 'TDAH';
      case 'dislexia': return 'Dislexia';
      default: return type.toUpperCase();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tea': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'tdah': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'dislexia': return 'bg-green-500/10 text-green-600 border-green-500/30';
      default: return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (score >= 40) return <TrendingUp className="w-4 h-4 text-accent" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-48" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-secondary">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-semibold">Testes Diagnósticos Recentes</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/diagnostic-tests')}>
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {screenings.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">Nenhum teste realizado ainda</p>
            <Button onClick={() => navigate('/diagnostic-tests')}>
              Realizar Primeiro Teste
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {screenings.map((screening) => (
              <div
                key={screening.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate('/screening/result', { 
                  state: { 
                    result: {
                      id: screening.id,
                      type: screening.type,
                      score: screening.score,
                      percentile: screening.percentile,
                      recommended_action: screening.recommended_action,
                      duration: screening.duration,
                    }
                  }
                })}
              >
                <div className="flex items-center gap-3">
                  {getScoreIcon(screening.score)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(screening.type)}>
                        {getTypeLabel(screening.type)}
                      </Badge>
                      <span className="font-medium">{screening.score}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(screening.created_at), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                      {screening.duration && (
                        <span>• {screening.duration} min</span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}

            {/* Summary */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total de testes realizados:</span>
                <span className="font-semibold">{screenings.length}</span>
              </div>
              {screenings.length >= 2 && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Média de pontuação:</span>
                  <span className="font-semibold">
                    {Math.round(screenings.reduce((acc, s) => acc + s.score, 0) / screenings.length)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};