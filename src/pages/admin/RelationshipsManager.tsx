import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Baby, 
  Stethoscope, 
  GraduationCap, 
  Plus, 
  Trash2,
  RefreshCw,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useParentChildRelationships, 
  useTherapistPatientRelationships,
  useTeacherStudentRelationships 
} from '@/hooks/useRelationships';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RelationshipsManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    children, 
    loading: loadingChildren, 
    refresh: refreshChildren,
    removeChild 
  } = useParentChildRelationships();

  const { 
    patients, 
    loading: loadingPatients, 
    refresh: refreshPatients,
    removePatient 
  } = useTherapistPatientRelationships();

  const { 
    students, 
    loading: loadingStudents, 
    refresh: refreshStudents,
    removeStudentFromClass 
  } = useTeacherStudentRelationships();

  const handleRemoveChild = async (id: string) => {
    const { error } = await removeChild(id);
    if (error) {
      toast({ title: 'Erro', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Vínculo desativado' });
    }
  };

  const handleRemovePatient = async (id: string) => {
    const { error } = await removePatient(id);
    if (error) {
      toast({ title: 'Erro', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Vínculo desativado' });
    }
  };

  const handleRemoveStudent = async (id: string) => {
    const { error } = await removeStudentFromClass(id);
    if (error) {
      toast({ title: 'Erro', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Vínculo desativado' });
    }
  };

  const filteredChildren = children.filter(c => 
    c.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.parent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(p => 
    p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.therapist_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Gerenciador de Relacionamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie vínculos entre pais, terapeutas, professores e crianças
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="parent-child" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="parent-child" className="flex items-center gap-2">
              <Baby className="h-4 w-4" />
              <span className="hidden sm:inline">Pais-Filhos</span>
              <Badge variant="secondary" className="ml-1">{children.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="therapist-patient" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Terapeuta-Paciente</span>
              <Badge variant="secondary" className="ml-1">{patients.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="teacher-student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Professor-Aluno</span>
              <Badge variant="secondary" className="ml-1">{students.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Parent-Child Tab */}
          <TabsContent value="parent-child">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vínculos Pai/Mãe - Filho</CardTitle>
                  <CardDescription>Relacionamentos entre responsáveis e crianças</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshChildren}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {loadingChildren ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredChildren.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum vínculo encontrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredChildren.map(child => (
                      <div 
                        key={child.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Baby className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{child.child_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {child.parent_name || 'Responsável'} • {child.relationship_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {format(new Date(child.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveChild(child.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Therapist-Patient Tab */}
          <TabsContent value="therapist-patient">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vínculos Terapeuta - Paciente</CardTitle>
                  <CardDescription>Acesso de profissionais a pacientes</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshPatients}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {loadingPatients ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum vínculo encontrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredPatients.map(patient => (
                      <div 
                        key={patient.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">{patient.patient_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Dr(a). {patient.therapist_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={patient.access_level === 'full' ? 'default' : 'secondary'}>
                            {patient.access_level === 'full' ? 'Completo' : 'Leitura'}
                          </Badge>
                          <Badge variant="outline">
                            {format(new Date(patient.granted_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemovePatient(patient.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teacher-Student Tab */}
          <TabsContent value="teacher-student">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vínculos Professor - Aluno</CardTitle>
                  <CardDescription>Alunos matriculados em turmas</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshStudents}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {loadingStudents ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum vínculo encontrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map(student => (
                      <div 
                        key={student.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{student.student_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.class_name} {student.grade_level && `• ${student.grade_level}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{student.class_name}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Baby className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{children.length}</p>
                  <p className="text-sm text-muted-foreground">Vínculos Familiares</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{patients.length}</p>
                  <p className="text-sm text-muted-foreground">Vínculos Terapêuticos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Vínculos Escolares</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
