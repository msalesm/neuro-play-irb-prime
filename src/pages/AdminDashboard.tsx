import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSystem, StudentData, StudentDetail } from '@/hooks/useAdminSystem';
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Bell,
  Download,
  UserPlus,
  UserMinus,
  Brain,
  Clock,
  Target,
  Star,
  Calendar,
  ChevronRight,
  Home,
  BarChart3,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    students,
    notifications,
    loading,
    isAdmin,
    isEducator,
    getStudentDetail,
    addStudentToEducator,
    removeStudentFromEducator,
    markNotificationAsRead,
    getAllStudents,
    exportStudentData
  } = useAdminSystem();

  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAllStudents();
    }
  }, [isAdmin]);

  const loadAllStudents = async () => {
    const data = await getAllStudents();
    setAllStudents(data);
  };

  const handleAddStudent = async () => {
    if (!newStudentEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira o email do estudante",
        variant: "destructive"
      });
      return;
    }

    const success = await addStudentToEducator(newStudentEmail);
    if (success) {
      toast({
        title: "Estudante adicionado",
        description: "O estudante foi vinculado com sucesso"
      });
      setNewStudentEmail('');
      setShowAddStudent(false);
    } else {
      toast({
        title: "Erro ao adicionar estudante",
        description: "Verifique se o email está correto",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    const success = await removeStudentFromEducator(studentId);
    if (success) {
      toast({
        title: "Estudante removido",
        description: "O vínculo foi removido com sucesso"
      });
    } else {
      toast({
        title: "Erro ao remover estudante",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  };

  const handleViewStudent = async (studentId: string) => {
    const detail = await getStudentDetail(studentId);
    setSelectedStudent(detail);
  };

  const handleExportData = async (studentId: string) => {
    const data = await exportStudentData(studentId);
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-data-${studentId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getProgressColor = (trend: string) => {
    switch (trend) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'needs_improvement': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressText = (trend: string) => {
    switch (trend) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'average': return 'Regular';
      case 'needs_improvement': return 'Precisa melhorar';
      default: return 'Sem dados';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para acessar o painel administrativo, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isEducator && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Negado</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área.
            </p>
            <Button asChild>
              <Link to="/">Ir para Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  const totalSessions = students.reduce((sum, s) => sum + s.total_sessions, 0);
  const avgAccuracy = students.length > 0 
    ? students.reduce((sum, s) => sum + s.avg_accuracy, 0) / students.length 
    : 0;
  const studentsNeedingAttention = students.filter(s => s.needs_attention).length;
  const unreadNotifications = notifications.filter(n => !n.read_at).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 pb-24">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Painel {isAdmin ? 'Administrativo' : 'do Educador'}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Visão geral de todos os estudantes' : 'Acompanhe o progresso dos seus estudantes'}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Início
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{students.length}</div>
                <div className="text-sm text-muted-foreground">Estudantes</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-sm text-muted-foreground">Sessões Totais</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{Math.round(avgAccuracy)}%</div>
                <div className="text-sm text-muted-foreground">Precisão Média</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{studentsNeedingAttention}</div>
                <div className="text-sm text-muted-foreground">Precisam Atenção</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Estudantes
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificações {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            {/* Add Student */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Gerenciar Estudantes
                  </CardTitle>
                  <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Adicionar Estudante
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Estudante</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Email do Estudante</label>
                          <Input
                            value={newStudentEmail}
                            onChange={(e) => setNewStudentEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                            type="email"
                          />
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddStudent}>
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Students List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {students.map((student) => (
                <Card key={student.student_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{student.student_name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getProgressColor(student.progress_trend)}>
                            {getProgressText(student.progress_trend)}
                          </Badge>
                          {student.needs_attention && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Atenção
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStudent(student.student_id)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportData(student.student_id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveStudent(student.student_id)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span>{student.total_sessions} sessões</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <span>{student.avg_accuracy}% precisão</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{student.total_xp} XP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>
                          {student.last_session_date 
                            ? new Date(student.last_session_date).toLocaleDateString('pt-BR')
                            : 'Nunca'
                          }
                        </span>
                      </div>
                    </div>
                    <Progress value={student.avg_accuracy} className="h-2 mt-3" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {students.length === 0 && (
              <Card className="p-8">
                <div className="text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum estudante encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece adicionando estudantes ao seu grupo
                  </p>
                  <Button onClick={() => setShowAddStudent(true)}>
                    Adicionar Primeiro Estudante
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card key={notification.id} className={`${notification.read_at ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString('pt-BR')}
                          </span>
                          {!notification.read_at && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-8">
                <div className="text-center">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                  <p className="text-muted-foreground">
                    Você receberá notificações sobre o progresso dos estudantes aqui
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['excellent', 'good', 'average', 'needs_improvement'].map((trend) => {
                      const count = students.filter(s => s.progress_trend === trend).length;
                      const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                      
                      return (
                        <div key={trend}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{getProgressText(trend)}</span>
                            <span>{count} estudantes</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {students
                      .filter(s => s.last_session_date)
                      .sort((a, b) => new Date(b.last_session_date!).getTime() - new Date(a.last_session_date!).getTime())
                      .slice(0, 5)
                      .map((student) => (
                        <div key={student.student_id} className="flex justify-between items-center">
                          <span className="text-sm">{student.student_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.last_session_date && new Date(student.last_session_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Perfil de {selectedStudent.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Performance Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedStudent.performance_metrics.total_xp}
                    </div>
                    <div className="text-sm text-muted-foreground">XP Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedStudent.performance_metrics.avg_accuracy}%
                    </div>
                    <div className="text-sm text-muted-foreground">Precisão Média</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedStudent.performance_metrics.total_sessions}
                    </div>
                    <div className="text-sm text-muted-foreground">Sessões</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedStudent.performance_metrics.active_days}
                    </div>
                    <div className="text-sm text-muted-foreground">Dias Ativos</div>
                  </div>
                </div>

                {/* Learning Trails */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trilhas de Aprendizado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.learning_trails.map((trail) => (
                        <div key={trail.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium capitalize">{trail.cognitive_category}</h4>
                            <Badge variant="outline">Nível {trail.current_level}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {trail.total_xp} XP • {trail.completed_exercises} exercícios
                          </div>
                          <Progress value={(trail.current_level / 10) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sessões Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedStudent.recent_sessions.slice(0, 10).map((session) => (
                        <div key={session.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{session.game_type}</div>
                            <div className="text-sm text-muted-foreground">
                              Nível {session.level} • {session.performance_data?.accuracy || 0}% precisão
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}