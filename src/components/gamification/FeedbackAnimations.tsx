import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Trophy } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface XPGainToastProps {
  amount: number;
  message?: string;
  onComplete?: () => void;
}

export function XPGainToast({ amount, message, onComplete }: XPGainToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.9 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="font-bold text-lg">+{amount} XP</span>
            {message && <span className="text-sm opacity-80">• {message}</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface StarBurstProps {
  x?: number;
  y?: number;
}

export function StarBurst({ x = 50, y = 50 }: StarBurstProps) {
  const stars = Array.from({ length: 6 });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" style={{ left: `${x}%`, top: `${y}%` }}>
      {stars.map((_, i) => {
        const angle = (360 / stars.length) * i;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 0.8],
              x: Math.cos(rad) * 60,
              y: Math.sin(rad) * 60,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute"
          >
            <Star className="h-5 w-5 text-[hsl(var(--neuroplay-yellow))] fill-current" />
          </motion.div>
        );
      })}
    </div>
  );
}

interface LevelUpCelebrationProps {
  level: number;
  title: string;
  icon: string;
  onDismiss: () => void;
}

export function LevelUpCelebration({ level, title, icon, onDismiss }: LevelUpCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.5, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        className="bg-card rounded-3xl p-8 text-center shadow-2xl max-w-xs mx-4"
      >
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: 2, duration: 0.6 }}
          className="text-6xl block mb-4"
        >
          {icon}
        </motion.span>
        <h2 className="text-2xl font-bold text-foreground mb-1">Nível {level}!</h2>
        <p className="text-lg text-primary font-semibold mb-2">{title}</p>
        <p className="text-sm text-muted-foreground">Continue explorando para avançar!</p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 4 }}
          className="h-1 bg-primary/30 rounded-full mt-4"
        >
          <div className="h-full bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface BadgeUnlockToastProps {
  name: string;
  icon: string;
  onComplete?: () => void;
}

export function BadgeUnlockToast({ name, icon, onComplete }: BadgeUnlockToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.7 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -30, opacity: 0 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="bg-secondary text-secondary-foreground px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-xs opacity-80">Nova conquista!</p>
              <p className="font-bold">{name}</p>
            </div>
            <Trophy className="h-5 w-5 opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
