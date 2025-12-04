import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Drama, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocialStories } from '@/hooks/useSocialStories';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Drama className="h-6 w-6 text-primary" />
              Histórias Sociais
            </h1>
            <p className="text-muted-foreground">Aprenda rotinas do dia a dia de forma divertida</p>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-xl" />
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-destructive/10 border-destructive">
              <CardContent className="p-4 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stories List */}
        {!loading && !error && (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stories.length === 0 ? (
              <motion.div variants={cardVariants}>
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-8 text-center">
                    <Drama className="h-16 w-16 mx-auto mb-4 text-primary/40" />
                    <p className="text-muted-foreground text-lg">Nenhuma história disponível ainda</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">Em breve teremos histórias incríveis para você!</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl"
                    onClick={() => handleStoryClick(story.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Cover Image or Placeholder */}
                        <motion.div 
                          className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          {story.cover_image_url ? (
                            <img 
                              src={story.cover_image_url} 
                              alt={story.title}
                              className="h-full w-full object-cover rounded-xl"
                            />
                          ) : (
                            <>
                              <Drama className="h-10 w-10 text-primary" />
                              <Sparkles className="absolute top-1 right-1 h-4 w-4 text-secondary animate-pulse" />
                            </>
                          )}
                        </motion.div>
                        
                        {/* Story Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground truncate">
                            {story.title}
                          </h3>
                          {story.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {story.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                              História Guiada
                            </span>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ChevronRight className="h-6 w-6 text-primary flex-shrink-0" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
