import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  FileText, Save, Clock, CheckCircle, 
  User, Heart, Briefcase, GraduationCap,
  Baby, Pill, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NeuroAnamnesisProps {
  childId: string;
  childName: string;
}

interface AnamnesisData {
  id?: string;
  main_complaint: string;
  complaint_duration: string;
  previous_diagnoses: string[];
  family_history: {
    neurodev_conditions?: string;
    psychiatric_history?: string;
    family_structure?: string;
  };
  pregnancy_birth_history: {
    pregnancy?: string;
    delivery?: string;
    neonatal?: string;
  };
  developmental_milestones: {
    motor?: string;
    language?: string;
    social?: string;
    cognitive?: string;
  };
  medical_history: {
    conditions?: string;
    surgeries?: string;
    hospitalizations?: string;
  };
  current_medications: Array<{ name: string; dosage: string }>;
  allergies: string[];
  school_history: {
    current_school?: string;
    grade?: string;
    performance?: string;
    adaptations?: string;
  };
  learning_difficulties: {
    reading?: string;
    writing?: string;
    math?: string;
    attention?: string;
  };
  social_behavior: {
    peer_relations?: string;
    adult_relations?: string;
    emotional_regulation?: string;
  };
  previous_evaluations: Array<{ type: string; date: string; result: string }>;
  status: 'draft' | 'completed' | 'reviewed';
  created_at?: string;
  updated_at?: string;
}

const EMPTY_ANAMNESIS: AnamnesisData = {
  main_complaint: '',
  complaint_duration: '',
  previous_diagnoses: [],
  family_history: {},
  pregnancy_birth_history: {},
  developmental_milestones: {},
  medical_history: {},
  current_medications: [],
  allergies: [],
  school_history: {},
  learning_difficulties: {},
  social_behavior: {},
  previous_evaluations: [],
  status: 'draft'
};

export function NeuroAnamnesis({ childId, childName }: NeuroAnamnesisProps) {
  const [anamnesis, setAnamnesis] = useState<AnamnesisData>(EMPTY_ANAMNESIS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('complaint');

  useEffect(() => {
    fetchAnamnesis();
  }, [childId]);

  const fetchAnamnesis = async () => {
    try {
      const { data, error } = await supabase
        .from('neuro_anamnesis')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setAnamnesis({
          ...EMPTY_ANAMNESIS,
          id: data.id,
          main_complaint: data.main_complaint || '',
          complaint_duration: data.complaint_duration || '',
          previous_diagnoses: (data.previous_diagnoses as string[]) || [],
          family_history: (data.family_history as any) || {},
          pregnancy_birth_history: (data.pregnancy_birth_history as any) || {},
          developmental_milestones: (data.developmental_milestones as any) || {},
          medical_history: (data.medical_history as any) || {},
          current_medications: (data.current_medications as any) || [],
          allergies: (data.allergies as string[]) || [],
          school_history: (data.school_history as any) || {},
          learning_difficulties: (data.learning_difficulties as any) || {},
          social_behavior: (data.social_behavior as any) || {},
          previous_evaluations: (data.previous_evaluations as any) || [],
          status: (data.status as any) || 'draft'
        });
      }
    } catch (error) {
      console.error('Error fetching anamnesis:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnamnesis = async (status?: 'draft' | 'completed') => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const payload = {
        child_id: childId,
        professional_id: user.id,
        main_complaint: anamnesis.main_complaint,
        complaint_duration: anamnesis.complaint_duration,
        previous_diagnoses: anamnesis.previous_diagnoses,
        family_history: anamnesis.family_history,
        pregnancy_birth_history: anamnesis.pregnancy_birth_history,
        developmental_milestones: anamnesis.developmental_milestones,
        medical_history: anamnesis.medical_history,
        current_medications: anamnesis.current_medications,
        allergies: anamnesis.allergies,
        school_history: anamnesis.school_history,
        learning_difficulties: anamnesis.learning_difficulties,
        social_behavior: anamnesis.social_behavior,
        previous_evaluations: anamnesis.previous_evaluations,
        status: status || anamnesis.status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };

      if (anamnesis.id) {
        const { error } = await supabase
          .from('neuro_anamnesis')
          .update(payload)
          .eq('id', anamnesis.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('neuro_anamnesis')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setAnamnesis(prev => ({ ...prev, id: data.id }));
      }

      toast.success(status === 'completed' ? 'Anamnese finalizada' : 'Anamnese salva');
      if (status) setAnamnesis(prev => ({ ...prev, status }));
    } catch (error) {
      console.error('Error saving anamnesis:', error);
      toast.error('Erro ao salvar anamnese');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section: keyof AnamnesisData, field: string, value: any) => {
    setAnamnesis(prev => {
      if (typeof prev[section] === 'object' && !Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: { ...(prev[section] as object), [field]: value }
        };
      }
      return { ...prev, [section]: value };
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando anamnese...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Anamnese Neurodesenvolvimento
          </h3>
          <p className="text-sm text-muted-foreground">{childName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={
            anamnesis.status === 'completed' ? 'default' :
            anamnesis.status === 'reviewed' ? 'secondary' : 'outline'
          }>
            {anamnesis.status === 'completed' ? 'Completa' :
             anamnesis.status === 'reviewed' ? 'Revisada' : 'Rascunho'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => saveAnamnesis()} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          {anamnesis.status === 'draft' && (
            <Button size="sm" onClick={() => saveAnamnesis('completed')} disabled={saving}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1">
          <TabsTrigger value="complaint" className="text-xs">Queixa</TabsTrigger>
          <TabsTrigger value="family" className="text-xs">Família</TabsTrigger>
          <TabsTrigger value="development" className="text-xs">Desenvolvimento</TabsTrigger>
          <TabsTrigger value="medical" className="text-xs">Médico</TabsTrigger>
          <TabsTrigger value="school" className="text-xs">Escolar</TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs">Comportamento</TabsTrigger>
          <TabsTrigger value="evaluations" className="text-xs">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="complaint" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Queixa Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição da Queixa Principal *</Label>
                <Textarea
                  placeholder="Descreva a principal preocupação ou motivo da avaliação..."
                  value={anamnesis.main_complaint}
                  onChange={(e) => setAnamnesis(prev => ({ ...prev, main_complaint: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração dos Sintomas</Label>
                <Input
                  placeholder="Ex: Desde os 3 anos, há 2 anos..."
                  value={anamnesis.complaint_duration}
                  onChange={(e) => setAnamnesis(prev => ({ ...prev, complaint_duration: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Diagnósticos Anteriores (separar por vírgula)</Label>
                <Input
                  placeholder="Ex: TEA, TDAH, Dislexia..."
                  value={anamnesis.previous_diagnoses.join(', ')}
                  onChange={(e) => setAnamnesis(prev => ({ 
                    ...prev, 
                    previous_diagnoses: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Histórico Familiar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Condições Neurodesenvolvimentais na Família</Label>
                <Textarea
                  placeholder="TEA, TDAH, dislexia, deficiência intelectual em familiares..."
                  value={anamnesis.family_history.neurodev_conditions || ''}
                  onChange={(e) => updateField('family_history', 'neurodev_conditions', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Histórico Psiquiátrico Familiar</Label>
                <Textarea
                  placeholder="Depressão, ansiedade, transtorno bipolar em familiares..."
                  value={anamnesis.family_history.psychiatric_history || ''}
                  onChange={(e) => updateField('family_history', 'psychiatric_history', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Estrutura Familiar</Label>
                <Textarea
                  placeholder="Composição familiar, dinâmica, eventos significativos..."
                  value={anamnesis.family_history.family_structure || ''}
                  onChange={(e) => updateField('family_history', 'family_structure', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Baby className="w-4 h-4" />
                Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="pregnancy">
                  <AccordionTrigger>Gestação e Parto</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Gestação</Label>
                      <Textarea
                        placeholder="Intercorrências, uso de medicamentos, estresse..."
                        value={anamnesis.pregnancy_birth_history.pregnancy || ''}
                        onChange={(e) => updateField('pregnancy_birth_history', 'pregnancy', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parto</Label>
                      <Textarea
                        placeholder="Tipo de parto, semanas, peso, Apgar..."
                        value={anamnesis.pregnancy_birth_history.delivery || ''}
                        onChange={(e) => updateField('pregnancy_birth_history', 'delivery', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="milestones">
                  <AccordionTrigger>Marcos do Desenvolvimento</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Motor</Label>
                        <Textarea
                          placeholder="Sentar, andar, coordenação..."
                          value={anamnesis.developmental_milestones.motor || ''}
                          onChange={(e) => updateField('developmental_milestones', 'motor', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Linguagem</Label>
                        <Textarea
                          placeholder="Primeiras palavras, frases..."
                          value={anamnesis.developmental_milestones.language || ''}
                          onChange={(e) => updateField('developmental_milestones', 'language', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Social</Label>
                        <Textarea
                          placeholder="Interação social, brincadeiras..."
                          value={anamnesis.developmental_milestones.social || ''}
                          onChange={(e) => updateField('developmental_milestones', 'social', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cognitivo</Label>
                        <Textarea
                          placeholder="Aprendizagem, resolução de problemas..."
                          value={anamnesis.developmental_milestones.cognitive || ''}
                          onChange={(e) => updateField('developmental_milestones', 'cognitive', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Histórico Médico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Condições Médicas</Label>
                <Textarea
                  placeholder="Doenças crônicas, condições..."
                  value={anamnesis.medical_history.conditions || ''}
                  onChange={(e) => updateField('medical_history', 'conditions', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Cirurgias e Internações</Label>
                <Textarea
                  placeholder="Procedimentos, hospitalizações..."
                  value={anamnesis.medical_history.surgeries || ''}
                  onChange={(e) => updateField('medical_history', 'surgeries', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Alergias (separar por vírgula)</Label>
                <Input
                  placeholder="Medicamentos, alimentos..."
                  value={anamnesis.allergies.join(', ')}
                  onChange={(e) => setAnamnesis(prev => ({ 
                    ...prev, 
                    allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Histórico Escolar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Escola Atual</Label>
                  <Input
                    placeholder="Nome da escola..."
                    value={anamnesis.school_history.current_school || ''}
                    onChange={(e) => updateField('school_history', 'current_school', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Série/Ano</Label>
                  <Input
                    placeholder="Ex: 3º ano..."
                    value={anamnesis.school_history.grade || ''}
                    onChange={(e) => updateField('school_history', 'grade', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Desempenho Acadêmico</Label>
                <Textarea
                  placeholder="Rendimento, dificuldades, pontos fortes..."
                  value={anamnesis.school_history.performance || ''}
                  onChange={(e) => updateField('school_history', 'performance', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Adaptações Escolares (PEI)</Label>
                <Textarea
                  placeholder="Adaptações já implementadas..."
                  value={anamnesis.school_history.adaptations || ''}
                  onChange={(e) => updateField('school_history', 'adaptations', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Comportamento Social
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Relação com Pares</Label>
                <Textarea
                  placeholder="Amizades, brincadeiras, conflitos..."
                  value={anamnesis.social_behavior.peer_relations || ''}
                  onChange={(e) => updateField('social_behavior', 'peer_relations', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Relação com Adultos</Label>
                <Textarea
                  placeholder="Autoridade, comunicação..."
                  value={anamnesis.social_behavior.adult_relations || ''}
                  onChange={(e) => updateField('social_behavior', 'adult_relations', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Regulação Emocional</Label>
                <Textarea
                  placeholder="Frustração, birras, ansiedade..."
                  value={anamnesis.social_behavior.emotional_regulation || ''}
                  onChange={(e) => updateField('social_behavior', 'emotional_regulation', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Avaliações Anteriores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Registre avaliações neuropsicológicas, fonoaudiológicas, psicológicas ou outras realizadas anteriormente.
              </p>
              <div className="space-y-3">
                {anamnesis.previous_evaluations.map((eval_, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Tipo"
                        value={eval_.type}
                        onChange={(e) => {
                          const updated = [...anamnesis.previous_evaluations];
                          updated[index].type = e.target.value;
                          setAnamnesis(prev => ({ ...prev, previous_evaluations: updated }));
                        }}
                      />
                      <Input
                        type="date"
                        value={eval_.date}
                        onChange={(e) => {
                          const updated = [...anamnesis.previous_evaluations];
                          updated[index].date = e.target.value;
                          setAnamnesis(prev => ({ ...prev, previous_evaluations: updated }));
                        }}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setAnamnesis(prev => ({
                            ...prev,
                            previous_evaluations: prev.previous_evaluations.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Resultado/Conclusão"
                      value={eval_.result}
                      onChange={(e) => {
                        const updated = [...anamnesis.previous_evaluations];
                        updated[index].result = e.target.value;
                        setAnamnesis(prev => ({ ...prev, previous_evaluations: updated }));
                      }}
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => setAnamnesis(prev => ({
                    ...prev,
                    previous_evaluations: [...prev.previous_evaluations, { type: '', date: '', result: '' }]
                  }))}
                >
                  + Adicionar Avaliação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
