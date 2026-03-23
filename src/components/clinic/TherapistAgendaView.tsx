import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Calendar, Clock, ChevronLeft, ChevronRight,
  User, MapPin, RefreshCw, ArrowRight
} from 'lucide-react';
import { PatientAvatar } from '@/components/clinical/PatientAvatar';

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
  child?: { id: string; name: string; avatar_url?: string } | null;
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

const DAYS_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  agendado: { label: 'Agendado', variant: 'outline' },
  confirmado: { label: 'Confirmado', variant: 'default' },
  em_atendimento: { label: 'Em atendimento', variant: 'default' },
  realizado: { label: 'Realizado', variant: 'secondary' },
  falta: { label: 'Falta', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'destructive' },
};

export function TherapistAgendaView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<TherapistAppointment[]>([]);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => { if (user) fetchWorkSchedule(); }, [user]);
  useEffect(() => { if (user) fetchAppointments(); }, [user, selectedDate]);

  const fetchWorkSchedule = async () => {
    const { data } = await supabase
      .from('professional_schedules')
      .select('day_of_week, start_time, end_time, is_available, max_cases_per_slot')
      .eq('professional_id', user?.id)
      .order('day_of_week');
    setWorkSchedule(data || []);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const endOfWeek = addDays(weekStart, 6);
    const { data } = await supabase
      .from('clinic_appointments')
      .select(`
        *,
        child:children(id, name, avatar_url),
        parent:profiles!clinic_appointments_parent_id_fkey(id, full_name),
        professional:profiles!clinic_appointments_professional_id_fkey(id, full_name),
        appointment_type:appointment_types(id, name, color, duration_minutes)
      `)
      .eq('professional_id', user?.id)
      .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('scheduled_date', format(endOfWeek, 'yyyy-MM-dd'))
      .order('scheduled_date')
      .order('scheduled_time');
    setAppointments((data as TherapistAppointment[]) || []);
    setLoading(false);
  };

  const getScheduleForDay = (dow: number) => workSchedule.find(s => s.day_of_week === dow && s.is_available);
  const getAppointmentsForDay = (date: Date) => {
    const ds = format(date, 'yyyy-MM-dd');
    return appointments.filter(a => a.scheduled_date === ds);
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
    await supabase.from('clinic_appointments').update({ status, ...extra }).eq('id', id);
    fetchAppointments();
  };

  return (
    <div className="space-y-5">
      {/* Week Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchAppointments}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {format(weekStart, "d MMM", { locale: ptBR })} – {format(addDays(weekStart, 6), "d MMM yyyy", { locale: ptBR })}
        </span>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Main area */}
        <div className="space-y-4">
          {/* Day pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {weekDays.map((day) => {
              const sched = getScheduleForDay(day.getDay());
              const appts = getAppointmentsForDay(day);
              const sel = isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex-shrink-0 min-w-[4rem] p-2 rounded-xl border text-center transition-all",
                    sel ? "border-primary bg-primary/10 shadow-sm" : "hover:bg-muted/50",
                    isToday(day) && !sel && "border-primary/40",
                    !sched && "opacity-40"
                  )}
                >
                  <div className="text-[10px] text-muted-foreground uppercase">{DAYS_LABELS[day.getDay()]}</div>
                  <div className={cn("text-lg font-semibold", isToday(day) && "text-primary")}>{format(day, 'd')}</div>
                  {appts.length > 0 && (
                    <div className="flex justify-center mt-0.5">
                      {appts.length <= 3 ? (
                        appts.map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-primary mx-0.5" />)
                      ) : (
                        <span className="text-[10px] text-primary font-medium">{appts.length}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            {todaySchedule && (
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {todaySchedule.start_time.slice(0, 5)} – {todaySchedule.end_time.slice(0, 5)}
              </Badge>
            )}
          </div>

          {/* Timeline — vertical stacked, NO overlap */}
          {!todaySchedule ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">Sem expediente</p>
                <p className="text-sm">Configure horários no Centro de Operações</p>
              </CardContent>
            </Card>
          ) : todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum agendamento para este dia</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-[23px] top-4 bottom-4 w-px bg-border" />

              {todayAppointments.map((appt, idx) => {
                const st = STATUS_MAP[appt.status] || { label: appt.status, variant: 'outline' as const };
                const isActive = appt.status === 'em_atendimento';
                const isDone = appt.status === 'realizado' || appt.status === 'cancelado' || appt.status === 'falta';

                return (
                  <div key={appt.id} className="relative flex gap-4 pb-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex flex-col items-center pt-1">
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2 shrink-0",
                        isActive ? "bg-primary border-primary animate-pulse" :
                        isDone ? "bg-muted-foreground/30 border-muted-foreground/30" :
                        "bg-background border-primary"
                      )} />
                    </div>

                    {/* Card */}
                    <Card className={cn(
                      "flex-1 transition-all",
                      isActive && "ring-2 ring-primary/30",
                      isDone && "opacity-60"
                    )}>
                      <CardContent className="p-4">
                        {/* Time + Status */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tabular-nums">
                              {appt.scheduled_time.slice(0, 5)}
                            </span>
                            {appt.end_time && (
                              <span className="text-sm text-muted-foreground">
                                → {appt.end_time.slice(0, 5)}
                              </span>
                            )}
                          </div>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </div>

                        {/* Patient info — large card */}
                        {appt.child && (
                          <div
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors mb-3"
                            onClick={() => navigate(`/therapist/patient/${appt.child!.id}`)}
                          >
                            <PatientAvatar
                              photoUrl={appt.child.avatar_url}
                              name={appt.child.name}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{appt.child.name}</p>
                              {appt.appointment_type && (
                                <p className="text-xs text-muted-foreground">{appt.appointment_type.name}</p>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {appt.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {appt.room}
                            </span>
                          )}
                          {appt.service_mode && (
                            <Badge variant="secondary" className="text-[10px]">
                              {appt.service_mode === 'premium' ? 'Premium' : 'Standard'}
                            </Badge>
                          )}
                        </div>

                        {appt.internal_notes && (
                          <p className="text-xs text-muted-foreground mt-2 border-t pt-2">{appt.internal_notes}</p>
                        )}

                        {/* Actions */}
                        {!isDone && (
                          <div className="flex gap-2 mt-3 pt-2 border-t">
                            {appt.status === 'agendado' && (
                              <Button size="sm" variant="outline" onClick={() =>
                                updateStatus(appt.id, 'confirmado', { confirmed_at: new Date().toISOString(), confirmed_via: 'manual' })
                              }>Confirmar</Button>
                            )}
                            {(appt.status === 'confirmado' || appt.status === 'agendado') && (
                              <Button size="sm" onClick={() =>
                                updateStatus(appt.id, 'em_atendimento', { check_in_at: new Date().toISOString() })
                              }>Iniciar</Button>
                            )}
                            {appt.status === 'em_atendimento' && (
                              <Button size="sm" onClick={() => updateStatus(appt.id, 'realizado')}>
                                Finalizar
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumo da Semana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{statusCounts.total}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Confirmados</span><span className="font-medium">{statusCounts.confirmed}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pendentes</span><span className="font-medium">{statusCounts.pending}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Realizados</span><span className="font-medium">{statusCounts.completed}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Horários
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workSchedule.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">Nenhum horário configurado</p>
              ) : (
                <div className="space-y-1">
                  {DAYS_LABELS.map((label, idx) => {
                    const s = workSchedule.find(ws => ws.day_of_week === idx);
                    return (
                      <div key={idx} className={cn(
                        "flex justify-between text-xs py-1 px-2 rounded",
                        s?.is_available ? "bg-primary/5" : "opacity-40"
                      )}>
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">
                          {s?.is_available ? `${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}` : '—'}
                        </span>
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
