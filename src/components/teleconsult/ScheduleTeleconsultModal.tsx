import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Calendar, Clock, User } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  parent_id?: string;
}

interface ScheduleTeleconsultModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleTeleconsultModal({ open, onClose, onSuccess }: ScheduleTeleconsultModalProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    childId: '',
    date: '',
    time: '',
    duration: '30',
    sessionType: 'orientation'
  });

  useEffect(() => {
    if (open && user) {
      loadPatients();
    }
  }, [open, user]);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('child_access')
        .select(`
          child_id,
          children (id, name, parent_id)
        `)
        .eq('professional_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;

      const patientList = (data || [])
        .filter((a: any) => a.children)
        .map((a: any) => ({
          id: a.children.id,
          name: a.children.name,
          parent_id: a.children.parent_id
        }));

      setPatients(patientList);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.childId || !form.date || !form.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const patient = patients.find(p => p.id === form.childId);
      if (!patient?.parent_id) {
        toast.error('Paciente não possui responsável vinculado');
        return;
      }

      const scheduledAt = new Date(`${form.date}T${form.time}`);
      const meetingUrl = `https://meet.neuroplay.app/${crypto.randomUUID().slice(0, 8)}`;

      const { error } = await supabase
        .from('teleorientation_sessions')
        .insert({
          professional_id: user?.id,
          parent_id: patient.parent_id,
          child_id: form.childId,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(form.duration),
          session_type: form.sessionType,
          meeting_url: meetingUrl,
          status: 'scheduled'
        });

      if (error) throw error;

      toast.success('Teleconsulta agendada com sucesso');
      onSuccess();
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error('Erro ao agendar teleconsulta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar Teleconsulta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Paciente
            </Label>
            <Select 
              value={form.childId} 
              onValueChange={(value) => setForm(prev => ({ ...prev, childId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário
              </Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duração</Label>
              <Select 
                value={form.duration} 
                onValueChange={(value) => setForm(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Sessão</Label>
              <Select 
                value={form.sessionType} 
                onValueChange={(value) => setForm(prev => ({ ...prev, sessionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orientation">Orientação</SelectItem>
                  <SelectItem value="follow_up">Acompanhamento</SelectItem>
                  <SelectItem value="evaluation">Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Agendando...' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
