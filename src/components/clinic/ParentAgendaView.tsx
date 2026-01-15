import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, User, MapPin, Video, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, startOfWeek, addDays, isToday, isSameDay, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ParentAppointment {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  room?: string;
  service_mode?: string;
  child?: { name: string };
  professional?: { full_name: string };
  appointment_type?: { name: string; color: string };
}

export function ParentAgendaView() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<ParentAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, selectedDate]);

  const loadAppointments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get parent's children
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id);

      if (childrenError) throw childrenError;

      if (!children || children.length === 0) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      const childIds = children.map(c => c.id);
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');

      // Get appointments for parent's children
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('clinic_appointments')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          status,
          room,
          service_mode,
          child:children(name),
          professional:profiles!clinic_appointments_professional_id_fkey(full_name),
          appointment_type:appointment_types(name, color)
        `)
        .in('child_id', childIds)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error loading parent appointments:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => setSelectedDate(addDays(selectedDate, -7));
  const handleNextWeek = () => setSelectedDate(addDays(selectedDate, 7));
  const handleToday = () => setSelectedDate(new Date());

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' };
      case 'agendado':
        return { label: 'Aguardando confirmação', variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-600' };
      case 'realizado':
        return { label: 'Realizado', variant: 'outline' as const, icon: CheckCircle, color: 'text-blue-600' };
      case 'cancelado':
        return { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' };
      case 'faltou':
        return { label: 'Falta', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' };
      default:
        return { label: status, variant: 'outline' as const, icon: AlertCircle, color: 'text-muted-foreground' };
    }
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(a => a.scheduled_date === dateStr);
  };

  const upcomingAppointments = appointments.filter(a => {
    const appointmentDate = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
    return appointmentDate >= new Date() && a.status !== 'cancelado' && a.status !== 'faltou';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
          <p className="text-muted-foreground">
            Acompanhe as consultas dos seus filhos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week View */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const hasAppointments = dayAppointments.length > 0;
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 text-center rounded-lg border transition-colors",
                    isToday(day) && "bg-primary/10 border-primary",
                    hasAppointments && !isToday(day) && "bg-muted/50",
                    isPast(day) && !isToday(day) && "opacity-60"
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-lg font-medium",
                    isToday(day) && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </div>
                  {hasAppointments && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  if (dayAppointments.length === 0) return null;

                  return (
                    <div key={day.toISOString()}>
                      <h4 className={cn(
                        "font-medium mb-2 text-sm",
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </h4>
                      <div className="space-y-2">
                        {dayAppointments.map((appointment) => {
                          const status = getStatusInfo(appointment.status);
                          const StatusIcon = status.icon;
                          
                          return (
                            <Card key={appointment.id} className="border-l-4" style={{
                              borderLeftColor: appointment.appointment_type?.color || 'hsl(var(--primary))'
                            }}>
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {appointment.scheduled_time.slice(0, 5)}
                                      </span>
                                      <Badge variant={status.variant} className="text-xs">
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status.label}
                                      </Badge>
                                    </div>

                                    <div className="space-y-1 text-sm">
                                      {appointment.child && (
                                        <div className="flex items-center gap-2">
                                          <User className="h-3 w-3 text-muted-foreground" />
                                          <span>{appointment.child.name}</span>
                                        </div>
                                      )}
                                      
                                      {appointment.professional && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <User className="h-3 w-3" />
                                          <span>{appointment.professional.full_name}</span>
                                        </div>
                                      )}

                                      {appointment.appointment_type && (
                                        <div className="text-muted-foreground">
                                          {appointment.appointment_type.name}
                                        </div>
                                      )}

                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        {appointment.room && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{appointment.room}</span>
                                          </div>
                                        )}
                                        {appointment.service_mode === 'online' && (
                                          <div className="flex items-center gap-1">
                                            <Video className="h-3 w-3" />
                                            <span>Online</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum agendamento nesta semana</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments Summary */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingAppointments.slice(0, 3).map((appointment) => {
                const status = getStatusInfo(appointment.status);
                
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[50px]">
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(appointment.scheduled_date), 'dd/MM', { locale: ptBR })}
                        </div>
                        <div className="font-medium text-sm">
                          {appointment.scheduled_time.slice(0, 5)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {appointment.child?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.professional?.full_name}
                        </div>
                      </div>
                    </div>
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
