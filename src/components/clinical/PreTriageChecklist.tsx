import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, AlertTriangle, Brain, Heart, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PreTriageChecklistProps {
  childId: string;
  sessionId?: string;
  onComplete?: (riskScore: number, riskLevel: string) => void;
}

interface ChecklistItem {
  id: string;
  category: 'cognitive' | 'behavioral' | 'socioemotional';
  question: string;
  weight: number;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Cognitivo
  { id: 'cog1', category: 'cognitive', question: 'Dificuldade de atenção sustentada', weight: 3 },
  { id: 'cog2', category: 'cognitive', question: 'Problemas de memória de trabalho', weight: 3 },
  { id: 'cog3', category: 'cognitive', question: 'Dificuldade no processamento de informações', weight: 2 },
  { id: 'cog4', category: 'cognitive', question: 'Lentidão na execução de tarefas', weight: 2 },
  
  // Comportamental
  { id: 'beh1', category: 'behavioral', question: 'Impulsividade frequente', weight: 3 },
  { id: 'beh2', category: 'behavioral', question: 'Dificuldade de organização', weight: 2 },
  { id: 'beh3', category: 'behavioral', question: 'Problemas de planejamento', weight: 2 },
  { id: 'beh4', category: 'behavioral', question: 'Hiperatividade motora', weight: 3 },
  
  // Socioemocional
  { id: 'soc1', category: 'socioemotional', question: 'Sinais de ansiedade', weight: 3 },
  { id: 'soc2', category: 'socioemotional', question: 'Dificuldade de regulação emocional', weight: 3 },
  { id: 'soc3', category: 'socioemotional', question: 'Problemas de interação social', weight: 2 },
  { id: 'soc4', category: 'socioemotional', question: 'Isolamento ou retraimento', weight: 2 },
];

const CATEGORY_ICONS = {
  cognitive: Brain,
  behavioral: Users,
  socioemotional: Heart,
};

const CATEGORY_LABELS = {
  cognitive: 'Cognitivo',
  behavioral: 'Comportamental',
  socioemotional: 'Socioemocional',
};

export function PreTriageChecklist({ childId, sessionId, onComplete }: PreTriageChecklistProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toggleResponse = (id: string) => {
    setResponses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateRiskScore = () => {
    const maxWeight = CHECKLIST_ITEMS.reduce((sum, item) => sum + item.weight, 0);
    const currentWeight = CHECKLIST_ITEMS
      .filter(item => responses[item.id])
      .reduce((sum, item) => sum + item.weight, 0);
    
    // Score invertido: mais problemas = score mais baixo
    const score = Math.round(((maxWeight - currentWeight) / maxWeight) * 100);
    return score;
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 75) return 'low';
    if (score >= 50) return 'medium';
    if (score >= 25) return 'high';
    return 'critical';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 text-green-600';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600';
      case 'high': return 'bg-orange-500/10 text-orange-600';
      case 'critical': return 'bg-red-500/10 text-red-600';
      default: return 'bg-muted';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const riskScore = calculateRiskScore();
      const riskLevel = getRiskLevel(riskScore);

      const { error } = await supabase
        .from('pre_triage_forms')
        .insert({
          child_id: childId,
          session_id: sessionId,
          checklist_responses: responses,
          calculated_risk_score: riskScore,
          risk_level: riskLevel,
          status: 'completed',
          completed_by: user?.id,
          completed_at: new Date().toISOString(),
          auto_summary: generateSummary(responses, additionalNotes),
        });

      if (error) throw error;

      toast.success('Pré-triagem concluída');
      onComplete?.(riskScore, riskLevel);
    } catch (error) {
      console.error('Error saving pre-triage:', error);
      toast.error('Erro ao salvar pré-triagem');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = (responses: Record<string, boolean>, notes: string): string => {
    const positiveItems = CHECKLIST_ITEMS.filter(item => responses[item.id]);
    
    if (positiveItems.length === 0) {
      return 'Nenhum indicador de risco identificado na pré-triagem.';
    }

    const byCategory = positiveItems.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item.question);
      return acc;
    }, {} as Record<string, string[]>);

    let summary = 'Indicadores identificados: ';
    Object.entries(byCategory).forEach(([cat, items]) => {
      summary += `${CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}: ${items.join(', ')}. `;
    });

    if (notes) {
      summary += `Observações: ${notes}`;
    }

    return summary;
  };

  const riskScore = calculateRiskScore();
  const riskLevel = getRiskLevel(riskScore);

  const groupedItems = CHECKLIST_ITEMS.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary" />
            Pré-Triagem Estruturada
          </CardTitle>
          <Badge className={getRiskColor(riskLevel)}>
            Risco: {riskLevel === 'low' ? 'Baixo' : riskLevel === 'medium' ? 'Médio' : 
                    riskLevel === 'high' ? 'Alto' : 'Crítico'} ({riskScore}%)
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Protege o tempo do especialista - dados básicos coletados antes da consulta
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => {
          const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h3>
              <div className="grid gap-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      id={item.id}
                      checked={responses[item.id] || false}
                      onCheckedChange={() => toggleResponse(item.id)}
                    />
                    <Label 
                      htmlFor={item.id} 
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {item.question}
                    </Label>
                    {responses[item.id] && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Observações adicionais */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Observações Adicionais</Label>
          <Textarea
            placeholder="Informações relevantes para o especialista..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Concluir Pré-Triagem'}
        </Button>
      </CardContent>
    </Card>
  );
}
