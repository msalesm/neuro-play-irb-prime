import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

export interface AccessibilityProfile {
  fontScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  uiDensity: 'normal' | 'spacious';
  touchTargetSizePx: number;
  captions: {
    enabled: boolean;
    language: string;
  };
  hints: {
    showInlineHints: boolean;
    hintMode: 'normal' | 'simplified' | 'timed';
  };
  timers?: {
    show: boolean;
    defaultMs: number;
  };
  inputMode?: string;
}

interface AccessibilityPreset {
  id: string;
  label: string;
  description: string;
  profile: AccessibilityProfile;
}

interface AccessibilityContextType {
  profile: AccessibilityProfile;
  presets: AccessibilityPreset[];
  currentPresetId: string;
  loading: boolean;
  setPreset: (presetId: string) => Promise<void>;
  updateProfile: (updates: Partial<AccessibilityProfile>) => Promise<void>;
  saveProfile: () => Promise<void>;
}

const defaultProfile: AccessibilityProfile = {
  fontScale: 1.0,
  highContrast: false,
  reducedMotion: false,
  uiDensity: 'normal',
  touchTargetSizePx: 44,
  captions: { enabled: false, language: 'pt-BR' },
  hints: { showInlineHints: true, hintMode: 'normal' },
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AccessibilityProfile>(defaultProfile);
  const [presets, setPresets] = useState<AccessibilityPreset[]>([]);
  const [currentPresetId, setCurrentPresetId] = useState<string>('DEFAULT');
  const [loading, setLoading] = useState(true);

  // Apply CSS variables
  const applyAccessibility = useCallback((p: AccessibilityProfile) => {
    const root = document.documentElement;
    
    root.style.setProperty('--font-scale', String(p.fontScale));
    root.style.setProperty('--touch-target', `${p.touchTargetSizePx}px`);
    
    if (p.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    root.setAttribute('data-reduced-motion', String(p.reducedMotion));
    root.setAttribute('data-ui-density', p.uiDensity);
    root.setAttribute('data-captions', String(p.captions.enabled));
  }, []);

  // Load presets
  useEffect(() => {
    const loadPresets = async () => {
      const { data, error } = await supabase
        .from('accessibility_presets')
        .select('*');
      
      if (!error && data) {
        setPresets(data.map(p => ({
          id: p.id,
          label: p.label,
          description: p.description || '',
          profile: p.profile as unknown as AccessibilityProfile,
        })));
      }
    };
    
    loadPresets();
  }, []);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      if (user) {
        const { data, error } = await supabase
          .from('accessibility_profiles')
          .select('*')
          .eq('user_id', user.id)
          .is('game_id', null)
          .single();
        
        if (!error && data) {
          const loadedProfile = data.profile as unknown as AccessibilityProfile;
          setProfile(loadedProfile);
          setCurrentPresetId(data.preset_id || 'DEFAULT');
          applyAccessibility(loadedProfile);
        } else {
          // Use default
          applyAccessibility(defaultProfile);
        }
      } else {
        // Load from localStorage for guests
        const saved = localStorage.getItem('accessibility_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfile(parsed);
          applyAccessibility(parsed);
        } else {
          applyAccessibility(defaultProfile);
        }
      }
      
      setLoading(false);
    };
    
    loadProfile();
  }, [user, applyAccessibility]);

  const setPreset = async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    
    setCurrentPresetId(presetId);
    setProfile(preset.profile);
    applyAccessibility(preset.profile);
    
    if (user) {
      await supabase
        .from('accessibility_profiles')
        .upsert([{
          user_id: user.id,
          game_id: null,
          preset_id: presetId,
          profile: preset.profile as unknown as Json,
          updated_at: new Date().toISOString(),
        }], { onConflict: 'user_id,game_id' });
    } else {
      localStorage.setItem('accessibility_profile', JSON.stringify(preset.profile));
    }
  };

  const updateProfile = async (updates: Partial<AccessibilityProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    applyAccessibility(newProfile);
    setCurrentPresetId('CUSTOM');
    
    if (user) {
      await supabase
        .from('accessibility_profiles')
        .upsert([{
          user_id: user.id,
          game_id: null,
          preset_id: null,
          profile: newProfile as unknown as Json,
          updated_at: new Date().toISOString(),
        }], { onConflict: 'user_id,game_id' });
    } else {
      localStorage.setItem('accessibility_profile', JSON.stringify(newProfile));
    }
  };

  const saveProfile = async () => {
    if (user) {
      await supabase
        .from('accessibility_profiles')
        .upsert([{
          user_id: user.id,
          game_id: null,
          preset_id: currentPresetId === 'CUSTOM' ? null : currentPresetId,
          profile: profile as unknown as Json,
          updated_at: new Date().toISOString(),
        }], { onConflict: 'user_id,game_id' });
    } else {
      localStorage.setItem('accessibility_profile', JSON.stringify(profile));
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      profile,
      presets,
      currentPresetId,
      loading,
      setPreset,
      updateProfile,
      saveProfile,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
