import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, Brain } from 'lucide-react';

interface ClassStats {
  totalStudents: number;
  activeToday: number;
  averageAccuracy: number;
  totalSessions: number;
  studentsNeedingAttention: number;
  avgPlayTimeMinutes: number;
  cognitiveScores: {
    attention: number;
    memory: number;
    language: number;
    executive: number;
  };
}

interface TeacherClassStatsProps {
  stats: ClassStats;
  className?: string;
}

export function TeacherClassStats({ stats, className }: TeacherClassStatsProps) {
  const getCognitiveColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCognitiveProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={className}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Alunos</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs">Ativos Hoje</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activeToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Precisão Média</span>
            </div>
            <p className="text-2xl font-bold">{stats.averageAccuracy.toFixed(0)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Brain className="h-4 w-4" />
              <span className="text-xs">Sessões Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs">Precisam Atenção</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.studentsNeedingAttention}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgPlayTimeMinutes}min</p>
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Perfil Cognitivo da Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Atenção</span>
                <span className={`text-sm font-medium ${getCognitiveColor(stats.cognitiveScores.attention)}`}>
                  {stats.cognitiveScores.attention}%
                </span>
              </div>
              <Progress 
                value={stats.cognitiveScores.attention} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Memória</span>
                <span className={`text-sm font-medium ${getCognitiveColor(stats.cognitiveScores.memory)}`}>
                  {stats.cognitiveScores.memory}%
                </span>
              </div>
              <Progress 
                value={stats.cognitiveScores.memory} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Linguagem</span>
                <span className={`text-sm font-medium ${getCognitiveColor(stats.cognitiveScores.language)}`}>
                  {stats.cognitiveScores.language}%
                </span>
              </div>
              <Progress 
                value={stats.cognitiveScores.language} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Executivo</span>
                <span className={`text-sm font-medium ${getCognitiveColor(stats.cognitiveScores.executive)}`}>
                  {stats.cognitiveScores.executive}%
                </span>
              </div>
              <Progress 
                value={stats.cognitiveScores.executive} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
