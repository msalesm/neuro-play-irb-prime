import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SimonButtonProps {
  color: 'red' | 'blue' | 'green' | 'yellow';
  isActive: boolean;
  isDisabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClick: () => void;
  showName?: boolean;
}

const colorStyles = {
  red: {
    base: 'from-red-600 to-red-700',
    active: 'from-red-400 to-red-500',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.6)]',
    border: 'border-red-800/30',
    name: 'Vermelho',
    freq: '415Hz'
  },
  blue: {
    base: 'from-blue-600 to-blue-700',
    active: 'from-blue-400 to-blue-500',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.6)]',
    border: 'border-blue-800/30',
    name: 'Azul',
    freq: '310Hz'
  },
  green: {
    base: 'from-green-600 to-green-700',
    active: 'from-green-400 to-green-500',
    glow: 'shadow-[0_0_40px_rgba(34,197,94,0.6)]',
    border: 'border-green-800/30',
    name: 'Verde',
    freq: '252Hz'
  },
  yellow: {
    base: 'from-yellow-500 to-yellow-600',
    active: 'from-yellow-300 to-yellow-400',
    glow: 'shadow-[0_0_40px_rgba(234,179,8,0.6)]',
    border: 'border-yellow-700/30',
    name: 'Amarelo',
    freq: '209Hz'
  }
};

const positionStyles = {
  'top-left': 'rounded-tl-[120px]',
  'top-right': 'rounded-tr-[120px]',
  'bottom-left': 'rounded-bl-[120px]',
  'bottom-right': 'rounded-br-[120px]'
};

export function SimonButton({ 
  color, 
  isActive, 
  isDisabled, 
  position, 
  onClick,
  showName = false
}: SimonButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const style = colorStyles[color];

  useEffect(() => {
    if (isActive) {
      // Generate particles on activation
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);
      
      // Clear particles after animation
      setTimeout(() => setParticles([]), 600);
    }
  }, [isActive]);

  const handleClick = () => {
    if (isDisabled) return;
    setIsPressed(true);
    onClick();
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'relative w-full h-full bg-gradient-to-br transition-all duration-150',
        'border-4 shadow-inner overflow-hidden',
        positionStyles[position],
        style.border,
        isActive ? [
          style.active,
          style.glow,
          'scale-[1.02] brightness-125',
        ] : style.base,
        isPressed && 'scale-[0.98]',
        !isDisabled && !isActive && 'hover:brightness-110 cursor-pointer',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={`${style.name} - ${style.freq}`}
    >
      {/* Inner glow effect */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br from-white/0 to-white/10',
        'transition-opacity duration-200',
        isActive && 'opacity-100',
        !isActive && 'opacity-40'
      )} />
      
      {/* Particles on activation */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-white rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: '0.6s'
          }}
        />
      ))}

      {/* Color name display */}
      {showName && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          'text-white/80 font-bold text-sm pointer-events-none',
          'transition-opacity duration-200',
          isActive && 'opacity-0'
        )}>
          {style.name}
        </div>
      )}

      {/* Highlight edge */}
      <div className={cn(
        'absolute inset-0 rounded-inherit',
        'bg-gradient-to-br from-white/20 to-transparent',
        'pointer-events-none transition-opacity duration-200',
        isActive ? 'opacity-100' : 'opacity-60'
      )} />
    </button>
  );
}
