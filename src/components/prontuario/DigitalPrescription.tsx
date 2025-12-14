import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Pill, Plus, FileText, Calendar, Clock, 
  CheckCircle, AlertCircle, Download, Send 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DigitalPrescriptionProps {
  childId: string;
  childName: string;
  sessionId?: string;
}

interface Prescription {
  id: string;
  prescription_type: string;
  title: string;
  description: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  start_date: string;
  end_date?: string;
  status: string;
  notes?: string;
  signed_at?: string;
  parent_acknowledged_at?: string;
  created_at: string;
}

const PRESCRIPTION_TYPES = [
  { value: 'therapy', label: 'Terapia', icon: '🧠' },
  { value: 'intervention', label: 'Intervenção', icon: '🎯' },
  { value: 'recommendation', label: 'Recomendação', icon: '📋' },
  { value: 'referral', label: 'Encaminhamento', icon: '🏥' },
  { value: 'medication', label: 'Medicação', icon: '💊' },
];

export function DigitalPrescription({ childId, childName, sessionId }: DigitalPrescriptionProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newPrescription, setNewPrescription] = useState({
    prescription_type: 'therapy',
    title: '',
    description: '',
    dosage: '',
    frequency: '',
    duration: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchPrescriptions();
  }, [childId]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_prescriptions')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrescription = async () => {
    if (!newPrescription.title || !newPrescription.description) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('digital_prescriptions')
        .insert({
          child_id: childId,
          professional_id: user.id,
          session_id: sessionId,
          ...newPrescription,
          end_date: newPrescription.end_date || null,
          signed_at: new Date().toISOString(),
          signature_hash: `SIG-${Date.now()}-${user.id.slice(0, 8)}`
        });

      if (error) throw error;

      toast.success('Prescrição criada com sucesso');
      setIsDialogOpen(false);
      setNewPrescription({
        prescription_type: 'therapy',
        title: '',
        description: '',
        dosage: '',
        frequency: '',
        duration: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        notes: ''
      });
      fetchPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Erro ao criar prescrição');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/10 text-green-600 border-green-600',
      completed: 'bg-blue-500/10 text-blue-600 border-blue-600',
      cancelled: 'bg-red-500/10 text-red-600 border-red-600',
      expired: 'bg-muted text-muted-foreground'
    };
    const labels = {
      active: 'Ativa',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      expired: 'Expirada'
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeInfo = (type: string) => {
    return PRESCRIPTION_TYPES.find(t => t.value === type) || PRESCRIPTION_TYPES[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Pill className="w-5 h-5" />
          Prescrições Digitais
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Prescrição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Prescrição para {childName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Prescrição</Label>
                  <Select
                    value={newPrescription.prescription_type}
                    onValueChange={(v) => setNewPrescription(p => ({ ...p, prescription_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESCRIPTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={newPrescription.start_date}
                    onChange={(e) => setNewPrescription(p => ({ ...p, start_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ex: Terapia Ocupacional - Integração Sensorial"
                  value={newPrescription.title}
                  onChange={(e) => setNewPrescription(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea
                  placeholder="Descreva a prescrição, objetivos e orientações..."
                  value={newPrescription.description}
                  onChange={(e) => setNewPrescription(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Input
                    placeholder="Ex: 2x por semana"
                    value={newPrescription.frequency}
                    onChange={(e) => setNewPrescription(p => ({ ...p, frequency: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Input
                    placeholder="Ex: 12 semanas"
                    value={newPrescription.duration}
                    onChange={(e) => setNewPrescription(p => ({ ...p, duration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim (opcional)</Label>
                  <Input
                    type="date"
                    value={newPrescription.end_date}
                    onChange={(e) => setNewPrescription(p => ({ ...p, end_date: e.target.value }))}
                  />
                </div>
              </div>

              {newPrescription.prescription_type === 'medication' && (
                <div className="space-y-2">
                  <Label>Posologia</Label>
                  <Input
                    placeholder="Ex: 10mg, 1 comprimido pela manhã"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription(p => ({ ...p, dosage: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Notas adicionais..."
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createPrescription} disabled={saving}>
                  {saving ? 'Salvando...' : 'Criar e Assinar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : prescriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma prescrição registrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => {
            const typeInfo = getTypeInfo(prescription.prescription_type);
            return (
              <Card key={prescription.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{typeInfo.icon}</div>
                      <div>
                        <h4 className="font-medium">{prescription.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {prescription.description.slice(0, 100)}...
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary">{typeInfo.label}</Badge>
                          {getStatusBadge(prescription.status)}
                          {prescription.frequency && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {prescription.frequency}
                            </Badge>
                          )}
                          {prescription.signed_at && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Assinada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(prescription.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
