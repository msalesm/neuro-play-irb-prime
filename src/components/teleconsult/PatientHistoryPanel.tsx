import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Heart, Users, Calendar, Gamepad2, 
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  FileText, Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientHistoryPanelProps {
  patientId: string;
  patientName: string;
}

interface Assessment {
  id: string;
  assessment_date: string;
  cognitive_overall_score: number | null;
  cognitive_risk: string | null;
  behavioral_overall_score: number | null;
  behavioral_risk: string | null;
  socioemotional_overall_score: number | null;
  socioemotional_risk: string | null;
  notes: string | null;
  source_type: string | null;
}

interface SessionSummary {
  total_sessions: number;
  avg_accuracy: number;
  total_time_minutes: number;
  last_played: string | null;
}

interface PreviousConsult {
  id: string;
  scheduled_at: string;
  clinical_summary: string | null;
  status: string;
}

export function PatientHistoryPanel({ patientId, patientName }: PatientHistoryPanelProps) {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [previousConsults, setPreviousConsults] = useState<PreviousConsult[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadPatientHistory();
  }, [patientId]);

  const loadPatientHistory = async () => {
    setLoading(true);
    try {
      // Load assessments
      const { data: assessData } = await supabase
        .from('condensed_assessments')
        .select('*')
        .eq('child_id', patientId)
        .order('assessment_date', { ascending: false })
        .limit(5);
      
      setAssessments(assessData || []);

      // Load game session summary
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('accuracy_percentage, duration_seconds, created_at')
        .eq('child_profile_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (sessions && sessions.length > 0) {
        const totalSessions = sessions.length;
        const avgAccuracy = sessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / totalSessions;
        const totalTime = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60;
        
        setSessionSummary({
          total_sessions: totalSessions,
          avg_accuracy: Math.round(avgAccuracy),
          total_time_minutes: Math.round(totalTime),
          last_played: sessions[0]?.created_at || null
        });
      }

      // Load previous teleconsults
      const { data: consults } = await supabase
        .from('teleorientation_sessions')
        .select('id, scheduled_at, clinical_summary, status')
        .eq('child_id', patientId)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(5);

      setPreviousConsults(consults || []);

      // Load clinical alerts
      const { data: alertsData } = await supabase
        .from('clinical_pattern_alerts')
        .select('*')
        .eq('child_id', patientId)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setAlerts(alertsData || []);

    } catch (error) {
      console.error('Error loading patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: string | null) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">Alto Risco</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Médio</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Baixo</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const getTrendIcon = (score: number | null) => {
    if (!score) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando histórico...</div>
      </div>
    );
  }

  const latestAssessment = assessments[0];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold">Histórico do Paciente</h2>
        <p className="text-muted-foreground text-sm">{patientName}</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-4 border-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Alertas Ativos ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-2 bg-destructive/10 rounded text-sm">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-muted-foreground text-xs">{alert.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Latest Assessment Summary */}
        {latestAssessment && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Última Avaliação
                <span className="text-xs text-muted-foreground ml-auto">
                  {format(new Date(latestAssessment.assessment_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <Brain className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Cognitivo</p>
                  <p className="font-bold">{latestAssessment.cognitive_overall_score || '-'}%</p>
                  {getRiskBadge(latestAssessment.cognitive_risk)}
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <Users className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Comportamental</p>
                  <p className="font-bold">{latestAssessment.behavioral_overall_score || '-'}%</p>
                  {getRiskBadge(latestAssessment.behavioral_risk)}
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                  <p className="text-xs text-muted-foreground">Socioemocional</p>
                  <p className="font-bold">{latestAssessment.socioemotional_overall_score || '-'}%</p>
                  {getRiskBadge(latestAssessment.socioemotional_risk)}
                </div>
              </div>
              {latestAssessment.notes && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                  {latestAssessment.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Activity Summary */}
        {sessionSummary && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Atividade em Jogos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold">{sessionSummary.total_sessions}</p>
                  <p className="text-xs text-muted-foreground">Sessões</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{sessionSummary.avg_accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Precisão Média</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{sessionSummary.total_time_minutes}</p>
                  <p className="text-xs text-muted-foreground">Min. Total</p>
                </div>
              </div>
              {sessionSummary.last_played && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Última sessão: {format(new Date(sessionSummary.last_played), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Previous Teleconsults */}
        {previousConsults.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Consultas Anteriores ({previousConsults.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {previousConsults.map((consult) => (
                <div key={consult.id} className="p-2 bg-muted/30 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {format(new Date(consult.scheduled_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <Badge variant="outline" className="text-xs">Concluída</Badge>
                  </div>
                  {consult.clinical_summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {consult.clinical_summary}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Assessment History */}
        {assessments.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Evolução das Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assessments.slice(1).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                    <span>{format(new Date(assessment.assessment_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {assessment.cognitive_overall_score || '-'}%
                        {getTrendIcon(assessment.cognitive_overall_score)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {assessment.behavioral_overall_score || '-'}%
                        {getTrendIcon(assessment.behavioral_overall_score)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {assessment.socioemotional_overall_score || '-'}%
                        {getTrendIcon(assessment.socioemotional_overall_score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!latestAssessment && !sessionSummary && previousConsults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum histórico encontrado para este paciente.</p>
            <p className="text-sm">Esta será a primeira consulta registrada.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}