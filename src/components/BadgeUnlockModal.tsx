import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgeUnlockModalProps {
  open: boolean;
  onClose: () => void;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
}

export const BadgeUnlockModal = ({
  open,
  onClose,
  badgeName,
  badgeDescription,
  badgeIcon
}: BadgeUnlockModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center py-6"
        >
          {/* Animated stars */}
          <div className="relative mb-6">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  x: Math.cos((i * Math.PI * 2) / 8) * 100,
                  y: Math.sin((i * Math.PI * 2) / 8) * 100,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Star className="w-4 h-4 text-[#c7923e] fill-[#c7923e]" />
              </motion.div>
            ))}

            {/* Badge icon */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="w-32 h-32 bg-gradient-to-br from-[#c7923e]/20 to-[#005a70]/20 rounded-full flex items-center justify-center border-4 border-[#c7923e] relative z-10"
            >
              <span className="text-6xl">{badgeIcon}</span>
            </motion.div>
          </div>

          {/* Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-[#c7923e]" />
              <h2 className="text-2xl font-bold text-foreground">
                Badge Desbloqueado!
              </h2>
            </div>

            <h3 className="text-xl font-semibold mb-2 text-[#c7923e]">
              {badgeName}
            </h3>

            <p className="text-muted-foreground mb-6">
              {badgeDescription}
            </p>
          </motion.div>

          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: '50%',
                  y: '50%',
                  scale: 0
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Sparkles className="w-3 h-3 text-[#c7923e]" />
              </motion.div>
            ))}
          </div>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-[#005a70] to-[#0a1e35] hover:opacity-90"
          >
            Continuar
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};