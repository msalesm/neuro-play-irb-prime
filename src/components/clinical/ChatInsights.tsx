import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb, 
  Activity,
  CheckCircle2,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Insight {
  id: string;
  insight_type: 'pattern' | 'concern' | 'progress' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  status: 'active' | 'addressed' | 'dismissed';
  created_at: string;
  supporting_data: any;
}

interface ChatInsightsProps {
  childProfileId?: string;
}

export default function ChatInsights({ childProfileId }: ChatInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, childProfileId]);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('behavioral_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (childProfileId) {
        query = query.eq('child_profile_id', childProfileId);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setInsights((data || []) as Insight[]);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInsightStatus = async (insightId: string, newStatus: 'addressed' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('behavioral_insights')
        .update({ status: newStatus })
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.filter(i => i.id !== insightId));
      toast.success(
        newStatus === 'addressed' 
          ? 'Insight marcado como resolvido' 
          : 'Insight dispensado'
      );
    } catch (error) {
      console.error('Error updating insight:', error);
      toast.error('Erro ao atualizar insight');
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'concern':
        return AlertTriangle;
      case 'progress':
        return TrendingUp;
      case 'recommendation':
        return Lightbulb;
      case 'pattern':
      default:
        return Activity;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-500 text-white border-red-600';
      case 'high':
        return 'bg-orange-500 text-white border-orange-600';
      case 'medium':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'low':
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'concern':
        return 'Preocupação';
      case 'progress':
        return 'Progresso';
      case 'recommendation':
        return 'Recomendação';
      case 'pattern':
      default:
        return 'Padrão';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights Comportamentais</CardTitle>
          <CardDescription>Carregando análises...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights Comportamentais</CardTitle>
          <CardDescription>
            Análises automáticas baseadas em conversas terapêuticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum insight disponível no momento.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Continue conversando com o assistente terapêutico para gerar insights.
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
          <Activity className="h-5 w-5 text-primary" />
          Insights Comportamentais
        </CardTitle>
        <CardDescription>
          {insights.length} {insights.length === 1 ? 'insight detectado' : 'insights detectados'} pela análise de IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.insight_type);
              
              return (
                <Card key={insight.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(insight.insight_type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                          
                          {insight.supporting_data?.recommended_actions && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-semibold text-primary">Ações recomendadas:</p>
                              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                                {insight.supporting_data.recommended_actions.map((action: string, idx: number) => (
                                  <li key={idx} className="list-disc">{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateInsightStatus(insight.id, 'addressed')}
                          title="Marcar como resolvido"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateInsightStatus(insight.id, 'dismissed')}
                          title="Dispensar"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
