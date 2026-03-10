import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scan, Play, Square, Copy, Users, CheckCircle2, 
  Clock, AlertTriangle, Brain, BookOpen, Eye, Puzzle
} from 'lucide-react';
import { toast } from 'sonner';
import { useClassroomScan } from '@/hooks/useClassroomScan';
import { ScanResults } from './ScanResults';

interface ClassroomScanProps {
  classId: string | null;
  className?: string;
  students: { child_id: string; children: { id: string; name: string } }[];
}

export function ClassroomScan({ classId, className, students }: ClassroomScanProps) {
  const {
    activeSession,
    studentResults,
    scanHistory,
    createSession,
    startSession,
    completeSession,
    cancelSession,
    subscribeToSession,
  } = useClassroomScan(classId);

  // Subscribe to realtime when session is active
  useEffect(() => {
    if (activeSession?.id && activeSession.status === 'active') {
      const unsub = subscribeToSession(activeSession.id);
      return unsub;
    }
  }, [activeSession?.id, activeSession?.status]);

  const completedCount = studentResults.filter(r => r.status === 'completed').length;
  const playingCount = studentResults.filter(r => r.status === 'playing').length;
  const totalCount = studentResults.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleCreate = () => {
    const mapped = students.map(s => ({
      child_id: s.child_id,
      name: s.children.name,
    }));
    createSession.mutate(mapped);
  };

  const copyCode = () => {
    if (activeSession?.session_code) {
      navigator.clipboard.writeText(activeSession.session_code);
      toast.success('Código copiado!');
    }
  };

  // Show completed session results
  const lastCompleted = scanHistory[0];

  if (!classId) return null;

  return (
    <div className="space-y-4">
      {/* Active Session or Start Button */}
      {!activeSession ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Scan className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg">Classroom Cognitive Scan</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Avalie toda a turma em 5–7 minutos. Gera perfil cognitivo automático.
                </p>
              </div>
              <Button 
                onClick={handleCreate}
                disabled={createSession.isPending || students.length === 0}
                size="lg"
                className="gap-2 shrink-0"
              >
                <Play className="h-4 w-4" />
                Iniciar Triagem
              </Button>
            </div>
            {students.length === 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Adicione alunos à turma para iniciar a triagem.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scan className="h-5 w-5 text-primary" />
                Triagem em Andamento
              </CardTitle>
              <Badge variant={activeSession.status === 'active' ? 'default' : 'secondary'}>
                {activeSession.status === 'waiting' ? 'Aguardando' : 'Em progresso'}
              </Badge>
            </div>
            <CardDescription>{className} • {totalCount} alunos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Session Code */}
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Código da Sessão</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-mono font-bold tracking-[0.3em] text-primary">
                  {activeSession.session_code}
                </span>
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Alunos acessam <span className="font-medium">neuroplay.app/join</span>
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{completedCount}/{totalCount} concluídos</span>
              </div>
              <Progress value={progress} className="h-3" />
              {playingCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {playingCount} aluno(s) jogando agora...
                </p>
              )}
            </div>

            {/* Student Status Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {studentResults.map(sr => (
                <div
                  key={sr.id}
                  className={`p-2 rounded-lg text-center text-xs transition-all ${
                    sr.status === 'completed'
                      ? 'bg-chart-3/10 text-chart-3'
                      : sr.status === 'playing'
                      ? 'bg-primary/10 text-primary animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  title={sr.student_name}
                >
                  <div className="font-medium truncate">
                    {sr.student_name.split(' ')[0]}
                  </div>
                  {sr.status === 'completed' && <CheckCircle2 className="h-3 w-3 mx-auto mt-0.5" />}
                  {sr.status === 'playing' && <Brain className="h-3 w-3 mx-auto mt-0.5" />}
                  {sr.status === 'waiting' && <Clock className="h-3 w-3 mx-auto mt-0.5" />}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {activeSession.status === 'waiting' && (
                <Button onClick={() => startSession.mutate()} className="flex-1 gap-2">
                  <Play className="h-4 w-4" />
                  Liberar Acesso
                </Button>
              )}
              {activeSession.status === 'active' && completedCount === totalCount && totalCount > 0 && (
                <Button onClick={() => completeSession.mutate()} className="flex-1 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar Triagem
                </Button>
              )}
              {activeSession.status === 'active' && completedCount > 0 && completedCount < totalCount && (
                <Button onClick={() => completeSession.mutate()} variant="outline" className="flex-1 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar ({completedCount} de {totalCount})
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => cancelSession.mutate()}
                className="text-destructive hover:text-destructive"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Results */}
      {lastCompleted && !activeSession && (
        <ScanResults session={lastCompleted} />
      )}

      {/* History */}
      {scanHistory.length > 1 && !activeSession && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Histórico de Triagens</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {scanHistory.slice(1).map(scan => {
                const results = scan.class_results as any;
                return (
                  <div key={scan.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(scan.completed_at!).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.students_completed} alunos avaliados
                      </p>
                    </div>
                    {results?.avg_attention && (
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" /> {results.avg_attention}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" /> {results.avg_memory}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
