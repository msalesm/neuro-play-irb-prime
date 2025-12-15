import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Brain, Heart, Users, Save, AlertCircle, Clock,
  CheckCircle, Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeleconsultSessionProps {
  sessionId: string;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onComplete: () => void;
}

interface ObservationData {
  // Bloco A: Cognitivo
  cognitive_attention: string;
  cognitive_memory: string;
  cognitive_processing: string;
  cognitive_score: number;
  
  // Bloco B: Comportamental
  behavioral_impulsivity: string;
  behavioral_organization: string;
  behavioral_planning: string;
  behavioral_score: number;
  
  // Bloco C: Socioemocional
  socioemotional_anxiety: string;
  socioemotional_regulation: string;
  socioemotional_interaction: string;
  socioemotional_score: number;
  
  observed_traits: { trait: string; scale: number }[];
}

const TRAIT_OPTIONS = [
  'Manutenção de contato visual',
  'Comunicação verbal',
  'Seguimento de instruções',
  'Tolerância à frustração',
  'Flexibilidade',
  'Iniciativa',
  'Reciprocidade social',
  'Autorregulação',
  'Atenção sustentada',
  'Organização do pensamento'
];

export function TeleconsultSession({ 
  sessionId, 
  patientId, 
  patientName, 
  onClose, 
  onComplete 
}: TeleconsultSessionProps) {
  const [activeTab, setActiveTab] = useState('cognitive');
  const [saving, setSaving] = useState(false);
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [followUpPlan, setFollowUpPlan] = useState('');
  
  const [observations, setObservations] = useState<ObservationData>({
    cognitive_attention: '',
    cognitive_memory: '',
    cognitive_processing: '',
    cognitive_score: 50,
    behavioral_impulsivity: '',
    behavioral_organization: '',
    behavioral_planning: '',
    behavioral_score: 50,
    socioemotional_anxiety: '',
    socioemotional_regulation: '',
    socioemotional_interaction: '',
    socioemotional_score: 50,
    observed_traits: []
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateObservation = (field: keyof ObservationData, value: any) => {
    setObservations(prev => ({ ...prev, [field]: value }));
  };

  const addTrait = (trait: string) => {
    if (!observations.observed_traits.find(t => t.trait === trait)) {
      updateObservation('observed_traits', [
        ...observations.observed_traits,
        { trait, scale: 3 }
      ]);
    }
  };

  const updateTraitScale = (trait: string, scale: number) => {
    updateObservation('observed_traits', 
      observations.observed_traits.map(t => 
        t.trait === trait ? { ...t, scale } : t
      )
    );
  };

  const removeTrait = (trait: string) => {
    updateObservation('observed_traits', 
      observations.observed_traits.filter(t => t.trait !== trait)
    );
  };

  const saveAndComplete = async () => {
    if (!clinicalSummary.trim()) {
      toast.error('Resumo clínico é obrigatório para finalizar');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Salvar observações estruturadas
      const { error: obsError } = await supabase
        .from('teleconsult_observations')
        .insert({
          session_id: sessionId,
          professional_id: user.id,
          ...observations
        });

      if (obsError) throw obsError;

      // 2. Atualizar sessão com resumo e plano
      const { error: sessionError } = await supabase
        .from('teleorientation_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          clinical_summary: clinicalSummary,
          follow_up_plan: followUpPlan
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // 3. Criar avaliação condensada
      const { error: assessError } = await supabase
        .from('condensed_assessments')
        .insert({
          child_id: patientId,
          professional_id: user.id,
          source_type: 'teleconsult',
          source_session_id: sessionId,
          cognitive_overall_score: observations.cognitive_score,
          cognitive_risk: observations.cognitive_score < 40 ? 'high' : observations.cognitive_score < 70 ? 'medium' : 'low',
          behavioral_overall_score: observations.behavioral_score,
          behavioral_risk: observations.behavioral_score < 40 ? 'high' : observations.behavioral_score < 70 ? 'medium' : 'low',
          socioemotional_overall_score: observations.socioemotional_score,
          socioemotional_risk: observations.socioemotional_score < 40 ? 'high' : observations.socioemotional_score < 70 ? 'medium' : 'low',
          notes: clinicalSummary
        });

      if (assessError) throw assessError;

      // 4. Criar plano de acompanhamento se definido
      if (followUpPlan.trim()) {
        const { error: planError } = await supabase
          .from('follow_up_plans')
          .insert({
            child_id: patientId,
            professional_id: user.id,
            session_id: sessionId,
            objectives: [{ text: followUpPlan, status: 'pending' }],
            status: 'active'
          });

        if (planError) console.error('Error creating follow-up plan:', planError);
      }

      toast.success('Teleconsulta finalizada com sucesso');
      onComplete();
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Erro ao finalizar teleconsulta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with timer */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Prontuário em Tempo Real</h2>
          <p className="text-muted-foreground text-sm">{patientName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-muted px-3 py-1 rounded-full">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-red-500 animate-pulse" />
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Panel */}
      <div className="flex-1 overflow-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="cognitive" className="text-xs">
                <Brain className="w-4 h-4 mr-1" />
                Cognitivo
              </TabsTrigger>
              <TabsTrigger value="behavioral" className="text-xs">
                <Users className="w-4 h-4 mr-1" />
                Comportamental
              </TabsTrigger>
              <TabsTrigger value="socioemotional" className="text-xs">
                <Heart className="w-4 h-4 mr-1" />
                Socioemocional
              </TabsTrigger>
              <TabsTrigger value="traits" className="text-xs">
                <CheckCircle className="w-4 h-4 mr-1" />
                Traços
              </TabsTrigger>
            </TabsList>

            {/* Bloco A: Cognitivo */}
            <TabsContent value="cognitive" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Observações sobre atenção sustentada, dividida, seletiva..."
                    value={observations.cognitive_attention}
                    onChange={(e) => updateObservation('cognitive_attention', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Memória</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Observações sobre memória de trabalho, curto/longo prazo..."
                    value={observations.cognitive_memory}
                    onChange={(e) => updateObservation('cognitive_memory', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Velocidade de processamento, raciocínio..."
                    value={observations.cognitive_processing}
                    onChange={(e) => updateObservation('cognitive_processing', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Score Cognitivo Geral: {observations.cognitive_score}%</Label>
                <Slider
                  value={[observations.cognitive_score]}
                  onValueChange={(v) => updateObservation('cognitive_score', v[0])}
                  max={100}
                  step={5}
                />
              </div>
            </TabsContent>

            {/* Bloco B: Comportamental */}
            <TabsContent value="behavioral" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Impulsividade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Controle inibitório, impulsividade motora/verbal..."
                    value={observations.behavioral_impulsivity}
                    onChange={(e) => updateObservation('behavioral_impulsivity', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Organização</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Organização do espaço, materiais, tempo..."
                    value={observations.behavioral_organization}
                    onChange={(e) => updateObservation('behavioral_organization', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Planejamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Capacidade de planejar, sequenciar, antecipar..."
                    value={observations.behavioral_planning}
                    onChange={(e) => updateObservation('behavioral_planning', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Score Comportamental Geral: {observations.behavioral_score}%</Label>
                <Slider
                  value={[observations.behavioral_score]}
                  onValueChange={(v) => updateObservation('behavioral_score', v[0])}
                  max={100}
                  step={5}
                />
              </div>
            </TabsContent>

            {/* Bloco C: Socioemocional */}
            <TabsContent value="socioemotional" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Ansiedade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Sinais de ansiedade, preocupações, evitação..."
                    value={observations.socioemotional_anxiety}
                    onChange={(e) => updateObservation('socioemotional_anxiety', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Regulação Emocional</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Capacidade de regular emoções, tolerância à frustração..."
                    value={observations.socioemotional_regulation}
                    onChange={(e) => updateObservation('socioemotional_regulation', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Interação Social</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Habilidades sociais, reciprocidade, comunicação..."
                    value={observations.socioemotional_interaction}
                    onChange={(e) => updateObservation('socioemotional_interaction', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Score Socioemocional Geral: {observations.socioemotional_score}%</Label>
                <Slider
                  value={[observations.socioemotional_score]}
                  onValueChange={(v) => updateObservation('socioemotional_score', v[0])}
                  max={100}
                  step={5}
                />
              </div>
            </TabsContent>

            {/* Traços Observados */}
            <TabsContent value="traits" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Adicionar Traço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {TRAIT_OPTIONS.map((trait) => (
                      <Badge
                        key={trait}
                        variant={observations.observed_traits.find(t => t.trait === trait) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => addTrait(trait)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {observations.observed_traits.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Escalas de Traços</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {observations.observed_traits.map((trait) => (
                      <div key={trait.trait} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">{trait.trait}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTrait(trait.trait)}
                          >
                            ×
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">1</span>
                          <Slider
                            value={[trait.scale]}
                            onValueChange={(v) => updateTraitScale(trait.trait, v[0])}
                            min={1}
                            max={5}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground">5</span>
                          <Badge variant="outline">{trait.scale}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Summary and Completion */}
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Resumo Clínico *</Label>
              <Textarea
                placeholder="Resumo obrigatório da sessão..."
                value={clinicalSummary}
                onChange={(e) => setClinicalSummary(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Plano de Acompanhamento</Label>
              <Textarea
                placeholder="Definir próximos passos, objetivos, intervenções..."
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                rows={2}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={saveAndComplete}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Finalizar Teleconsulta'}
            </Button>
          </div>
        </div>
      </div>
  );
}
