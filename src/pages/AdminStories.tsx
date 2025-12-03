import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useSocialStories, useStorySteps } from '@/hooks/useSocialStories';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface TelemetryStats {
  storyId: string;
  storyTitle: string;
  starts: number;
  completions: number;
  completionRate: number;
}

export default function AdminStories() {
  const navigate = useNavigate();
  const { stories, loading: storiesLoading } = useSocialStories();
  const { trackScreenView } = useTelemetry();
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const { steps } = useStorySteps(selectedStory);
  const [telemetryStats, setTelemetryStats] = useState<TelemetryStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    trackScreenView('admin_stories');
  }, [trackScreenView]);

  // Load telemetry stats
  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      
      try {
        // Get story starts
        const { data: starts } = await supabase
          .from('telemetry_events')
          .select('payload')
          .eq('event_type', 'story_start');

        // Get story completions
        const { data: completions } = await supabase
          .from('telemetry_events')
          .select('payload')
          .eq('event_type', 'story_end');

        // Calculate stats per story
        const stats: TelemetryStats[] = stories.map(story => {
          const storyStarts = starts?.filter(
            e => (e.payload as { storyId?: string })?.storyId === story.id
          ).length || 0;
          
          const storyCompletions = completions?.filter(
            e => (e.payload as { storyId?: string })?.storyId === story.id
          ).length || 0;

          return {
            storyId: story.id,
            storyTitle: story.title,
            starts: storyStarts,
            completions: storyCompletions,
            completionRate: storyStarts > 0 ? (storyCompletions / storyStarts) * 100 : 0,
          };
        });

        setTelemetryStats(stats);
      } catch (error) {
        console.error('Error loading telemetry:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (stories.length > 0) {
      loadStats();
    }
  }, [stories]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Painel de Histórias
            </h1>
            <p className="text-muted-foreground">Gerenciamento e análise de histórias sociais</p>
          </div>
        </div>

        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stories">
              <BookOpen className="h-4 w-4 mr-2" />
              Histórias
            </TabsTrigger>
            <TabsTrigger value="steps">
              <Eye className="h-4 w-4 mr-2" />
              Passos
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Análise
            </TabsTrigger>
          </TabsList>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-4">
            {storiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              stories.map(story => (
                <Card 
                  key={story.id}
                  className={`cursor-pointer transition-colors ${
                    selectedStory === story.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedStory(story.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{story.title}</h3>
                        <p className="text-sm text-muted-foreground">{story.description}</p>
                      </div>
                      <Badge variant={story.is_active ? 'default' : 'secondary'}>
                        {story.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Steps Tab */}
          <TabsContent value="steps" className="space-y-4">
            {!selectedStory ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Selecione uma história na aba "Histórias" para ver os passos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Visualizando passos de: <strong>{stories.find(s => s.id === selectedStory)?.title}</strong>
                    </p>
                  </CardContent>
                </Card>
                
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <Card key={step.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            {step.image_url && (
                              <Badge variant="outline" className="mt-2">
                                Com imagem
                              </Badge>
                            )}
                            {step.audio_url && (
                              <Badge variant="outline" className="mt-2 ml-2">
                                Com áudio
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {loadingStats ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Histórias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stories.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Inícios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {telemetryStats.reduce((sum, s) => sum + s.starts, 0)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Conclusões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        {telemetryStats.reduce((sum, s) => sum + s.completions, 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Per-Story Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Estatísticas por História
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {telemetryStats.map(stat => (
                        <div key={stat.storyId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium">{stat.storyTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {stat.starts} inícios • {stat.completions} conclusões
                            </p>
                          </div>
                          <Badge 
                            variant={stat.completionRate >= 70 ? 'default' : 'secondary'}
                          >
                            {stat.completionRate.toFixed(0)}% conclusão
                          </Badge>
                        </div>
                      ))}
                      
                      {telemetryStats.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhuma estatística disponível ainda
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
