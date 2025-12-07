import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, UserPlus, Loader2, User, Calendar } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  birth_date: string;
  conditions: string[];
}

interface AddStudentToClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onStudentAdded: () => void;
  existingStudentIds: string[];
}

export function AddStudentToClassModal({
  open,
  onOpenChange,
  classId,
  onStudentAdded,
  existingStudentIds,
}: AddStudentToClassModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Child[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  // New student form
  const [newStudent, setNewStudent] = useState({
    name: '',
    birth_date: '',
  });
  const [creating, setCreating] = useState(false);

  const searchChildren = async () => {
    if (searchQuery.length < 2) return;

    try {
      setSearching(true);

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .not('id', 'in', `(${existingStudentIds.join(',') || '00000000-0000-0000-0000-000000000000'})`)
        .limit(10);

      if (error) throw error;

      setSearchResults(
        (data || []).map((child) => ({
          id: child.id,
          name: child.name,
          birth_date: child.birth_date,
          conditions: Array.isArray(child.neurodevelopmental_conditions)
            ? (child.neurodevelopmental_conditions as unknown[]).filter((c): c is string => typeof c === 'string')
            : [],
        }))
      );
    } catch (error) {
      console.error('Error searching children:', error);
      toast.error('Erro ao buscar alunos');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchChildren();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addExistingStudent = async (childId: string) => {
    if (!user) return;

    try {
      setAdding(childId);

      const { error } = await supabase.from('class_students').insert({
        class_id: classId,
        child_id: childId,
        teacher_id: user.id,
      });

      if (error) throw error;

      toast.success('Aluno adicionado à turma!');
      onStudentAdded();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Erro ao adicionar aluno');
    } finally {
      setAdding(null);
    }
  };

  const createAndAddStudent = async () => {
    if (!user || !newStudent.name || !newStudent.birth_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setCreating(true);

      // Create child without parent (teacher-initiated)
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          name: newStudent.name,
          birth_date: newStudent.birth_date,
          parent_id: null, // No parent linked yet
        })
        .select()
        .single();

      if (childError) throw childError;

      // Add to class
      const { error: classError } = await supabase.from('class_students').insert({
        class_id: classId,
        child_id: childData.id,
        teacher_id: user.id,
      });

      if (classError) throw classError;

      toast.success('Aluno cadastrado e adicionado à turma!');
      onStudentAdded();
      setNewStudent({ name: '', birth_date: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Erro ao cadastrar aluno');
    } finally {
      setCreating(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Aluno à Turma</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Buscar Existente</TabsTrigger>
            <TabsTrigger value="new">Novo Cadastro</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.map((child) => (
                  <Card key={child.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{child.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{calculateAge(child.birth_date)} anos</span>
                              {child.conditions.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{child.conditions.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addExistingStudent(child.id)}
                          disabled={adding === child.id}
                        >
                          {adding === child.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum aluno encontrado
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Digite pelo menos 2 caracteres para buscar
              </p>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="student-name">Nome do Aluno *</Label>
                <Input
                  id="student-name"
                  placeholder="Nome completo"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="student-birth">Data de Nascimento *</Label>
                <Input
                  id="student-birth"
                  type="date"
                  value={newStudent.birth_date}
                  onChange={(e) => setNewStudent({ ...newStudent, birth_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={createAndAddStudent} disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar e Adicionar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
