import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface AvatarItem {
  id: string;
  item_type: 'accessory' | 'clothing' | 'pet' | 'background' | 'effect';
  name: string;
  description?: string;
  image_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlock_requirement: 'purchase' | 'achievement' | 'level' | 'event';
  unlock_value?: number;
  is_premium: boolean;
}

export interface ChildAvatarItem {
  id: string;
  child_id: string;
  item_id: string;
  is_equipped: boolean;
  unlocked_at: string;
  item?: AvatarItem;
}

export interface AvatarEmotionalState {
  id: string;
  child_id: string;
  current_mood: 'happy' | 'calm' | 'focused' | 'tired' | 'anxious' | 'neutral';
  energy_level: number;
  last_activity_at?: string;
  mode: 'normal' | 'calm' | 'focus';
  updated_at: string;
}

export interface UnlockableWorld {
  id: string;
  name: string;
  description?: string;
  theme: 'ocean' | 'space' | 'forest' | 'city' | 'fantasy';
  unlock_requirement: string;
  unlock_value?: number;
  background_url?: string;
  ambient_sound_url?: string;
  is_premium: boolean;
  sort_order: number;
}

export function useAvatarPremium(childId?: string) {
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<AvatarItem[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<ChildAvatarItem[]>([]);
  const [emotionalState, setEmotionalState] = useState<AvatarEmotionalState | null>(null);
  const [worlds, setWorlds] = useState<UnlockableWorld[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('avatar_items')
        .select('*')
        .order('rarity', { ascending: true });

      if (error) throw error;
      setAllItems((data || []) as AvatarItem[]);
    } catch (error) {
      console.error('Error loading avatar items:', error);
    }
  }, []);

  const loadUnlockedItems = useCallback(async () => {
    if (!childId) return;

    try {
      const { data, error } = await supabase
        .from('child_avatar_items')
        .select(`
          *,
          item:avatar_items(*)
        `)
        .eq('child_id', childId);

      if (error) throw error;
      setUnlockedItems((data || []) as ChildAvatarItem[]);
    } catch (error) {
      console.error('Error loading unlocked items:', error);
    }
  }, [childId]);

  const loadEmotionalState = useCallback(async () => {
    if (!childId) return;

    try {
      const { data, error } = await supabase
        .from('avatar_emotional_states')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setEmotionalState(data as AvatarEmotionalState);
      } else {
        // Create default state
        const { data: newState } = await supabase
          .from('avatar_emotional_states')
          .insert({
            child_id: childId,
            current_mood: 'neutral',
            energy_level: 100,
            mode: 'normal'
          })
          .select()
          .single();
        
        if (newState) setEmotionalState(newState as AvatarEmotionalState);
      }
    } catch (error) {
      console.error('Error loading emotional state:', error);
    }
  }, [childId]);

  const loadWorlds = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('unlockable_worlds')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setWorlds((data || []) as UnlockableWorld[]);
    } catch (error) {
      console.error('Error loading worlds:', error);
    }
  }, []);

  const equipItem = useCallback(async (itemId: string) => {
    if (!childId) return;

    try {
      // First, unequip all items of the same type
      const item = unlockedItems.find(i => i.item_id === itemId);
      if (!item?.item) return;

      const sameTypeItems = unlockedItems.filter(
        i => i.item?.item_type === item.item?.item_type && i.is_equipped
      );

      for (const toUnequip of sameTypeItems) {
        await supabase
          .from('child_avatar_items')
          .update({ is_equipped: false })
          .eq('id', toUnequip.id);
      }

      // Equip the selected item
      const { error } = await supabase
        .from('child_avatar_items')
        .update({ is_equipped: true })
        .eq('child_id', childId)
        .eq('item_id', itemId);

      if (error) throw error;

      toast({
        title: 'Item equipado!',
        description: `${item.item.name} foi equipado`
      });

      await loadUnlockedItems();
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  }, [childId, unlockedItems, toast, loadUnlockedItems]);

  const unequipItem = useCallback(async (itemId: string) => {
    if (!childId) return;

    try {
      const { error } = await supabase
        .from('child_avatar_items')
        .update({ is_equipped: false })
        .eq('child_id', childId)
        .eq('item_id', itemId);

      if (error) throw error;
      await loadUnlockedItems();
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  }, [childId, loadUnlockedItems]);

  const unlockItem = useCallback(async (itemId: string) => {
    if (!childId) return false;

    try {
      const { error } = await supabase
        .from('child_avatar_items')
        .insert({
          child_id: childId,
          item_id: itemId,
          is_equipped: false
        });

      if (error) throw error;

      const item = allItems.find(i => i.id === itemId);
      toast({
        title: 'Item desbloqueado!',
        description: `Você desbloqueou: ${item?.name}`
      });

      await loadUnlockedItems();
      return true;
    } catch (error) {
      console.error('Error unlocking item:', error);
      return false;
    }
  }, [childId, allItems, toast, loadUnlockedItems]);

  const updateMood = useCallback(async (mood: AvatarEmotionalState['current_mood']) => {
    if (!childId || !emotionalState) return;

    try {
      const { error } = await supabase
        .from('avatar_emotional_states')
        .update({ 
          current_mood: mood,
          updated_at: new Date().toISOString()
        })
        .eq('child_id', childId);

      if (error) throw error;
      await loadEmotionalState();
    } catch (error) {
      console.error('Error updating mood:', error);
    }
  }, [childId, emotionalState, loadEmotionalState]);

  const setMode = useCallback(async (mode: AvatarEmotionalState['mode']) => {
    if (!childId) return;

    try {
      const { error } = await supabase
        .from('avatar_emotional_states')
        .update({ 
          mode,
          updated_at: new Date().toISOString()
        })
        .eq('child_id', childId);

      if (error) throw error;

      toast({
        title: mode === 'calm' ? 'Modo Calmo' : mode === 'focus' ? 'Modo Foco' : 'Modo Normal',
        description: 'O modo do avatar foi alterado'
      });

      await loadEmotionalState();
    } catch (error) {
      console.error('Error setting mode:', error);
    }
  }, [childId, toast, loadEmotionalState]);

  const getEquippedItems = useCallback(() => {
    return unlockedItems.filter(i => i.is_equipped);
  }, [unlockedItems]);

  const isItemUnlocked = useCallback((itemId: string) => {
    return unlockedItems.some(i => i.item_id === itemId);
  }, [unlockedItems]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadAllItems(), loadUnlockedItems(), loadEmotionalState(), loadWorlds()])
      .finally(() => setLoading(false));
  }, [loadAllItems, loadUnlockedItems, loadEmotionalState, loadWorlds]);

  return {
    allItems,
    unlockedItems,
    emotionalState,
    worlds,
    loading,
    equipItem,
    unequipItem,
    unlockItem,
    updateMood,
    setMode,
    getEquippedItems,
    isItemUnlocked,
    reload: () => Promise.all([loadAllItems(), loadUnlockedItems(), loadEmotionalState(), loadWorlds()])
  };
}
