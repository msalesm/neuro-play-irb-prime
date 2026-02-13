import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  School, Users, AlertTriangle, CheckCircle2, Clock, 
  ClipboardCheck, Eye, ChevronRight, UserCheck
} from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClassStudent {
  id: string;
  child_id: string;
  children: { id: string; name: string; birth_date: string; avatar_url: string | null };
}

interface ObservationData {
  participation: number;
  behavior_change: number;
  social_isolation: number;
  aggressiveness: number;
  focus_difficulty: number;
  performance_drop: number;
  persistent_sadness: number;
  notes: string;
}

const DEFAULT_OBSERVATION: ObservationData = {
  participation: 1, behavior_change: 1, social_isolation: 1,
  aggressiveness: 1, focus_difficulty: 1, performance_drop: 1,
  persistent_sadness: 1, notes: '',
};

const CHECKLIST_ITEMS = [
  { key: 'participation', label: 'Participação em sala', icon: '🗣️' },
  { key: 'behavior_change', label: 'Mudança de comportamento', icon: '🔄' },
  { key: 'social_isolation', label: 'Isolamento social', icon: '🧍' },
  { key: 'aggressiveness', label: 'Agressividade', icon: '⚡' },
  { key: 'focus_difficulty', label: 'Dificuldade de foco', icon: '🎯' },
  { key: 'performance_drop', label: 'Queda de rendimento', icon: '📉' },
  { key: 'persistent_sadness', label: 'Tristeza persistente', icon: '😢' },
] as const;

const LEVEL_LABELS = [
  { value: 1, label: 'Adequado', color: 'bg-emerald-500' },
  { value: 2, label: 'Atenção', color: 'bg-amber-500' },
  { value: 3, label: 'Prioridade', color: 'bg-red-500' },
];

function getRiskColor(level: string | null) {
  if (level === 'high') return 'text-red-600 bg-red-50 border-red-200';
  if (level === 'moderate') return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
}

function getRiskLabel(level: string | null) {
  if (level === 'high') return 'Prioridade';
  if (level === 'moderate') return 'Atenção';
  return 'Adequado';
}

export default function EducacaoDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(null);
  const [observation, setObservation] = useState<ObservationData>(DEFAULT_OBSERVATION);

  const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekLabel = `${format(currentWeek, "dd/MM", { locale: ptBR })} – ${format(addDays(currentWeek, 6), "dd/MM", { locale: ptBR })}`;

  // Fetch teacher's classes
  const { data: classes = [] } = useQuery({
    queryKey: ['teacher-classes-edu', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('school_classes')
        .select('id, name, grade_level, school_year')
        .eq('teacher_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Auto-select first class
  React.useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Fetch students of selected class
  const { data: students = [] } = useQuery({
    queryKey: ['class-students-edu', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      const { data, error } = await supabase
        .from('class_students')
        .select('id, child_id, children!class_students_child_id_fkey(id, name, birth_date, avatar_url)')
        .eq('class_id', selectedClassId)
        .eq('is_active', true);
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        child_id: d.child_id,
        children: d.children,
      })) as ClassStudent[];
    },
    enabled: !!selectedClassId,
  });

  // Fetch this week's observations for class
  const { data: observations = [] } = useQuery({
    queryKey: ['student-observations', selectedClassId, currentWeek.toISOString()],
    queryFn: async () => {
      if (!selectedClassId) return [];
      const { data, error } = await supabase
        .from('student_observations')
        .select('*')
        .eq('class_id', selectedClassId)
        .eq('observation_week', format(currentWeek, 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClassId,
  });

  // Compute class indicators
  const classIndicators = useMemo(() => {
    const total = students.length;
    if (total === 0) return { total: 0, observed: 0, low: 0, moderate: 0, high: 0 };
    const observed = observations.length;
    const low = observations.filter((o: any) => o.risk_level === 'low').length;
    const moderate = observations.filter((o: any) => o.risk_level === 'moderate').length;
    const high = observations.filter((o: any) => o.risk_level === 'high').length;
    return { total, observed, low, moderate, high };
  }, [students, observations]);

  // Build student list with observation status
  const studentList = useMemo(() => {
    return students.map(s => {
      const obs = observations.find((o: any) => o.child_id === s.child_id);
      return { ...s, observation: obs || null };
    }).sort((a, b) => {
      const riskOrder = (o: any) => {
        if (!o) return 2;
        if (o.risk_level === 'high') return 0;
        if (o.risk_level === 'moderate') return 1;
        return 3;
      };
      return riskOrder(a.observation) - riskOrder(b.observation);
    });
  }, [students, observations]);

  // Save observation mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent || !selectedClassId || !user) throw new Error('Missing data');
      const payload = {
        class_id: selectedClassId,
        child_id: selectedStudent.child_id,
        teacher_id: user.id,
        observation_week: format(currentWeek, 'yyyy-MM-dd'),
        ...observation,
      };
      const { error } = await supabase
        .from('student_observations')
        .upsert(payload, { onConflict: 'class_id,child_id,observation_week' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Observação registrada!');
      queryClient.invalidateQueries({ queryKey: ['student-observations'] });
      setCheckinOpen(false);
      setSelectedStudent(null);
      setObservation(DEFAULT_OBSERVATION);
    },
    onError: (e) => toast.error('Erro ao salvar: ' + (e as Error).message),
  });

  const openCheckin = (student: ClassStudent) => {
    setSelectedStudent(student);
    const existing = observations.find((o: any) => o.child_id === student.child_id) as any;
    if (existing) {
      setObservation({
        participation: existing.participation,
        behavior_change: existing.behavior_change,
        social_isolation: existing.social_isolation,
        aggressiveness: existing.aggressiveness,
        focus_difficulty: existing.focus_difficulty,
        performance_drop: existing.performance_drop,
        persistent_sadness: existing.persistent_sadness,
        notes: existing.notes || '',
      });
    } else {
      setObservation(DEFAULT_OBSERVATION);
    }
    setCheckinOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-3xl mx-auto px-4 pt-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <School className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Neuro Play Educação</h1>
          </div>
          <p className="text-sm text-muted-foreground">Painel da Turma • Semana {weekLabel}</p>
        </div>

        {/* Class selector */}
        {classes.length > 1 && (
          <div className="mb-4">
            <Select value={selectedClassId || ''} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Selecionar turma" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} – {c.grade_level} ({c.school_year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {classes.length === 0 && (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <School className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhuma turma atribuída a você.</p>
              <p className="text-xs text-muted-foreground mt-1">Peça ao administrador para vincular suas turmas.</p>
            </CardContent>
          </Card>
        )}

        {selectedClassId && (
          <>
            {/* Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <Users className="h-7 w-7 text-primary shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">{classIndicators.total}</p>
                    <p className="text-xs text-muted-foreground">Alunos</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">{classIndicators.observed}</p>
                    <p className="text-xs text-muted-foreground">Observados</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <Eye className="h-7 w-7 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">{classIndicators.moderate}</p>
                    <p className="text-xs text-muted-foreground">Atenção</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-7 w-7 text-red-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">{classIndicators.high}</p>
                    <p className="text-xs text-muted-foreground">Prioridade</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress bar */}
            <Card className="mb-6 border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso do check-in semanal</span>
                  <span className="text-sm text-muted-foreground">
                    {classIndicators.observed}/{classIndicators.total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: classIndicators.total > 0 ? `${(classIndicators.observed / classIndicators.total) * 100}%` : '0%' }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Student list */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Lista de Alunos
                </CardTitle>
                <CardDescription>Toque em um aluno para registrar a observação semanal</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {studentList.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum aluno matriculado nesta turma.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {studentList.map((student) => {
                      const obs = student.observation as any;
                      const hasObs = !!obs;
                      return (
                        <button
                          key={student.id}
                          onClick={() => openCheckin(student)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {student.children.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{student.children.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {hasObs ? `Registrado em ${format(new Date(obs.updated_at || obs.created_at), "dd/MM HH:mm")}` : 'Aguardando check-in'}
                            </p>
                          </div>
                          {hasObs ? (
                            <Badge variant="outline" className={`${getRiskColor(obs.risk_level)} shrink-0`}>
                              {getRiskLabel(obs.risk_level)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-dashed shrink-0">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Check-in Dialog */}
        <Dialog open={checkinOpen} onOpenChange={setCheckinOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Check-in: {selectedStudent?.children.name}
              </DialogTitle>
              <DialogDescription>
                Semana {weekLabel} • Toque para alterar o nível
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {CHECKLIST_ITEMS.map(item => {
                const value = observation[item.key as keyof ObservationData] as number;
                return (
                  <div key={item.key} className="space-y-1.5">
                    <span className="text-sm font-medium">
                      {item.icon} {item.label}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {LEVEL_LABELS.map(level => (
                        <button
                          key={level.value}
                          onClick={() => setObservation(prev => ({ ...prev, [item.key]: level.value }))}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all ${
                            value === level.value
                              ? `${level.color} text-white border-transparent scale-105`
                              : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">📝 Observações (opcional)</label>
                <Textarea
                  value={observation.notes}
                  onChange={e => setObservation(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Anotações sobre o aluno nesta semana..."
                  rows={3}
                />
              </div>

              <p className="text-[10px] text-muted-foreground leading-tight">
                ⚠️ Ferramenta de apoio educacional. Não substitui avaliação clínica profissional.
              </p>

              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="w-full"
                size="lg"
              >
                {saveMutation.isPending ? 'Salvando...' : 'Registrar Observação'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
