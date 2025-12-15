import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Minus, Brain, 
  Heart, Users, Target, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImpactDashboardProps {
  childId?: string;
  institutionId?: string;
  isAggregated?: boolean;
}

interface OutcomeData {
  total_patients: number;
  avg_cognitive_improvement: number;
  avg_behavioral_improvement: number;
  avg_socioemotional_improvement: number;
  avg_global_improvement: number;
  significant_improvements: number;
  moderate_improvements: number;
  stable: number;
  declines: number;
}

export function ImpactDashboard({ childId, institutionId, isAggregated = false }: ImpactDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OutcomeData | null>(null);

  useEffect(() => {
    loadData();
  }, [childId, institutionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('clinical_outcomes')
        .select('*');

      if (childId) {
        query = query.eq('child_id', childId);
      }

      const { data: outcomes } = await query;

      if (!outcomes || outcomes.length === 0) {
        setData(null);
        return;
      }

      // Calcular agregados
      const aggregated: OutcomeData = {
        total_patients: new Set(outcomes.map(o => o.child_id)).size,
        avg_cognitive_improvement: average(outcomes.map(o => o.cognitive_improvement)),
        avg_behavioral_improvement: average(outcomes.map(o => o.behavioral_improvement)),
        avg_socioemotional_improvement: average(outcomes.map(o => o.socioemotional_improvement)),
        avg_global_improvement: average(outcomes.map(o => o.global_improvement)),
        significant_improvements: outcomes.filter(o => o.outcome_classification === 'significant_improvement').length,
        moderate_improvements: outcomes.filter(o => o.outcome_classification === 'moderate_improvement').length,
        stable: outcomes.filter(o => o.outcome_classification === 'stable').length,
        declines: outcomes.filter(o => 
          o.outcome_classification === 'moderate_decline' || 
          o.outcome_classification === 'significant_decline'
        ).length,
      };

      setData(aggregated);
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const average = (nums: (number | null)[]): number => {
    const valid = nums.filter((n): n is number => n !== null);
    if (valid.length === 0) return 0;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  };

  const getTrendIcon = (value: number) => {
    if (value > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getImprovementColor = (value: number) => {
    if (value > 10) return 'text-green-600';
    if (value > 0) return 'text-green-500';
    if (value === 0) return 'text-muted-foreground';
    if (value > -10) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum dado de impacto disponível</p>
          <p className="text-sm mt-2">
            Os desfechos são registrados após períodos de acompanhamento completos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo de Impacto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Impacto Mensurável
          </CardTitle>
          {isAggregated && (
            <p className="text-sm text-muted-foreground">
              Dados agregados e anonimizados - {data.total_patients} pacientes
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Cognitivo */}
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-primary" />
                {getTrendIcon(data.avg_cognitive_improvement)}
              </div>
              <p className={`text-2xl font-bold ${getImprovementColor(data.avg_cognitive_improvement)}`}>
                {data.avg_cognitive_improvement > 0 ? '+' : ''}{data.avg_cognitive_improvement.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Cognitivo</p>
            </div>

            {/* Comportamental */}
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#005a70]" />
                {getTrendIcon(data.avg_behavioral_improvement)}
              </div>
              <p className={`text-2xl font-bold ${getImprovementColor(data.avg_behavioral_improvement)}`}>
                {data.avg_behavioral_improvement > 0 ? '+' : ''}{data.avg_behavioral_improvement.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Comportamental</p>
            </div>

            {/* Socioemocional */}
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                {getTrendIcon(data.avg_socioemotional_improvement)}
              </div>
              <p className={`text-2xl font-bold ${getImprovementColor(data.avg_socioemotional_improvement)}`}>
                {data.avg_socioemotional_improvement > 0 ? '+' : ''}{data.avg_socioemotional_improvement.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Socioemocional</p>
            </div>

            {/* Global */}
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                {getTrendIcon(data.avg_global_improvement)}
              </div>
              <p className={`text-2xl font-bold ${getImprovementColor(data.avg_global_improvement)}`}>
                {data.avg_global_improvement > 0 ? '+' : ''}{data.avg_global_improvement.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Global</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Desfechos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição de Desfechos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{data.significant_improvements}</p>
              <p className="text-xs text-muted-foreground">Melhora Significativa</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{data.moderate_improvements}</p>
              <p className="text-xs text-muted-foreground">Melhora Moderada</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">{data.stable}</p>
              <p className="text-xs text-muted-foreground">Estável</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{data.declines}</p>
              <p className="text-xs text-muted-foreground">Declínio</p>
            </div>
          </div>

          {/* Barra de progresso visual */}
          <div className="mt-4 h-4 rounded-full overflow-hidden flex bg-muted">
            <div 
              className="bg-green-600 h-full" 
              style={{ width: `${(data.significant_improvements / data.total_patients) * 100}%` }}
            />
            <div 
              className="bg-green-400 h-full" 
              style={{ width: `${(data.moderate_improvements / data.total_patients) * 100}%` }}
            />
            <div 
              className="bg-gray-400 h-full" 
              style={{ width: `${(data.stable / data.total_patients) * 100}%` }}
            />
            <div 
              className="bg-red-500 h-full" 
              style={{ width: `${(data.declines / data.total_patients) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
