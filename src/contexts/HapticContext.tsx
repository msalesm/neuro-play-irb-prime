import { createContext, useContext, ReactNode } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import type { HapticIntensity } from '@/lib/haptics';

interface HapticContextType {
  intensity: HapticIntensity;
  setIntensity: (intensity: HapticIntensity) => Promise<void>;
  isSupported: boolean;
  isNative: boolean;
  hapticFeedback: (type: 'success' | 'error' | 'tap' | 'sequence' | 'achievement' | 'warning') => Promise<void>;
  vibrate: (pattern: number | number[]) => void;
}

const HapticContext = createContext<HapticContextType | null>(null);

export function HapticProvider({ 
  children, 
  childProfileId 
}: { 
  children: ReactNode; 
  childProfileId?: string | null;
}) {
  const haptic = useHapticFeedback(childProfileId);

  return (
    <HapticContext.Provider value={haptic}>
      {children}
    </HapticContext.Provider>
  );
}

export function useHaptic() {
  const context = useContext(HapticContext);
  if (!context) {
    throw new Error('useHaptic must be used within HapticProvider');
  }
  return context;
}
