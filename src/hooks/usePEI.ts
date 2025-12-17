import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PEIPlan {
  id: string;
  user_id: string;
  screening_id: string;
  goals: any;
  accommodations: any;
  strategies: any;
  progress_notes: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export function usePEI() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PEIPlan | null>(null);

  const getPEIByScreening = async (screeningId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pei_plans')
        .select('*')
        .eq('screening_id', screeningId)
        .maybeSingle();

      if (error) throw error;

      setCurrentPlan(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching PEI:', error);
      toast.error('Erro ao carregar PEI');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPEIByUserId = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pei_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;

      setCurrentPlan(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching PEI by user:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAllPEIsForUser = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pei_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCurrentPlan(data[0]);
      }
      return data || [];
    } catch (error: any) {
      console.error('Error fetching PEIs:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (screeningId: string, userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pei_plans')
        .insert({
          screening_id: screeningId,
          user_id: userId,
          goals: [],
          accommodations: [],
          strategies: [],
          progress_notes: [],
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentPlan(data);
      toast.success('PEI criado com sucesso');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating PEI:', error);
      toast.error('Erro ao criar PEI');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updatePEI = async (id: string, updates: Partial<PEIPlan>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pei_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCurrentPlan(data);
      toast.success('PEI atualizado com sucesso');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating PEI:', error);
      toast.error('Erro ao atualizar PEI');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentPlan,
    peiPlan: currentPlan,
    getPEIByScreening,
    getPEIByUserId,
    getAllPEIsForUser,
    createPlan,
    updatePlan: updatePEI,
    updatePEI,
  };
}
