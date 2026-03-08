import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRecordTrial, useAbaReinforcements, useAbaProgressStats } from '@/hooks/useAbaNeuroPlay';
import { Check, X, Clipboard, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { suggestPromptReduction, suggestReinforcementSchedule, type PromptLevel } from '@/core/aba-engine';

const promptLabels: Record<string, string> = {
  fisico: '🤲 Físico',
  gestual: '👋 Gestual',
  verbal: '🗣️ Verbal',
  visual: '👁️ Visual',
  independente: '⭐ Independente',
};

const promptMap: Record<string, PromptLevel> = {
  fisico: 'full_physical',
  gestual: 'gestural',
  verbal: 'verbal',
  visual: 'positional',
  independente: 'independent',
};

interface Props {
  preSelectedInterventionId?: string;
  preSelectedChildId?: string;
}

export function AbaTrialCollector({ preSelectedInterventionId, preSelectedChildId }: Props) {
  const recordTrial = useRecordTrial();
  const { data: reinforcements } = useAbaReinforcements();
  const stats = useAbaProgressStats(preSelectedInterventionId || '');
  const [promptLevel, setPromptLevel] = useState('independente');
  const [reinforcementType, setReinforcementType] = useState('');
  const [notes, setNotes] = useState('');
  const [sessionNumber, setSessionNumber] = useState(1);

  const handleRecord = async (correct: boolean) => {
    if (!preSelectedInterventionId || !preSelectedChildId) {
      toast.error('Selecione uma intervenção primeiro');
      return;
    }

    await recordTrial.mutateAsync({
      intervention_id: preSelectedInterventionId,
      child_id: preSelectedChildId,
      prompt_level: promptLevel,
      correct,
      reinforcement_given: correct && !!reinforcementType,
      reinforcement_type: reinforcementType || undefined,
      session_number: sessionNumber,
      notes: notes || undefined,
    });

    toast.success(correct ? '✅ Acerto registrado!' : '❌ Erro registrado');
    setNotes('');
  };

  // Engine-based suggestions (always computed, safe since hook is at top level)
  const promptSuggestion = suggestPromptReduction(
    promptMap[promptLevel] || 'independent',
    stats.accuracy,
    stats.independence
  );

  const reinforcementSuggestion = suggestReinforcementSchedule(
    stats.accuracy,
    stats.independence,
    stats.sessions.length
  );

  if (!preSelectedInterventionId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clipboard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Selecione um programa e uma habilidade para iniciar a coleta de dados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-primary" />
            Coleta de Tentativas
          </CardTitle>
          <CardDescription>Sessão #{sessionNumber} — Registre cada tentativa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nível de Prompt</Label>
              <Select value={promptLevel} onValueChange={setPromptLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(promptLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reforço</Label>
              <Select value={reinforcementType} onValueChange={setReinforcementType}>
                <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {(reinforcements || []).map((r: any) => (
                    <SelectItem key={r.id} value={r.name}>{r.icon} {r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sessão</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSessionNumber(Math.max(1, sessionNumber - 1))}
                >
                  -
                </Button>
                <span className="flex items-center justify-center w-12 font-medium">{sessionNumber}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSessionNumber(sessionNumber + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Observação (opcional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Descreva o comportamento observado..."
              className="h-16"
            />
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1 h-16 text-lg bg-primary hover:bg-primary/90"
              onClick={() => handleRecord(true)}
              disabled={recordTrial.isPending}
            >
              <Check className="h-6 w-6 mr-2" />
              ACERTO
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-16 text-lg"
              onClick={() => handleRecord(false)}
              disabled={recordTrial.isPending}
            >
              <X className="h-6 w-6 mr-2" />
              ERRO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Engine Suggestions */}
      {stats.totalTrials > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Sugestões do Motor ABA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs shrink-0">Prompt</Badge>
              <span className="text-xs text-muted-foreground">{promptSuggestion.reason}</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs shrink-0">Reforço</Badge>
              <span className="text-xs text-muted-foreground">{reinforcementSuggestion.reason}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
