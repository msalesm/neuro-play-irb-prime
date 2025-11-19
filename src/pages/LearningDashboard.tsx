import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Star, 
  Clock,
  Zap,
  Award,
  BookOpen,
  Users,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEducationalSystem } from '@/hooks/useEducationalSystem';
import { useLanguage } from '@/contexts/LanguageContext';
import LearningTrails from '@/components/LearningTrails';
import { LevelProgress } from '@/components/LevelProgress';
import { AdminSystemDemo } from '@/components/AdminSystemDemo';
import { supabase } from '@/integrations/supabase/client';

export default function LearningDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { learningTrails, neurodiversityProfile, recentSessions } = useEducationalSystem();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState({
    gamesPlayed: 12,
    xpGained: 1580,
    streakDays: 5,
    newAchievements: 3
  });

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    setUserProfile(profile);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">{t('dashboard.accessRestricted')}</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('dashboard.loginRequired')}
            </p>
            <Button asChild>
              <a href="/auth">{t('dashboard.login')}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate overall progress
  const totalXP = learningTrails.reduce((sum, trail) => sum + (trail.total_xp || 0), 0);
  const averageLevel = learningTrails.length > 0 
    ? learningTrails.reduce((sum, trail) => sum + (trail.current_level || 1), 0) / learningTrails.length
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 pb-24">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('dashboard.learningCenter')}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('dashboard.trackProgress')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center border-l-4 border-l-purple-500">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalXP.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.totalXP')}</div>
          </Card>
          
          <Card className="p-4 text-center border-l-4 border-l-blue-500">
            <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.floor(averageLevel)}</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.averageLevel')}</div>
          </Card>
          
          <Card className="p-4 text-center border-l-4 border-l-green-500">
            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{weeklyStats.streakDays}</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.dayStreak')}</div>
          </Card>
          
          <Card className="p-4 text-center border-l-4 border-l-orange-500">
            <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{weeklyStats.newAchievements}</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.newAchievements')}</div>
          </Card>
        </div>

        {/* Level Progress */}
        <LevelProgress 
          currentLevel={Math.floor(averageLevel)}
          currentXP={totalXP}
          xpToNext={2000}
          levelProgress={65}
          recentGain={150}
          showLevelUp={false}
        />

        {/* Main Content */}
        <Tabs defaultValue="trails" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trails" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t('dashboard.trails')}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.progress')}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              {t('dashboard.achievements')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {t('dashboard.profile')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trails">
            <LearningTrails />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t('dashboard.weeklyProgress')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t('dashboard.gamesPlayed')}</span>
                    <Badge variant="outline">{weeklyStats.gamesPlayed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('dashboard.xpGained')}</span>
                    <Badge variant="outline">+{weeklyStats.xpGained}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('dashboard.streakDays')}</span>
                    <Badge variant="outline">{weeklyStats.streakDays} {t('dashboard.days')}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('dashboard.recentSessions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentSessions.length > 0 ? (
                    <div className="space-y-3">
                      {recentSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{session.game_type}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('dashboard.level')} {session.level}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            +{Math.floor(Math.random() * 100) + 50} XP
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      {t('dashboard.noRecentSessions')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Achievement cards */}
              <Card className="p-4 text-center border-yellow-200 bg-yellow-50">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-bold">{t('achievements.firstWin')}</h3>
                <p className="text-sm text-muted-foreground">{t('achievements.firstWinDesc')}</p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                  {t('achievements.unlocked')}
                </Badge>
              </Card>

              <Card className="p-4 text-center border-blue-200 bg-blue-50">
                <Zap className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <h3 className="font-bold">{t('achievements.speedster')}</h3>
                <p className="text-sm text-muted-foreground">{t('achievements.speedsterDesc')}</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">
                  {t('achievements.unlocked')}
                </Badge>
              </Card>

              <Card className="p-4 text-center border-green-200 bg-green-50">
                <Target className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="font-bold">{t('achievements.focused')}</h3>
                <p className="text-sm text-muted-foreground">{t('achievements.focusedDesc')}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  {t('achievements.unlocked')}
                </Badge>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Admin System Demo */}
              <div className="lg:col-span-2">
                <AdminSystemDemo />
              </div>
              
              {/* Neurodiversity Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {t('dashboard.cognitiveProfile')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {neurodiversityProfile ? (
                    <div className="space-y-3">
                      {neurodiversityProfile.detected_conditions?.length > 0 ? (
                        <div>
                          <h4 className="font-medium mb-2">{t('dashboard.detectedPatterns')}</h4>
                          <div className="space-y-2">
                            {neurodiversityProfile.detected_conditions.map((condition: string) => (
                              <Badge key={condition} variant="outline">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t('dashboard.noPatterns')}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t('dashboard.profileNotCreated')}</p>
                  )}
                </CardContent>
              </Card>

              {/* Learning Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {t('dashboard.learningPreferences')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>{t('dashboard.visualLearning')}</span>
                    <Progress value={85} className="w-24 h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('dashboard.auditoryLearning')}</span>
                    <Progress value={65} className="w-24 h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('dashboard.kinestheticLearning')}</span>
                    <Progress value={70} className="w-24 h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{t('dashboard.readyToPlay')}</h3>
              <p className="opacity-90">{t('dashboard.continueJourney')}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" asChild>
                <a href="/games" className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  {t('dashboard.playGames')}
                </a>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <a href="/diagnostic-tests" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {t('dashboard.takeAssessment')}
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}