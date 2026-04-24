/**
 * Hook: useTraitProfile
 *
 * Returns a pedagogical TraitProfile derived from the UnifiedProfile.
 * Pure derivation on top of useBehavioralProfile — no extra DB calls.
 */

import { useMemo } from 'react';
import { useBehavioralProfile } from './useBehavioralProfile';
import { generateTraitProfile, type TraitProfile } from '@/modules/behavioral/trait-profile-engine';

export function useTraitProfile(childId: string | undefined) {
  const { data: profile, isLoading, error } = useBehavioralProfile(childId);

  const traitProfile = useMemo<TraitProfile | null>(() => {
    if (!profile) return null;
    return generateTraitProfile(profile);
  }, [profile]);

  return {
    data: traitProfile,
    isLoading,
    error,
    profile, // expose underlying profile for advanced callers
  };
}