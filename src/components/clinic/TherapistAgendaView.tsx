import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';

interface WorkSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_cases_per_slot: number | null;
}

interface TherapistAppointment {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  end_time: string | null;
  status: string;
  room: string | null;
  service_mode: string | null;
  internal_notes: string | null;
  child?: { id: string; name: string } | null;
  parent?: { id: string; full_name: string } | null;
  professional?: { id: string; full_name: string } | null;
  appointment_type?: { id: string; name: string; color: string; duration_minutes: number } | null;
  check_in_at: string | null;
  confirmed_at: string | null;
  confirmed_via: string | null;
  cancellation_reason: string | null;
  professional_id: string;
  appointment_type_id: string | null;
  child_id: string | null;
  parent_id: string | null;
  created_at: string;
}

const DAYS_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function TherapistAgendaView() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<TherapistAppointment[]>([]);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (user) {
      fetchWorkSchedule();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, selectedDate]);

  const fetchWorkSchedule = async () => {
    const { data, error } = await supabase
      .from('professional_schedules')
      .select('day_of_week, start_time, end_time, is_available, max_cases_per_slot')
      .eq('professional_id', user?.id)
      .order('day_of_week');

    if (error) {
      console.error('Error fetching work schedule:', error);
      return;
    }
    setWorkSchedule(data || []);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const endOfWeek = addDays(weekStart, 6);

    const { data, error } = await supabase
      .from('clinic_appointments')
      .select(`
        *,
        child:children(id, name),
        parent:profiles!clinic_appointments_parent_id_fkey(id, full_name),
        professional:profiles!clinic_appointments_professional_id_fkey(id, full_name),
        appointment_type:appointment_types(id, name, color, duration_minutes)
      `)
      .eq('professional_id', user?.id)
      .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('scheduled_date', format(endOfWeek, 'yyyy-MM-dd'))
      .order('scheduled_date')
      .order('scheduled_time');

    if (error) {
      console.error('Error fetching appointments:', error);
    }
    setAppointments((data as TherapistAppointment[]) || []);
    setLoading(false);
  };

  const getScheduleForDay = (dayOfWeek: number): WorkSchedule | undefined => {
    return workSchedule.find(s => s.day_of_week === dayOfWeek && s.is_available);
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(a => a.scheduled_date === dateStr);
  };

  const todayAppointments = getAppointmentsForDay(selectedDate);
  const todaySchedule = getScheduleForDay(selectedDate.getDay());

  const statusCounts = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmado').length,
    pending: appointments.filter(a => a.status === 'agendado').length,
    completed: appointments.filter(a => a.status === 'realizado').length,
  };

  const updateStatus = async (id: string, status: string, extra?: Record<string, any>) => {
    const { error } = await supabase
      .from('clinic_appointments')
      .update({ status, ...extra })
      .eq('id', id);
    if (!error) fetchAppointments();
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-medium ml-2">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={fetchAppointments}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Week overview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Week day selector */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const daySchedule = getScheduleForDay(day.getDay());
              const dayAppts = getAppointmentsForDay(day);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-colors",
                    isSelected && "border-primary bg-primary/10",
                    isToday(day) && !isSelected && "border-primary/50",
                    !daySchedule && "opacity-50"
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn("text-lg font-semibold", isToday(day) && "text-primary")}>
                    {format(day, 'd')}
                  </div>
                  {daySchedule && (
                    <div className="text-[10px] text-muted-foreground">
                      {daySchedule.start_time.slice(0, 5)}-{daySchedule.end_time.slice(0, 5)}
                    </div>
                  )}
                  {dayAppts.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      {dayAppts.length}
                    </Badge>
                  )}
                  {!daySchedule && (
                    <div className="text-[10px] text-muted-foreground">Folga</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day detail */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </div>
                {todaySchedule && (
                  <Badge variant="outline" className="font-normal gap-1">
                    <Clock className="w-3 h-3" />
                    {todaySchedule.start_time.slice(0, 5)} - {todaySchedule.end_time.slice(0, 5)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!todaySchedule ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">Sem expediente neste dia</p>
                  <p className="text-sm">Configure seus horários de trabalho no Centro de Operações</p>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>Nenhum agendamento para este dia</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-3">
                    {todayAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        className={cn(
                          "p-4 rounded-lg border space-y-2",
                          appt.status === 'cancelado' && "opacity-50",
                          appt.status === 'realizado' && "bg-muted/30",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-semibold">
                              {appt.scheduled_time.slice(0, 5)}
                            </div>
                            {appt.end_time && (
                              <span className="text-sm text-muted-foreground">
                                até {appt.end_time.slice(0, 5)}
                              </span>
                            )}
                          </div>
                          <Badge
                            variant={
                              appt.status === 'confirmado' ? 'default' :
                              appt.status === 'realizado' ? 'secondary' :
                              appt.status === 'cancelado' ? 'destructive' :
                              appt.status === 'em_atendimento' ? 'default' :
                              'outline'
                            }
                          >
                            {appt.status === 'agendado' && 'Agendado'}
                            {appt.status === 'confirmado' && 'Confirmado'}
                            {appt.status === 'em_atendimento' && 'Em atendimento'}
                            {appt.status === 'realizado' && 'Realizado'}
                            {appt.status === 'falta' && 'Falta'}
                            {appt.status === 'cancelado' && 'Cancelado'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          {appt.child && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              {appt.child.name}
                            </span>
                          )}
                          {appt.appointment_type && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: appt.appointment_type.color || undefined,
                                color: appt.appointment_type.color || undefined
                              }}
                            >
                              {appt.appointment_type.name}
                            </Badge>
                          )}
                          {appt.room && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              {appt.room}
                            </span>
                          )}
                          {appt.service_mode && (
                            <Badge variant="secondary" className="text-xs">
                              {appt.service_mode === 'premium' ? 'Premium' : 'Standard'}
                            </Badge>
                          )}
                        </div>

                        {appt.internal_notes && (
                          <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                            {appt.internal_notes}
                          </p>
                        )}

                        {/* Quick actions */}
                        {appt.status !== 'cancelado' && appt.status !== 'realizado' && appt.status !== 'falta' && (
                          <div className="flex gap-2 pt-1">
                            {appt.status === 'agendado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(appt.id, 'confirmado', { confirmed_at: new Date().toISOString(), confirmed_via: 'manual' })}
                              >
                                Confirmar
                              </Button>
                            )}
                            {(appt.status === 'confirmado' || appt.status === 'agendado') && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus(appt.id, 'em_atendimento', { check_in_at: new Date().toISOString() })}
                              >
                                Iniciar Atendimento
                              </Button>
                            )}
                            {appt.status === 'em_atendimento' && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus(appt.id, 'realizado')}
                              >
                                Finalizar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Weekly summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumo da Semana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{statusCounts.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confirmados</span>
                <span className="font-medium text-green-600">{statusCounts.confirmed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aguardando</span>
                <span className="font-medium text-yellow-600">{statusCounts.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Realizados</span>
                <span className="font-medium text-blue-600">{statusCounts.completed}</span>
              </div>
            </CardContent>
          </Card>

          {/* Work schedule card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário de Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workSchedule.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum horário configurado
                </p>
              ) : (
                <div className="space-y-2">
                  {DAYS_LABELS.map((label, idx) => {
                    const schedule = workSchedule.find(s => s.day_of_week === idx);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center justify-between text-sm py-1.5 px-2 rounded",
                          schedule?.is_available ? "bg-green-50 dark:bg-green-950/20" : "opacity-50"
                        )}
                      >
                        <span className="font-medium">{label.slice(0, 3)}</span>
                        {schedule?.is_available ? (
                          <span className="text-muted-foreground">
                            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
