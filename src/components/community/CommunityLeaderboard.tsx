import { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const rankIcons = [
  { icon: Crown, color: 'text-yellow-500' },
  { icon: Medal, color: 'text-gray-400' },
  { icon: Medal, color: 'text-amber-600' }
];

export function CommunityLeaderboard() {
  const { leaderboard, fetchLeaderboard, loading, myPoints } = useCommunity();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as 'weekly' | 'monthly' | 'all_time';
    setPeriod(newPeriod);
    fetchLeaderboard(newPeriod);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* My Stats */}
        {myPoints && (
          <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sua Posição</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-bold">Nível {myPoints.level}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{myPoints.total_points}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{myPoints.weekly_points}</p>
                <p className="text-xs text-muted-foreground">Semanal</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{myPoints.monthly_points}</p>
                <p className="text-xs text-muted-foreground">Mensal</p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="weekly" className="flex-1">Semanal</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Mensal</TabsTrigger>
            <TabsTrigger value="all_time" className="flex-1">Geral</TabsTrigger>
          </TabsList>

          <TabsContent value={period}>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="h-4 w-16 bg-muted-foreground/20 rounded" />
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum participante ainda</p>
                <p className="text-sm">Complete atividades para aparecer no ranking!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const RankIcon = rankIcons[index]?.icon;
                  const rankColor = rankIcons[index]?.color;
                  const isCurrentUser = entry.user_id === user?.id;

                  return (
                    <div
                      key={entry.user_id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                        isCurrentUser ? "bg-primary/10 border border-primary/30" : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      {/* Rank */}
                      <div className="w-8 flex justify-center">
                        {RankIcon ? (
                          <RankIcon className={cn("w-6 h-6", rankColor)} />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {entry.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name */}
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium",
                          isCurrentUser && "text-primary"
                        )}>
                          {entry.name || 'Usuário'}
                          {isCurrentUser && <span className="text-xs ml-2">(você)</span>}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <p className="font-bold">{entry.points}</p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
