import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface MarketplaceItem {
  id: string;
  creator_id: string;
  item_type: 'social_story' | 'learning_trail' | 'mini_game' | 'routine_template';
  title: string;
  description?: string;
  preview_url?: string;
  content_data: any;
  price_coins: number;
  price_real: number;
  is_premium_only: boolean;
  age_min?: number;
  age_max?: number;
  target_conditions?: string[];
  language: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  download_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  creator?: {
    display_name: string;
    credentials: string[];
    rating: number;
  };
}

export interface UserCoins {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export function useMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [myItems, setMyItems] = useState<MarketplaceItem[]>([]);
  const [myPurchases, setMyPurchases] = useState<string[]>([]);
  const [coins, setCoins] = useState<UserCoins>({ balance: 0, total_earned: 0, total_spent: 0 });
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  const loadItems = useCallback(async (filters?: {
    type?: string;
    ageRange?: [number, number];
    conditions?: string[];
    language?: string;
  }) => {
    try {
      let query = supabase
        .from('marketplace_items')
        .select(`
          *,
          creator:marketplace_creators(display_name, credentials, rating)
        `)
        .eq('status', 'published')
        .order('download_count', { ascending: false });

      if (filters?.type) {
        query = query.eq('item_type', filters.type);
      }
      if (filters?.language) {
        query = query.eq('language', filters.language);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems((data || []) as MarketplaceItem[]);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    }
  }, []);

  const loadMyItems = useCallback(async () => {
    if (!user) return;

    try {
      const { data: creatorData } = await supabase
        .from('marketplace_creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (creatorData) {
        setIsCreator(true);
        const { data, error } = await supabase
          .from('marketplace_items')
          .select('*')
          .eq('creator_id', creatorData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMyItems((data || []) as MarketplaceItem[]);
      }
    } catch (error) {
      console.error('Error loading my items:', error);
    }
  }, [user]);

  const loadPurchases = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_purchases')
        .select('item_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setMyPurchases((data || []).map(p => p.item_id));
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  }, [user]);

  const loadCoins = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_coins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCoins({
          balance: data.balance,
          total_earned: data.total_earned,
          total_spent: data.total_spent
        });
      }
    } catch (error) {
      console.error('Error loading coins:', error);
    }
  }, [user]);

  const purchaseItem = useCallback(async (itemId: string, paymentType: 'coins' | 'subscription' | 'direct' = 'coins') => {
    if (!user) return false;

    try {
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      if (paymentType === 'coins' && coins.balance < item.price_coins) {
        toast({
          title: 'Moedas insuficientes',
          description: 'Você não tem moedas suficientes para esta compra',
          variant: 'destructive'
        });
        return false;
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('marketplace_purchases')
        .insert({
          user_id: user.id,
          item_id: itemId,
          price_paid: paymentType === 'coins' ? item.price_coins : item.price_real,
          payment_type: paymentType,
          creator_earnings: (paymentType === 'coins' ? item.price_coins : item.price_real) * 0.7,
          platform_fee: (paymentType === 'coins' ? item.price_coins : item.price_real) * 0.3
        });

      if (purchaseError) throw purchaseError;

      // Deduct coins if payment type is coins
      if (paymentType === 'coins') {
        const { error: coinsError } = await supabase
          .from('user_coins')
          .update({ 
            balance: coins.balance - item.price_coins,
            total_spent: coins.total_spent + item.price_coins
          })
          .eq('user_id', user.id);

        if (coinsError) throw coinsError;
      }

      // Increment download count
      await supabase
        .from('marketplace_items')
        .update({ download_count: item.download_count + 1 })
        .eq('id', itemId);

      toast({
        title: 'Compra realizada!',
        description: `${item.title} foi adicionado à sua biblioteca`
      });

      await Promise.all([loadPurchases(), loadCoins()]);
      return true;
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Erro na compra',
        description: 'Não foi possível completar a compra',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, items, coins, toast, loadPurchases, loadCoins]);

  const submitItem = useCallback(async (item: Partial<MarketplaceItem>) => {
    if (!user) return null;

    try {
      // Get or create creator profile
      let { data: creator } = await supabase
        .from('marketplace_creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!creator) {
        const { data: newCreator, error: createError } = await supabase
          .from('marketplace_creators')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'Criador'
          })
          .select()
          .single();

        if (createError) throw createError;
        creator = newCreator;
        setIsCreator(true);
      }

      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          creator_id: creator.id,
          item_type: item.item_type || 'social_story',
          title: item.title || 'Untitled',
          content_data: item.content_data || {},
          description: item.description,
          price_coins: item.price_coins || 0,
          price_real: item.price_real || 0,
          age_min: item.age_min,
          age_max: item.age_max,
          target_conditions: item.target_conditions,
          language: item.language || 'pt'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Item enviado',
        description: 'Seu item foi enviado para aprovação'
      });

      await loadMyItems();
      return data as MarketplaceItem;
    } catch (error) {
      console.error('Error submitting item:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar o item',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast, loadMyItems]);

  const hasPurchased = useCallback((itemId: string) => {
    return myPurchases.includes(itemId);
  }, [myPurchases]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadItems(), loadMyItems(), loadPurchases(), loadCoins()])
      .finally(() => setLoading(false));
  }, [loadItems, loadMyItems, loadPurchases, loadCoins]);

  return {
    items,
    myItems,
    myPurchases,
    coins,
    loading,
    isCreator,
    loadItems,
    purchaseItem,
    submitItem,
    hasPurchased,
    reload: () => Promise.all([loadItems(), loadMyItems(), loadPurchases(), loadCoins()])
  };
}
