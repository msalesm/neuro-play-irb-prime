import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, Watch, ShoppingCart, Video, Crown, 
  Globe, Sparkles, ArrowLeft, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmotionalAIPanel } from '@/components/phase5/EmotionalAIPanel';

import { MarketplaceGrid } from '@/components/phase5/MarketplaceGrid';
import { TeleorientationPanel } from '@/components/phase5/TeleorientationPanel';
import { PremiumAvatarCustomizer } from '@/components/phase5/PremiumAvatarCustomizer';
import { InternationalizationPanel } from '@/components/phase5/InternationalizationPanel';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/AppLayout';

export default function Phase5Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { t } = useLanguage();
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('ai');

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {t('phase5.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('phase5.subtitle')}
              </p>
            </div>
          </div>
          <LanguageSelector variant="full" />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger 
              value="ai" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">{t('phase5.emotionalAI.title')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="marketplace"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">{t('phase5.marketplace.title')}</span>
            </TabsTrigger>
            {(role === 'therapist' || role === 'admin') && (
              <TabsTrigger 
                value="teleorientation"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">{t('phase5.teleorientation.title')}</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="avatar"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">{t('phase5.premiumAvatar.title')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="international"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{t('phase5.internationalization.title')}</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Emotional Panel */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EmotionalAIPanel childId={selectedChildId} />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('phase5.emotionalAI.selectChild')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('phase5.emotionalAI.selectChild')}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/dashboard-pais')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {t('common.viewMore')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>


          {/* Marketplace */}
          <TabsContent value="marketplace">
            <MarketplaceGrid />
          </TabsContent>

          {/* Teleorientation */}
          <TabsContent value="teleorientation">
            <TeleorientationPanel />
          </TabsContent>

          {/* Premium Avatar */}
          <TabsContent value="avatar">
            <PremiumAvatarCustomizer childId={selectedChildId} />
          </TabsContent>

          {/* Internationalization */}
          <TabsContent value="international">
            <InternationalizationPanel />
          </TabsContent>
        </Tabs>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-purple-500" />}
            title={t('phase5.emotionalAI.title')}
            description={t('phase5.emotionalAI.subtitle')}
            onClick={() => setActiveTab('ai')}
          />
          <FeatureCard
            icon={<Watch className="h-8 w-8 text-blue-500" />}
            title={t('phase5.wearables.title')}
            description={t('phase5.wearables.subtitle')}
            onClick={() => setActiveTab('wearables')}
          />
          <FeatureCard
            icon={<ShoppingCart className="h-8 w-8 text-green-500" />}
            title={t('phase5.marketplace.title')}
            description={t('phase5.marketplace.subtitle')}
            onClick={() => setActiveTab('marketplace')}
          />
          <FeatureCard
            icon={<Globe className="h-8 w-8 text-orange-500" />}
            title={t('phase5.internationalization.title')}
            description="PT, EN, ES"
            onClick={() => setActiveTab('international')}
          />
        </div>
      </div>
    </AppLayout>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function FeatureCard({ icon, title, description, onClick }: FeatureCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
