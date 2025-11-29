import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementSystem } from '@/hooks/useAchievementSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BadgeProgressCard } from '@/components/BadgeProgressCard';
import { AvatarEvolutionCard } from '@/components/AvatarEvolutionCard';
import { AchievementsGrid } from '@/components/AchievementsGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function AchievementsPage() {
  const { user } = useAuth();
  const {
    achievements,
    userAchievements,
    badgeProgress,
    avatarEvolution,
    loading,
    getBadgeIcon,
    getBadgeColor
  } = useAchievementSystem(user?.id);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Todas', icon: Target },
    { value: 'cognitive', label: 'Cognitivas', icon: Trophy },
    { value: 'emotional', label: 'Emocionais', icon: Sparkles },
    { value: 'social', label: 'Sociais', icon: Trophy },
    { value: 'behavioral', label: 'Comportamentais', icon: Target },
    { value: 'performance', label: 'Performance', icon: Trophy }
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const completedCount = userAchievements.filter(ua => ua.completed).length;
  const totalCount = achievements.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Faça login para ver suas conquistas.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard-pais">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Conquistas</h1>
              <p className="text-muted-foreground">
                Acompanhe seu progresso e desbloqueie recompensas
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {completedCount} / {totalCount} ({Math.round(completionRate)}%)
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            {/* Badge & Avatar Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BadgeProgressCard
                level={badgeProgress.level}
                current={badgeProgress.current}
                required={badgeProgress.required}
                percentage={badgeProgress.percentage}
                getBadgeIcon={getBadgeIcon}
                getBadgeColor={getBadgeColor}
              />
              <AvatarEvolutionCard
                stage={avatarEvolution.stage}
                xp={avatarEvolution.xp}
                nextStageXp={avatarEvolution.nextStageXp}
                unlockedAccessories={avatarEvolution.unlockedAccessories}
              />
            </div>

            {/* Achievements Grid */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Conquistas
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
                  <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                    {categories.map(category => {
                      const Icon = category.icon;
                      const categoryAchievements = category.value === 'all'
                        ? achievements
                        : achievements.filter(a => a.category === category.value);
                      const categoryCompleted = userAchievements.filter(
                        ua => ua.completed && categoryAchievements.some(a => a.key === ua.achievement_key)
                      ).length;

                      return (
                        <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="hidden lg:inline">{category.label}</span>
                          <Badge variant="secondary" className="ml-1">
                            {categoryCompleted}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {categories.map(category => (
                    <TabsContent key={category.value} value={category.value}>
                      <AchievementsGrid
                        achievements={filteredAchievements}
                        userAchievements={userAchievements}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
