import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Brain, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Target,
  Star,
  Clock,
  Users,
  Award,
  ChevronRight,
  Lightbulb,
  HeartHandshake
} from 'lucide-react';
import { useEducationalSystem } from '@/hooks/useEducationalSystem';
import { UnifiedScoreDisplay } from './UnifiedScoreDisplay';

export function EducationalDashboard() {
  const { 
    learningTrails, 
    neurodiversityProfile, 
    recentSessions, 
    getOverallProgress,
    loading 
  } = useEducationalSystem();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const totalXP = learningTrails.reduce((sum, trail) => sum + trail.total_xp, 0);
  const completedSessions = recentSessions.length;
  const averageScore = recentSessions.length > 0 
    ? recentSessions.reduce((sum, s) => {
        const perfData = s.performance_data as any;
        return sum + (perfData?.accuracy || 0);
      }, 0) / recentSessions.length
    : 0;

  const getStreakData = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const todaySessions = recentSessions.filter(s => 
      new Date(s.created_at).toDateString() === today
    );
    const yesterdaySessions = recentSessions.filter(s => 
      new Date(s.created_at).toDateString() === yesterday
    );
    
    return {
      current: todaySessions.length > 0 ? 1 + (yesterdaySessions.length > 0 ? 1 : 0) : 0,
      best: Math.max(1, completedSessions)
    };
  };

  const streakData = getStreakData();

  return (
    <div className="space-y-6">
      {/* Header with Overall Progress */}
      <Card className="gradient-playful text-white shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <GraduationCap className="w-7 h-7" />
                Meu Aprendizado
              </h1>
              <p className="text-white/90 text-sm">
                Acompanhe seu crescimento educacional e conquistas
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(overallProgress)}%</div>
              <div className="text-white/80 text-sm">Progresso Geral</div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={overallProgress} className="h-3 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{totalXP}</div>
            <div className="text-xs text-muted-foreground">Experiência Total</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-600">{completedSessions}</div>
            <div className="text-xs text-muted-foreground">Atividades Concluídas</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{Math.round(averageScore)}%</div>
            <div className="text-xs text-muted-foreground">Desempenho Médio</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-600">{streakData.current}</div>
            <div className="text-xs text-muted-foreground">Sequência Atual</div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Trails */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Trilhas de Aprendizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {learningTrails.map((trail) => {
            const progress = (trail.total_xp / (trail.current_level * 100)) * 100;
            
            return (
              <div key={trail.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{trail.cognitive_category}</h4>
                    <Badge variant="outline">
                      Nível {trail.current_level}
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, progress)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{trail.completed_exercises} exercícios</span>
                    <span>{trail.total_xp} XP</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Neurodiversity Profile */}
      {neurodiversityProfile && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-purple-500" />
              Perfil de Aprendizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Perfil de Aprendizado</h5>
                <Badge variant="secondary" className="capitalize">
                  {neurodiversityProfile.detected_conditions ? 'Identificado' : 'Descobrindo...'}
                </Badge>
              </div>
              <div>
                <h5 className="font-medium mb-2">Condições Detectadas</h5>
                <div className="flex flex-wrap gap-1">
                  {neurodiversityProfile.detected_conditions && 
                   Object.keys(neurodiversityProfile.detected_conditions as object).length > 0 ? (
                    Object.entries(neurodiversityProfile.detected_conditions as object).map(([condition, confidence]) => (
                      <Badge key={condition} variant="outline" className="text-xs">
                        {condition}: {Math.round(confidence as number)}%
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Em análise...
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {neurodiversityProfile.adaptive_strategies && 
             Object.keys(neurodiversityProfile.adaptive_strategies as object).length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Estratégias Adaptativas</h5>
                <div className="space-y-2">
                  {Object.entries(neurodiversityProfile.adaptive_strategies as object).slice(0, 3).map(([strategy, details], index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{strategy}: {String(details)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h5 className="font-medium">{session.game_type}</h5>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Nível {session.level}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.completed ? 'Concluído' : 'Em progresso'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                Comece sua jornada de aprendizado!
              </p>
              <Button className="mt-3">
                Explorar Jogos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}