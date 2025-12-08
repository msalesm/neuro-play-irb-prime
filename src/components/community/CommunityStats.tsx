import { Trophy, Star, Flame, Target, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCommunity } from '@/hooks/useCommunity';
import { cn } from '@/lib/utils';

const levelThresholds = [
  { level: 1, minPoints: 0, rank: 'Iniciante', color: 'text-gray-500' },
  { level: 2, minPoints: 100, rank: 'Explorador', color: 'text-green-500' },
  { level: 3, minPoints: 300, rank: 'Aventureiro', color: 'text-blue-500' },
  { level: 4, minPoints: 600, rank: 'Mestre', color: 'text-purple-500' },
  { level: 5, minPoints: 1000, rank: 'Lenda', color: 'text-amber-500' }
];

export function CommunityStats() {
  const { myPoints, missions, loading } = useCommunity();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completedMissions = missions.filter(m => m.completed).length;
  const currentLevel = levelThresholds.find(
    (l, i) => {
      const next = levelThresholds[i + 1];
      return !next || (myPoints?.total_points || 0) < next.minPoints;
    }
  ) || levelThresholds[0];

  const nextLevel = levelThresholds[currentLevel.level] || null;
  const progressToNext = nextLevel 
    ? ((myPoints?.total_points || 0) - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints) * 100
    : 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Points */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Pontos Totais</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{myPoints?.total_points || 0}</p>
        </CardContent>
      </Card>

      {/* Current Level */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Nível</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{currentLevel.level}</p>
          <Badge variant="secondary" className="mt-1">
            {currentLevel.rank}
          </Badge>
        </CardContent>
      </Card>

      {/* Completed Missions */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Missões</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{completedMissions}</p>
          <p className="text-xs text-muted-foreground">de {missions.length}</p>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Badges</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{myPoints?.badges_earned?.length || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
}
