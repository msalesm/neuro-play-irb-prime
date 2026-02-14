import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, School, Users, UserPlus, Trash2 } from 'lucide-react';

interface ClassManagerProps {
  classes: Array<{ id: string; name: string; grade_level: string | null; school_year: string | null }>;
  selectedClassId: string | null;
  onClassCreated: (classId: string) => void;
}

export function ClassManager({ classes, selectedClassId, onClassCreated }: ClassManagerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [schoolYear, setSchoolYear] = useState(new Date().getFullYear().toString());
  const [studentName, setStudentName] = useState('');
  const [studentBirthDate, setStudentBirthDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateClass = async () => {
    if (!user || !className.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('school_classes')
        .insert({
          teacher_id: user.id,
          name: className.trim(),
          grade_level: gradeLevel.trim() || null,
          school_year: schoolYear.trim() || null,
        })
        .select('id')
        .single();
      if (error) throw error;
      toast.success('Turma criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['teacher-classes-edu'] });
      setCreateOpen(false);
      setClassName('');
      setGradeLevel('');
      if (data) onClassCreated(data.id);
    } catch (e) {
      toast.error('Erro ao criar turma: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStudent = async () => {
    if (!user || !selectedClassId || !studentName.trim() || !studentBirthDate) return;
    setSaving(true);
    try {
      // Create child record first
      const { data: child, error: childError } = await supabase
        .from('children')
        .insert({
          name: studentName.trim(),
          birth_date: studentBirthDate,
          parent_id: null, // Teacher-created, no parent yet
        })
        .select('id')
        .single();
      if (childError) throw childError;

      // Link to class
      const { error: linkError } = await supabase
        .from('class_students')
        .insert({
          class_id: selectedClassId,
          child_id: child.id,
          teacher_id: user.id,
        });
      if (linkError) throw linkError;

      toast.success(`${studentName} adicionado à turma!`);
      queryClient.invalidateQueries({ queryKey: ['class-students-edu'] });
      setAddStudentOpen(false);
      setStudentName('');
      setStudentBirthDate('');
    } catch (e) {
      toast.error('Erro ao adicionar aluno: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nova Turma
        </Button>
        {selectedClassId && (
          <Button onClick={() => setAddStudentOpen(true)} variant="outline" size="sm" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            Adicionar Aluno
          </Button>
        )}
      </div>

      {/* Create Class Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Criar Nova Turma
            </DialogTitle>
            <DialogDescription>Preencha os dados da turma</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Turma *</Label>
              <Input
                value={className}
                onChange={e => setClassName(e.target.value)}
                placeholder="Ex: Turma 3ºA"
              />
            </div>
            <div>
              <Label>Série/Ano</Label>
              <Input
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
                placeholder="Ex: 3º Ano"
              />
            </div>
            <div>
              <Label>Ano Letivo</Label>
              <Input
                value={schoolYear}
                onChange={e => setSchoolYear(e.target.value)}
                placeholder="2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateClass} disabled={saving || !className.trim()}>
              {saving ? 'Criando...' : 'Criar Turma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Aluno
            </DialogTitle>
            <DialogDescription>Cadastre um novo aluno na turma</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Aluno *</Label>
              <Input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={studentBirthDate}
                onChange={e => setStudentBirthDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddStudent} disabled={saving || !studentName.trim() || !studentBirthDate}>
              {saving ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
