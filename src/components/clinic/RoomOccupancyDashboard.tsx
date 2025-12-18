import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DoorOpen, User, UserCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Appointment } from '@/hooks/useClinicAgenda';

export const CLINIC_ROOMS = [
  'Fonoaudiologia - Cabine',
  'Psicopedagogia',
  'Mini Casa',
  'Fisioterapia',
  'Psicomotricidade',
  'Integração Sensorial',
  'T. Ocupacional Sensorial',
  'Musicoterapia',
  'Arteterapia',
  'Cozinha Experimental',
  'Psicologia 01',
  'Psicologia Acústica 02',
  'Psicologia 03',
  'Psicologia 04',
  'Psicologia 05',
  'Psicologia 06',
  'Psicologia 07',
  'Integração Casa/Escola',
] as const;

interface RoomOccupancyDashboardProps {
  appointments: Appointment[];
  selectedDate: Date;
  onRoomClick?: (room: string) => void;
}

interface RoomStatus {
  room: string;
  isOccupied: boolean;
  currentAppointment?: Appointment;
  upcomingAppointments: Appointment[];
}

export function RoomOccupancyDashboard({
  appointments,
  selectedDate,
  onRoomClick,
}: RoomOccupancyDashboardProps) {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');

  const roomStatuses: RoomStatus[] = useMemo(() => {
    // Filter appointments for selected date
    const dayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduled_date);
      return (
        aptDate.toDateString() === selectedDate.toDateString() &&
        apt.status !== 'cancelado' &&
        apt.status !== 'falta'
      );
    });

    return CLINIC_ROOMS.map((room) => {
      const roomAppointments = dayAppointments
        .filter((apt) => apt.room === room)
        .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

      // Find current appointment (in progress now)
      const currentAppointment = roomAppointments.find((apt) => {
        const startTime = apt.scheduled_time;
        const endTime = apt.end_time || addMinutesToTime(startTime, 50);
        return (
          currentTime >= startTime &&
          currentTime < endTime &&
          (apt.status === 'em_atendimento' || apt.status === 'confirmado' || apt.status === 'agendado')
        );
      });

      // Upcoming appointments
      const upcomingAppointments = roomAppointments.filter((apt) => {
        return apt.scheduled_time > currentTime;
      });

      return {
        room,
        isOccupied: !!currentAppointment,
        currentAppointment,
        upcomingAppointments,
      };
    });
  }, [appointments, selectedDate, currentTime]);

  const occupiedCount = roomStatuses.filter((r) => r.isOccupied).length;
  const availableCount = roomStatuses.filter((r) => !r.isOccupied).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Ocupadas: {occupiedCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Disponíveis: {availableCount}</span>
        </div>
      </div>

      {/* Room Grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {roomStatuses.map((status) => (
            <Card
              key={status.room}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                status.isOccupied
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-green-500/50 bg-green-500/5 hover:bg-green-500/10'
              )}
              onClick={() => onRoomClick?.(status.room)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DoorOpen
                      className={cn(
                        'h-4 w-4',
                        status.isOccupied ? 'text-red-500' : 'text-green-500'
                      )}
                    />
                    <span className="font-medium text-sm truncate" title={status.room}>
                      {status.room}
                    </span>
                  </div>
                  <Badge
                    variant={status.isOccupied ? 'destructive' : 'default'}
                    className={cn(
                      'text-xs',
                      !status.isOccupied && 'bg-green-600 hover:bg-green-700'
                    )}
                  >
                    {status.isOccupied ? 'Ocupada' : 'Livre'}
                  </Badge>
                </div>

                {status.isOccupied && status.currentAppointment && (
                  <div className="space-y-2 mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-xs">
                      <UserCheck className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Terapeuta:</span>
                      <span className="font-medium truncate">
                        {status.currentAppointment.professional?.full_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Paciente:</span>
                      <span className="font-medium truncate">
                        {status.currentAppointment.child?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Horário:</span>
                      <span className="font-medium">
                        {status.currentAppointment.scheduled_time} -{' '}
                        {status.currentAppointment.end_time ||
                          addMinutesToTime(status.currentAppointment.scheduled_time, 50)}
                      </span>
                    </div>
                  </div>
                )}

                {!status.isOccupied && status.upcomingAppointments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Próximo:</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        {status.upcomingAppointments[0].scheduled_time}
                      </span>
                      <span className="text-muted-foreground truncate">
                        - {status.upcomingAppointments[0].child?.name || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {!status.isOccupied && status.upcomingAppointments.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                    Sem agendamentos hoje
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + minutes);
  return format(date, 'HH:mm');
}
