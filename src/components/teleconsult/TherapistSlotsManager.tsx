import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';

interface Slot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export function TherapistSlotsManager() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSlots();
    }
  }, [user]);

  const loadSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('therapist_available_slots')
        .select('*')
        .eq('professional_id', user?.id)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 30,
        is_active: true
      }
    ]);
  };

  const updateSlot = (index: number, field: keyof Slot, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const removeSlot = async (index: number) => {
    const slot = slots[index];
    
    if (slot.id) {
      try {
        const { error } = await supabase
          .from('therapist_available_slots')
          .delete()
          .eq('id', slot.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting slot:', error);
        toast.error('Erro ao remover horário');
        return;
      }
    }

    setSlots(slots.filter((_, i) => i !== index));
    toast.success('Horário removido');
  };

  const saveSlots = async () => {
    setSaving(true);
    try {
      // Separate existing and new slots
      const existingSlots = slots.filter(s => s.id);
      const newSlots = slots.filter(s => !s.id);

      // Update existing slots
      for (const slot of existingSlots) {
        const { error } = await supabase
          .from('therapist_available_slots')
          .update({
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            slot_duration_minutes: slot.slot_duration_minutes,
            is_active: slot.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', slot.id);

        if (error) throw error;
      }

      // Insert new slots
      if (newSlots.length > 0) {
        const { error } = await supabase
          .from('therapist_available_slots')
          .insert(
            newSlots.map(slot => ({
              professional_id: user?.id,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
              slot_duration_minutes: slot.slot_duration_minutes,
              is_active: slot.is_active
            }))
          );

        if (error) throw error;
      }

      toast.success('Horários salvos com sucesso');
      loadSlots(); // Reload to get IDs
    } catch (error) {
      console.error('Error saving slots:', error);
      toast.error('Erro ao salvar horários');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Horários Disponíveis
        </CardTitle>
        <CardDescription>
          Configure os horários em que você está disponível para teleconsultas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {slots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum horário configurado</p>
            <p className="text-sm">Adicione seus horários disponíveis para teleconsultas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slot.is_active}
                      onCheckedChange={(checked) => updateSlot(index, 'is_active', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {slot.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Dia</Label>
                    <Select
                      value={slot.day_of_week.toString()}
                      onValueChange={(v) => updateSlot(index, 'day_of_week', parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map(day => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Término</Label>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Duração</Label>
                    <Select
                      value={slot.slot_duration_minutes.toString()}
                      onValueChange={(v) => updateSlot(index, 'slot_duration_minutes', parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={addSlot} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Horário
          </Button>
          {slots.length > 0 && (
            <Button onClick={saveSlots} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
