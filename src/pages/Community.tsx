import { Users, MessageCircle, Target, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { SocialMissions } from '@/components/community/SocialMissions';
import { CommunityLeaderboard } from '@/components/community/CommunityLeaderboard';
import { CommunityStats } from '@/components/community/CommunityStats';
import { AppLayout } from '@/components/AppLayout';

export default function Community() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Comunidade NeuroPlay
          </h1>
          <p className="text-muted-foreground mt-1">
            Compartilhe conquistas, complete missões e conecte-se com outras famílias
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6">
          <CommunityStats />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="feed" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Missões</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
          </TabsList>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Feed / Content */}
            <div className="md:col-span-2">
              <TabsContent value="feed" className="mt-0">
                <CommunityFeed />
              </TabsContent>
              
              <TabsContent value="missions" className="mt-0">
                <SocialMissions />
              </TabsContent>
              
              <TabsContent value="ranking" className="mt-0">
                <CommunityLeaderboard />
              </TabsContent>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CommunityLeaderboard />
              <SocialMissions />
            </div>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
