import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook universal para gerenciar perfis de jogos
 * Permite modo teste quando não há child_profile
 */
export function useGameProfile() {
  const { user } = useAuth();
  const [childProfileId, setChildProfileId] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
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
        setChildProfileId(storedId);
        setIsTestMode(false);
        setLoading(false);
        return;
      }

      // Try to load from database
      const { data: profiles, error } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
      }

      if (profiles?.id) {
        setChildProfileId(profiles.id);
        setIsTestMode(false);
        localStorage.setItem('selectedChildProfile', profiles.id);
      } else {
        // No profile found - enable test mode
        setIsTestMode(true);
        setChildProfileId(null);
        toast.info('🎮 Modo Teste - Jogando sem salvar progresso', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
      setIsTestMode(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    childProfileId,
    isTestMode,
    loading,
    user,
  };
}
