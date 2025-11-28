import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, FileText, AlertCircle, MessageSquare, Plus, Loader2, Calendar, TrendingUp } from 'lucide-react';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const occurrenceSchema = z.object({
  occurrence_type: z.enum(['behavioral', 'academic', 'social', 'positive']),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  title: z.string().min(3, 'Título muito curto').max(100),
  description: z.string().min(10, 'Descrição muito curta').max(1000),
  intervention_taken: z.string().optional(),
  follow_up_needed: z.boolean().default(false),
  occurred_at: z.string(),
});

type OccurrenceFormData = z.infer<typeof occurrenceSchema>;

interface StudentData {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  conditions: string[];
  birth_date: string;
}

interface Occurrence {
  id: string;
  occurrence_type: string;
  severity?: string;
  title: string;
  description: string;
  intervention_taken?: string;
  follow_up_needed: boolean;
  occurred_at: string;
  created_at: string;
}

export default function TeacherStudentView() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      occurrence_type: 'behavioral',
      severity: 'medium',
      title: '',
      description: '',
      intervention_taken: '',
      follow_up_needed: false,
      occurred_at: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (user && studentId) {
      loadStudentData();
    }
  }, [user, studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Load student data
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', studentId)
        .single();

      if (childError) throw childError;

      const birthDate = new Date(childData.birth_date);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      setStudent({
        id: childData.id,
        name: childData.name,
        age,
        avatar_url: childData.avatar_url,
        conditions: Array.isArray(childData.neurodevelopmental_conditions)
          ? (childData.neurodevelopmental_conditions as unknown[]).filter((c): c is string => typeof c === 'string')
          : [],
        birth_date: childData.birth_date,
      });

      // Load occurrences
      const { data: occurrencesData, error: occurrencesError } = await supabase
        .from('school_occurrences')
        .select('*')
        .eq('child_id', studentId)
        .order('occurred_at', { ascending: false });

      if (occurrencesError) throw occurrencesError;

      setOccurrences(occurrencesData || []);
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOccurrence = async (data: OccurrenceFormData) => {
    if (!user || !studentId) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('school_occurrences')
        .insert({
          child_id: studentId,
          teacher_id: user.id,
          occurrence_type: data.occurrence_type,
          severity: data.severity || null,
          title: data.title,
          description: data.description,
          intervention_taken: data.intervention_taken || null,
          follow_up_needed: data.follow_up_needed,
          occurred_at: data.occurred_at,
        });

      if (error) throw error;

      toast.success('Ocorrência registrada com sucesso!');
      setShowOccurrenceModal(false);
      form.reset();
      loadStudentData();
    } catch (error) {
      console.error('Error creating occurrence:', error);
      toast.error('Erro ao registrar ocorrência');
    } finally {
      setSubmitting(false);
    }
  };

  const getOccurrenceTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      behavioral: { label: 'Comportamental', className: 'bg-yellow-500/10 text-yellow-700' },
      academic: { label: 'Acadêmico', className: 'bg-blue-500/10 text-blue-700' },
      social: { label: 'Social', className: 'bg-purple-500/10 text-purple-700' },
      positive: { label: 'Positivo', className: 'bg-green-500/10 text-green-700' },
    };
    return types[type] || types.behavioral;
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    const severities: Record<string, { label: string; className: string }> = {
      low: { label: 'Baixa', className: 'bg-green-500/10 text-green-700' },
      medium: { label: 'Média', className: 'bg-yellow-500/10 text-yellow-700' },
      high: { label: 'Alta', className: 'bg-red-500/10 text-red-700' },
    };
    const sev = severities[severity];
    return sev ? <Badge className={sev.className}>{sev.label}</Badge> : null;
  };

  if (loading || !student) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Student Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ChildAvatarDisplay avatar={student.avatar_url} name={student.name} size="lg" />
                <div>
                  <h1 className="text-3xl font-bold">{student.name}</h1>
                  <p className="text-muted-foreground">{student.age} anos</p>
                  {student.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {student.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="secondary">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pei" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pei">PEI Escolar</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="occurrences">Ocorrências</TabsTrigger>
            <TabsTrigger value="communication">Comunicação</TabsTrigger>
          </TabsList>

          {/* PEI Tab */}
          <TabsContent value="pei" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Plano Educacional Individualizado</CardTitle>
                    <CardDescription>Estratégias e acomodações para o aluno</CardDescription>
                  </div>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Editar PEI
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Estratégias Sugeridas</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <span className="text-sm">Tempo adicional para atividades escritas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <span className="text-sm">Instruções apresentadas de forma visual e verbal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <span className="text-sm">Ambiente com menos estímulos visuais</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Acomodações</h3>
                  <div className="grid gap-3">
                    <Badge variant="outline" className="justify-start">
                      Avaliações adaptadas
                    </Badge>
                    <Badge variant="outline" className="justify-start">
                      Material em formato alternativo
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Progresso por Trilha</CardTitle>
                <CardDescription>Visão simplificada do desempenho do aluno</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Atenção Sustentada</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <Badge variant="secondary">75%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memória de Trabalho</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                      <Badge variant="secondary">60%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processamento Fonológico</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <Badge variant="secondary">82%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Occurrences Tab */}
          <TabsContent value="occurrences" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Ocorrências Escolares</CardTitle>
                    <CardDescription>Registros de comportamento e desempenho</CardDescription>
                  </div>
                  <Dialog open={showOccurrenceModal} onOpenChange={setShowOccurrenceModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Ocorrência
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitOccurrence)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="occurrence_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo *</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="behavioral">Comportamental</SelectItem>
                                      <SelectItem value="academic">Acadêmico</SelectItem>
                                      <SelectItem value="social">Social</SelectItem>
                                      <SelectItem value="positive">Positivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="severity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gravidade</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="low">Baixa</SelectItem>
                                      <SelectItem value="medium">Média</SelectItem>
                                      <SelectItem value="high">Alta</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="occurred_at"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Descreva brevemente a ocorrência" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Descreva o que aconteceu..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="intervention_taken"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Intervenção Realizada</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Quais ações foram tomadas?"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowOccurrenceModal(false)}
                              disabled={submitting}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Registrar
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {occurrences.length > 0 ? (
                    occurrences.map((occ) => {
                      const typeInfo = getOccurrenceTypeBadge(occ.occurrence_type);
                      return (
                        <Card key={occ.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex gap-2">
                                <Badge className={typeInfo.className}>{typeInfo.label}</Badge>
                                {getSeverityBadge(occ.severity)}
                                {occ.follow_up_needed && (
                                  <Badge variant="outline">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Acompanhamento
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(occ.occurred_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <h4 className="font-semibold mb-1">{occ.title}</h4>
                            <p className="text-sm text-muted-foreground">{occ.description}</p>
                            {occ.intervention_taken && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-semibold mb-1">Intervenção:</p>
                                <p className="text-xs text-muted-foreground">{occ.intervention_taken}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma ocorrência registrada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>Comunicação Escola-Família-Terapeuta</CardTitle>
                <CardDescription>
                  Canal de comunicação para acompanhamento integrado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sistema de mensagens em breve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}
