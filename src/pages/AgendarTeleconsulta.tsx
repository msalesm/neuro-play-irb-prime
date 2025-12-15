import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Calendar, Clock, User, Video, ArrowLeft, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Therapist {
  id: string;
  full_name: string;
}

interface AvailableSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

interface Child {
  id: string;
  name: string;
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AgendarTeleconsulta() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTherapist) {
      loadTherapistSlots(selectedTherapist);
    }
  }, [selectedTherapist]);

  const loadData = async () => {
    try {
      // Load children belonging to this parent
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, name')
        .eq('parent_id', user?.id)
        .eq('is_active', true);

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Load therapists linked to parent's children
      const { data: accessData, error: accessError } = await supabase
        .from('child_access')
        .select(`
          professional_id,
          profiles:professional_id(id, full_name)
        `)
        .in('child_id', (childrenData || []).map(c => c.id))
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      if (accessError) throw accessError;

      const uniqueTherapists = new Map<string, Therapist>();
      (accessData || []).forEach((a: any) => {
        if (a.profiles) {
          uniqueTherapists.set(a.profiles.id, {
            id: a.profiles.id,
            full_name: a.profiles.full_name || 'Terapeuta'
          });
        }
      });

      setTherapists(Array.from(uniqueTherapists.values()));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadTherapistSlots = async (therapistId: string) => {
    try {
      const { data, error } = await supabase
        .from('therapist_available_slots')
        .select('day_of_week, start_time, end_time, slot_duration_minutes')
        .eq('professional_id', therapistId)
        .eq('is_active', true);

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  // Generate available dates for the next 14 days based on therapist slots
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      if (slots.some(s => s.day_of_week === dayOfWeek)) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  // Generate time slots for selected date
  const getTimeSlots = () => {
    if (!selectedDate) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const daySlots = slots.filter(s => s.day_of_week === dayOfWeek);
    const times: string[] = [];

    daySlots.forEach(slot => {
      const [startH, startM] = slot.start_time.split(':').map(Number);
      const [endH, endM] = slot.end_time.split(':').map(Number);
      const duration = slot.slot_duration_minutes;

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + duration <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        times.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        currentMinutes += duration;
      }
    });

    return times;
  };

  const handleSubmit = async () => {
    if (!selectedTherapist || !selectedChild || !selectedDate || !selectedTime) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSubmitting(true);
    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('teleorientation_sessions')
        .insert({
          professional_id: selectedTherapist,
          parent_id: user?.id,
          child_id: selectedChild,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 30,
          session_type: 'orientation',
          status: 'scheduled'
        });

      if (error) throw error;

      setSuccess(true);
      toast.success('Teleconsulta agendada com sucesso!');
    } catch (error) {
      console.error('Error scheduling:', error);
      toast.error('Erro ao agendar teleconsulta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Teleconsulta Agendada!</h2>
            <p className="text-muted-foreground">
              Você receberá uma notificação quando o terapeuta confirmar.
            </p>
            <Button onClick={() => navigate('/minhas-teleconsultas')} className="w-full">
              Ver Minhas Teleconsultas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const timeSlots = getTimeSlots();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Agendar Teleconsulta
            </CardTitle>
            <CardDescription>
              Escolha o terapeuta, data e horário para sua teleconsulta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Child */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Paciente
              </Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Therapist */}
            <div className="space-y-2">
              <Label>Terapeuta</Label>
              <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o terapeuta" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map(therapist => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {therapists.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum terapeuta vinculado encontrado
                </p>
              )}
            </div>

            {/* Select Date */}
            {selectedTherapist && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data
                </Label>
                {availableDates.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableDates.map(date => (
                      <Button
                        key={date.toISOString()}
                        variant={selectedDate && isSameDay(selectedDate, date) ? 'default' : 'outline'}
                        size="sm"
                        className="flex flex-col h-auto py-2"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime('');
                        }}
                      >
                        <span className="text-xs">
                          {format(date, 'EEE', { locale: ptBR })}
                        </span>
                        <span className="font-semibold">
                          {format(date, 'dd/MM')}
                        </span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum horário disponível configurado
                  </p>
                )}
              </div>
            )}

            {/* Select Time */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário
                </Label>
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {timeSlots.map(time => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum horário disponível para esta data
                  </p>
                )}
              </div>
            )}

            {/* Summary */}
            {selectedTime && selectedDate && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <h4 className="font-medium">Resumo do Agendamento</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>
                    <strong>Paciente:</strong>{' '}
                    {children.find(c => c.id === selectedChild)?.name}
                  </p>
                  <p>
                    <strong>Terapeuta:</strong>{' '}
                    {therapists.find(t => t.id === selectedTherapist)?.full_name}
                  </p>
                  <p>
                    <strong>Data:</strong>{' '}
                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p>
                    <strong>Horário:</strong> {selectedTime}
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!selectedTherapist || !selectedChild || !selectedDate || !selectedTime || submitting}
              className="w-full"
            >
              {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
