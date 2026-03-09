/**
 * useOnboardingStatus — checks if user completed LGPD onboarding flow.
 * 
 * Queries data_consents for clinical_disclaimer once per session,
 * caches result in a module-level Map to avoid re-querying on every render.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Module-level cache: persists across re-renders and remounts within the same session
const sessionCache = new Map<string, boolean>();

export function useOnboardingStatus() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompleted(null);
      setLoading(false);
      return;
    }

    // Check session cache first
    if (sessionCache.has(user.id)) {
      setCompleted(sessionCache.get(user.id)!);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      const { data } = await supabase
        .from('data_consents')
        .select('id')
        .eq('user_id', user.id)
        .eq('consent_type', 'clinical_disclaimer')
        .eq('consent_given', true)
        .maybeSingle();

      if (cancelled) return;

      const result = !!data;
      sessionCache.set(user.id, result);
      setCompleted(result);
      setLoading(false);
    };

    check();

    return () => { cancelled = true; };
  }, [user]);

  return { completed: completed ?? false, loading };
}

/**
 * Call this after onboarding completes to update the cache
 * without waiting for a re-query.
 */
export function markOnboardingComplete(userId: string) {
  sessionCache.set(userId, true);
}
