import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertTriangle, Plus, Clock, User, FileText, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Occurrence {
  id: string;
  child_id: string;
  child_name: string;
  category: string;
  description: string;
  severity: string;
  created_at: string;
  resolved: boolean;
}

const categories = [
  { value: 'behavioral', label: 'Comportamental' },
  { value: 'social', label: 'Social' },
  { value: 'emotional', label: 'Emocional' },
  { value: 'academic', label: 'Acadêmico' },
  { value: 'sensory', label: 'Sensorial' },
];

const severityOptions = [
  { value: 'low', label: 'Leve', color: 'bg-info/10 text-info' },
  { value: 'medium', label: 'Moderado', color: 'bg-warning/10 text-warning' },
  { value: 'high', label: 'Grave', color: 'bg-destructive/10 text-destructive' },
];

export function SchoolOccurrences() {
  const { user } = useAuth();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [selectedChild, setSelectedChild] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch students from teacher's classes
      const { data: classData } = await supabase
        .from('school_classes')
        .select('id')
        .eq('teacher_id', user.id);

      const classIds = classData?.map(c => c.id) || [];
      
      if (classIds.length > 0) {
        const { data: studentData } = await supabase
          .from('class_students')
          .select('child_id, children(id, name)')
          .in('class_id', classIds)
          .eq('is_active', true);

        const uniqueStudents = new Map<string, { id: string; name: string }>();
        studentData?.forEach((s: any) => {
          if (s.children) {
            uniqueStudents.set(s.child_id, { id: s.child_id, name: s.children.name });
          }
        });
        setStudents(Array.from(uniqueStudents.values()));
      }

      // Fetch occurrences
      const { data: occData } = await supabase
        .from('school_occurrences')
        .select('*, children(name)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setOccurrences(
        (occData || []).map((o: any) => ({
          id: o.id,
          child_id: o.child_id,
          child_name: o.children?.name || 'Aluno',
          category: o.occurrence_type || 'behavioral',
          description: o.description,
          severity: o.severity || 'medium',
          created_at: o.created_at,
          resolved: o.follow_up_needed || false,
        }))
      );
    } catch (error) {
      console.error('Error fetching occurrences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild || !category || !description.trim() || !user) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('school_occurrences').insert({
        child_id: selectedChild,
        teacher_id: user.id,
        occurrence_type: category,
        severity,
        description: description.trim(),
        title: `${categories.find(c => c.value === category)?.label || category} - ${new Date().toLocaleDateString('pt-BR')}`,
        occurred_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Ocorrência registrada!');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving occurrence:', error);
      toast.error('Erro ao registrar ocorrência');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedChild('');
    setCategory('');
    setSeverity('medium');
    setDescription('');
  };

  const toggleResolved = async (id: string, resolved: boolean) => {
    try {
      await supabase.from('school_occurrences').update({ follow_up_needed: !resolved }).eq('id', id);
      setOccurrences(prev => prev.map(o => o.id === id ? { ...o, resolved: !resolved } : o));
    } catch (error) {
      console.error(error);
    }
  };

  const getSeverityBadge = (sev: string) => {
    const opt = severityOptions.find(s => s.value === sev);
    return <Badge className={opt?.color || ''}>{opt?.label || sev}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Ocorrências Escolares
            </CardTitle>
            <CardDescription>Registre e acompanhe ocorrências dos alunos</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Ocorrência
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Ocorrência</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Descreva a ocorrência..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                />

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!selectedChild || !category || !description.trim() || saving}
                >
                  {saving ? 'Salvando...' : 'Registrar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : occurrences.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma ocorrência registrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {occurrences.map(occ => (
                <div
                  key={occ.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    occ.resolved ? 'bg-muted/30 opacity-60' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{occ.child_name}</span>
                      {getSeverityBadge(occ.severity)}
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.value === occ.category)?.label || occ.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleResolved(occ.id, occ.resolved)}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${occ.resolved ? 'text-success' : 'text-muted-foreground/30'}`}
                      />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{occ.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(occ.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
