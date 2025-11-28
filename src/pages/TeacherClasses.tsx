import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, Plus, Users, GraduationCap, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const classSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  grade_level: z.string().optional(),
  school_year: z.string().optional(),
  description: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface SchoolClass {
  id: string;
  name: string;
  grade_level?: string;
  school_year?: string;
  description?: string;
  student_count: number;
}

export default function TeacherClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      grade_level: '',
      school_year: new Date().getFullYear().toString(),
      description: '',
    },
  });

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(classes);
    }
  }, [searchQuery, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Load classes
      const { data: classesData, error: classesError } = await supabase
        .from('school_classes')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;

      // Count students per class
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return {
            id: cls.id,
            name: cls.name,
            grade_level: cls.grade_level,
            school_year: cls.school_year,
            description: cls.description,
            student_count: count || 0,
          };
        })
      );

      setClasses(classesWithCounts);
      setFilteredClasses(classesWithCounts);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClassFormData) => {
    if (!user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('school_classes')
        .insert({
          teacher_id: user.id,
          name: data.name,
          grade_level: data.grade_level || null,
          school_year: data.school_year || null,
          description: data.description || null,
        });

      if (error) throw error;

      toast.success('Turma criada com sucesso!');
      setShowAddModal(false);
      form.reset();
      loadClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Erro ao criar turma');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Minhas Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie suas turmas e acompanhe o progresso dos alunos
          </p>
        </div>

        {/* Search & Add */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar turma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Turma
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Turma</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Turma *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 3º Ano A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Série/Ano</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 3º Ano" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="school_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ano Letivo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 2025" {...field} />
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
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input placeholder="Informações adicionais..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddModal(false)}
                          disabled={submitting}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Criar Turma
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Classes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((schoolClass) => (
              <Card
                key={schoolClass.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/teacher/class/${schoolClass.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <GraduationCap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{schoolClass.name}</CardTitle>
                        {schoolClass.grade_level && (
                          <p className="text-sm text-muted-foreground">{schoolClass.grade_level}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {schoolClass.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {schoolClass.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{schoolClass.student_count} alunos</span>
                    </div>
                    {schoolClass.school_year && (
                      <Badge variant="secondary">{schoolClass.school_year}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma turma encontrada</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente buscar com outros termos' : 'Crie sua primeira turma para começar'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernPageLayout>
  );
}
