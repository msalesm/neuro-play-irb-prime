import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function getInvokeErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const bodyText = await error.context.text();
      if (!bodyText) return error.message;

      try {
        const parsed = JSON.parse(bodyText);
        return parsed?.message || parsed?.error || bodyText;
      } catch {
        return bodyText;
      }
    } catch {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro inesperado na sincronização';
}

export function useAbaIntegration() {
  const queryClient = useQueryClient();

  const { data: aprendizes, isLoading: loadingAprendizes } = useQuery({
    queryKey: ['aba-aprendizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aba_aprendizes')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      if (error) throw error;
      return data;
    },
  });

  const { data: syncLogs, isLoading: loadingSyncLogs } = useQuery({
    queryKey: ['aba-sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aba_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: neuroScores } = useQuery({
    queryKey: ['aba-neuro-scores'],
    queryFn: async () => {
      // Get latest score per aprendiz
      const { data, error } = await supabase
        .from('aba_neuro_scores')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(100);
      if (error) throw error;

      // Deduplicate: keep only latest per aprendiz
      const latest = new Map<string, any>();
      for (const score of data || []) {
        if (!latest.has(score.codigo_aprendiz)) {
          latest.set(score.codigo_aprendiz, score);
        }
      }
      return Array.from(latest.values());
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ['aba-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aba_neuro_scores')
        .select('*, aba_aprendizes!inner(nome)')
        .not('alert_type', 'is', null)
        .order('calculated_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (action: string = 'full_sync') => {
      const { data, error } = await supabase.functions.invoke('aba-sync', {
        body: { action },
      });
      if (error) {
        throw new Error(await getInvokeErrorMessage(error));
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Sincronização concluída: ${data.total_records} registros`);
      queryClient.invalidateQueries({ queryKey: ['aba-aprendizes'] });
      queryClient.invalidateQueries({ queryKey: ['aba-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['aba-neuro-scores'] });
      queryClient.invalidateQueries({ queryKey: ['aba-alerts'] });
    },
    onError: (error) => {
      toast.error(`Erro na sincronização: ${error.message}`);
    },
  });

  return {
    aprendizes: aprendizes || [],
    syncLogs: syncLogs || [],
    neuroScores: neuroScores || [],
    alerts: alerts || [],
    loading: loadingAprendizes || loadingSyncLogs,
    syncing: syncMutation.isPending,
    triggerSync: (action?: string) => syncMutation.mutate(action || 'full_sync'),
  };
}

export function useAbaAprendizDetail(codigoAprendiz: string | undefined) {
  const { data: aprendiz } = useQuery({
    queryKey: ['aba-aprendiz', codigoAprendiz],
    queryFn: async () => {
      if (!codigoAprendiz) return null;
      const { data, error } = await supabase
        .from('aba_aprendizes')
        .select('*')
        .eq('codigo_aprendiz', codigoAprendiz)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!codigoAprendiz,
  });

  const { data: desempenhos } = useQuery({
    queryKey: ['aba-desempenho', codigoAprendiz],
    queryFn: async () => {
      if (!codigoAprendiz) return [];
      const { data, error } = await supabase
        .from('aba_desempenho')
        .select('*')
        .eq('codigo_aprendiz', codigoAprendiz)
        .order('synced_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!codigoAprendiz,
  });

  const { data: atendimentos } = useQuery({
    queryKey: ['aba-atendimentos', codigoAprendiz],
    queryFn: async () => {
      if (!codigoAprendiz) return [];
      const { data, error } = await supabase
        .from('aba_atendimentos')
        .select('*')
        .eq('codigo_aprendiz', codigoAprendiz)
        .order('data_inicio', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!codigoAprendiz,
  });

  const { data: scores } = useQuery({
    queryKey: ['aba-scores-history', codigoAprendiz],
    queryFn: async () => {
      if (!codigoAprendiz) return [];
      const { data, error } = await supabase
        .from('aba_neuro_scores')
        .select('*')
        .eq('codigo_aprendiz', codigoAprendiz)
        .order('calculated_at', { ascending: true })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!codigoAprendiz,
  });

  return {
    aprendiz,
    desempenhos: desempenhos || [],
    atendimentos: atendimentos || [],
    scores: scores || [],
  };
}
