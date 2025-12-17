import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Zap, BookOpen, AlertTriangle, 
  CheckCircle, TrendingUp, TrendingDown, Minus,
  ClipboardCheck, Calendar, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface DiagnosticsTabProps {
  childId: string;
}

interface ScreeningResult {
  id: string;
  type: 'tea' | 'tdah' | 'dislexia';
  score: number;
  percentile?: number;
  duration?: number;
  recommended_action?: string;
  test_data: Record<string, unknown>;
  created_at: string;
}

interface CondensedAssessment {
  id: string;
  assessment_date: string;
  cognitive_overall_score: number | null;
  cognitive_risk: string | null;
  cognitive_trend: string | null;
  behavioral_overall_score: number | null;
  behavioral_risk: string | null;
  behavioral_trend: string | null;
  socioemotional_overall_score: number | null;
  socioemotional_risk: string | null;
  socioemotional_trend: string | null;
  source_type: string | null;
  notes: string | null;
}

const screeningConfig = {
  tea: {
    title: 'Transtorno do Espectro Autista',
    shortTitle: 'TEA',
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  tdah: {
    title: 'Déficit de Atenção e Hiperatividade',
    shortTitle: 'TDAH',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  dislexia: {
    title: 'Dislexia',
    shortTitle: 'Dislexia',
    icon: BookOpen,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  }
};

const getRiskBadge = (risk: string | null) => {
  if (!risk) return null;
  const config = {
    low: { label: 'Baixo', variant: 'default' as const, className: 'bg-green-500/20 text-green-700 border-green-500/30' },
    medium: { label: 'Moderado', variant: 'default' as const, className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
    high: { label: 'Alto', variant: 'destructive' as const, className: 'bg-red-500/20 text-red-700 border-red-500/30' }
  };
  const riskConfig = config[risk as keyof typeof config] || config.medium;
  return (
    <Badge variant="outline" className={riskConfig.className}>
      {riskConfig.label}
    </Badge>
  );
};

const getTrendIcon = (trend: string | null) => {
  if (!trend) return <Minus className="w-4 h-4 text-muted-foreground" />;
  if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const getScoreColor = (score: number | null) => {
  if (!score) return 'text-muted-foreground';
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

export function DiagnosticsTab({ childId }: DiagnosticsTabProps) {
  const [activeType, setActiveType] = useState<'all' | 'tea' | 'tdah' | 'dislexia'>('all');

  // Fetch screening results
  const { data: screenings, isLoading: loadingScreenings, refetch: refetchScreenings } = useQuery({
    queryKey: ['screenings', childId],
    queryFn: async (): Promise<ScreeningResult[]> => {
      // Try to get screenings for this child (via child_id column or user_id)
      const { data } = await supabase
        .from('screenings')
        .select('*')
        .or(`child_id.eq.${childId},user_id.eq.${childId}`)
        .order('created_at', { ascending: false })
        .limit(20);
      
      return (data || []).map(s => ({
        id: s.id,
        type: s.type as 'tea' | 'tdah' | 'dislexia',
        score: Number(s.score),
        percentile: s.percentile ? Number(s.percentile) : undefined,
        duration: s.duration || undefined,
        recommended_action: s.recommended_action || undefined,
        test_data: (s.test_data as Record<string, unknown>) || {},
        created_at: s.created_at
      }));
    },
    enabled: !!childId
  });

  // Fetch condensed assessments
  const { data: assessments, isLoading: loadingAssessments, refetch: refetchAssessments } = useQuery({
    queryKey: ['condensed-assessments', childId],
    queryFn: async (): Promise<CondensedAssessment[]> => {
      const { data } = await supabase
        .from('condensed_assessments')
        .select('*')
        .eq('child_id', childId)
        .order('assessment_date', { ascending: false })
        .limit(10);
      
      return (data || []) as CondensedAssessment[];
    },
    enabled: !!childId
  });

  const latestAssessment = assessments?.[0];
  const filteredScreenings = activeType === 'all' 
    ? screenings 
    : screenings?.filter(s => s.type === activeType);

  const isLoading = loadingScreenings || loadingAssessments;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Three-Block Assessment Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Avaliação Consolidada (3 Blocos)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => { refetchScreenings(); refetchAssessments(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {latestAssessment ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Última avaliação: {format(new Date(latestAssessment.assessment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                {latestAssessment.source_type && (
                  <Badge variant="outline" className="ml-2">{latestAssessment.source_type}</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cognitive Block */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold">Cognitivo</span>
                      </div>
                      {getTrendIcon(latestAssessment.cognitive_trend)}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${getScoreColor(latestAssessment.cognitive_overall_score)}`}>
                      {latestAssessment.cognitive_overall_score ?? '-'}%
                    </div>
                    <Progress value={latestAssessment.cognitive_overall_score ?? 0} className="mb-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Risco:</span>
                      {getRiskBadge(latestAssessment.cognitive_risk)}
                    </div>
                  </CardContent>
                </Card>

                {/* Behavioral Block */}
                <Card className="border-2 border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="font-semibold">Comportamental</span>
                      </div>
                      {getTrendIcon(latestAssessment.behavioral_trend)}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${getScoreColor(latestAssessment.behavioral_overall_score)}`}>
                      {latestAssessment.behavioral_overall_score ?? '-'}%
                    </div>
                    <Progress value={latestAssessment.behavioral_overall_score ?? 0} className="mb-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Risco:</span>
                      {getRiskBadge(latestAssessment.behavioral_risk)}
                    </div>
                  </CardContent>
                </Card>

                {/* Socioemotional Block */}
                <Card className="border-2 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <BookOpen className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="font-semibold">Socioemocional</span>
                      </div>
                      {getTrendIcon(latestAssessment.socioemotional_trend)}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${getScoreColor(latestAssessment.socioemotional_overall_score)}`}>
                      {latestAssessment.socioemotional_overall_score ?? '-'}%
                    </div>
                    <Progress value={latestAssessment.socioemotional_overall_score ?? 0} className="mb-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Risco:</span>
                      {getRiskBadge(latestAssessment.socioemotional_risk)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {latestAssessment.notes && (
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{latestAssessment.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">Nenhuma avaliação consolidada encontrada</p>
              <Button variant="outline" asChild>
                <Link to="/testes-diagnosticos">Realizar Triagem</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screening Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Histórico de Triagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as typeof activeType)} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="tea" className="flex items-center gap-1">
                <Brain className="w-3 h-3" /> TEA
              </TabsTrigger>
              <TabsTrigger value="tdah" className="flex items-center gap-1">
                <Zap className="w-3 h-3" /> TDAH
              </TabsTrigger>
              <TabsTrigger value="dislexia" className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Dislexia
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredScreenings && filteredScreenings.length > 0 ? (
            <div className="space-y-3">
              {filteredScreenings.map((screening) => {
                const config = screeningConfig[screening.type];
                const Icon = config.icon;
                
                return (
                  <Card key={screening.id} className={`border ${config.borderColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold">{config.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(screening.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              {screening.duration && ` • ${Math.round(screening.duration / 60)} min`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(screening.score)}`}>
                            {screening.score.toFixed(0)}%
                          </div>
                          {screening.percentile && (
                            <p className="text-xs text-muted-foreground">
                              Percentil: {screening.percentile}
                            </p>
                          )}
                        </div>
                      </div>
                      {screening.recommended_action && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-sm text-amber-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {screening.recommended_action}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">Nenhuma triagem realizada ainda</p>
              <Button variant="outline" asChild>
                <Link to="/testes-diagnosticos">Iniciar Triagem</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(screeningConfig).map(([type, config]) => {
          const Icon = config.icon;
          const lastScreening = screenings?.find(s => s.type === type);
          
          return (
            <Card key={type} className={`border ${config.borderColor} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <span className="font-semibold">{config.shortTitle}</span>
                </div>
                {lastScreening ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Última: {format(new Date(lastScreening.created_at), "dd/MM/yyyy")}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Score:</span>
                      <span className={`font-bold ${getScoreColor(lastScreening.score)}`}>
                        {lastScreening.score.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Não realizada</p>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  asChild
                >
                  <Link to={`/games/${type}-screening`}>
                    {lastScreening ? 'Refazer Triagem' : 'Iniciar Triagem'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
