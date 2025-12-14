import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Video, AlertTriangle, TrendingUp, 
  Search, Calendar, Clock, FileText, 
  Plus, ChevronRight, Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  name: string;
  birth_date: string;
  last_session?: string;
  pending_alerts: number;
  conditions: string[];
}

interface UpcomingSession {
  id: string;
  patient_name: string;
  patient_id: string;
  scheduled_for: string;
  session_type: string;
}

export function ClinicalDashboardProfessional() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAlerts: 0,
    weekSessions: 0,
    pendingReports: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch patients with access
      const { data: access } = await supabase
        .from('child_access')
        .select(`
          child_id,
          children:child_id (
            id, name, birth_date, 
            neurodevelopmental_conditions
          )
        `)
        .eq('professional_id', user.id)
        .eq('is_active', true);

      const patientList: Patient[] = [];
      
      if (access) {
        for (const a of access) {
          const child = a.children as any;
          if (child) {
            // Count pending alerts
            const { count: alertCount } = await supabase
              .from('clinical_pattern_alerts')
              .select('*', { count: 'exact', head: true })
              .eq('child_id', child.id)
              .eq('is_acknowledged', false);

            patientList.push({
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              pending_alerts: alertCount || 0,
              conditions: child.neurodevelopmental_conditions?.conditions || []
            });
          }
        }
      }

      setPatients(patientList);
      
      // Fetch upcoming sessions
      const { data: sessions } = await supabase
        .from('teleorientation_sessions')
        .select(`
          id, scheduled_at, session_type,
          children:child_id (id, name)
        `)
        .eq('professional_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (sessions) {
        setUpcomingSessions(sessions.map((s: any) => ({
          id: s.id,
          patient_name: s.children?.name || 'Paciente',
          patient_id: s.children?.id,
          scheduled_for: s.scheduled_at,
          session_type: s.session_type
        })));
      }

      // Count total alerts
      const totalAlerts = patientList.reduce((sum, p) => sum + p.pending_alerts, 0);
      
      // Count week sessions
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { count: weekSessionCount } = await supabase
        .from('teleorientation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', user.id)
        .gte('scheduled_for', weekStart.toISOString())
        .eq('status', 'completed');

      setStats({
        totalPatients: patientList.length,
        activeAlerts: totalAlerts,
        weekSessions: weekSessionCount || 0,
        pendingReports: 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Clínico</h1>
          <p className="text-muted-foreground">Gerencie pacientes e teleconsultas</p>
        </div>
        <Button onClick={() => navigate('/teleconsultas')}>
          <Video className="w-4 h-4 mr-2" />
          Nova Teleconsulta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes</p>
                <p className="text-2xl font-bold">{stats.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{stats.activeAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Video className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessões Semana</p>
                <p className="text-2xl font-bold">{stats.weekSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#c7923e]/10">
                <TrendingUp className="w-6 h-6 text-[#c7923e]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Evolução Média</p>
                <p className="text-2xl font-bold">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pacientes</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum paciente encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/prontuario/${patient.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <div className="flex items-center gap-2">
                            {patient.conditions.slice(0, 2).map((c, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {patient.pending_alerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {patient.pending_alerts} alerta{patient.pending_alerts > 1 ? 's' : ''}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Próximas Teleconsultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhuma sessão agendada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div 
                      key={session.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/prontuario/${session.patient_id}`)}
                    >
                      <p className="font-medium text-sm">{session.patient_name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(session.scheduled_for), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {session.session_type === 'evaluation' ? 'Avaliação' :
                         session.session_type === 'follow_up' ? 'Acompanhamento' :
                         session.session_type === 'feedback' ? 'Devolutiva' : 'Teleconsulta'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/teleconsultas')}>
                <Video className="w-4 h-4 mr-2" />
                Agendar Teleconsulta
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/pacientes')}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
