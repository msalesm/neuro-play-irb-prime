import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AvatarBase, AvatarLevel, AvatarAccessory, AVATAR_LEVELS, AVATAR_ACCESSORIES } from '@/types/avatar';

interface EvolutionaryAvatarProps {
  avatar: AvatarBase;
  level: number;
  equippedAccessories?: string[];
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showEffects?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-12 w-12 text-2xl',
  md: 'h-16 w-16 text-3xl',
  lg: 'h-24 w-24 text-5xl',
  xl: 'h-32 w-32 text-6xl',
  '2xl': 'h-40 w-40 text-7xl'
};

const glowSizes = {
  sm: 'before:w-14 before:h-14',
  md: 'before:w-20 before:h-20',
  lg: 'before:w-28 before:h-28',
  xl: 'before:w-36 before:h-36',
  '2xl': 'before:w-44 before:h-44'
};

export const EvolutionaryAvatar = ({
  avatar,
  level,
  equippedAccessories = [],
  size = 'md',
  showEffects = true,
  className
}: EvolutionaryAvatarProps) => {
  const currentLevel = AVATAR_LEVELS.find(l => l.level === level) || AVATAR_LEVELS[0];
  const accessories = AVATAR_ACCESSORIES.filter(acc => equippedAccessories.includes(acc.id));

  const getAnimationClass = () => {
    if (!showEffects) return '';
    switch (currentLevel.visualEffects.animation) {
      case 'pulse':
        return 'animate-[pulse_2s_ease-in-out_infinite]';
      case 'float':
        return 'animate-[bounce_3s_ease-in-out_infinite]';
      case 'spin':
        return 'animate-[spin_10s_linear_infinite]';
      default:
        return '';
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Glow Effect */}
      {showEffects && currentLevel.visualEffects.glow && (
        <div
          className={cn(
            'absolute rounded-full blur-xl opacity-50 animate-pulse',
            glowSizes[size]
          )}
          style={{ backgroundColor: currentLevel.visualEffects.glowColor }}
        />
      )}

      {/* Particles */}
      {showEffects && currentLevel.visualEffects.particles && (
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 45 * Math.PI / 180) * 40],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * 40],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Main Avatar */}
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 z-10',
          sizeClasses[size],
          getAnimationClass()
        )}
        style={{
          borderColor: showEffects && currentLevel.visualEffects.glow
            ? currentLevel.visualEffects.glowColor
            : 'transparent',
        }}
        whileHover={showEffects ? { scale: 1.05 } : {}}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <span className="relative z-10">{avatar.emoji}</span>

        {/* Aura Accessory */}
        {accessories.find(acc => acc.type === 'aura') && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: `radial-gradient(circle, ${currentLevel.visualEffects.glowColor}40, transparent)`,
            }}
          />
        )}
      </motion.div>

      {/* Accessories Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Crown */}
        {accessories.find(acc => acc.type === 'crown') && (
          <motion.div
            className="absolute text-2xl"
            style={{ top: size === 'sm' ? '-8px' : size === 'md' ? '-12px' : '-16px' }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {accessories.find(acc => acc.type === 'crown')?.emoji}
          </motion.div>
        )}

        {/* Hat */}
        {accessories.find(acc => acc.type === 'hat') && (
          <motion.div
            className="absolute text-xl"
            style={{ top: size === 'sm' ? '-6px' : size === 'md' ? '-10px' : '-14px' }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {accessories.find(acc => acc.type === 'hat')?.emoji}
          </motion.div>
        )}

        {/* Glasses */}
        {accessories.find(acc => acc.type === 'glasses') && (
          <motion.div
            className="absolute text-lg"
            style={{ top: '40%' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {accessories.find(acc => acc.type === 'glasses')?.emoji}
          </motion.div>
        )}

        {/* Wings */}
        {accessories.find(acc => acc.type === 'wings') && (
          <motion.div
            className="absolute text-3xl"
            style={{ left: size === 'sm' ? '-10px' : size === 'md' ? '-15px' : '-20px' }}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {accessories.find(acc => acc.type === 'wings')?.emoji}
          </motion.div>
        )}

        {/* Badge */}
        {accessories.find(acc => acc.type === 'badge') && (
          <motion.div
            className="absolute text-lg"
            style={{ bottom: size === 'sm' ? '-4px' : size === 'md' ? '-6px' : '-8px', right: size === 'sm' ? '-4px' : size === 'md' ? '-6px' : '-8px' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {accessories.find(acc => acc.type === 'badge')?.emoji}
          </motion.div>
        )}
      </div>

      {/* Level Badge */}
      {level > 1 && (
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#c7923e] to-[#f59e0b] text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-lg z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          Nv.{level}
        </motion.div>
      )}
    </div>
  );
};
