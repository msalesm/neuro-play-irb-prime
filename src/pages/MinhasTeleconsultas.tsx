import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Calendar, Clock, User, 
  AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow, isPast, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface TeleconsultSession {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string | null;
  professional_id: string;
  children: { id: string; name: string } | null;
  profiles?: { full_name: string } | null;
}

export default function MinhasTeleconsultas() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TeleconsultSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Carregar sessões onde o usuário é o pai
      const { data, error } = await supabase
        .from('teleorientation_sessions')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          status,
          session_type,
          professional_id,
          children:child_id (id, name)
        `)
        .eq('parent_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      // Carregar nomes dos profissionais
      const professionalIds = [...new Set(data?.map(s => s.professional_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', professionalIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      
      const sessionsWithProfiles = data?.map(s => ({
        ...s,
        profiles: { full_name: profileMap.get(s.professional_id) || 'Profissional' }
      })) || [];

      setSessions(sessionsWithProfiles);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Erro ao carregar teleconsultas');
    } finally {
      setLoading(false);
    }
  };

  const canJoinSession = (session: TeleconsultSession) => {
    const scheduledTime = new Date(session.scheduled_at);
    const now = new Date();
    const minutesBefore = 10; // Pode entrar 10 min antes
    const canEnter = now >= addMinutes(scheduledTime, -minutesBefore);
    const sessionEnd = addMinutes(scheduledTime, session.duration_minutes || 30);
    const notExpired = now <= sessionEnd;
    return canEnter && notExpired && session.status !== 'completed' && session.status !== 'cancelled';
  };

  const getStatusBadge = (session: TeleconsultSession) => {
    const scheduledTime = new Date(session.scheduled_at);
    
    if (session.status === 'completed') {
      return <Badge variant="secondary" className="bg-green-500/20 text-green-600">Concluída</Badge>;
    }
    if (session.status === 'cancelled') {
      return <Badge variant="destructive">Cancelada</Badge>;
    }
    if (session.status === 'in_progress') {
      return <Badge className="bg-blue-500 animate-pulse">Em Andamento</Badge>;
    }
    if (isPast(scheduledTime) && session.status !== 'completed') {
      return <Badge variant="destructive">Não Compareceu</Badge>;
    }
    if (isToday(scheduledTime)) {
      return <Badge className="bg-primary">Hoje</Badge>;
    }
    if (isTomorrow(scheduledTime)) {
      return <Badge variant="outline">Amanhã</Badge>;
    }
    return <Badge variant="outline">Agendada</Badge>;
  };

  const handleJoinSession = (session: TeleconsultSession) => {
    navigate(`/teleconsulta/${session.id}`);
  };

  const upcomingSessions = sessions.filter(s => 
    s.status !== 'completed' && s.status !== 'cancelled' && !isPast(new Date(s.scheduled_at))
  );
  
  const todaySessions = upcomingSessions.filter(s => isToday(new Date(s.scheduled_at)));
  const futureSessions = upcomingSessions.filter(s => !isToday(new Date(s.scheduled_at)));
  const pastSessions = sessions.filter(s => 
    s.status === 'completed' || s.status === 'cancelled' || 
    (isPast(new Date(s.scheduled_at)) && s.status !== 'in_progress')
  ).slice(0, 10);

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Minhas Teleconsultas</h1>
          <p className="text-muted-foreground">Acompanhe e participe das suas consultas online</p>
        </div>

        {/* Consulta de Hoje - Destaque */}
        {todaySessions.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Video className="w-5 h-5" />
                Consultas de Hoje
              </CardTitle>
              <CardDescription>
                Prepare-se para sua teleconsulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaySessions.map((session) => (
                <div 
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background rounded-lg border gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{session.children?.name || 'Paciente'}</span>
                      {getStatusBadge(session)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(session.scheduled_at), "HH:mm", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {session.profiles?.full_name}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleJoinSession(session)}
                    disabled={!canJoinSession(session)}
                    className="gap-2"
                  >
                    <Video className="w-4 h-4" />
                    {canJoinSession(session) ? 'Entrar na Sala' : 'Aguarde o horário'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Próximas Consultas */}
        {futureSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {futureSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{session.children?.name || 'Paciente'}</span>
                        {getStatusBadge(session)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(session.scheduled_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(session.scheduled_at), "HH:mm", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {session.profiles?.full_name}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1" disabled>
                      Aguardando
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consultas Realizadas */}
        {pastSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pastSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/20 rounded-lg gap-2"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium">{session.children?.name || 'Paciente'}</span>
                      {getStatusBadge(session)}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(session.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {sessions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma teleconsulta agendada</h3>
              <p className="text-muted-foreground">
                Aguarde o profissional agendar uma teleconsulta para você.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernPageLayout>
  );
}
