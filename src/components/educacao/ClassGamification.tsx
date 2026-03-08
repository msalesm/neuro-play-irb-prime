import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Target, Zap, Flame } from 'lucide-react';

interface ClassGamificationProps {
  totalStudents: number;
  observedStudents: number;
  className?: string;
  weekLabel?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  current: number;
  target: number;
  reward: string;
}

export function ClassGamification({ totalStudents, observedStudents, className, weekLabel }: ClassGamificationProps) {
  const challenges = useMemo<Challenge[]>(() => {
    const completionRate = totalStudents > 0 ? (observedStudents / totalStudents) * 100 : 0;

    return [
      {
        id: 'checkin-complete',
        title: 'Check-in Completo',
        description: 'Todos os alunos observados esta semana',
        icon: <Star className="h-5 w-5 text-amber-500" />,
        current: observedStudents,
        target: totalStudents,
        reward: '⭐ Estrela de Dedicação',
      },
      {
        id: 'engagement-week',
        title: 'Semana de Engajamento',
        description: '5 dias de atividades na turma',
        icon: <Flame className="h-5 w-5 text-orange-500" />,
        current: Math.min(observedStudents, 5),
        target: 5,
        reward: '🔥 Sequência Ativa',
      },
      {
        id: 'activities-10',
        title: 'Turma Ativa',
        description: '10 atividades concluídas pela turma',
        icon: <Target className="h-5 w-5 text-primary" />,
        current: Math.min(observedStudents * 2, 10),
        target: 10,
        reward: '🏆 Turma Exemplar',
      },
    ];
  }, [totalStudents, observedStudents]);

  const totalStars = challenges.filter(c => c.current >= c.target).length;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Conquistas da Turma
          </CardTitle>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < totalStars ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map(challenge => {
          const progress = challenge.target > 0 ? (challenge.current / challenge.target) * 100 : 0;
          const completed = challenge.current >= challenge.target;

          return (
            <div
              key={challenge.id}
              className={`p-3 rounded-lg border transition-colors ${
                completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/30 border-border'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {challenge.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{challenge.title}</p>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
                {completed && (
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs">
                    {challenge.reward}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, progress)} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {challenge.current}/{challenge.target}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
