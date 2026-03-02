import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  RefreshCw,
  DoorOpen
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useClinicAgenda, Appointment, WaitingListItem } from '@/hooks/useClinicAgenda';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentForm } from './AppointmentForm';
import { WaitingListPanel } from './WaitingListPanel';
import { RoomOccupancyDashboard } from './RoomOccupancyDashboard';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 to 19:00

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

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
    // Pre-fill form with waiting list data
    setFormInitialDate(new Date());
    setFormOpen(true);
  };

  const getAppointmentPosition = (appointment: Appointment) => {
    const [hours, minutes] = appointment.scheduled_time.split(':').map(Number);
    const startMinutes = (hours - 7) * 60 + minutes;
    const type = appointmentTypes.find(t => t.id === appointment.appointment_type_id);
    const duration = type?.duration_minutes || 50;
    
    return {
      top: `${(startMinutes / 60) * 60}px`,
      height: `${(duration / 60) * 60}px`,
    };
  };

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
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedProfessional || 'all'} onValueChange={(v) => setSelectedProfessional(v === 'all' ? null : v)}>
            <SelectTrigger className="w-[200px] bg-background border-border">
              <SelectValue placeholder="Filtrar por profissional" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Todos profissionais</SelectItem>
              {professionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={view === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              title="Semana"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              title="Dia"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              title="Lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'rooms' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('rooms')}
              title="Salas"
            >
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
                  <div className="min-w-[640px]">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
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
                        <div className="text-xs text-muted-foreground">
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
                  <ScrollArea className="h-[600px]">
                    <div className="relative">
                      {HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b h-[60px]">
                          <div className="p-1 text-xs text-muted-foreground border-r text-center">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          {weekDays.map((day) => (
                            <div
                              key={`${day.toISOString()}-${hour}`}
                              className="border-r relative hover:bg-muted/30 cursor-pointer"
                              onClick={() => handleNewAppointment(day)}
                            />
                          ))}
                        </div>
                      ))}

                      {/* Appointments Overlay */}
                      {weekDays.map((day, dayIndex) => {
                        const dayAppointments = getAppointmentsForDay(day);
                        return dayAppointments.map((appointment) => {
                          const pos = getAppointmentPosition(appointment);
                          return (
                            <div
                              key={appointment.id}
                              className="absolute px-1"
                              style={{
                                left: `calc(${(dayIndex + 1) * 12.5}%)`,
                                width: '12.5%',
                                top: pos.top,
                                height: pos.height,
                              }}
                            >
                              <AppointmentCard
                                appointment={appointment}
                                onCheckIn={checkInPatient}
                                onConfirm={confirmAppointment}
                                onCancel={cancelAppointment}
                                onComplete={completeAppointment}
                                onNoShow={markAsNoShow}
                              />
                            </div>
                          );
                        });
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
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-2">
                      {getAppointmentsForDay(selectedDate).length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhum agendamento para este dia
                        </p>
                      ) : (
                        getAppointmentsForDay(selectedDate).map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onCheckIn={checkInPatient}
                            onConfirm={confirmAppointment}
                            onCancel={cancelAppointment}
                            onComplete={completeAppointment}
                            onNoShow={markAsNoShow}
                          />
                        ))
                      )}
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
                <span className="font-medium text-green-600">
                  {appointments.filter(a => a.status === 'confirmado').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aguardando</span>
                <span className="font-medium text-yellow-600">
                  {appointments.filter(a => a.status === 'agendado').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Realizados</span>
                <span className="font-medium text-blue-600">
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
