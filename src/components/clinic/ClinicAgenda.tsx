import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  RefreshCw,
  DoorOpen,
  Search,
  X,
  ChevronsUpDown
} from 'lucide-react';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useClinicAgenda, Appointment } from '@/hooks/useClinicAgenda';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentForm } from './AppointmentForm';
import { WaitingListPanel } from './WaitingListPanel';
import { RoomOccupancyDashboard } from './RoomOccupancyDashboard';
import type { WaitingListItem } from '@/hooks/useClinicAgenda';

// 08:00 to 18:00 (10 hours)
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const HOUR_HEIGHT = 72; // px per hour slot

// Helper: given appointments for a day, compute columns so they don't overlap
function layoutAppointments(
  dayAppointments: Appointment[],
  getTypeDuration: (typeId: string | null) => number
) {
  if (dayAppointments.length === 0) return [];

  // Convert to intervals in minutes from 08:00
  const items = dayAppointments.map((appt) => {
    const [h, m] = appt.scheduled_time.split(':').map(Number);
    const startMin = (h - 8) * 60 + m;
    const duration = getTypeDuration(appt.appointment_type_id);
    return { appt, startMin, endMin: startMin + duration };
  });

  // Sort by start time, then by duration descending
  items.sort((a, b) => a.startMin - b.startMin || (b.endMin - b.startMin) - (a.endMin - a.startMin));

  // Assign columns using a greedy approach
  const columns: { endMin: number }[][] = [];

  const result: { appt: Appointment; startMin: number; endMin: number; col: number; totalCols: number }[] = [];

  // Group overlapping items
  const groups: (typeof items)[] = [];
  let currentGroup: typeof items = [];

  for (const item of items) {
    if (currentGroup.length === 0 || item.startMin < Math.max(...currentGroup.map(i => i.endMin))) {
      currentGroup.push(item);
    } else {
      groups.push(currentGroup);
      currentGroup = [item];
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  for (const group of groups) {
    const cols: number[] = [];
    const colEnds: number[] = [];

    for (const item of group) {
      // Find first column where this item fits
      let placed = false;
      for (let c = 0; c < colEnds.length; c++) {
        if (item.startMin >= colEnds[c]) {
          colEnds[c] = item.endMin;
          cols.push(c);
          placed = true;
          break;
        }
      }
      if (!placed) {
        cols.push(colEnds.length);
        colEnds.push(item.endMin);
      }
    }

    const totalCols = colEnds.length;
    group.forEach((item, idx) => {
      result.push({ ...item, col: cols[idx], totalCols });
    });
  }

  return result;
}

export function ClinicAgenda() {
  const {
    appointments,
    appointmentTypes,
    waitingList,
    professionals,
    loading,
    selectedDate,
    setSelectedDate,
    selectedProfessional,
    setSelectedProfessional,
    createAppointment,
    checkInPatient,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markAsNoShow,
    getAppointmentsForDay,
    refresh,
  } = useClinicAgenda();

  const [formOpen, setFormOpen] = useState(false);
  const [view, setView] = useState<'week' | 'day' | 'list' | 'rooms'>('week');
  const [formInitialDate, setFormInitialDate] = useState<Date | undefined>();
  const [formInitialRoom, setFormInitialRoom] = useState<string | undefined>();
  const [profSearch, setProfSearch] = useState('');
  const [profPopoverOpen, setProfPopoverOpen] = useState(false);

  const filteredProfessionals = useMemo(() => {
    if (!profSearch.trim()) return professionals;
    const q = profSearch.toLowerCase();
    return professionals.filter(p => p.full_name?.toLowerCase().includes(q));
  }, [professionals, profSearch]);

  const selectedProfName = selectedProfessional 
    ? professionals.find(p => p.id === selectedProfessional)?.full_name || 'Profissional'
    : 'Todos profissionais';

  // Monday-based week, only weekdays (Mon-Fri)
  const weekMonday = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekMonday, i));

  const handlePrevWeek = () => setSelectedDate(addDays(selectedDate, -7));
  const handleNextWeek = () => setSelectedDate(addDays(selectedDate, 7));
  const handleToday = () => setSelectedDate(new Date());

  const handleNewAppointment = (date?: Date, room?: string) => {
    setFormInitialDate(date);
    setFormInitialRoom(room);
    setFormOpen(true);
  };

  const handleRoomClick = (room: string) => {
    handleNewAppointment(selectedDate, room);
  };

  const handleScheduleFromWaitingList = (item: WaitingListItem) => {
    setFormInitialDate(new Date());
    setFormOpen(true);
  };

  const getTypeDuration = (typeId: string | null) => {
    if (!typeId) return 50;
    const type = appointmentTypes.find(t => t.id === typeId);
    return type?.duration_minutes || 50;
  };

  // 6 columns: 1 for hours + 5 for weekdays
  const dayColWidth = 100 / 6; // ~16.67%

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
          <span className="font-medium ml-2">
            {format(weekMonday, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekMonday, 4), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={profPopoverOpen} onOpenChange={setProfPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-between bg-background border-border text-left font-normal">
                <span className="truncate">{selectedProfName}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-2" align="start">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Buscar profissional..."
                  value={profSearch}
                  onChange={(e) => setProfSearch(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
                {profSearch && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setProfSearch('')}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-0.5">
                  <button
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors",
                      !selectedProfessional && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => { setSelectedProfessional(null); setProfPopoverOpen(false); setProfSearch(''); }}
                  >
                    Todos profissionais
                  </button>
                  {filteredProfessionals.map((prof) => (
                    <button
                      key={prof.id}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors",
                        selectedProfessional === prof.id && "bg-primary/10 text-primary font-medium"
                      )}
                      onClick={() => { setSelectedProfessional(prof.id); setProfPopoverOpen(false); setProfSearch(''); }}
                    >
                      {prof.full_name}
                    </button>
                  ))}
                  {filteredProfessionals.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">Nenhum profissional encontrado</p>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <div className="flex border rounded-md">
            <Button variant={view === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('week')} title="Semana">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === 'day' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('day')} title="Dia">
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')} title="Lista">
              <List className="h-4 w-4" />
            </Button>
            <Button variant={view === 'rooms' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('rooms')} title="Salas">
              <DoorOpen className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={refresh}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          <Button onClick={() => handleNewAppointment()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Calendar Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {view === 'week' && (
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    {/* Week Header */}
                    <div className="grid border-b sticky top-0 bg-background z-10" style={{ gridTemplateColumns: `80px repeat(5, 1fr)` }}>
                      <div className="p-2 text-center text-sm text-muted-foreground border-r">
                        Hora
                      </div>
                      {weekDays.map((day) => (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "p-2 text-center border-r cursor-pointer hover:bg-muted/50",
                            isToday(day) && "bg-primary/10"
                          )}
                          onClick={() => {
                            setSelectedDate(day);
                            setView('day');
                          }}
                        >
                          <div className="text-xs text-muted-foreground uppercase">
                            {format(day, 'EEE', { locale: ptBR })}
                          </div>
                          <div className={cn(
                            "text-lg font-medium",
                            isToday(day) && "text-primary"
                          )}>
                            {format(day, 'd')}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getAppointmentsForDay(day).length}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Time Grid */}
                    <ScrollArea className="h-[660px]">
                      <div className="relative" style={{ display: 'grid', gridTemplateColumns: `80px repeat(5, 1fr)` }}>
                        {/* Hour labels column */}
                        <div>
                          {HOURS.map((hour) => (
                            <div
                              key={hour}
                              className="border-b border-r p-1 text-xs text-muted-foreground flex items-start justify-center pt-1"
                              style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                          ))}
                        </div>

                        {/* Day columns with appointments */}
                        {weekDays.map((day, dayIndex) => {
                          const dayAppointments = getAppointmentsForDay(day);
                          const laid = layoutAppointments(dayAppointments, getTypeDuration);

                          return (
                            <div key={day.toISOString()} className="relative border-r">
                              {/* Hour cells (clickable) */}
                              {HOURS.map((hour) => (
                                <div
                                  key={hour}
                                  className="border-b hover:bg-muted/30 cursor-pointer"
                                  style={{ height: `${HOUR_HEIGHT}px` }}
                                  onClick={() => handleNewAppointment(day)}
                                />
                              ))}

                              {/* Appointment overlays */}
                              {laid.map(({ appt, startMin, endMin, col, totalCols }) => {
                                const topPx = (startMin / 60) * HOUR_HEIGHT;
                                const heightPx = Math.max(28, ((endMin - startMin) / 60) * HOUR_HEIGHT);
                                const widthPercent = 100 / totalCols;
                                const leftPercent = col * widthPercent;

                                return (
                                  <div
                                    key={appt.id}
                                    className="absolute px-0.5 z-10"
                                    style={{
                                      left: `${leftPercent}%`,
                                      width: `${widthPercent}%`,
                                      top: `${topPx}px`,
                                      height: `${heightPx}px`,
                                    }}
                                  >
                                    <AppointmentCard
                                      appointment={appt}
                                      onCheckIn={checkInPatient}
                                      onConfirm={confirmAppointment}
                                      onCancel={cancelAppointment}
                                      onComplete={completeAppointment}
                                      onNoShow={markAsNoShow}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {view === 'day' && (
                <div>
                  <div className="p-4 border-b">
                    <h3 className="font-medium">
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </h3>
                  </div>
                  <ScrollArea className="h-[660px]">
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
                      {/* Hour labels */}
                      <div>
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="border-b border-r p-1 text-xs text-muted-foreground flex items-start justify-center pt-1"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                          >
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                        ))}
                      </div>

                      {/* Day column */}
                      <div className="relative">
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="border-b hover:bg-muted/30 cursor-pointer"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                            onClick={() => handleNewAppointment(selectedDate)}
                          />
                        ))}

                        {/* Appointments */}
                        {(() => {
                          const dayAppointments = getAppointmentsForDay(selectedDate);
                          const laid = layoutAppointments(dayAppointments, getTypeDuration);

                          return laid.map(({ appt, startMin, endMin, col, totalCols }) => {
                            const topPx = (startMin / 60) * HOUR_HEIGHT;
                            const heightPx = Math.max(28, ((endMin - startMin) / 60) * HOUR_HEIGHT);
                            const widthPercent = 100 / totalCols;
                            const leftPercent = col * widthPercent;

                            return (
                              <div
                                key={appt.id}
                                className="absolute px-0.5 z-10"
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  top: `${topPx}px`,
                                  height: `${heightPx}px`,
                                }}
                              >
                                <AppointmentCard
                                  appointment={appt}
                                  onCheckIn={checkInPatient}
                                  onConfirm={confirmAppointment}
                                  onCancel={cancelAppointment}
                                  onComplete={completeAppointment}
                                  onNoShow={markAsNoShow}
                                />
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}

              {view === 'list' && (
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-4">
                    {weekDays.map((day) => {
                      const dayAppointments = getAppointmentsForDay(day);
                      if (dayAppointments.length === 0) return null;
                      
                      return (
                        <div key={day.toISOString()}>
                          <h4 className={cn(
                            "font-medium mb-2",
                            isToday(day) && "text-primary"
                          )}>
                            {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                          </h4>
                          <div className="space-y-2">
                            {dayAppointments.map((appointment) => (
                              <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onCheckIn={checkInPatient}
                                onConfirm={confirmAppointment}
                                onCancel={cancelAppointment}
                                onComplete={completeAppointment}
                                onNoShow={markAsNoShow}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {view === 'rooms' && (
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium">
                      Ocupação de Salas - {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em uma sala para agendar
                    </p>
                  </div>
                  <RoomOccupancyDashboard
                    appointments={appointments}
                    selectedDate={selectedDate}
                    onRoomClick={handleRoomClick}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <WaitingListPanel
            items={waitingList}
            onSchedule={handleScheduleFromWaitingList}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Semana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{appointments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confirmados</span>
                <span className="font-medium text-success">
                  {appointments.filter(a => a.status === 'confirmado').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aguardando</span>
                <span className="font-medium text-warning">
                  {appointments.filter(a => a.status === 'agendado').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Realizados</span>
                <span className="font-medium text-info">
                  {appointments.filter(a => a.status === 'realizado').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        appointmentTypes={appointmentTypes}
        professionals={professionals}
        onSubmit={createAppointment}
        initialDate={formInitialDate}
        initialProfessional={selectedProfessional || undefined}
        initialRoom={formInitialRoom}
      />
    </div>
  );
}
