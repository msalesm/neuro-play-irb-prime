import { Calendar, ChevronRight, Sparkles, Star, Crown, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { SocialStory } from '@/hooks/useSocialStories';

interface StoryCardProps {
  story: SocialStory;
  onClick: () => void;
  isHighlighted?: boolean;
  badge?: string;
  badgeIcon?: 'star' | 'crown' | 'heart';
  gradient?: string;
  image?: string;
}

const BadgeIcon = ({ type }: { type: 'star' | 'crown' | 'heart' }) => {
  switch (type) {
    case 'crown': return <Crown className="h-3 w-3" />;
    case 'heart': return <Heart className="h-3 w-3" />;
    default: return <Star className="h-3 w-3" />;
  }
};

export function StoryCard({ 
  story, 
  onClick, 
  isHighlighted = false,
  badge = 'Novo',
  badgeIcon = 'star',
  gradient = 'from-primary/10 to-transparent',
  image
}: StoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl group ${
          isHighlighted 
            ? 'border-2 border-primary/50 hover:border-primary ring-2 ring-primary/20' 
            : 'border-2 border-transparent hover:border-primary/40'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className={`flex bg-gradient-to-r ${gradient}`}>
            {/* Illustration */}
            <motion.div 
              className={`flex-shrink-0 relative overflow-hidden ${
                isHighlighted ? 'h-40 w-40 md:h-48 md:w-48' : 'h-36 w-36 md:h-40 md:w-40'
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {image ? (
                <img 
                  src={image} 
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-6xl">📖</span>
                </div>
              )}
              
              {/* Badge */}
              <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                isHighlighted 
                  ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg' 
                  : 'bg-primary/90 text-primary-foreground'
              }`}>
                <BadgeIcon type={badgeIcon} />
                <span>{badge}</span>
              </div>
              
              {/* Highlighted indicator */}
              {isHighlighted && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
              )}
            </motion.div>
            
            {/* Story Info */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 className={`font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors ${
                  isHighlighted ? 'text-xl' : 'text-lg'
                }`}>
                  {story.title}
                </h3>
                {story.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {story.description}
                  </p>
                )}
                
                {/* Age indicator */}
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs bg-secondary/30 text-secondary-foreground px-2 py-1 rounded-full font-medium">
                    <Calendar className="h-3 w-3" />
                    <span>{story.age_min || 3}-{story.age_max || 18} anos</span>
                  </div>
                  {isHighlighted && (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Sparkles className="h-3 w-3" />
                      <span>Recomendada</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${
                  isHighlighted 
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary' 
                    : 'bg-secondary/20 text-secondary-foreground'
                }`}>
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
  );
}
