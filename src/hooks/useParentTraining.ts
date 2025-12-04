import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

interface ParentTraining {
  id: string;
  userId: string;
  moduleName: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido';
  score?: number;
  startedAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  progressData?: any;
}

export function useParentTraining() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [trainings, setTrainings] = useState<ParentTraining[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrainings();
    }
  }, [user, isAdmin]);

  const fetchTrainings = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('parent_training')
        .select('*');

      // Se não é admin, filtra apenas os dados do usuário
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map((t) => ({
        id: t.id,
        userId: t.user_id,
        moduleName: t.module_name,
        status: t.status as 'nao_iniciado' | 'em_andamento' | 'concluido',
        score: t.score || undefined,
        startedAt: t.started_at || undefined,
        completedAt: t.completed_at || undefined,
        certificateUrl: t.certificate_url || undefined,
        progressData: t.progress_data,
      }));

      setTrainings(mapped);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const startModule = async (moduleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('parent_training')
        .upsert({
          user_id: user.id,
          module_name: moduleId,
          status: 'em_andamento',
          started_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchTrainings();
    } catch (error) {
      console.error('Error starting module:', error);
    }
  };

  const completeModule = async (moduleId: string, score: number, certificateUrl?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('parent_training')
        .upsert({
          user_id: user.id,
          module_name: moduleId,
          status: 'concluido',
          score,
          completed_at: new Date().toISOString(),
          certificate_url: certificateUrl,
        });

      if (error) throw error;
      await fetchTrainings();
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  const getCompletedModules = () => {
    return trainings.filter((t) => t.status === 'concluido');
  };

  const getTotalScore = () => {
    const completed = getCompletedModules();
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, t) => sum + (t.score || 0), 0);
    return Math.round(total / completed.length);
  };

  return {
    trainings,
    loading,
    startModule,
    completeModule,
    getCompletedModules,
    getTotalScore,
    refetch: fetchTrainings,
  };
}
