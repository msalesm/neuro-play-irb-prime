import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Activity, Clock, Target, ChevronRight, 
  Gamepad2, Brain, AlertCircle, UserPlus, GraduationCap, BookOpen
} from 'lucide-react';
import { useTeacherStudentProgress, StudentProgress, ClassWithStudents } from '@/hooks/useTeacherStudentProgress';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeacherStudentSectionProps {
  onViewDetails?: (studentId: string) => void;
  onAddStudent?: (classId: string) => void;
}

export function TeacherStudentSection({ onViewDetails, onAddStudent }: TeacherStudentSectionProps) {
  const { classes, allStudents, loading } = useTeacherStudentProgress();
  const [selectedClass, setSelectedClass] = useState<string>('all');

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const displayStudents = selectedClass === 'all' 
    ? allStudents 
    : classes.find(c => c.id === selectedClass)?.students || [];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Progresso dos Alunos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma turma cadastrada</p>
          </div>
        ) : (
          <>
            {/* Class Tabs */}
            <Tabs value={selectedClass} onValueChange={setSelectedClass} className="mb-4">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">
                  Todos ({allStudents.length})
                </TabsTrigger>
                {classes.map((cls) => (
                  <TabsTrigger key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Class Summary */}
            {selectedClass !== 'all' && (
              <div className="mb-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {classes.find(c => c.id === selectedClass)?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {classes.find(c => c.id === selectedClass)?.gradeLevel} • 
                      {classes.find(c => c.id === selectedClass)?.schoolYear}
                    </p>
                  </div>
                  {onAddStudent && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onAddStudent(selectedClass)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Aluno
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Students List */}
            <div className="space-y-4">
              {displayStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum aluno nesta turma</p>
                </div>
              ) : (
                displayStudents.map((student) => (
                  <StudentCard 
                    key={student.id} 
                    student={student} 
                    formatPlayTime={formatPlayTime}
                    onViewDetails={onViewDetails}
                  />
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface StudentCardProps {
  student: StudentProgress;
  formatPlayTime: (seconds: number) => string;
  onViewDetails?: (studentId: string) => void;
}

function StudentCard({ student, formatPlayTime, onViewDetails }: StudentCardProps) {
  const needsAttention = student.totalSessions === 0 || 
    (student.lastActivity && new Date(student.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  return (
    <div className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {student.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{student.name}</h3>
              {needsAttention && (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">{student.age} anos</span>
              <Badge variant="outline" className="text-xs">
                {student.className}
              </Badge>
              {student.conditions.map((condition, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
            {student.lastActivity && (
              <span className="text-xs text-muted-foreground">
                Última atividade: {formatDistanceToNow(new Date(student.lastActivity), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            )}
          </div>
        </div>
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails(student.childId)}
          >
            Ver detalhes
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-background/50">
          <Gamepad2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{student.totalSessions}</p>
          <p className="text-xs text-muted-foreground">Sessões</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{student.avgAccuracy}%</p>
          <p className="text-xs text-muted-foreground">Precisão</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{formatPlayTime(student.totalPlayTime)}</p>
          <p className="text-xs text-muted-foreground">Tempo</p>
        </div>
      </div>

      {/* Cognitive Scores */}
      {(student.cognitiveScores.attention > 0 || student.cognitiveScores.memory > 0) && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Perfil Cognitivo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {student.cognitiveScores.attention > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Atenção</span>
                <span className="font-medium">{student.cognitiveScores.attention}%</span>
              </div>
            )}
            {student.cognitiveScores.memory > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Memória</span>
                <span className="font-medium">{student.cognitiveScores.memory}%</span>
              </div>
            )}
            {student.cognitiveScores.language > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Linguagem</span>
                <span className="font-medium">{student.cognitiveScores.language}%</span>
              </div>
            )}
            {student.cognitiveScores.executive > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Executivo</span>
                <span className="font-medium">{student.cognitiveScores.executive}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Games */}
      {student.recentGames.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividades Recentes
          </p>
          <div className="space-y-2">
            {student.recentGames.slice(0, 3).map((game, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded bg-background/30 text-sm"
              >
                <span className="font-medium">{game.game_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{game.accuracy}%</span>
                  <Badge variant="outline" className="text-xs">
                    {game.score} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {student.avgAccuracy > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-medium">{student.avgAccuracy}%</span>
          </div>
          <Progress value={student.avgAccuracy} className="h-2" />
        </div>
      )}
    </div>
  );
}
