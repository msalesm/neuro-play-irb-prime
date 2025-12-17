import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePEI } from '@/hooks/usePEI';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, Target, Lightbulb, ClipboardCheck, 
  Plus, Save, TrendingUp, AlertCircle, ArrowLeft, FileDown 
} from 'lucide-react';
import { generatePEIPdf, getClassificationLabel, getDefaultBNCCSkills } from '@/lib/peiPdfGenerator';
import { toast } from 'sonner';
import { SkillsInventory } from '@/components/pei/SkillsInventory';

interface PEIGoal {
  id: string;
  area: string;
  objective: string;
  strategies: string[];
  timeline: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
}

interface PEIAccommodation {
  id: string;
  type: string;
  description: string;
  context: string;
}

export default function PEIView() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const screeningId = searchParams.get('screening');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentPlan, loading, getPEIByScreening, getPEIByUserId, getAllPEIsForUser, updatePEI, createPlan } = usePEI();
  
  const [goals, setGoals] = useState<PEIGoal[]>([]);
  const [accommodations, setAccommodations] = useState<PEIAccommodation[]>([]);
  const [newGoal, setNewGoal] = useState({
    area: '',
    objective: '',
    strategies: '',
    timeline: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadPEI();
  }, [user, screeningId, patientId]);

  const loadPEI = async () => {
    let plan = null;

    // If screeningId is provided, fetch by screening
    if (screeningId) {
      plan = await getPEIByScreening(screeningId);
    } 
    // If patientId is provided (therapist viewing patient), fetch by patient
    else if (patientId) {
      plan = await getPEIByUserId(patientId);
    }
    // Otherwise fetch for current user
    else if (user) {
      plan = await getPEIByUserId(user.id);
    }
    
    if (plan) {
      // Load goals and accommodations from plan with type safety
      const planGoals = Array.isArray(plan.goals) ? (plan.goals as unknown as PEIGoal[]) : [];
      const planAccommodations = Array.isArray(plan.accommodations) ? (plan.accommodations as unknown as PEIAccommodation[]) : [];
      
      setGoals(planGoals);
      setAccommodations(planAccommodations);
    } else {
      // No plan found - reset state
      setGoals([]);
      setAccommodations([]);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.area || !newGoal.objective) {
      toast.error('Preencha pelo menos a área e o objetivo');
      return;
    }

    const goal: PEIGoal = {
      id: Date.now().toString(),
      area: newGoal.area,
      objective: newGoal.objective,
      strategies: newGoal.strategies.split('\n').filter(s => s.trim()),
      timeline: newGoal.timeline,
      progress: 0,
      status: 'pending'
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);

    if (currentPlan) {
      await updatePEI(currentPlan.id, { goals: updatedGoals });
    }

    setNewGoal({ area: '', objective: '', strategies: '', timeline: '' });
    toast.success('Meta adicionada ao PEI');
  };

  const handleSavePEI = async () => {
    if (!currentPlan) return;

    await updatePEI(currentPlan.id, { 
      goals,
      accommodations 
    });
    
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'pending': return 'outline';
      default: return 'default';
    }
  };

const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Em Progresso';
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const handleExportPDF = () => {
    const totalScore = goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length / 10)
      : 5;

    // Generate BNCC skills for each goal area
    const allBnccSkills = goals.flatMap(goal => getDefaultBNCCSkills(goal.area));

    // Generate orientations text based on goals
    const orientationsText = goals.length > 0
      ? `O aluno apresenta perfil cognitivo com características específicas nas áreas de ${goals.map(g => g.area).join(', ')}. ` +
        `Recomenda-se acompanhamento contínuo com foco nas estratégias delineadas neste plano. ` +
        `Estimule a autonomia e o protagonismo nas atividades propostas, adaptando sempre que necessário às necessidades individuais.`
      : 'Aguardando definição de metas e objetivos para orientações específicas.';

    generatePEIPdf({
      studentInfo: {
        name: patientId || 'Aluno',
        age: undefined,
        grade: undefined,
        shift: undefined,
        institution: 'Neuro IRB Prime'
      },
      classification: getClassificationLabel(totalScore),
      totalScore,
      goals: goals as any,
      accommodations: accommodations as any,
      strategies: currentPlan?.strategies && Array.isArray(currentPlan.strategies) 
        ? currentPlan.strategies 
        : [],
      orientations: orientationsText,
      bnccSkills: allBnccSkills,
      progressNotes: currentPlan?.progress_notes
    });

    toast.success('PDF do PEI gerado com sucesso!');
  };

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8 text-muted-foreground">Carregando PEI...</div>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">PEI Inteligente</h1>
              <p className="text-muted-foreground">Plano Educacional Individualizado baseado em dados cognitivos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportPDF} className="text-foreground">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(!isEditing)} className="text-foreground">
              {isEditing ? 'Cancelar' : 'Editar PEI'}
            </Button>
            {isEditing && (
              <Button onClick={handleSavePEI}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {goals.filter(g => g.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {goals.length > 0 
                    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acomodações</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accommodations.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={currentPlan?.status === 'active' ? 'default' : 'secondary'}>
                  {currentPlan?.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="goals" className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="goals">Metas e Objetivos</TabsTrigger>
              <TabsTrigger value="skills">Inventário de Habilidades</TabsTrigger>
              <TabsTrigger value="accommodations">Acomodações</TabsTrigger>
              <TabsTrigger value="strategies">Estratégias</TabsTrigger>
              <TabsTrigger value="progress">Notas de Progresso</TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="space-y-4">
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhuma meta cadastrada ainda. Adicione a primeira meta abaixo.
                    </CardContent>
                  </Card>
                ) : (
                  goals.map(goal => (
                    <Card key={goal.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-primary" />
                              <CardTitle className="text-base">{goal.area}</CardTitle>
                              <Badge variant={getStatusColor(goal.status)}>
                                {getStatusLabel(goal.status)}
                              </Badge>
                            </div>
                            <CardDescription>{goal.objective}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {goal.strategies.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Estratégias:</h4>
                            <ul className="space-y-1">
                              {goal.strategies.map((strategy, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{strategy}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Prazo: </span>
                            <span className="font-medium">{goal.timeline || 'Não definido'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{goal.progress}%</div>
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Adicionar Nova Meta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="area">Área de Desenvolvimento</Label>
                      <Input
                        id="area"
                        placeholder="Ex: Atenção, Linguagem, Social..."
                        value={newGoal.area}
                        onChange={(e) => setNewGoal({ ...newGoal, area: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="objective">Objetivo</Label>
                      <Textarea
                        id="objective"
                        placeholder="Descreva o objetivo de forma clara e mensurável"
                        value={newGoal.objective}
                        onChange={(e) => setNewGoal({ ...newGoal, objective: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="strategies">Estratégias (uma por linha)</Label>
                      <Textarea
                        id="strategies"
                        placeholder="Liste as estratégias que serão utilizadas"
                        value={newGoal.strategies}
                        onChange={(e) => setNewGoal({ ...newGoal, strategies: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeline">Prazo</Label>
                      <Input
                        id="timeline"
                        placeholder="Ex: 3 meses, 6 semanas..."
                        value={newGoal.timeline}
                        onChange={(e) => setNewGoal({ ...newGoal, timeline: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleAddGoal} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Meta ao PEI
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="skills">
              <SkillsInventory 
                childId={patientId || ''} 
                peiPlanId={currentPlan?.id}
                childName={patientId}
              />
            </TabsContent>

            <TabsContent value="accommodations" className="space-y-4">
              {accommodations.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhuma acomodação cadastrada ainda.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accommodations.map(acc => (
                    <Card key={acc.id}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <CardTitle className="text-base">{acc.type}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{acc.description}</p>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 mt-0.5" />
                          <span>{acc.context}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {isEditing && (
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Acomodação
                </Button>
              )}
            </TabsContent>

            <TabsContent value="strategies">
              <Card>
                <CardHeader>
                  <CardTitle>Estratégias Terapêuticas Consolidadas</CardTitle>
                  <CardDescription>
                    Compilação de todas as estratégias recomendadas baseadas no perfil cognitivo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPlan?.strategies && Array.isArray(currentPlan.strategies) && currentPlan.strategies.length > 0 ? (
                    <ul className="space-y-2">
                      {currentPlan.strategies.map((strategy: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma estratégia consolidada ainda.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Notas de Progresso</CardTitle>
                  <CardDescription>
                    Registro de observações e evolução ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPlan?.progress_notes && Array.isArray(currentPlan.progress_notes) && currentPlan.progress_notes.length > 0 ? (
                    <div className="space-y-4">
                      {currentPlan.progress_notes.map((note: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                          <p className="text-sm text-muted-foreground">{note.date}</p>
                          <p className="text-sm mt-1">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma nota de progresso registrada ainda.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ModernPageLayout>
  );
}
