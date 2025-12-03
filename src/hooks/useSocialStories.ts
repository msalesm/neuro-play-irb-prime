import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SocialStory {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StoryStep {
  id: string;
  story_id: string;
  order_number: number;
  image_url: string | null;
  title: string;
  description: string | null;
  audio_url: string | null;
}

export function useSocialStories() {
  const [stories, setStories] = useState<SocialStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('social_stories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (queryError) throw queryError;
      setStories(data || []);
    } catch (err) {
      setError('Erro ao carregar histórias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  return { stories, loading, error, refresh: loadStories };
}

export function useStorySteps(storyId: string | null) {
  const [steps, setSteps] = useState<StoryStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSteps = useCallback(async () => {
    if (!storyId) {
      setSteps([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('story_steps')
        .select('*')
        .eq('story_id', storyId)
        .order('order_number', { ascending: true });
      
      if (queryError) throw queryError;
      setSteps(data || []);
    } catch (err) {
      setError('Erro ao carregar passos da história');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  return { steps, loading, error, refresh: loadSteps };
}
