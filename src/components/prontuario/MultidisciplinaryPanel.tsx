import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Heart, Brain, BookOpen, 
  AlertTriangle, TrendingUp, Activity,
  Clock, Target, Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MultidisciplinaryPanelProps {
  childId: string;
  userRole: 'parent' | 'therapist' | 'teacher';
}

export const MultidisciplinaryPanel = ({ childId, userRole }: MultidisciplinaryPanelProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['multidisciplinary-data', childId, userRole],
    queryFn: async () => {
      // Fetch role-specific data
      const [sessions, checkIns, insights] = await Promise.all([
        supabase.from('game_sessions').select('*').limit(50),
        supabase.from('emotional_checkins').select('*').limit(30),
        supabase.from('behavioral_insights').select('*').limit(20)
      ]);

      const gameSessions = sessions.data || [];
      const emotionalCheckIns = checkIns.data || [];
      const behavioralInsights = insights.data || [];

      // Calculate metrics based on role
      const avgAccuracy = gameSessions.length > 0
        ? gameSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / gameSessions.length
        : 0;

      const avgMood = emotionalCheckIns.length > 0
        ? emotionalCheckIns.reduce((acc, c) => acc + (c.mood_rating || 3), 0) / emotionalCheckIns.length
        : 3;

      const focusScore = gameSessions.length > 0
        ? gameSessions.filter(s => (s.accuracy_percentage || 0) > 70).length / gameSessions.length * 100
        : 0;

      return {
        sessions: gameSessions,
        checkIns: emotionalCheckIns,
        insights: behavioralInsights,
        metrics: {
          avgAccuracy,
          avgMood,
          focusScore,
          totalSessions: gameSessions.length,
          alertCount: behavioralInsights.filter(i => i.severity === 'high').length
        }
      };
    },
    enabled: !!childId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.metrics;

  // Parent View - Focus on mood, routine, daily engagement
  const ParentView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Humor Médio</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.avgMood.toFixed(1)}/5</div>
            <Progress value={(metrics?.avgMood || 0) * 20} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Engajamento</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.totalSessions}</div>
            <p className="text-xs text-muted-foreground">sessões esta semana</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Progresso</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.avgAccuracy.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">precisão média</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Alertas</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.alertCount || 0}</div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dicas para os Pais</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <span>Mantenha uma rotina consistente de sono</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <span>Celebre pequenas conquistas diariamente</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
              <span>Observe padrões de humor e comportamento</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  // Therapist View - Focus on cognitive functions, clinical insights
  const TherapistView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Funções Executivas</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.avgAccuracy.toFixed(0)}%</div>
            <Progress value={metrics?.avgAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Controle Inibitório</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.focusScore.toFixed(0)}%</div>
            <Progress value={metrics?.focusScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Tempo de Reação</span>
            </div>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">média em ms</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Alertas Clínicos</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.alertCount || 0}</div>
            <Badge variant="destructive" className="mt-1">
              {(metrics?.alertCount || 0) > 0 ? 'Ação necessária' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights Comportamentais</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.insights && data.insights.length > 0 ? (
            <div className="space-y-3">
              {data.insights.slice(0, 5).map((insight, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{insight.title}</span>
                    <Badge variant={
                      insight.severity === 'high' ? 'destructive' :
                      insight.severity === 'medium' ? 'secondary' : 'outline'
                    }>
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum insight comportamental registrado ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Teacher View - Focus on attention, classroom behavior
  const TeacherView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Foco</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.focusScore.toFixed(0)}%</div>
            <Progress value={metrics?.focusScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Participação</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.totalSessions}</div>
            <p className="text-xs text-muted-foreground">atividades completadas</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Comportamento</span>
            </div>
            <div className="text-2xl font-bold">
              {(metrics?.alertCount || 0) === 0 ? 'Bom' : 'Atenção'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recomendações para Sala de Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <span>Posicione o aluno próximo ao professor</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <span>Use instruções claras e diretas</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
              <span>Ofereça pausas regulares durante atividades longas</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Painel Multidisciplinar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={userRole}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="parent">
              <Heart className="h-4 w-4 mr-2" />
              Pais
            </TabsTrigger>
            <TabsTrigger value="therapist">
              <Brain className="h-4 w-4 mr-2" />
              Terapeuta
            </TabsTrigger>
            <TabsTrigger value="teacher">
              <BookOpen className="h-4 w-4 mr-2" />
              Professor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parent" className="mt-4">
            <ParentView />
          </TabsContent>

          <TabsContent value="therapist" className="mt-4">
            <TherapistView />
          </TabsContent>

          <TabsContent value="teacher" className="mt-4">
            <TeacherView />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
