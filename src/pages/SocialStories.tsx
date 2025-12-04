import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Drama, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocialStories } from '@/hooks/useSocialStories';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

// Import AI-generated illustrations
import storyBrushingTeeth from '@/assets/story-brushing-teeth.jpg';
import storyDoctorVisit from '@/assets/story-doctor-visit.jpg';
import storyMakingFriends from '@/assets/story-making-friends.jpg';
import storyWashingHands from '@/assets/story-washing-hands.jpg';

// Default illustrations for stories without cover images
const defaultIllustrations = [
  { image: storyBrushingTeeth, keywords: ['dente', 'escovar', 'escova', 'higiene bucal'] },
  { image: storyDoctorVisit, keywords: ['médico', 'doutor', 'hospital', 'consulta', 'pediatra'] },
  { image: storyMakingFriends, keywords: ['amigo', 'amizade', 'brincar', 'criança', 'escola'] },
  { image: storyWashingHands, keywords: ['mão', 'lavar', 'sabão', 'higiene'] },
];

const getDefaultIllustration = (title: string, index: number): string => {
  const lowerTitle = title.toLowerCase();
  
  // Try to match by keywords
  for (const illustration of defaultIllustrations) {
    if (illustration.keywords.some(keyword => lowerTitle.includes(keyword))) {
      return illustration.image;
    }
  }
  
  // Fallback to cycle through illustrations
  return defaultIllustrations[index % defaultIllustrations.length].image;
};

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
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'linear' as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-secondary/5">
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
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <Skeleton className="h-32 w-32 rounded-none" />
                    <div className="flex-1 p-4">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
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
            className="space-y-5"
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
                  whileHover={{ scale: 1.02, y: -6 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                    onClick={() => handleStoryClick(story.id)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Illustration */}
                        <motion.div 
                          className="h-36 w-36 md:h-40 md:w-40 flex-shrink-0 relative overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img 
                            src={story.cover_image_url || getDefaultIllustration(story.title, index)} 
                            alt={story.title}
                            className="h-full w-full object-cover"
                          />
                          {/* Shimmer overlay on hover */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                            variants={shimmerVariants}
                            initial="initial"
                            whileHover="animate"
                          />
                          {/* Badge */}
                          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>Novo</span>
                          </div>
                        </motion.div>
                        
                        {/* Story Info */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {story.title}
                            </h3>
                            {story.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {story.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              História Guiada
                            </span>
                            
                            <motion.div
                              className="flex items-center gap-1 text-primary font-medium text-sm"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <span className="hidden sm:inline">Começar</span>
                              <ChevronRight className="h-5 w-5" />
                            </motion.div>
                          </div>
                        </div>
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
