import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Calendar, Clock, User, Plus, FileText,
  Play, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleTeleconsultModal } from './ScheduleTeleconsultModal';

interface TeleconsultSession {
  id: string;
  child_id: string;
  parent_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  clinical_summary?: string;
  children?: { name: string; id: string };
}

interface TeleconsultListProps {
  onStartSession: (session: TeleconsultSession) => void;
  onViewRecord: (childId: string) => void;
}

export function TeleconsultList({ onStartSession, onViewRecord }: TeleconsultListProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TeleconsultSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const loadSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teleorientation_sessions')
        .select(`
          *,
          children (id, name)
        `)
        .eq('professional_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const date = new Date(scheduledAt);
    
    if (status === 'completed') {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Concluída</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelada</Badge>;
    }
    if (status === 'in_progress') {
      return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 animate-pulse">Em andamento</Badge>;
    }
    if (isPast(date)) {
      return <Badge variant="destructive">Não realizada</Badge>;
    }
    if (isToday(date)) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Hoje</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Amanhã</Badge>;
    }
    return <Badge variant="outline">Agendada</Badge>;
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'orientation': return 'Orientação';
      case 'follow_up': return 'Acompanhamento';
      case 'evaluation': return 'Avaliação';
      default: return type;
    }
  };

  const upcomingSessions = sessions.filter(s => 
    s.status !== 'completed' && s.status !== 'cancelled' && isFuture(new Date(s.scheduled_at))
  );

  const todaySessions = sessions.filter(s => 
    s.status !== 'cancelled' && isToday(new Date(s.scheduled_at))
  );

  const pastSessions = sessions.filter(s => 
    s.status === 'completed' || (isPast(new Date(s.scheduled_at)) && s.status !== 'cancelled')
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Teleconsultas</h2>
          <p className="text-muted-foreground">Gerencie suas consultas remotas</p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Agendar Teleconsulta
        </Button>
      </div>

      {/* Today's Sessions Alert */}
      {todaySessions.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {todaySessions.length} teleconsulta{todaySessions.length > 1 ? 's' : ''} hoje
                </p>
                <p className="text-sm text-muted-foreground">
                  Próxima: {todaySessions[0]?.children?.name} às{' '}
                  {format(new Date(todaySessions[0].scheduled_at), 'HH:mm', { locale: ptBR })}
                </p>
              </div>
              {todaySessions[0] && (
                <Button onClick={() => onStartSession(todaySessions[0])}>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Próximas Teleconsultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma teleconsulta agendada
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 5).map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.children?.name || 'Paciente'}</p>
                        {getStatusBadge(session.status, session.scheduled_at)}
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
                        <Badge variant="outline" className="text-xs">
                          {getSessionTypeLabel(session.session_type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => session.children?.id && onViewRecord(session.children.id)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Prontuário
                    </Button>
                    {isToday(new Date(session.scheduled_at)) && (
                      <Button size="sm" onClick={() => onStartSession(session)}>
                        <Play className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Histórico de Teleconsultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma teleconsulta realizada
            </p>
          ) : (
            <div className="space-y-3">
              {pastSessions.slice(0, 10).map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Video className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.children?.name || 'Paciente'}</p>
                        {getStatusBadge(session.status, session.scheduled_at)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(session.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      {session.clinical_summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {session.clinical_summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => session.children?.id && onViewRecord(session.children.id)}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Modal */}
      <ScheduleTeleconsultModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={() => {
          setShowScheduleModal(false);
          loadSessions();
        }}
      />
    </div>
  );
}
