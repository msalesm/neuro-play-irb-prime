import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Calendar, Clock, FileText, Play, 
  Brain, Heart, Users, TrendingUp, TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeleconsultTabProps {
  childId: string;
  onStartSession?: (sessionId: string) => void;
}

interface TeleconsultHistory {
  id: string;
  scheduled_at: string;
  status: string;
  session_type: string;
  clinical_summary?: string;
  duration_minutes: number;
}

interface AssessmentSummary {
  date: string;
  cognitive_score: number;
  behavioral_score: number;
  socioemotional_score: number;
  cognitive_risk: string;
  behavioral_risk: string;
  socioemotional_risk: string;
}

export function TeleconsultTab({ childId, onStartSession }: TeleconsultTabProps) {
  const [sessions, setSessions] = useState<TeleconsultHistory[]>([]);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load teleconsult sessions
      const { data: sessionData } = await supabase
        .from('teleorientation_sessions')
        .select('*')
        .eq('child_id', childId)
        .order('scheduled_at', { ascending: false })
        .limit(10);

      setSessions(sessionData || []);

      // Load condensed assessments
      const { data: assessData } = await supabase
        .from('condensed_assessments')
        .select('*')
        .eq('child_id', childId)
        .order('assessment_date', { ascending: false })
        .limit(5);

      setAssessments((assessData || []).map((a: any) => ({
        date: a.assessment_date,
        cognitive_score: a.cognitive_overall_score || 0,
        behavioral_score: a.behavioral_overall_score || 0,
        socioemotional_score: a.socioemotional_overall_score || 0,
        cognitive_risk: a.cognitive_risk || 'medium',
        behavioral_risk: a.behavioral_risk || 'medium',
        socioemotional_risk: a.socioemotional_risk || 'medium'
      })));
    } catch (error) {
      console.error('Error loading teleconsult data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-500/10';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10';
      case 'high': return 'text-red-600 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const latestAssessment = assessments[0];
  const previousAssessment = assessments[1];

  return (
    <div className="space-y-6">
      {/* Latest Assessment Summary */}
      {latestAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Última Avaliação</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(latestAssessment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* Cognitivo */}
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-medium">Cognitivo</span>
                  {getScoreTrend(latestAssessment.cognitive_score, previousAssessment?.cognitive_score)}
                </div>
                <p className="text-3xl font-bold">{latestAssessment.cognitive_score}%</p>
                <Badge className={`mt-2 ${getRiskColor(latestAssessment.cognitive_risk)}`}>
                  Risco {latestAssessment.cognitive_risk === 'low' ? 'Baixo' : 
                         latestAssessment.cognitive_risk === 'high' ? 'Alto' : 'Médio'}
                </Badge>
              </div>

              {/* Comportamental */}
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#005a70]" />
                  <span className="font-medium">Comportamental</span>
                  {getScoreTrend(latestAssessment.behavioral_score, previousAssessment?.behavioral_score)}
                </div>
                <p className="text-3xl font-bold">{latestAssessment.behavioral_score}%</p>
                <Badge className={`mt-2 ${getRiskColor(latestAssessment.behavioral_risk)}`}>
                  Risco {latestAssessment.behavioral_risk === 'low' ? 'Baixo' : 
                         latestAssessment.behavioral_risk === 'high' ? 'Alto' : 'Médio'}
                </Badge>
              </div>

              {/* Socioemocional */}
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Socioemocional</span>
                  {getScoreTrend(latestAssessment.socioemotional_score, previousAssessment?.socioemotional_score)}
                </div>
                <p className="text-3xl font-bold">{latestAssessment.socioemotional_score}%</p>
                <Badge className={`mt-2 ${getRiskColor(latestAssessment.socioemotional_risk)}`}>
                  Risco {latestAssessment.socioemotional_risk === 'low' ? 'Baixo' : 
                         latestAssessment.socioemotional_risk === 'high' ? 'Alto' : 'Médio'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teleconsult History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="w-4 h-4" />
            Histórico de Teleconsultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma teleconsulta registrada para este paciente
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      session.status === 'completed' ? 'bg-green-500/10' : 'bg-muted'
                    }`}>
                      <Video className={`w-5 h-5 ${
                        session.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {session.session_type === 'orientation' ? 'Orientação' :
                           session.session_type === 'follow_up' ? 'Acompanhamento' : 'Avaliação'}
                        </p>
                        <Badge variant={session.status === 'completed' ? 'default' : 'outline'}>
                          {session.status === 'completed' ? 'Concluída' :
                           session.status === 'scheduled' ? 'Agendada' :
                           session.status === 'cancelled' ? 'Cancelada' : session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(session.scheduled_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.scheduled_at), 'HH:mm', { locale: ptBR })}
                        </span>
                        <span>{session.duration_minutes} min</span>
                      </div>
                      {session.clinical_summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {session.clinical_summary}
                        </p>
                      )}
                    </div>
                  </div>
                  {session.status === 'scheduled' && onStartSession && (
                    <Button size="sm" onClick={() => onStartSession(session.id)}>
                      <Play className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Trend */}
      {assessments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendência Longitudinal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessments.slice(0, 5).map((assessment, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-24">
                    {format(new Date(assessment.date), 'dd/MM/yy', { locale: ptBR })}
                  </span>
                  <div className="flex-1 flex gap-2">
                    <div 
                      className="h-4 rounded bg-primary/60"
                      style={{ width: `${assessment.cognitive_score}%` }}
                      title={`Cognitivo: ${assessment.cognitive_score}%`}
                    />
                  </div>
                  <div className="flex-1 flex gap-2">
                    <div 
                      className="h-4 rounded bg-[#005a70]/60"
                      style={{ width: `${assessment.behavioral_score}%` }}
                      title={`Comportamental: ${assessment.behavioral_score}%`}
                    />
                  </div>
                  <div className="flex-1 flex gap-2">
                    <div 
                      className="h-4 rounded bg-red-500/60"
                      style={{ width: `${assessment.socioemotional_score}%` }}
                      title={`Socioemocional: ${assessment.socioemotional_score}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary/60" /> Cognitivo
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#005a70]/60" /> Comportamental
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500/60" /> Socioemocional
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
