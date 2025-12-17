import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MapPin, User, CreditCard, AlertCircle } from 'lucide-react';
import { format, getDay, addMinutes, parse, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { ClubService } from '@/hooks/useParentsClub';
import { cn } from '@/lib/utils';

interface PartnerAvailability {
  id: string;
  partner_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface ServiceBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ClubService | null;
  onConfirm: (date: string, time: string) => Promise<void>;
}

export function ServiceBookingDialog({ open, onOpenChange, service, onConfirm }: ServiceBookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<PartnerAvailability[]>([]);
  const [existingBookings, setExistingBookings] = useState<{ scheduled_date: string; scheduled_time: string; duration_minutes: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (service && open) {
      fetchPartnerAvailability();
      setSelectedDate(undefined);
      setSelectedTime('');
    }
  }, [service, open]);

  useEffect(() => {
    if (selectedDate && service) {
      fetchExistingBookings();
    }
  }, [selectedDate, service]);

  const fetchPartnerAvailability = async () => {
    if (!service) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('club_partner_availability')
      .select('*')
      .eq('partner_id', service.partner_id)
      .eq('is_active', true);
    
    if (!error && data) {
      setAvailability(data);
    }
    setLoading(false);
  };

  const fetchExistingBookings = async () => {
    if (!service || !selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const { data } = await supabase
      .from('club_bookings')
      .select('scheduled_date, scheduled_time, duration_minutes')
      .eq('partner_id', service.partner_id)
      .eq('scheduled_date', dateStr)
      .in('status', ['pending', 'confirmed']);
    
    setExistingBookings(data || []);
  };

  const getAvailableDays = (): number[] => {
    return availability.map(a => a.day_of_week);
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(date, today)) return true;
    
    const dayOfWeek = getDay(date);
    const availableDays = getAvailableDays();
    
    // If no availability data, default to weekdays
    if (availableDays.length === 0) {
      return dayOfWeek === 0; // Disable only Sundays
    }
    
    return !availableDays.includes(dayOfWeek);
  };

  const generateTimeSlots = (): string[] => {
    if (!selectedDate || !service) return [];
    
    const dayOfWeek = getDay(selectedDate);
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek);
    
    // Default hours if no availability configured
    let startHour = 8;
    let endHour = 18;
    
    if (dayAvailability) {
      const [startH] = dayAvailability.start_time.split(':').map(Number);
      const [endH] = dayAvailability.end_time.split(':').map(Number);
      startHour = startH;
      endHour = endH;
    }
    
    const slots: string[] = [];
    const serviceDuration = service.duration_minutes || 60;
    const slotInterval = 30; // 30 minute intervals
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot end time is within working hours
        const slotEnd = addMinutes(parse(timeStr, 'HH:mm', new Date()), serviceDuration);
        const endTimeLimit = parse(`${endHour}:00`, 'HH:mm', new Date());
        
        if (!isAfter(slotEnd, endTimeLimit)) {
          slots.push(timeStr);
        }
      }
    }
    
    return slots;
  };

  const isSlotAvailable = (time: string): boolean => {
    if (!service) return false;
    
    const slotStart = parse(time, 'HH:mm', new Date());
    const slotEnd = addMinutes(slotStart, service.duration_minutes);
    
    for (const booking of existingBookings) {
      const bookingStart = parse(booking.scheduled_time.slice(0, 5), 'HH:mm', new Date());
      const bookingEnd = addMinutes(bookingStart, booking.duration_minutes);
      
      // Check for overlap
      if (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      ) {
        return false;
      }
    }
    
    return true;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !service) return;
    
    setConfirming(true);
    await onConfirm(format(selectedDate, 'yyyy-MM-dd'), selectedTime);
    setConfirming(false);
    onOpenChange(false);
  };

  const timeSlots = generateTimeSlots();
  const finalPrice = service ? service.price * (1 - (service.discount_percentage || 0) / 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Agendar Serviço</DialogTitle>
        </DialogHeader>
        
        {service && (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Service Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-foreground">{service.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {service.partner?.name}
                    </p>
                  </div>
                  {service.discount_percentage > 0 && (
                    <Badge variant="destructive">-{service.discount_percentage}%</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {service.location_type === 'clinic' ? 'Na clínica' : 
                     service.location_type === 'online' ? 'Online' : 'Externo'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {service.discount_percentage > 0 && (
                    <span className="text-muted-foreground line-through text-sm">
                      R$ {service.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl font-bold text-primary">
                    R$ {finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Escolha a Data</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }}
                  disabled={isDateDisabled}
                  className="rounded-md border mx-auto"
                  locale={ptBR}
                />
                {availability.length === 0 && !loading && (
                  <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Usando horário padrão (dias úteis)
                  </p>
                )}
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Horários Disponíveis - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </label>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map(time => {
                        const available = isSlotAvailable(time);
                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            size="sm"
                            disabled={!available}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "text-sm",
                              !available && "opacity-50 cursor-not-allowed line-through"
                            )}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum horário disponível nesta data
                    </p>
                  )}
                </div>
              )}

              {/* Cancellation Policy */}
              {service.cancellation_policy && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Política de cancelamento:</strong> {service.cancellation_policy}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || confirming}
          >
            {confirming ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
