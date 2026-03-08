import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============ SKILLS ============
export function useAbaSkills() {
  return useQuery({
    queryKey: ['aba-np-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aba_np_skills')
        .select('*')
        .eq('is_active', true)
        .order('skill_category');
      if (error) throw error;
      return data;
    },
  });
}

// ============ PROGRAMS ============
export function useAbaPrograms(childId?: string) {
  return useQuery({
    queryKey: ['aba-np-programs', childId],
    queryFn: async () => {
      let query = supabase
        .from('aba_np_programs')
        .select('*, profiles!aba_np_programs_created_by_fkey(full_name)')
        .order('created_at', { ascending: false });
      if (childId) query = query.eq('child_id', childId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: childId ? !!childId : true,
  });
}

export function useCreateProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (program: {
      child_id: string;
      program_name: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('aba_np_programs')
        .insert({ ...program, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Programa ABA criado com sucesso');
      qc.invalidateQueries({ queryKey: ['aba-np-programs'] });
    },
    onError: (e) => toast.error(`Erro ao criar programa: ${e.message}`),
  });
}

// ============ INTERVENTIONS ============
export function useAbaInterventions(programId?: string) {
  return useQuery({
    queryKey: ['aba-np-interventions', programId],
    queryFn: async () => {
      if (!programId) return [];
      const { data, error } = await supabase
        .from('aba_np_interventions')
        .select('*, aba_np_skills(skill_name, skill_category, description)')
        .eq('program_id', programId)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!programId,
  });
}

export function useCreateIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (intervention: {
      program_id: string;
      skill_id: string;
      baseline_level?: number;
      target_level?: number;
      teaching_method?: string;
      prompting_strategy?: string;
      reinforcement_type?: string;
      success_criteria?: string;
    }) => {
      const { data, error } = await supabase
        .from('aba_np_interventions')
        .insert([intervention as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      toast.success('Habilidade adicionada ao programa');
      qc.invalidateQueries({ queryKey: ['aba-np-interventions', vars.program_id] });
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
}

// ============ TRIALS ============
export function useAbaTrials(interventionId?: string) {
  return useQuery({
    queryKey: ['aba-np-trials', interventionId],
    queryFn: async () => {
      if (!interventionId) return [];
      const { data, error } = await supabase
        .from('aba_np_trials')
        .select('*')
        .eq('intervention_id', interventionId)
        .order('recorded_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!interventionId,
  });
}

export function useRecordTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trial: {
      intervention_id: string;
      child_id: string;
      prompt_level: string;
      correct: boolean;
      latency_ms?: number;
      reinforcement_given?: boolean;
      reinforcement_type?: string;
      session_number?: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('aba_np_trials')
        .insert([{ ...trial, recorded_by: user.id } as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['aba-np-trials', vars.intervention_id] });
    },
    onError: (e) => toast.error(`Erro ao registrar tentativa: ${e.message}`),
  });
}

// ============ REINFORCEMENTS ============
export function useAbaReinforcements() {
  return useQuery({
    queryKey: ['aba-np-reinforcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aba_np_reinforcements')
        .select('*')
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ============ PROGRESS STATS ============
export function useAbaProgressStats(interventionId?: string) {
  const { data: trials } = useAbaTrials(interventionId);
  
  if (!trials || trials.length === 0) {
    return { accuracy: 0, independence: 0, totalTrials: 0, sessions: [] as any[], trend: 'stable' as const };
  }

  const totalTrials = trials.length;
  const correctTrials = trials.filter((t) => t.correct).length;
  const accuracy = Math.round((correctTrials / totalTrials) * 100);
  
  const independentTrials = trials.filter((t) => t.prompt_level === 'independente').length;
  const independence = Math.round((independentTrials / totalTrials) * 100);

  // Group by session
  const sessionMap = new Map<number, { correct: number; total: number; independent: number }>();
  for (const t of trials) {
    const sn = t.session_number || 1;
    const s = sessionMap.get(sn) || { correct: 0, total: 0, independent: 0 };
    s.total++;
    if (t.correct) s.correct++;
    if (t.prompt_level === 'independente') s.independent++;
    sessionMap.set(sn, s);
  }

  const sessions = Array.from(sessionMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([session, s]) => ({
      session,
      accuracy: Math.round((s.correct / s.total) * 100),
      independence: Math.round((s.independent / s.total) * 100),
    }));

  // Trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (sessions.length >= 4) {
    const first3 = sessions.slice(0, 3).reduce((s, v) => s + v.accuracy, 0) / 3;
    const last3 = sessions.slice(-3).reduce((s, v) => s + v.accuracy, 0) / 3;
    if (last3 - first3 > 10) trend = 'up';
    else if (first3 - last3 > 10) trend = 'down';
  }

  return { accuracy, independence, totalTrials, sessions, trend };
}

// ============ CHILD PROGRAMS SUMMARY ============
export function useChildAbaSummary(childId?: string) {
  return useQuery({
    queryKey: ['aba-np-summary', childId],
    queryFn: async () => {
      if (!childId) return null;
      
      const [{ data: programs }, { data: trials }] = await Promise.all([
        supabase
          .from('aba_np_programs')
          .select('id, program_name, status')
          .eq('child_id', childId)
          .eq('status', 'active'),
        supabase
          .from('aba_np_trials')
          .select('correct, prompt_level, recorded_at')
          .eq('child_id', childId)
          .order('recorded_at', { ascending: false })
          .limit(100),
      ]);

      const totalTrials = trials?.length || 0;
      const correctTrials = trials?.filter(t => t.correct).length || 0;
      const independentTrials = trials?.filter(t => t.prompt_level === 'independente').length || 0;

      return {
        activePrograms: programs?.length || 0,
        totalTrials,
        accuracy: totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0,
        independence: totalTrials > 0 ? Math.round((independentTrials / totalTrials) * 100) : 0,
      };
    },
    enabled: !!childId,
  });
}
