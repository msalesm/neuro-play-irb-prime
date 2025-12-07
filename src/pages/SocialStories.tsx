import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Drama, Sparkles, Star, Crown, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocialStories, SocialStory } from '@/hooks/useSocialStories';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useChildAge, filterByAge } from '@/hooks/useAgeFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Import unique illustrations for each story
import storyTakingBath from '@/assets/story-taking-bath.jpg';
import storyBrushingTeeth from '@/assets/story-brushing-teeth-new.jpg';
import storyAskingHelp from '@/assets/story-asking-help.jpg';
import storyPackingBackpack from '@/assets/story-packing-backpack.jpg';
import storyWashingHands from '@/assets/story-washing-hands-new.jpg';
import storyDoctorVisit from '@/assets/story-doctor-visit.jpg';
import storyMakingFriends from '@/assets/story-making-friends.jpg';
import heroGaming from '/hero-gaming.jpg';

// Story configurations with illustrations and styling
const storyConfigs: Record<string, {
  image: string;
  isHighlighted: boolean;
  gradient: string;
  badge: string;
  badgeIcon: 'star' | 'crown' | 'heart';
}> = {
  'Como tomar banho': {
    image: storyTakingBath,
    isHighlighted: true,
    gradient: 'from-secondary/20 via-secondary/10 to-transparent',
    badge: 'Essencial',
    badgeIcon: 'crown'
  },
  'Como escovar os dentes': {
    image: storyBrushingTeeth,
    isHighlighted: true,
    gradient: 'from-accent/20 via-accent/10 to-transparent',
    badge: 'Importante',
    badgeIcon: 'heart'
  },
  'Como pedir ajuda': {
    image: storyAskingHelp,
    isHighlighted: true,
    gradient: 'from-accent/20 via-primary/10 to-transparent',
    badge: 'Fundamental',
    badgeIcon: 'star'
  },
  'Como arrumar a mochila': {
    image: storyPackingBackpack,
    isHighlighted: false,
    gradient: 'from-primary/10 to-transparent',
    badge: 'Novo',
    badgeIcon: 'star'
  },
  'Como lavar as mãos': {
    image: storyWashingHands,
    isHighlighted: false,
    gradient: 'from-primary/10 to-transparent',
    badge: 'Novo',
    badgeIcon: 'star'
  },
  'Entrar na sala de aula': {
    image: storyMakingFriends,
    isHighlighted: false,
    gradient: 'from-secondary/10 to-transparent',
    badge: 'Novo',
    badgeIcon: 'star'
  },
  'Como participar de um trabalho em grupo': {
    image: storyDoctorVisit,
    isHighlighted: false,
    gradient: 'from-accent/10 to-transparent',
    badge: 'Novo',
    badgeIcon: 'star'
  },
  'Quando as Coisas Não Dão Certo': {
    image: heroGaming,
    isHighlighted: false,
    gradient: 'from-primary/10 to-transparent',
    badge: 'Novo',
    badgeIcon: 'heart'
  }
};

const getStoryConfig = (title: string) => {
  // Check for exact match first
  if (storyConfigs[title]) {
    return storyConfigs[title];
  }
  
  // Check for partial matches in title
  for (const [key, config] of Object.entries(storyConfigs)) {
    if (title.toLowerCase().includes(key.toLowerCase().split(' ').slice(0, 3).join(' '))) {
      return config;
    }
  }
  
  // Default fallback with unique color based on title hash
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-secondary/15 to-transparent',
    'from-accent/15 to-transparent',
    'from-primary/15 to-transparent'
  ];
  
  return {
    image: heroGaming,
    isHighlighted: false,
    gradient: gradients[hash % gradients.length],
    badge: 'Novo',
    badgeIcon: 'star' as const
  };
};

const BadgeIcon = ({ type }: { type: 'star' | 'crown' | 'heart' }) => {
  switch (type) {
    case 'crown': return <Crown className="h-3 w-3" />;
    case 'heart': return <Heart className="h-3 w-3" />;
    default: return <Star className="h-3 w-3" />;
  }
};

export default function SocialStories() {
  const navigate = useNavigate();
  const { stories, loading, error } = useSocialStories();
  const { trackScreenView } = useTelemetry();
  const { childAge, isLoading: ageLoading } = useChildAge();

  // Filter stories by child's age
  const ageFilteredStories = filterByAge(
    stories,
    childAge ?? null,
    (story) => ({ min: story.age_min, max: story.age_max })
  );

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

  // Sort stories to show highlighted ones first
  const sortedStories = [...ageFilteredStories].sort((a, b) => {
    const configA = getStoryConfig(a.title);
    const configB = getStoryConfig(b.title);
    if (configA.isHighlighted && !configB.isHighlighted) return -1;
    if (!configA.isHighlighted && configB.isHighlighted) return 1;
    return 0;
  });

  // Check if filtering is active
  const isFiltering = childAge !== null && childAge !== undefined;
  const hiddenCount = stories.length - ageFilteredStories.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
              <Drama className="h-6 w-6 text-accent" />
              Histórias Sociais
            </h1>
            <p className="text-primary-foreground/70">
              {isFiltering 
                ? `Conteúdo para ${childAge} anos` 
                : 'Aprenda rotinas do dia a dia de forma divertida'}
            </p>
          </div>
          {isFiltering && (
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {childAge} anos
            </Badge>
          )}
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
            {sortedStories.length === 0 ? (
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
              sortedStories.map((story) => {
                const config = getStoryConfig(story.title);
                
                return (
                  <motion.div
                    key={story.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl group ${
                        config.isHighlighted 
                          ? 'border-2 border-primary/50 hover:border-primary ring-2 ring-primary/20' 
                          : 'border-2 border-transparent hover:border-primary/40'
                      }`}
                      onClick={() => handleStoryClick(story.id)}
                    >
                      <CardContent className="p-0">
                        <div className={`flex bg-gradient-to-r ${config.gradient}`}>
                          {/* Illustration */}
                          <motion.div 
                            className={`flex-shrink-0 relative overflow-hidden ${
                              config.isHighlighted ? 'h-40 w-40 md:h-48 md:w-48' : 'h-36 w-36 md:h-40 md:w-40'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <img 
                              src={config.image} 
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
                            <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                              config.isHighlighted 
                                ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg' 
                                : 'bg-primary/90 text-primary-foreground'
                            }`}>
                              <BadgeIcon type={config.badgeIcon} />
                              <span>{config.badge}</span>
                            </div>
                            
                            {/* Highlighted indicator */}
                            {config.isHighlighted && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
                            )}
                          </motion.div>
                          
                          {/* Story Info */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                            <h3 className={`font-bold text-foreground line-clamp-2 group-hover:text-secondary transition-colors ${
                                config.isHighlighted ? 'text-xl' : 'text-lg'
                              }`}>
                                {story.title}
                              </h3>
                              {story.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                  {story.description}
                                </p>
                              )}
                              
                              {/* Age indicator */}
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs bg-secondary/30 text-accent px-2 py-1 rounded-full font-medium">
                                  <Calendar className="h-3 w-3" />
                                  <span>{story.age_min || 3}-{story.age_max || 18} anos</span>
                                </div>
                                {config.isHighlighted && (
                                  <div className="flex items-center gap-1 text-xs text-accent font-medium">
                                    <Sparkles className="h-3 w-3" />
                                    <span>Recomendada</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${
                                config.isHighlighted 
                                  ? 'bg-gradient-to-r from-accent/30 to-secondary/30 text-accent' 
                                  : 'bg-gradient-to-r from-secondary/20 to-primary/20 text-muted-foreground'
                              }`}>
                                <Sparkles className="h-3 w-3" />
                                História Guiada
                              </span>
                              
                              <motion.div
                                className="flex items-center gap-1 text-accent font-medium text-sm"
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
                );
              })
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
