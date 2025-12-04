import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook universal para gerenciar perfis de jogos
 * SEMPRE salva sessões - nunca entra em modo teste
 */
export function useGameProfile() {
  const { user } = useAuth();
  const [childProfileId, setChildProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Try to load from localStorage first
      const storedId = localStorage.getItem('selectedChildProfile');
      if (storedId) {
        // Verify it still exists and belongs to user
        const { data: verifyProfile } = await supabase
          .from('child_profiles')
          .select('id')
          .eq('id', storedId)
          .eq('parent_user_id', user?.id)
          .maybeSingle();
        
        if (verifyProfile?.id) {
          setChildProfileId(storedId);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem('selectedChildProfile');
        }
      }

      // Try to load from database - get first child profile
      const { data: profiles, error } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', user?.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
      }

      if (profiles?.id) {
        setChildProfileId(profiles.id);
        localStorage.setItem('selectedChildProfile', profiles.id);
      } else {
        // No child profile - sessions will still be saved to learning_sessions
        setChildProfileId(null);
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    childProfileId,
    isTestMode: false, // NEVER test mode - always save
    loading,
    user,
  };
}
