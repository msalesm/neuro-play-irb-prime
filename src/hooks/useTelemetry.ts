import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

type TelemetryEventType = 
  | 'screen_view'
  | 'screen_exit'
  | 'story_start'
  | 'step_view'
  | 'story_end'
  | 'button_click'
  | 'touch_error'
  | 'game_start'
  | 'game_end'
  | 'accessibility_change';

export function useTelemetry(gameId?: string) {
  const { user } = useAuth();

  const sendEvent = useCallback(async (
    eventType: TelemetryEventType,
    payload: Record<string, unknown> = {}
  ) => {
    try {
      await supabase
        .from('telemetry_events')
        .insert([{
          user_id: user?.id || null,
          game_id: gameId || null,
          event_type: eventType,
          payload: payload as Json,
        }]);
    } catch (error) {
      console.error('Telemetry error:', error);
    }
  }, [user?.id, gameId]);

  const trackScreenView = useCallback((screenName: string) => {
    sendEvent('screen_view', { screen: screenName, timestamp: Date.now() });
  }, [sendEvent]);

  const trackScreenExit = useCallback((screenName: string) => {
    sendEvent('screen_exit', { screen: screenName, timestamp: Date.now() });
  }, [sendEvent]);

  const trackStoryStart = useCallback((storyId: string, storyTitle: string) => {
    sendEvent('story_start', { storyId, storyTitle, timestamp: Date.now() });
  }, [sendEvent]);

  const trackStepView = useCallback((storyId: string, stepNumber: number, stepTitle: string) => {
    sendEvent('step_view', { storyId, stepNumber, stepTitle, timestamp: Date.now() });
  }, [sendEvent]);

  const trackStoryEnd = useCallback((storyId: string, storyTitle: string, totalSteps: number) => {
    sendEvent('story_end', { storyId, storyTitle, totalSteps, timestamp: Date.now() });
  }, [sendEvent]);

  const trackButtonClick = useCallback((buttonName: string, context?: string) => {
    sendEvent('button_click', { buttonName, context, timestamp: Date.now() });
  }, [sendEvent]);

  const trackAccessibilityChange = useCallback((presetId: string, changes?: Record<string, unknown>) => {
    sendEvent('accessibility_change', { presetId, changes, timestamp: Date.now() });
  }, [sendEvent]);

  return {
    sendEvent,
    trackScreenView,
    trackScreenExit,
    trackStoryStart,
    trackStepView,
    trackStoryEnd,
    trackButtonClick,
    trackAccessibilityChange,
  };
}
