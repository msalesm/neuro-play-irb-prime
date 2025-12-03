import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocialStories } from '@/hooks/useSocialStories';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Skeleton } from '@/components/ui/skeleton';

export default function SocialStories() {
  const navigate = useNavigate();
  const { stories, loading, error } = useSocialStories();
  const { trackScreenView } = useTelemetry();

  useEffect(() => {
    trackScreenView('social_stories_list');
  }, [trackScreenView]);

  const handleStoryClick = (storyId: string) => {
    navigate(`/stories/${storyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Histórias Guiadas
            </h1>
            <p className="text-muted-foreground">Aprenda rotinas do dia a dia</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-4 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stories List */}
        {!loading && !error && (
          <div className="space-y-4">
            {stories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma história disponível</p>
                </CardContent>
              </Card>
            ) : (
              stories.map((story) => (
                <Card 
                  key={story.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleStoryClick(story.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Cover Image or Placeholder */}
                      <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {story.cover_image_url ? (
                          <img 
                            src={story.cover_image_url} 
                            alt={story.title}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      
                      {/* Story Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {story.title}
                        </h3>
                        {story.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {story.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
