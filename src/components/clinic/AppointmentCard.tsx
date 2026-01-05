import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreVertical, 
  Check, 
  X, 
  Clock, 
  User, 
  LogIn,
  FileText,
  Phone
} from 'lucide-react';
import { Appointment } from '@/hooks/useClinicAgenda';

interface AppointmentCardProps {
  appointment: Appointment;
  onCheckIn: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string, reason: string) => void;
  onComplete: (id: string) => void;
  onNoShow: (id: string) => void;
  onStartSession?: (appointment: Appointment) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  agendado: { label: 'Agendado', variant: 'outline' },
  confirmado: { label: 'Confirmado', variant: 'secondary' },
  em_atendimento: { label: 'Em Atendimento', variant: 'default' },
  realizado: { label: 'Realizado', variant: 'default' },
  falta: { label: 'Falta', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'destructive' },
  reagendado: { label: 'Reagendado', variant: 'outline' },
};

export function AppointmentCard({
  appointment,
  onCheckIn,
  onConfirm,
  onCancel,
  onComplete,
  onNoShow,
  onStartSession,
}: AppointmentCardProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const status = statusConfig[appointment.status] || statusConfig.agendado;
  const typeColor = appointment.appointment_type?.color || '#3B82F6';

  const handleCancel = () => {
    onCancel(appointment.id, cancelReason);
    setCancelDialogOpen(false);
    setCancelReason('');
  };

  const isActive = ['agendado', 'confirmado'].includes(appointment.status);
  const canCheckIn = appointment.status === 'confirmado';
  const canComplete = appointment.status === 'em_atendimento';

  return (
    <>
      <Card 
        className="p-3 hover:shadow-md transition-shadow border-l-4"
        style={{ borderLeftColor: typeColor }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {appointment.scheduled_time.slice(0, 5)}
                {appointment.end_time && ` - ${appointment.end_time.slice(0, 5)}`}
              </span>
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
              {appointment.service_mode && (
                <Badge 
                  variant={appointment.service_mode === 'premium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {appointment.service_mode === 'premium' ? '🌟 Premium' : '👥 Grupo'}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              {appointment.child && (
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium truncate">{appointment.child.name}</span>
                </div>
              )}

              {appointment.professional && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="truncate">👨‍⚕️ {appointment.professional.full_name}</span>
                </div>
              )}

              {appointment.room && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>🚪 {appointment.room}</span>
                </div>
              )}

              {appointment.appointment_type && (
                <div className="text-xs text-muted-foreground">
                  {appointment.appointment_type.name}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {appointment.status === 'agendado' && (
                <DropdownMenuItem onClick={() => onConfirm(appointment.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar
                </DropdownMenuItem>
              )}

              {canCheckIn && (
                <DropdownMenuItem onClick={() => onCheckIn(appointment.id)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Check-in
                </DropdownMenuItem>
              )}

              {canComplete && (
                <>
                  {onStartSession && (
                    <DropdownMenuItem onClick={() => onStartSession(appointment)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Iniciar Atendimento
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onComplete(appointment.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Finalizar
                  </DropdownMenuItem>
                </>
              )}

              {isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNoShow(appointment.id)}>
                    <Clock className="h-4 w-4 mr-2" />
                    Marcar Falta
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setCancelDialogOpen(true)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Phone className="h-4 w-4 mr-2" />
                Contato WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {appointment.internal_notes && (
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            {appointment.internal_notes}
          </div>
        )}
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo do cancelamento. O responsável será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo do cancelamento..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={!cancelReason.trim()}>
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
