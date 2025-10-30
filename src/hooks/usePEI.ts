import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PEIPlan {
  id: string;
  userId: string;
  screeningId: string | null;
  objectives: string;
  activities: string;
  recommendations: string;
  aiGenerated: boolean;
  progress: number;
  status: 'ativo' | 'concluido' | 'arquivado';
  createdAt: string;
  updatedAt: string;
}

export function usePEI() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PEIPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PEIPlan | null>(null);

  useEffect(() => {
    if (user) {
      fetchPEIPlans();
    }
  }, [user]);

  const fetchPEIPlans = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pei_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPlans: PEIPlan[] = (data || []).map((plan) => ({
        id: plan.id,
        userId: plan.user_id,
        screeningId: plan.screening_id,
        objectives: plan.objectives,
        activities: plan.activities,
        recommendations: plan.recommendations,
        aiGenerated: plan.ai_generated,
        progress: plan.progress,
        status: plan.status as 'ativo' | 'concluido' | 'arquivado',
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching PEI plans:', error);
      toast.error('Erro ao carregar planos PEI');
    } finally {
      setLoading(false);
    }
  };

  const updatePEI = async (
    planId: string,
    updates: {
      objectives?: string;
      activities?: string;
      recommendations?: string;
      progress?: number;
      status?: 'ativo' | 'concluido' | 'arquivado';
    }
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pei_plans')
        .update(updates)
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchPEIPlans();
      toast.success('PEI atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Error updating PEI:', error);
      toast.error('Erro ao atualizar PEI');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPEIByScreening = async (screeningId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('pei_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('screening_id', screeningId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const plan: PEIPlan = {
          id: data.id,
          userId: data.user_id,
          screeningId: data.screening_id,
          objectives: data.objectives,
          activities: data.activities,
          recommendations: data.recommendations,
          aiGenerated: data.ai_generated,
          progress: data.progress,
          status: data.status as 'ativo' | 'concluido' | 'arquivado',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setCurrentPlan(plan);
        return plan;
      }
      return null;
    } catch (error) {
      console.error('Error fetching PEI by screening:', error);
      return null;
    }
  };

  const createPEI = async (peiData: {
    screeningId?: string;
    objectives: string;
    activities: string;
    recommendations: string;
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pei_plans')
        .insert({
          user_id: user.id,
          screening_id: peiData.screeningId || null,
          objectives: peiData.objectives,
          activities: peiData.activities,
          recommendations: peiData.recommendations,
          ai_generated: false,
          progress: 0,
          status: 'ativo',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPEIPlans();
      toast.success('PEI criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error creating PEI:', error);
      toast.error('Erro ao criar PEI');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    plans,
    currentPlan,
    loading,
    fetchPEIPlans,
    updatePEI,
    getPEIByScreening,
    createPEI,
  };
}
