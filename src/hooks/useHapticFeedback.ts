import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HapticIntensity = 'off' | 'light' | 'medium' | 'strong';

export interface HapticPattern {
  success: number | number[];
  error: number | number[];
  tap: number | number[];
  sequence: number | number[];
  achievement: number | number[];
  warning: number | number[];
}

const HAPTIC_PATTERNS: Record<HapticIntensity, HapticPattern> = {
  off: {
    success: 0,
    error: 0,
    tap: 0,
    sequence: 0,
    achievement: 0,
    warning: 0,
  },
  light: {
    success: [30, 50, 30],
    error: [50, 30, 50],
    tap: 20,
    sequence: 30,
    achievement: [40, 60, 40, 60, 80],
    warning: [60, 40, 60],
  },
  medium: {
    success: [50, 70, 50, 70, 100],
    error: [100, 50, 100],
    tap: 40,
    sequence: 50,
    achievement: [60, 80, 60, 80, 120],
    warning: [80, 60, 80],
  },
  strong: {
    success: [80, 100, 80, 100, 150],
    error: [150, 80, 150],
    tap: 60,
    sequence: 80,
    achievement: [100, 120, 100, 120, 200],
    warning: [120, 80, 120],
  },
};

export function useHapticFeedback(childProfileId?: string | null) {
  const [intensity, setIntensity] = useState<HapticIntensity>('medium');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Vibration API is supported
    setIsSupported('vibrate' in navigator);
  }, []);

  useEffect(() => {
    if (!childProfileId) return;

    const loadHapticSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('child_profiles')
          .select('sensory_profile')
          .eq('id', childProfileId)
          .single();

        if (error) throw error;

        if (data?.sensory_profile) {
          const profile = data.sensory_profile as any;
          const savedIntensity = profile.haptic_intensity as HapticIntensity;
          if (savedIntensity && ['off', 'light', 'medium', 'strong'].includes(savedIntensity)) {
            setIntensity(savedIntensity);
          }
        }
      } catch (error) {
        console.error('Error loading haptic settings:', error);
      }
    };

    loadHapticSettings();
  }, [childProfileId]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!isSupported || intensity === 'off') return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Vibration error:', error);
    }
  }, [isSupported, intensity]);

  const hapticFeedback = useCallback((type: keyof HapticPattern) => {
    const pattern = HAPTIC_PATTERNS[intensity][type];
    if (pattern) {
      vibrate(pattern);
    }
  }, [intensity, vibrate]);

  const updateIntensity = useCallback(async (newIntensity: HapticIntensity) => {
    setIntensity(newIntensity);

    if (!childProfileId) return;

    try {
      const { data: currentData } = await supabase
        .from('child_profiles')
        .select('sensory_profile')
        .eq('id', childProfileId)
        .single();

      const currentProfile = (currentData?.sensory_profile as any) || {};

      const { error } = await supabase
        .from('child_profiles')
        .update({
          sensory_profile: {
            ...currentProfile,
            haptic_intensity: newIntensity,
          },
        })
        .eq('id', childProfileId);

      if (error) throw error;

      // Test vibration with new intensity
      hapticFeedback('tap');
    } catch (error) {
      console.error('Error updating haptic intensity:', error);
    }
  }, [childProfileId, hapticFeedback]);

  return {
    intensity,
    setIntensity: updateIntensity,
    isSupported,
    hapticFeedback,
    vibrate,
    patterns: HAPTIC_PATTERNS[intensity],
  };
}
