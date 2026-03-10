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
import { Search, UserPlus, Loader2, User, Calendar, Upload, FileText, AlertCircle } from 'lucide-react';

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

  // CSV import
  const [csvData, setCsvData] = useState<Array<{ name: string; birth_date: string }>>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

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

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    setCsvData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          setCsvError('O arquivo deve conter pelo menos um cabeçalho e uma linha de dados.');
          return;
        }

        const header = lines[0].toLowerCase().replace(/\s/g, '');
        if (!header.includes('nome') && !header.includes('name')) {
          setCsvError('Cabeçalho deve conter "nome" e "data_nascimento". Ex: nome,data_nascimento');
          return;
        }

        const parsed: Array<{ name: string; birth_date: string }> = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 2 || !cols[0]) continue;
          
          // Try to parse date
          let dateStr = cols[1];
          // Handle dd/mm/yyyy format
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [d, m, y] = dateStr.split('/');
            dateStr = `${y}-${m}-${d}`;
          }
          
          if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            setCsvError(`Linha ${i + 1}: data inválida "${cols[1]}". Use AAAA-MM-DD ou DD/MM/AAAA.`);
            return;
          }

          parsed.push({ name: cols[0], birth_date: dateStr });
        }

        if (parsed.length === 0) {
          setCsvError('Nenhum aluno válido encontrado no arquivo.');
          return;
        }

        setCsvData(parsed);
      } catch {
        setCsvError('Erro ao processar o arquivo CSV.');
      }
    };
    reader.readAsText(file);
  };

  const importCsv = async () => {
    if (!user || csvData.length === 0) return;

    try {
      setImporting(true);
      let added = 0;

      for (const student of csvData) {
        const { data: childData, error: childError } = await supabase
          .from('children')
          .insert({ name: student.name, birth_date: student.birth_date, parent_id: null })
          .select('id')
          .single();
        if (childError) continue;

        const { error: linkError } = await supabase.from('class_students').insert({
          class_id: classId,
          child_id: childData.id,
          teacher_id: user.id,
        });
        if (!linkError) added++;
      }

      toast.success(`${added} aluno(s) importado(s) com sucesso!`);
      onStudentAdded();
      setCsvData([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Erro ao importar alunos');
    } finally {
      setImporting(false);
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Buscar</TabsTrigger>
            <TabsTrigger value="new">Novo</TabsTrigger>
            <TabsTrigger value="csv">Importar CSV</TabsTrigger>
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

          <TabsContent value="csv" className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                Faça upload de um arquivo CSV com os alunos
              </p>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleCsvUpload}
                className="max-w-xs mx-auto"
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1 flex items-center gap-1">
                <FileText className="h-3 w-3" /> Formato esperado:
              </p>
              <code className="block bg-background rounded p-2 mt-1">
                nome,data_nascimento{'\n'}
                Lucas Silva,2017-05-10{'\n'}
                Maria Costa,02/11/2016
              </code>
            </div>

            {csvError && (
              <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{csvError}</p>
              </div>
            )}

            {csvData.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {csvData.length} aluno(s) encontrado(s):
                </p>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {csvData.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2 text-sm">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.birth_date}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setCsvData([]); setCsvError(null); }}>
                    Limpar
                  </Button>
                  <Button onClick={importCsv} disabled={importing}>
                    {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Importar {csvData.length} aluno(s)
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
