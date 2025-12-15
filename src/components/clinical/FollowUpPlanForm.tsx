import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, User, AlertTriangle, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FollowUpPlanFormProps {
  childId: string;
  sessionId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

interface MonitoringIndicator {
  name: string;
  target: string;
  frequency: string;
}

export function FollowUpPlanForm({ childId, sessionId, onSave, onCancel }: FollowUpPlanFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clinicalObjective, setClinicalObjective] = useState('');
  const [reassessmentDate, setReassessmentDate] = useState('');
  const [indicators, setIndicators] = useState<MonitoringIndicator[]>([
    { name: '', target: '', frequency: '' }
  ]);

  const addIndicator = () => {
    setIndicators([...indicators, { name: '', target: '', frequency: '' }]);
  };

  const removeIndicator = (index: number) => {
    setIndicators(indicators.filter((_, i) => i !== index));
  };

  const updateIndicator = (index: number, field: keyof MonitoringIndicator, value: string) => {
    const updated = [...indicators];
    updated[index][field] = value;
    setIndicators(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clinicalObjective.trim()) {
      toast.error('Objetivo clínico é obrigatório');
      return;
    }

    if (!reassessmentDate) {
      toast.error('Data de reavaliação é obrigatória');
      return;
    }

    const validIndicators = indicators.filter(i => i.name.trim());
    if (validIndicators.length === 0) {
      toast.error('Pelo menos um indicador de acompanhamento é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('follow_up_plans')
        .insert({
          child_id: childId,
          professional_id: user?.id,
          session_id: sessionId,
          clinical_objective: clinicalObjective,
          monitoring_indicators: validIndicators,
          reassessment_date: reassessmentDate,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Plano de acompanhamento registrado');
      onSave?.();
    } catch (error) {
      console.error('Error saving follow-up plan:', error);
      toast.error('Erro ao salvar plano de acompanhamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Plano de Acompanhamento
          <Badge variant="destructive" className="ml-auto">Obrigatório</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Nenhuma consulta pode ser encerrada sem plano registrado
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Objetivo Clínico */}
          <div className="space-y-2">
            <Label htmlFor="objective" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Objetivo Clínico *
            </Label>
            <Textarea
              id="objective"
              placeholder="Descreva o objetivo clínico do acompanhamento..."
              value={clinicalObjective}
              onChange={(e) => setClinicalObjective(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Indicadores de Acompanhamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Indicadores de Acompanhamento *
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addIndicator}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {indicators.map((indicator, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                <Input
                  className="col-span-4"
                  placeholder="Indicador"
                  value={indicator.name}
                  onChange={(e) => updateIndicator(idx, 'name', e.target.value)}
                />
                <Input
                  className="col-span-4"
                  placeholder="Meta"
                  value={indicator.target}
                  onChange={(e) => updateIndicator(idx, 'target', e.target.value)}
                />
                <Input
                  className="col-span-3"
                  placeholder="Frequência"
                  value={indicator.frequency}
                  onChange={(e) => updateIndicator(idx, 'frequency', e.target.value)}
                />
                {indicators.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1"
                    onClick={() => removeIndicator(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Data de Reavaliação */}
          <div className="space-y-2">
            <Label htmlFor="reassessment" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Reavaliação *
            </Label>
            <Input
              id="reassessment"
              type="date"
              value={reassessmentDate}
              onChange={(e) => setReassessmentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Registrar Plano'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
