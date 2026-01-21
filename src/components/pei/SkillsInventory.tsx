import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ClipboardList, Save, CheckCircle2, XCircle, 
  MinusCircle, FileDown, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  skillsInventoryCategories, 
  SkillCategory, 
  SkillResponse, 
  ResponseType,
  getTotalItems 
} from '@/data/skillsInventoryQuestions';

interface SkillsInventoryProps {
  childId: string;
  peiPlanId?: string;
  childName?: string;
  onComplete?: () => void;
}

interface StudentInfo {
  grade: string;
  shift: string;
  diagnosis: string;
  teacherName: string;
  caregiverName: string;
  aeeTeacherName: string;
  therapeuticCompanion: string;
  schoolYear: string;
}

export function SkillsInventory({ childId, peiPlanId, childName, onComplete }: SkillsInventoryProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inventoryId, setInventoryId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(skillsInventoryCategories[0].id);
  
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    grade: '',
    shift: '',
    diagnosis: '',
    teacherName: '',
    caregiverName: '',
    aeeTeacherName: '',
    therapeuticCompanion: '',
    schoolYear: new Date().getFullYear().toString(),
  });
  
  const [responses, setResponses] = useState<Record<string, SkillResponse[]>>({});
  const [notes, setNotes] = useState('');

  const totalItems = getTotalItems();

  useEffect(() => {
    if (childId) {
      loadExistingInventory();
    }
  }, [childId]);

  const loadExistingInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('skills_inventory')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setInventoryId(data.id);
        setStudentInfo({
          grade: data.grade || '',
          shift: data.shift || '',
          diagnosis: data.diagnosis || '',
          teacherName: data.teacher_name || '',
          caregiverName: data.caregiver_name || '',
          aeeTeacherName: data.aee_teacher_name || '',
          therapeuticCompanion: (data as any).therapeutic_companion || '',
          schoolYear: data.school_year || new Date().getFullYear().toString(),
        });
        setNotes(data.notes || '');

        // Load responses from each category
        const loadedResponses: Record<string, SkillResponse[]> = {};
        skillsInventoryCategories.forEach(cat => {
          const columnName = cat.id as keyof typeof data;
          const categoryData = data[columnName];
          if (categoryData && Array.isArray(categoryData)) {
            loadedResponses[cat.id] = categoryData as unknown as SkillResponse[];
          }
        });
        setResponses(loadedResponses);
      }
    } catch (error) {
      console.log('No existing inventory found');
    } finally {
      setLoading(false);
    }
  };

  const getResponseForItem = (categoryId: string, itemId: string): SkillResponse | undefined => {
    return responses[categoryId]?.find(r => r.itemId === itemId);
  };

  const setResponseForItem = (categoryId: string, itemId: string, response: ResponseType, observations?: string) => {
    setResponses(prev => {
      const categoryResponses = prev[categoryId] || [];
      const existingIndex = categoryResponses.findIndex(r => r.itemId === itemId);
      
      const newResponse: SkillResponse = {
        itemId,
        response,
        observations: observations ?? (existingIndex >= 0 ? categoryResponses[existingIndex].observations : ''),
      };

      if (existingIndex >= 0) {
        const updated = [...categoryResponses];
        updated[existingIndex] = newResponse;
        return { ...prev, [categoryId]: updated };
      } else {
        return { ...prev, [categoryId]: [...categoryResponses, newResponse] };
      }
    });
  };

  const setObservationForItem = (categoryId: string, itemId: string, observations: string) => {
    setResponses(prev => {
      const categoryResponses = prev[categoryId] || [];
      const existingIndex = categoryResponses.findIndex(r => r.itemId === itemId);
      
      if (existingIndex >= 0) {
        const updated = [...categoryResponses];
        updated[existingIndex] = { ...updated[existingIndex], observations };
        return { ...prev, [categoryId]: updated };
      } else {
        return { 
          ...prev, 
          [categoryId]: [...categoryResponses, { itemId, response: null, observations }] 
        };
      }
    });
  };

  const calculateStats = () => {
    let yesCount = 0;
    let noCount = 0;
    let partialCount = 0;
    let answeredCount = 0;

    Object.values(responses).forEach(categoryResponses => {
      categoryResponses.forEach(r => {
        if (r.response === 'yes') { yesCount++; answeredCount++; }
        else if (r.response === 'no') { noCount++; answeredCount++; }
        else if (r.response === 'partial') { partialCount++; answeredCount++; }
      });
    });

    return { yesCount, noCount, partialCount, answeredCount, completionPercentage: Math.round((answeredCount / totalItems) * 100) };
  };

  const getCategoryProgress = (categoryId: string): number => {
    const category = skillsInventoryCategories.find(c => c.id === categoryId);
    if (!category) return 0;
    
    const categoryResponses = responses[categoryId] || [];
    const answered = categoryResponses.filter(r => r.response !== null).length;
    return Math.round((answered / category.items.length) * 100);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Você precisa estar autenticado para salvar');
      return;
    }
    
    setSaving(true);
    try {
      const stats = calculateStats();
      
      const inventoryData: any = {
        child_id: childId || null,
        pei_plan_id: peiPlanId || null,
        assessor_id: user.id,
        school_year: studentInfo.schoolYear,
        grade: studentInfo.grade,
        shift: studentInfo.shift,
        diagnosis: studentInfo.diagnosis,
        teacher_name: studentInfo.teacherName,
        caregiver_name: studentInfo.caregiverName,
        aee_teacher_name: studentInfo.aeeTeacherName,
        therapeutic_companion: studentInfo.therapeuticCompanion,
        total_items: totalItems,
        yes_count: stats.yesCount,
        no_count: stats.noCount,
        partial_count: stats.partialCount,
        completion_percentage: stats.completionPercentage,
        status: stats.completionPercentage >= 100 ? 'completed' : 'in_progress',
        notes,
      };

      // Add each category's responses
      skillsInventoryCategories.forEach(cat => {
        inventoryData[cat.id] = responses[cat.id] || [];
      });

      if (inventoryId) {
        const { error } = await supabase
          .from('skills_inventory')
          .update(inventoryData)
          .eq('id', inventoryId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('skills_inventory')
          .insert(inventoryData)
          .select()
          .single();

        if (error) throw error;
        if (data) setInventoryId(data.id);
      }

      toast.success('Inventário salvo com sucesso!');
      if (stats.completionPercentage >= 100 && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast.error('Erro ao salvar inventário');
    } finally {
      setSaving(false);
    }
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando inventário...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Inventário de Habilidades</CardTitle>
                <CardDescription>
                  Avaliação pedagógica para {childName || 'aluno'}
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso geral</span>
              <span className="font-medium">{stats.completionPercentage}%</span>
            </div>
            <Progress value={stats.completionPercentage} className="h-2" />
            
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Sim: {stats.yesCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Não: {stats.noCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircle className="h-4 w-4 text-yellow-500" />
                <span>Parcial: {stats.partialCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identificação do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Série</Label>
              <Input 
                value={studentInfo.grade} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="Ex: 3º ano"
              />
            </div>
            <div>
              <Label>Turno</Label>
              <Input 
                value={studentInfo.shift} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, shift: e.target.value }))}
                placeholder="Ex: Manhã"
              />
            </div>
            <div>
              <Label>Ano Letivo</Label>
              <Input 
                value={studentInfo.schoolYear} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, schoolYear: e.target.value }))}
              />
            </div>
            <div>
              <Label>Laudo</Label>
              <Input 
                value={studentInfo.diagnosis} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Ex: TEA, TDAH..."
              />
            </div>
            <div>
              <Label>Professor(a) da Turma</Label>
              <Input 
                value={studentInfo.teacherName} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, teacherName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Cuidador(a)</Label>
              <Input 
                value={studentInfo.caregiverName} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, caregiverName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Professor(a) do AEE</Label>
              <Input 
                value={studentInfo.aeeTeacherName} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, aeeTeacherName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Acompanhante Terapêutico</Label>
              <Input 
                value={studentInfo.therapeuticCompanion} 
                onChange={(e) => setStudentInfo(prev => ({ ...prev, therapeuticCompanion: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Navigation + Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar Navigation */}
        <Card className="lg:w-64 lg:shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Áreas de Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] lg:h-[500px]">
              <div className="space-y-1 p-2">
                {skillsInventoryCategories.map((cat) => {
                  const progress = getCategoryProgress(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg transition-colors",
                        activeCategory === cat.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium leading-tight line-clamp-2">{cat.name}</span>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={progress} className="h-1 flex-1" />
                        <span className="text-xs">{progress}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Questions Content */}
        <Card className="flex-1 min-w-0">
          <CardHeader>
            {skillsInventoryCategories.find(c => c.id === activeCategory) && (
              <>
                <CardTitle className="text-lg">{skillsInventoryCategories.find(c => c.id === activeCategory)?.name}</CardTitle>
                <CardDescription>
                  Área: {skillsInventoryCategories.find(c => c.id === activeCategory)?.area}
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {skillsInventoryCategories
                  .find(c => c.id === activeCategory)?.items
                  .map((item, index) => {
                    const response = getResponseForItem(activeCategory, item.id);
                    return (
                      <div key={item.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-sm text-muted-foreground shrink-0">
                            {index + 1}.
                          </span>
                          <span className="text-sm font-medium">{item.text}</span>
                        </div>
                        
                        <RadioGroup
                          value={response?.response || ''}
                          onValueChange={(value) => setResponseForItem(activeCategory, item.id, value as ResponseType)}
                          className="flex items-center gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                            <Label htmlFor={`${item.id}-yes`} className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              Sim
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id={`${item.id}-no`} />
                            <Label htmlFor={`${item.id}-no`} className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                              Não
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="partial" id={`${item.id}-partial`} />
                            <Label htmlFor={`${item.id}-partial`} className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                              <MinusCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                              Parcialmente
                            </Label>
                          </div>
                        </RadioGroup>

                        <Input
                          placeholder="Observações..."
                          value={response?.observations || ''}
                          onChange={(e) => setObservationForItem(activeCategory, item.id, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anotações adicionais sobre o aluno..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
