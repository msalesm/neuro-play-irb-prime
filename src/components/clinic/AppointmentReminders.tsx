import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Calendar, Clock, CheckCircle2, X, Video, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isTomorrow, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  patient_name: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  status: string;
  professional_name?: string;
}

export function AppointmentReminders() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchUpcoming();
  }, [user]);

  const fetchUpcoming = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from('clinic_appointments')
        .select(`
          id, patient_name, start_time, end_time, status,
          appointment_types(name),
          profiles!clinic_appointments_professional_id_fkey(full_name)
        `)
        .gte('start_time', now)
        .lte('start_time', threeDaysLater)
        .in('status', ['confirmed', 'pending'])
        .order('start_time', { ascending: true })
        .limit(10);

      setAppointments(
        (data || []).map((a: any) => ({
          id: a.id,
          patient_name: a.patient_name || 'Paciente',
          appointment_type: a.appointment_types?.name || 'Consulta',
          start_time: a.start_time,
          end_time: a.end_time,
          status: a.status,
          professional_name: a.profiles?.full_name,
        }))
      );
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (startTime: string) => {
    const date = new Date(startTime);
    const hoursUntil = differenceInHours(date, new Date());

    if (hoursUntil <= 1) {
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Em breve</Badge>;
    }
    if (isToday(date)) {
      return <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">Hoje</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge className="bg-info/10 text-info border-info/20 text-[10px]">Amanhã</Badge>;
    }
    return <Badge variant="outline" className="text-[10px]">Próximo</Badge>;
  };

  const confirmAppointment = async (id: string) => {
    try {
      await supabase.from('clinic_appointments').update({ status: 'confirmed' }).eq('id', id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Próximos Agendamentos
        </CardTitle>
        <CardDescription className="text-xs">Consultas nos próximos 3 dias</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum agendamento próximo</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-3 rounded-lg border bg-card/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{apt.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{apt.appointment_type}</p>
                    </div>
                    {getUrgencyBadge(apt.start_time)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(apt.start_time), "dd/MM", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                    </span>
                  </div>
                  {apt.professional_name && (
                    <p className="text-xs text-muted-foreground">Dr(a). {apt.professional_name}</p>
                  )}
                  {apt.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => confirmAppointment(apt.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Confirmar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
