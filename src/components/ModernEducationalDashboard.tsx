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
  HeartHandshake,
  Zap,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UnifiedScoreDisplay } from './UnifiedScoreDisplay';

export function ModernEducationalDashboard() {
  // Mock data for demonstration - this will be connected to real data later
  const mockData = {
    overallProgress: 68,
    totalXP: 2450,
    completedSessions: 23,
    averageScore: 82,
    currentStreak: 5,
    
    learningTrails: [
      { id: '1', name: 'Memória', progress: 75, level: 3, xp: 450, icon: '🧠', color: 'gradient-memory' },
      { id: '2', name: 'Atenção', progress: 60, level: 2, xp: 380, icon: '🎯', color: 'gradient-focus' },
      { id: '3', name: 'Lógica', progress: 85, level: 4, xp: 520, icon: '🧩', color: 'gradient-problem' },
      { id: '4', name: 'Linguagem', progress: 45, level: 2, xp: 290, icon: '📚', color: 'gradient-language' },
      { id: '5', name: 'Matemática', progress: 70, level: 3, xp: 410, icon: '🔢', color: 'gradient-math' },
      { id: '6', name: 'Social', progress: 55, level: 2, xp: 310, icon: '👥', color: 'gradient-social' },
    ],
    
    recentActivities: [
      { game: 'Memória Colorida', date: 'Hoje', score: 89, xp: 45 },
      { game: 'Foco Floresta', date: 'Ontem', score: 76, xp: 38 },
      { game: 'Lógica Rápida', date: '2 dias atrás', score: 92, xp: 52 },
    ],
    
    achievements: [
      { name: 'Primeiro Nível', icon: '🏆', earned: true },
      { name: 'Concentração', icon: '🎯', earned: true },
      { name: 'Memória Expert', icon: '🧠', earned: false },
      { name: 'Social Star', icon: '⭐', earned: false },
    ],
    
    neurodiversityProfile: {
      detectedConditions: { 'TDAH': 65, 'Ansiedade': 30 },
      adaptiveStrategies: {
        'Pausas Frequentes': 'Recomendado para manter atenção',
        'Feedback Visual': 'Ajuda na compreensão',
        'Gamificação': 'Aumenta motivação'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="gradient-playful text-white shadow-glow overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <CardContent className="p-8 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <GraduationCap className="w-8 h-8" />
                Meu Aprendizado
              </h1>
              <p className="text-white/90">
                Descubra como seu cérebro está crescendo! 🌟
              </p>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>📚 {mockData.completedSessions} atividades</span>
                <span>🔥 {mockData.currentStreak} dias seguidos</span>
                <span>⚡ {mockData.totalXP} XP total</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">
                {mockData.overallProgress}%
              </div>
              <div className="text-white/80 text-sm">Progresso Geral</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Seu progresso educacional</span>
              <span>Nível Hábil 🎓</span>
            </div>
            <Progress value={mockData.overallProgress} className="h-3 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card hover:shadow-glow transition-smooth cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{mockData.totalXP}</div>
            <div className="text-xs text-muted-foreground">Experiência Total</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-smooth cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">{mockData.completedSessions}</div>
            <div className="text-xs text-muted-foreground">Jogos Completados</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-smooth cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{mockData.averageScore}%</div>
            <div className="text-xs text-muted-foreground">Desempenho Médio</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-smooth cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">{mockData.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Dias Seguidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Trails */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Suas Trilhas de Aprendizado
            <Badge variant="secondary" className="ml-auto">
              6 trilhas ativas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.learningTrails.map((trail) => (
              <div
                key={trail.id}
                className="p-4 rounded-lg border border-border hover:border-primary/30 transition-smooth cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${trail.color} flex items-center justify-center text-white text-lg`}>
                      {trail.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{trail.name}</h4>
                      <p className="text-sm text-muted-foreground">Nível {trail.level}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Progress value={trail.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{trail.progress}% concluído</span>
                    <span>{trail.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4">
            <Button variant="outline" asChild>
              <Link to="/games">
                <Play className="w-4 h-4 mr-2" />
                Explorar Jogos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neurodiversity Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-purple-500" />
              Seu Perfil Único
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h5 className="font-medium mb-3">Como você aprende melhor:</h5>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(mockData.neurodiversityProfile.detectedConditions).map(([condition, confidence]) => (
                  <div key={condition} className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium">{condition}</div>
                    <div className="text-xs text-muted-foreground">{confidence}% detectado</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-3">Estratégias personalizadas:</h5>
              <div className="space-y-2">
                {Object.entries(mockData.neurodiversityProfile.adaptiveStrategies).slice(0, 2).map(([strategy, description], index) => (
                  <div key={index} className="flex items-start gap-2 text-sm p-2 bg-accent/20 rounded">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-accent-foreground">{strategy}</div>
                      <div className="text-xs text-accent-foreground/80">{description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-playful flex items-center justify-center text-white text-sm font-bold">
                      {activity.game.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{activity.game}</h5>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">+{activity.xp} XP</div>
                    <div className="text-xs text-muted-foreground">{activity.score}% precisão</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border text-center">
              <Button variant="outline" size="sm">
                Ver Histórico Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Suas Conquistas
            <Badge variant="secondary" className="ml-auto">
              2 de 4 desbloqueadas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockData.achievements.map((achievement, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-lg border transition-smooth cursor-pointer ${
                  achievement.earned 
                    ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' 
                    : 'border-muted bg-muted/20 opacity-60'
                }`}
              >
                <div className={`text-2xl mb-2 ${achievement.earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="text-sm font-medium">{achievement.name}</div>
                {achievement.earned && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Conquistado!
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Ver Todas as Conquistas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}