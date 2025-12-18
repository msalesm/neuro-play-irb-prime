import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentType } from '@/hooks/useClinicAgenda';

const CLINIC_ROOMS = [
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

const formSchema = z.object({
  child_id: z.string().optional(),
  parent_id: z.string().optional(),
  professional_id: z.string().min(1, 'Selecione um profissional'),
  appointment_type_id: z.string().optional(),
  service_mode: z.enum(['premium', 'standard']).default('premium'),
  room: z.string().optional(),
  scheduled_date: z.date({ required_error: 'Selecione uma data' }),
  scheduled_time: z.string().min(1, 'Informe o horário'),
  internal_notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentTypes: AppointmentType[];
  professionals: { id: string; full_name: string }[];
  onSubmit: (data: {
    child_id?: string;
    parent_id?: string;
    professional_id: string;
    appointment_type_id?: string;
    service_mode: 'premium' | 'standard';
    room?: string;
    scheduled_date: string;
    scheduled_time: string;
    internal_notes?: string;
  }) => Promise<any>;
  initialDate?: Date;
  initialProfessional?: string;
}

export function AppointmentForm({
  open,
  onOpenChange,
  appointmentTypes,
  professionals,
  onSubmit,
  initialDate,
  initialProfessional,
}: AppointmentFormProps) {
  const [children, setChildren] = useState<{ id: string; name: string; parent_id: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scheduled_date: initialDate || new Date(),
      scheduled_time: '08:00',
      professional_id: initialProfessional || '',
      service_mode: 'premium',
    },
  });

  useEffect(() => {
    if (open) {
      fetchChildren();
      if (initialDate) form.setValue('scheduled_date', initialDate);
      if (initialProfessional) form.setValue('professional_id', initialProfessional);
    }
  }, [open, initialDate, initialProfessional]);

  const fetchChildren = async () => {
    const { data } = await supabase
      .from('children')
      .select('id, name, parent_id')
      .eq('is_active', true)
      .order('name');

    setChildren(data || []);
  };

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    
    const selectedChild = children.find(c => c.id === data.child_id);
    
    const result = await onSubmit({
      child_id: data.child_id,
      parent_id: selectedChild?.parent_id || data.parent_id,
      professional_id: data.professional_id,
      appointment_type_id: data.appointment_type_id,
      service_mode: data.service_mode,
      room: data.room,
      scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
      scheduled_time: data.scheduled_time,
      internal_notes: data.internal_notes,
    });

    setLoading(false);

    if (result) {
      form.reset();
      onOpenChange(false);
    }
  };

  const selectedType = appointmentTypes.find(t => t.id === form.watch('appointment_type_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="child_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professional_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modalidade de Atendimento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a modalidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="premium">
                        <div className="flex flex-col">
                          <span className="font-medium">🌟 Premium (Individual)</span>
                          <span className="text-xs text-muted-foreground">Atendimento personalizado 1:1</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="standard">
                        <div className="flex flex-col">
                          <span className="font-medium">👥 Padrão (Grupo)</span>
                          <span className="text-xs text-muted-foreground">Até 4 pacientes por sala</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sala</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a sala" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLINIC_ROOMS.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointment_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Atendimento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                            {type.name} ({type.duration_minutes}min)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedType?.price && (
                    <p className="text-xs text-muted-foreground">
                      Valor: R$ {selectedType.price.toFixed(2)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internal_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas visíveis apenas para a equipe..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Agendar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
