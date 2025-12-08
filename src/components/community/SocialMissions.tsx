import { Target, Gamepad2, BookOpen, Calendar, Users, GraduationCap, Flame, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCommunity } from '@/hooks/useCommunity';
import { cn } from '@/lib/utils';

const missionTypeStyles: Record<string, { bg: string; border: string; label: string }> = {
  daily: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Diária' },
  weekly: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Semanal' },
  special: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Especial' }
};

const categoryIcons: Record<string, React.ElementType> = {
  games: Gamepad2,
  stories: BookOpen,
  routines: Calendar,
  social: Users,
  learning: GraduationCap
};

export function SocialMissions() {
  const { missions, loading } = useCommunity();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Missões Sociais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyMissions = missions.filter(m => m.mission_type === 'daily');
  const weeklyMissions = missions.filter(m => m.mission_type === 'weekly');
  const specialMissions = missions.filter(m => m.mission_type === 'special');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Missões Sociais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Missions */}
        {dailyMissions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-500" />
              Missões Diárias
            </h4>
            <div className="space-y-3">
              {dailyMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </div>
        )}

        {/* Weekly Missions */}
        {weeklyMissions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              Missões Semanais
            </h4>
            <div className="space-y-3">
              {weeklyMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </div>
        )}

        {/* Special Missions */}
        {specialMissions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Missões Especiais
            </h4>
            <div className="space-y-3">
              {specialMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </div>
        )}

        {missions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma missão disponível no momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MissionCardProps {
  mission: {
    id: string;
    title: string;
    description: string;
    mission_type: 'daily' | 'weekly' | 'special';
    category: string;
    points_reward: number;
    progress?: number;
    target?: number;
    completed?: boolean;
  };
}

function MissionCard({ mission }: MissionCardProps) {
  const style = missionTypeStyles[mission.mission_type];
  const CategoryIcon = categoryIcons[mission.category] || Target;
  const progress = mission.progress || 0;
  const target = mission.target || 1;
  const percentage = Math.min((progress / target) * 100, 100);

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border transition-all",
        style.bg,
        style.border,
        mission.completed && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <CategoryIcon className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{mission.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {mission.completed ? (
            <Badge variant="default" className="bg-green-500">
              ✓ Completa
            </Badge>
          ) : (
            <Badge variant="secondary">
              +{mission.points_reward} pts
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">{mission.description}</p>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>{progress}/{target}</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
}
