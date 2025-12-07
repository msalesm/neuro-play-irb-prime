import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Brain,
  Users,
  Target
} from 'lucide-react';

interface StudentProgress {
  id: string;
  name: string;
  sessionsCount: number;
  avgAccuracy: number;
  trend: 'up' | 'down' | 'stable';
  needsAttention: boolean;
  strengths: string[];
  challenges: string[];
}

interface ClassPedagogicalReportProps {
  classId: string;
  className: string;
  students: StudentProgress[];
  classStats: {
    totalSessions: number;
    avgAccuracy: number;
    activeStudents: number;
    totalStudents: number;
  };
}

export function ClassPedagogicalReport({ 
  classId, 
  className, 
  students, 
  classStats 
}: ClassPedagogicalReportProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDFReport = async () => {
    try {
      setGenerating(true);

      // Create report data
      const reportData = {
        className,
        generatedAt: new Date().toISOString(),
        summary: {
          totalStudents: classStats.totalStudents,
          activeStudents: classStats.activeStudents,
          totalSessions: classStats.totalSessions,
          avgAccuracy: classStats.avgAccuracy,
        },
        studentsNeedingAttention: students.filter(s => s.needsAttention),
        topPerformers: students
          .filter(s => s.avgAccuracy >= 80)
          .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
          .slice(0, 5),
        recommendations: generateRecommendations(students, classStats),
      };

      // Create downloadable JSON report (PDF would require additional library)
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-pedagogico-${className.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Relatório pedagógico gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  const generateRecommendations = (students: StudentProgress[], stats: typeof classStats) => {
    const recommendations: string[] = [];

    const lowAccuracyCount = students.filter(s => s.avgAccuracy < 50).length;
    if (lowAccuracyCount > 0) {
      recommendations.push(`${lowAccuracyCount} aluno(s) com precisão abaixo de 50% - considerar intervenção individualizada`);
    }

    const inactiveCount = stats.totalStudents - stats.activeStudents;
    if (inactiveCount > 0) {
      recommendations.push(`${inactiveCount} aluno(s) inativos - verificar engajamento e possíveis barreiras`);
    }

    if (stats.avgAccuracy < 60) {
      recommendations.push('Média geral abaixo do esperado - revisar estratégias pedagógicas');
    }

    const attentionCount = students.filter(s => 
      s.challenges.some(c => c.toLowerCase().includes('atenção'))
    ).length;
    if (attentionCount >= students.length * 0.3) {
      recommendations.push('Alto índice de dificuldades com atenção - implementar pausas ativas e atividades curtas');
    }

    if (recommendations.length === 0) {
      recommendations.push('Turma com bom desempenho geral - manter estratégias atuais');
    }

    return recommendations;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
  };

  const needsAttentionStudents = students.filter(s => s.needsAttention);
  const topPerformers = students
    .filter(s => s.avgAccuracy >= 70)
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Pedagógico
            </CardTitle>
            <CardDescription>Análise de desempenho da turma {className}</CardDescription>
          </div>
          <Button onClick={generatePDFReport} disabled={generating}>
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="attention">
              Atenção ({needsAttentionStudents.length})
            </TabsTrigger>
            <TabsTrigger value="performers">Destaques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{classStats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Alunos</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{classStats.activeStudents}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <Brain className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{classStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessões</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <Target className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{classStats.avgAccuracy.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Precisão Média</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recomendações</h4>
              <ul className="space-y-2">
                {generateRecommendations(students, classStats).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="attention" className="mt-4">
            {needsAttentionStudents.length > 0 ? (
              <div className="space-y-3">
                {needsAttentionStudents.map((student) => (
                  <div key={student.id} className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">{student.name}</span>
                      </div>
                      <Badge variant="outline" className="text-amber-700">
                        {student.avgAccuracy.toFixed(0)}%
                      </Badge>
                    </div>
                    {student.challenges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {student.challenges.map((challenge, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {challenge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum aluno necessitando atenção especial</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performers" className="mt-4">
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.map((student, idx) => (
                  <div key={student.id} className="p-3 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">#{idx + 1}</span>
                        <span className="font-medium">{student.name}</span>
                        {getTrendIcon(student.trend)}
                      </div>
                      <Badge className="bg-green-500">{student.avgAccuracy.toFixed(0)}%</Badge>
                    </div>
                    {student.strengths.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {student.strengths.map((strength, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs text-green-700">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum destaque ainda neste período</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
