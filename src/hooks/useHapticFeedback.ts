import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hapticsEngine, type HapticIntensity, type HapticPattern } from '@/lib/haptics';

export function useHapticFeedback(childProfileId?: string | null) {
  const [intensity, setIntensityState] = useState<HapticIntensity>('medium');
  const [isSupported] = useState(hapticsEngine.isHapticsSupported());
  const [isNative] = useState(hapticsEngine.isNativeApp());

  // Sync intensity with haptics engine
  useEffect(() => {
    hapticsEngine.setIntensity(intensity);
  }, [intensity]);

  // Load saved settings from database
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
            setIntensityState(savedIntensity);
            hapticsEngine.setIntensity(savedIntensity);
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
    hapticsEngine.vibratePattern(pattern);
  }, [isSupported, intensity]);

  const hapticFeedback = useCallback(async (type: keyof HapticPattern) => {
    if (!isSupported || intensity === 'off') return;
    await hapticsEngine.trigger(type);
  }, [isSupported, intensity]);

  const updateIntensity = useCallback(async (newIntensity: HapticIntensity) => {
    setIntensityState(newIntensity);
    hapticsEngine.setIntensity(newIntensity);

    if (!childProfileId) {
      // Still test the haptic even without a profile
      await hapticsEngine.trigger('tap');
      return;
    }

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

      // Test haptic with new intensity
      await hapticsEngine.trigger('tap');
    } catch (error) {
      console.error('Error updating haptic intensity:', error);
    }
  }, [childProfileId]);

  return {
    intensity,
    setIntensity: updateIntensity,
    isSupported,
    isNative,
    hapticFeedback,
    vibrate,
  };
}
