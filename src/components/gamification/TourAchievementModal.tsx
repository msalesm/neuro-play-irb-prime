import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourAchievementModalProps {
  isOpen: boolean;
  achievement: {
    name: string;
    description: string;
    icon: string;
    rarity: string;
  } | null;
  onClose: () => void;
}

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-amber-500 to-amber-600',
};

const rarityLabels = {
  common: 'Comum',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Lendária',
};

export const TourAchievementModal = ({ isOpen, achievement, onClose }: TourAchievementModalProps) => {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="pointer-events-auto max-w-md w-full mx-4"
            >
              <Card className={cn(
                'relative overflow-hidden border-2',
                achievement.rarity === 'legendary' && 'border-amber-500/50',
                achievement.rarity === 'epic' && 'border-purple-500/50',
                achievement.rarity === 'rare' && 'border-blue-500/50',
                achievement.rarity === 'common' && 'border-gray-500/50'
              )}>
                {/* Background gradient */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-10',
                  rarityColors[achievement.rarity as keyof typeof rarityColors]
                )} />

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{
                        x: Math.random() * 100 + '%',
                        y: '100%',
                        opacity: 0,
                      }}
                      animate={{
                        y: '-10%',
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: Math.random() * 2 + 2,
                        delay: Math.random() * 0.5,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>

                <CardContent className="p-8 text-center relative z-10">
                  {/* Trophy icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-4"
                  >
                    <div className={cn(
                      'w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br shadow-xl',
                      rarityColors[achievement.rarity as keyof typeof rarityColors]
                    )}>
                      <span className="text-4xl">{achievement.icon}</span>
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Conquista Desbloqueada!
                  </motion.h2>

                  {/* Achievement name */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl font-semibold mb-2"
                  >
                    {achievement.name}
                  </motion.h3>

                  {/* Rarity badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mb-3"
                  >
                    <Badge className={cn(
                      'text-white border-0 shadow-lg',
                      `bg-gradient-to-r ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`
                    )}>
                      <Star className="w-3 h-3 mr-1" />
                      {rarityLabels[achievement.rarity as keyof typeof rarityLabels]}
                    </Badge>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-muted-foreground mb-6"
                  >
                    {achievement.description}
                  </motion.p>

                  {/* Close hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm text-muted-foreground"
                  >
                    Clique em qualquer lugar para fechar
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
