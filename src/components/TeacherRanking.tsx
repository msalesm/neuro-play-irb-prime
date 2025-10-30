import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RankingEntry {
  userId: string;
  modulesCompleted: number;
  averageScore: number;
  totalScore: number;
}

export function TeacherRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_training')
        .select('user_id, score, status')
        .eq('status', 'concluido');

      if (error) throw error;

      // Group by user_id and calculate stats
      const userStats = new Map<string, { scores: number[]; count: number }>();

      data?.forEach((record) => {
        const userId = record.user_id;
        if (!userStats.has(userId)) {
          userStats.set(userId, { scores: [], count: 0 });
        }
        const stats = userStats.get(userId)!;
        stats.scores.push(record.score);
        stats.count++;
      });

      // Convert to ranking entries
      const rankingEntries: RankingEntry[] = Array.from(userStats.entries()).map(
        ([userId, stats]) => ({
          userId,
          modulesCompleted: stats.count,
          averageScore: Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length),
          totalScore: stats.scores.reduce((a, b) => a + b, 0),
        })
      );

      // Sort by modules completed first, then by average score
      rankingEntries.sort((a, b) => {
        if (b.modulesCompleted !== a.modulesCompleted) {
          return b.modulesCompleted - a.modulesCompleted;
        }
        return b.averageScore - a.averageScore;
      });

      setRanking(rankingEntries.slice(0, 10));
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    if (position === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 2) return <Award className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Professores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando ranking...</p>
        </CardContent>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Professores
          </CardTitle>
          <CardDescription>Top 10 educadores por módulos concluídos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Seja o primeiro a completar um módulo!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Ranking de Professores
        </CardTitle>
        <CardDescription>Top 10 educadores por módulos concluídos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranking.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index < 3 ? 'bg-primary/5 border border-primary/10' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 w-8">
                {getMedalIcon(index) || (
                  <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
                )}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  {getInitials(entry.userId)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Professor {getInitials(entry.userId)}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.modulesCompleted} {entry.modulesCompleted === 1 ? 'módulo' : 'módulos'}
                </p>
              </div>

              <div className="text-right">
                <Badge variant="outline" className="font-semibold">
                  {entry.averageScore}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">média</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
