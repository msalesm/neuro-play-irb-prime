import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Save, CheckCircle, User, Baby, Heart, 
  Brain, MessageSquare, Smile, Home, Stethoscope,
  ClipboardList, Sparkles, AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChildDevelopmentAnamnesisProps {
  childId: string;
  childName: string;
  childBirthDate?: string;
  onComplete?: () => void;
}

interface AnamnesisData {
  id?: string;
  identification: {
    responsible_name?: string;
    relationship?: string;
    education?: string;
    institution?: string;
    anamnesis_date?: string;
  };
  pregnancy_prenatal: {
    planned?: string;
    duration_weeks?: string;
    prenatal_care?: string;
    complications?: string;
  };
  birth: {
    type?: string;
    full_term?: string;
    weight?: string;
    cried_at_birth?: string;
    nicu?: string;
    complications?: string;
  };
  neuropsychomotor: {
    motor_milestones?: string;
    fine_motor?: string;
    motor_observations?: string;
  };
  language_development: {
    babbling?: string;
    first_words?: string;
    simple_sentences?: string;
    current_communication?: string;
    speech_therapy_history?: string;
  };
  cognitive_development: {
    curiosity?: string;
    attention?: string;
    concept_recognition?: string;
    learning_difficulties?: string;
  };
  social_emotional: {
    social_interaction?: string;
    symbolic_play?: string;
    affectivity?: string;
    observed_behaviors?: string;
    frustration_reaction?: string;
  };
  autonomy_routine: {
    feeding?: string;
    sphincter_control?: string;
    sleep?: string;
  };
  general_health: {
    previous_diseases?: string;
    medications?: string;
    medical_diagnoses?: string;
    professional_followups?: string;
  };
  general_observations: string;
  main_complaint: string;
  generated_summary?: {
    summary?: string;
    development_areas?: any;
    attention_points?: string[];
    quick_synthesis?: string;
  };
  status: 'draft' | 'completed' | 'reviewed';
}

const EMPTY_ANAMNESIS: AnamnesisData = {
  identification: { anamnesis_date: new Date().toISOString().split('T')[0] },
  pregnancy_prenatal: {},
  birth: {},
  neuropsychomotor: {},
  language_development: {},
  cognitive_development: {},
  social_emotional: {},
  autonomy_routine: {},
  general_health: {},
  general_observations: '',
  main_complaint: '',
  status: 'draft'
};

export function ChildDevelopmentAnamnesis({ 
  childId, 
  childName, 
  childBirthDate,
  onComplete 
}: ChildDevelopmentAnamnesisProps) {
  const [anamnesis, setAnamnesis] = useState<AnamnesisData>(EMPTY_ANAMNESIS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('identification');

  useEffect(() => {
    fetchAnamnesis();
  }, [childId]);

  const fetchAnamnesis = async () => {
    try {
      const { data, error } = await supabase
        .from('child_development_anamnesis')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setAnamnesis({
          id: data.id,
          identification: (data.identification as any) || {},
          pregnancy_prenatal: (data.pregnancy_prenatal as any) || {},
          birth: (data.birth as any) || {},
          neuropsychomotor: (data.neuropsychomotor as any) || {},
          language_development: (data.language_development as any) || {},
          cognitive_development: (data.cognitive_development as any) || {},
          social_emotional: (data.social_emotional as any) || {},
          autonomy_routine: (data.autonomy_routine as any) || {},
          general_health: (data.general_health as any) || {},
          general_observations: data.general_observations || '',
          main_complaint: data.main_complaint || '',
          generated_summary: (data.generated_summary as any) || undefined,
          status: (data.status as any) || 'draft'
        });
      }
    } catch (error) {
      console.error('Error fetching anamnesis:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (section: keyof AnamnesisData, field: string, value: any) => {
    setAnamnesis(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null && !Array.isArray(currentSection)) {
        return {
          ...prev,
          [section]: { ...currentSection, [field]: value }
        };
      }
      return { ...prev, [section]: value };
    });
  };

  const generateSummary = (): AnamnesisData['generated_summary'] => {
    const attentionPoints: string[] = [];
    const developmentAreas: Record<string, string> = {};

    // Analyze pregnancy/birth
    if (anamnesis.birth.nicu === 'sim') {
      attentionPoints.push('Internação em UTI neonatal - acompanhar desenvolvimento');
    }
    if (anamnesis.pregnancy_prenatal.complications) {
      attentionPoints.push('Intercorrências gestacionais relatadas');
    }

    // Analyze neuropsychomotor
    if (anamnesis.neuropsychomotor.motor_milestones) {
      developmentAreas['Motor'] = anamnesis.neuropsychomotor.motor_milestones;
    }

    // Analyze language
    if (anamnesis.language_development.speech_therapy_history) {
      attentionPoints.push('Histórico de fonoaudiologia');
    }
    if (anamnesis.language_development.current_communication) {
      developmentAreas['Linguagem'] = anamnesis.language_development.current_communication;
    }

    // Analyze cognitive
    if (anamnesis.cognitive_development.learning_difficulties) {
      attentionPoints.push('Dificuldades de aprendizagem observadas');
      developmentAreas['Cognitivo'] = anamnesis.cognitive_development.learning_difficulties;
    }

    // Analyze social-emotional
    if (anamnesis.social_emotional.frustration_reaction) {
      developmentAreas['Socioemocional'] = anamnesis.social_emotional.frustration_reaction;
    }
    if (anamnesis.social_emotional.observed_behaviors) {
      attentionPoints.push('Comportamentos específicos observados');
    }

    // Analyze health
    if (anamnesis.general_health.medical_diagnoses) {
      attentionPoints.push('Diagnósticos médicos registrados');
    }
    if (anamnesis.general_health.medications) {
      attentionPoints.push('Uso de medicação em curso');
    }

    const summary = `Anamnese de desenvolvimento infantil realizada em ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}. Criança: ${childName}${childBirthDate ? `, nascida em ${format(new Date(childBirthDate), 'dd/MM/yyyy')}` : ''}. ${anamnesis.main_complaint ? `Queixa principal: ${anamnesis.main_complaint.substring(0, 200)}...` : 'Sem queixa principal registrada.'}`;

    const quickSynthesis = `${attentionPoints.length > 0 ? `Pontos de atenção identificados: ${attentionPoints.length}. ` : 'Nenhum ponto crítico identificado. '}${Object.keys(developmentAreas).length > 0 ? `Áreas avaliadas: ${Object.keys(developmentAreas).join(', ')}.` : ''}`;

    return {
      summary,
      development_areas: developmentAreas,
      attention_points: attentionPoints,
      quick_synthesis: quickSynthesis
    };
  };

  const saveAnamnesis = async (status?: 'draft' | 'completed') => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const generatedSummary = status === 'completed' ? generateSummary() : anamnesis.generated_summary;

      const payload = {
        child_id: childId,
        professional_id: user.id,
        identification: anamnesis.identification,
        pregnancy_prenatal: anamnesis.pregnancy_prenatal,
        birth: anamnesis.birth,
        neuropsychomotor: anamnesis.neuropsychomotor,
        language_development: anamnesis.language_development,
        cognitive_development: anamnesis.cognitive_development,
        social_emotional: anamnesis.social_emotional,
        autonomy_routine: anamnesis.autonomy_routine,
        general_health: anamnesis.general_health,
        general_observations: anamnesis.general_observations,
        main_complaint: anamnesis.main_complaint,
        generated_summary: generatedSummary,
        status: status || anamnesis.status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };

      if (anamnesis.id) {
        const { error } = await supabase
          .from('child_development_anamnesis')
          .update(payload)
          .eq('id', anamnesis.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('child_development_anamnesis')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setAnamnesis(prev => ({ ...prev, id: data.id }));
      }

      if (status === 'completed') {
        setAnamnesis(prev => ({ ...prev, status: 'completed', generated_summary: generatedSummary }));
        toast.success('Anamnese finalizada com resumo gerado!');
        onComplete?.();
      } else {
        toast.success('Anamnese salva');
      }
    } catch (error) {
      console.error('Error saving anamnesis:', error);
      toast.error('Erro ao salvar anamnese');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando anamnese...</div>;
  }

  const tabs = [
    { id: 'identification', label: 'Identificação', icon: User },
    { id: 'pregnancy', label: 'Gestação', icon: Heart },
    { id: 'birth', label: 'Nascimento', icon: Baby },
    { id: 'motor', label: 'Motor', icon: Baby },
    { id: 'language', label: 'Linguagem', icon: MessageSquare },
    { id: 'cognitive', label: 'Cognitivo', icon: Brain },
    { id: 'social', label: 'Social', icon: Smile },
    { id: 'autonomy', label: 'Autonomia', icon: Home },
    { id: 'health', label: 'Saúde', icon: Stethoscope },
    { id: 'observations', label: 'Observações', icon: ClipboardList },
    { id: 'summary', label: 'Resumo', icon: Sparkles },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Anamnese de Desenvolvimento Infantil
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

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 gap-1">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="text-xs px-3 py-2 flex items-center gap-1"
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {/* 1. Identificação */}
        <TabsContent value="identification" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Criança</Label>
                  <Input value={childName} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input value={childBirthDate || ''} disabled className="bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Responsável</Label>
                  <Input
                    value={anamnesis.identification.responsible_name || ''}
                    onChange={(e) => updateSection('identification', 'responsible_name', e.target.value)}
                    placeholder="Nome completo do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grau de Parentesco</Label>
                  <Select 
                    value={anamnesis.identification.relationship || ''} 
                    onValueChange={(v) => updateSection('identification', 'relationship', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mae">Mãe</SelectItem>
                      <SelectItem value="pai">Pai</SelectItem>
                      <SelectItem value="avo">Avó/Avô</SelectItem>
                      <SelectItem value="tio">Tia/Tio</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Escolaridade do Responsável</Label>
                  <Select 
                    value={anamnesis.identification.education || ''} 
                    onValueChange={(v) => updateSection('identification', 'education', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fundamental_incompleto">Fund. Incompleto</SelectItem>
                      <SelectItem value="fundamental_completo">Fund. Completo</SelectItem>
                      <SelectItem value="medio_incompleto">Médio Incompleto</SelectItem>
                      <SelectItem value="medio_completo">Médio Completo</SelectItem>
                      <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                      <SelectItem value="superior_completo">Superior Completo</SelectItem>
                      <SelectItem value="pos_graduacao">Pós-graduação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Instituição (se houver)</Label>
                  <Input
                    value={anamnesis.identification.institution || ''}
                    onChange={(e) => updateSection('identification', 'institution', e.target.value)}
                    placeholder="Escola, clínica, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data da Anamnese</Label>
                <Input
                  type="date"
                  value={anamnesis.identification.anamnesis_date || ''}
                  onChange={(e) => updateSection('identification', 'anamnesis_date', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Gestação e Pré-natal */}
        <TabsContent value="pregnancy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Gestação e Pré-natal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Gestação Planejada?</Label>
                <RadioGroup 
                  value={anamnesis.pregnancy_prenatal.planned || ''} 
                  onValueChange={(v) => updateSection('pregnancy_prenatal', 'planned', v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="planned-yes" />
                    <Label htmlFor="planned-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="planned-no" />
                    <Label htmlFor="planned-no">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Duração da Gestação (semanas)</Label>
                <Input
                  type="number"
                  value={anamnesis.pregnancy_prenatal.duration_weeks || ''}
                  onChange={(e) => updateSection('pregnancy_prenatal', 'duration_weeks', e.target.value)}
                  placeholder="Ex: 38"
                />
              </div>
              <div className="space-y-2">
                <Label>Acompanhamento Pré-natal</Label>
                <RadioGroup 
                  value={anamnesis.pregnancy_prenatal.prenatal_care || ''} 
                  onValueChange={(v) => updateSection('pregnancy_prenatal', 'prenatal_care', v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="completo" id="prenatal-complete" />
                    <Label htmlFor="prenatal-complete">Completo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parcial" id="prenatal-partial" />
                    <Label htmlFor="prenatal-partial">Parcial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nenhum" id="prenatal-none" />
                    <Label htmlFor="prenatal-none">Nenhum</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Intercorrências na Gestação</Label>
                <Textarea
                  value={anamnesis.pregnancy_prenatal.complications || ''}
                  onChange={(e) => updateSection('pregnancy_prenatal', 'complications', e.target.value)}
                  placeholder="Descreva quaisquer problemas durante a gestação..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Parto e Nascimento */}
        <TabsContent value="birth" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Baby className="w-4 h-4" />
                Parto e Nascimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Parto</Label>
                <RadioGroup 
                  value={anamnesis.birth.type || ''} 
                  onValueChange={(v) => updateSection('birth', 'type', v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="birth-normal" />
                    <Label htmlFor="birth-normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cesarea" id="birth-cesarea" />
                    <Label htmlFor="birth-cesarea">Cesárea</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="forceps" id="birth-forceps" />
                    <Label htmlFor="birth-forceps">Fórceps</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nascimento a Termo?</Label>
                  <RadioGroup 
                    value={anamnesis.birth.full_term || ''} 
                    onValueChange={(v) => updateSection('birth', 'full_term', v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="term-yes" />
                      <Label htmlFor="term-yes">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="term-no" />
                      <Label htmlFor="term-no">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Peso ao Nascer (g)</Label>
                  <Input
                    type="number"
                    value={anamnesis.birth.weight || ''}
                    onChange={(e) => updateSection('birth', 'weight', e.target.value)}
                    placeholder="Ex: 3200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chorou ao Nascer?</Label>
                  <RadioGroup 
                    value={anamnesis.birth.cried_at_birth || ''} 
                    onValueChange={(v) => updateSection('birth', 'cried_at_birth', v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="cried-yes" />
                      <Label htmlFor="cried-yes">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="cried-no" />
                      <Label htmlFor="cried-no">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>UTI Neonatal?</Label>
                  <RadioGroup 
                    value={anamnesis.birth.nicu || ''} 
                    onValueChange={(v) => updateSection('birth', 'nicu', v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="nicu-yes" />
                      <Label htmlFor="nicu-yes">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="nicu-no" />
                      <Label htmlFor="nicu-no">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Complicações ao Nascer</Label>
                <Textarea
                  value={anamnesis.birth.complications || ''}
                  onChange={(e) => updateSection('birth', 'complications', e.target.value)}
                  placeholder="Descreva quaisquer complicações no parto ou nascimento..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Desenvolvimento Neuropsicomotor */}
        <TabsContent value="motor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Baby className="w-4 h-4" />
                Desenvolvimento Neuropsicomotor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Marcos Motores</Label>
                <Textarea
                  value={anamnesis.neuropsychomotor.motor_milestones || ''}
                  onChange={(e) => updateSection('neuropsychomotor', 'motor_milestones', e.target.value)}
                  placeholder="Idade que sustentou a cabeça, sentou, engatinhou, andou..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Coordenação Motora Fina</Label>
                <Textarea
                  value={anamnesis.neuropsychomotor.fine_motor || ''}
                  onChange={(e) => updateSection('neuropsychomotor', 'fine_motor', e.target.value)}
                  placeholder="Pegar objetos, usar talheres, escrever, desenhar..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Observações Motoras</Label>
                <Textarea
                  value={anamnesis.neuropsychomotor.motor_observations || ''}
                  onChange={(e) => updateSection('neuropsychomotor', 'motor_observations', e.target.value)}
                  placeholder="Outras observações sobre desenvolvimento motor..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Desenvolvimento da Linguagem */}
        <TabsContent value="language" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Desenvolvimento da Linguagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Balbucio</Label>
                <Input
                  value={anamnesis.language_development.babbling || ''}
                  onChange={(e) => updateSection('language_development', 'babbling', e.target.value)}
                  placeholder="Idade e características do balbucio"
                />
              </div>
              <div className="space-y-2">
                <Label>Primeiras Palavras</Label>
                <Input
                  value={anamnesis.language_development.first_words || ''}
                  onChange={(e) => updateSection('language_development', 'first_words', e.target.value)}
                  placeholder="Idade e primeiras palavras"
                />
              </div>
              <div className="space-y-2">
                <Label>Frases Simples</Label>
                <Input
                  value={anamnesis.language_development.simple_sentences || ''}
                  onChange={(e) => updateSection('language_development', 'simple_sentences', e.target.value)}
                  placeholder="Idade que começou a formar frases"
                />
              </div>
              <div className="space-y-2">
                <Label>Avaliação Atual da Comunicação</Label>
                <Textarea
                  value={anamnesis.language_development.current_communication || ''}
                  onChange={(e) => updateSection('language_development', 'current_communication', e.target.value)}
                  placeholder="Como a criança se comunica atualmente..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Histórico de Fonoaudiologia</Label>
                <Textarea
                  value={anamnesis.language_development.speech_therapy_history || ''}
                  onChange={(e) => updateSection('language_development', 'speech_therapy_history', e.target.value)}
                  placeholder="Acompanhamento fonoaudiológico anterior ou atual..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Desenvolvimento Cognitivo */}
        <TabsContent value="cognitive" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Desenvolvimento Cognitivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Curiosidade</Label>
                <Textarea
                  value={anamnesis.cognitive_development.curiosity || ''}
                  onChange={(e) => updateSection('cognitive_development', 'curiosity', e.target.value)}
                  placeholder="Interesse por explorar, perguntas frequentes..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Atenção</Label>
                <Textarea
                  value={anamnesis.cognitive_development.attention || ''}
                  onChange={(e) => updateSection('cognitive_development', 'attention', e.target.value)}
                  placeholder="Capacidade de manter atenção, tempo de foco..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Reconhecimento de Conceitos</Label>
                <Textarea
                  value={anamnesis.cognitive_development.concept_recognition || ''}
                  onChange={(e) => updateSection('cognitive_development', 'concept_recognition', e.target.value)}
                  placeholder="Cores, formas, números, letras..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Dificuldades de Aprendizagem</Label>
                <Textarea
                  value={anamnesis.cognitive_development.learning_difficulties || ''}
                  onChange={(e) => updateSection('cognitive_development', 'learning_difficulties', e.target.value)}
                  placeholder="Áreas de dificuldade observadas..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. Desenvolvimento Social e Emocional */}
        <TabsContent value="social" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smile className="w-4 h-4" />
                Desenvolvimento Social e Emocional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Interação Social</Label>
                <Textarea
                  value={anamnesis.social_emotional.social_interaction || ''}
                  onChange={(e) => updateSection('social_emotional', 'social_interaction', e.target.value)}
                  placeholder="Como interage com outras crianças e adultos..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Brincar Simbólico</Label>
                <Textarea
                  value={anamnesis.social_emotional.symbolic_play || ''}
                  onChange={(e) => updateSection('social_emotional', 'symbolic_play', e.target.value)}
                  placeholder="Faz de conta, jogos imaginativos..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Afetividade</Label>
                <Textarea
                  value={anamnesis.social_emotional.affectivity || ''}
                  onChange={(e) => updateSection('social_emotional', 'affectivity', e.target.value)}
                  placeholder="Expressão de afeto, vínculos..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Comportamentos Observados</Label>
                <Textarea
                  value={anamnesis.social_emotional.observed_behaviors || ''}
                  onChange={(e) => updateSection('social_emotional', 'observed_behaviors', e.target.value)}
                  placeholder="Comportamentos específicos relevantes..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Reação à Frustração</Label>
                <Textarea
                  value={anamnesis.social_emotional.frustration_reaction || ''}
                  onChange={(e) => updateSection('social_emotional', 'frustration_reaction', e.target.value)}
                  placeholder="Como lida com frustração e limites..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. Autonomia e Rotina */}
        <TabsContent value="autonomy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="w-4 h-4" />
                Autonomia e Rotina
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alimentação</Label>
                <Textarea
                  value={anamnesis.autonomy_routine.feeding || ''}
                  onChange={(e) => updateSection('autonomy_routine', 'feeding', e.target.value)}
                  placeholder="Autonomia na alimentação, seletividade alimentar..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Controle Esfincteriano</Label>
                <Textarea
                  value={anamnesis.autonomy_routine.sphincter_control || ''}
                  onChange={(e) => updateSection('autonomy_routine', 'sphincter_control', e.target.value)}
                  placeholder="Desfralde, uso do banheiro..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Sono</Label>
                <Textarea
                  value={anamnesis.autonomy_routine.sleep || ''}
                  onChange={(e) => updateSection('autonomy_routine', 'sleep', e.target.value)}
                  placeholder="Rotina de sono, dificuldades..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 9. Saúde Geral */}
        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Saúde Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Doenças Prévias</Label>
                <Textarea
                  value={anamnesis.general_health.previous_diseases || ''}
                  onChange={(e) => updateSection('general_health', 'previous_diseases', e.target.value)}
                  placeholder="Doenças, internações, cirurgias..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Uso de Medicação</Label>
                <Textarea
                  value={anamnesis.general_health.medications || ''}
                  onChange={(e) => updateSection('general_health', 'medications', e.target.value)}
                  placeholder="Medicamentos em uso atual..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Diagnósticos Médicos</Label>
                <Textarea
                  value={anamnesis.general_health.medical_diagnoses || ''}
                  onChange={(e) => updateSection('general_health', 'medical_diagnoses', e.target.value)}
                  placeholder="Diagnósticos formais recebidos..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Acompanhamentos Profissionais</Label>
                <Textarea
                  value={anamnesis.general_health.professional_followups || ''}
                  onChange={(e) => updateSection('general_health', 'professional_followups', e.target.value)}
                  placeholder="Terapeutas, médicos, especialistas..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 10/11. Observações e Queixa */}
        <TabsContent value="observations" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Queixa Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={anamnesis.main_complaint}
                onChange={(e) => setAnamnesis(prev => ({ ...prev, main_complaint: e.target.value }))}
                placeholder="Relato do responsável sobre a principal preocupação ou motivo da consulta..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Observações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={anamnesis.general_observations}
                onChange={(e) => setAnamnesis(prev => ({ ...prev, general_observations: e.target.value }))}
                placeholder="Observações adicionais do profissional..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resumo Gerado */}
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Resumo Clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {anamnesis.generated_summary ? (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Resumo</h4>
                    <p className="text-sm text-muted-foreground">
                      {anamnesis.generated_summary.summary}
                    </p>
                  </div>

                  {anamnesis.generated_summary.attention_points && 
                   anamnesis.generated_summary.attention_points.length > 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        Pontos de Atenção
                      </h4>
                      <ul className="text-sm space-y-1">
                        {anamnesis.generated_summary.attention_points.map((point, i) => (
                          <li key={i} className="text-muted-foreground">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {anamnesis.generated_summary.development_areas && 
                   Object.keys(anamnesis.generated_summary.development_areas).length > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-medium mb-2">Áreas do Desenvolvimento</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(anamnesis.generated_summary.development_areas).map(([area, desc]) => (
                          <div key={area}>
                            <span className="font-medium">{area}:</span>
                            <span className="text-muted-foreground ml-1">{String(desc).substring(0, 50)}...</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-medium mb-2">Síntese Rápida</h4>
                    <p className="text-sm text-muted-foreground">
                      {anamnesis.generated_summary.quick_synthesis}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>O resumo será gerado automaticamente ao finalizar a anamnese.</p>
                  <p className="text-sm mt-2">
                    Clique em "Finalizar" para gerar o resumo clínico estruturado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
