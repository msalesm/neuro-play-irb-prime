import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAbaNativeData() {
  const { data: aprendizes, isLoading: loadingAprendizes } = useQuery({
    queryKey: ['aba-native-aprendizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, cpf, gender, birth_date, insurance_name, is_active, neurodevelopmental_conditions, address_zipcode')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data || []).map(c => ({
        codigoAprendiz: c.id,
        aprendiz: c.name,
        ativo: c.is_active,
        cpf: c.cpf,
        sexo: c.gender,
        dataNascimento: c.birth_date,
        cep: c.address_zipcode,
        convenio: c.insurance_name,
        nivelSuporte: (c.neurodevelopmental_conditions as any)?.support_level || null,
        child_id: c.id,
      }));
    },
  });

  const { data: profissionais, isLoading: loadingProfissionais } = useQuery({
    queryKey: ['aba-native-profissionais'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['therapist', 'admin']);
      if (rolesError) throw rolesError;

      if (!roles?.length) return [];

      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, professional_registration')
        .in('id', userIds);
      if (error) throw error;

      return (profiles || []).map(p => ({
        codigoProfissional: p.id,
        profissional: p.full_name,
        ativo: true,
        cargo: p.role || 'Terapeuta',
        especialidade: p.professional_registration || '',
        profile_id: p.id,
      }));
    },
  });

  const { data: agendamentos, isLoading: loadingAgendamentos } = useQuery({
    queryKey: ['aba-native-agendamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinic_appointments')
        .select(`
          id, scheduled_date, scheduled_time, status, room, child_id, professional_id,
          children(name),
          profiles!clinic_appointments_professional_id_fkey(full_name),
          appointment_types(name)
        `)
        .order('scheduled_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        dataInicio: `${a.scheduled_date}T${a.scheduled_time}`,
        codigoAprendiz: a.child_id,
        tipoAgendamento: a.appointment_types?.name || 'Sessão',
        local: a.room || 'Clínica',
        codigoProfissional: a.professional_id,
        situacao: a.status,
        nomeAprendiz: a.children?.name,
        nomeProfissional: a.profiles?.full_name,
        scheduled_date: a.scheduled_date,
      }));
    },
  });

  const { data: atendimentos, isLoading: loadingAtendimentos } = useQuery({
    queryKey: ['aba-native-atendimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinic_appointments')
        .select(`
          id, scheduled_date, scheduled_time, end_time, status, internal_notes, updated_at,
          child_id, professional_id,
          children(name),
          profiles!clinic_appointments_professional_id_fkey(full_name),
          appointment_types(name)
        `)
        .order('scheduled_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((a: any) => ({
        identificador: a.id,
        tipo: a.appointment_types?.name || 'Sessão ABA',
        dataInicio: `${a.scheduled_date}T${a.scheduled_time}`,
        dataFim: a.end_time,
        codigoAprendiz: a.child_id,
        falta: ['cancelled', 'no_show'].includes(a.status),
        codigoProfissional: a.professional_id,
        situacao: a.status,
        observacoes: a.internal_notes,
        dataAlteracao: a.updated_at,
        nomeAprendiz: a.children?.name,
        nomeProfissional: a.profiles?.full_name,
      }));
    },
  });

  const { data: desempenho, isLoading: loadingDesempenho } = useQuery({
    queryKey: ['aba-native-desempenho'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aba_np_trials')
        .select(`
          id, correct, prompt_level, child_id, recorded_at,
          aba_np_interventions!inner(
            id, program_id,
            aba_np_skills!inner(skill_name),
            aba_np_programs!inner(program_name)
          )
        `)
        .order('recorded_at', { ascending: false })
        .limit(500);
      if (error) throw error;

      // Group by intervention to calculate percentages
      const byIntervention = new Map<string, any[]>();
      for (const t of data || []) {
        const key = (t.aba_np_interventions as any)?.id;
        if (!key) continue;
        if (!byIntervention.has(key)) byIntervention.set(key, []);
        byIntervention.get(key)!.push(t);
      }

      return Array.from(byIntervention.entries()).map(([intId, trials]) => {
        const total = trials.length;
        const errors = trials.filter(t => !t.correct).length;
        const independent = trials.filter(t => t.prompt_level === 'independente').length;
        const helped = total - independent;
        const pctIndep = total > 0 ? Math.round((independent / total) * 100) : 0;

        const intervention = (trials[0].aba_np_interventions as any);
        return {
          identificadorSessao: intId,
          identificadorPrograma: intervention?.program_id,
          habilidade: intervention?.aba_np_skills?.skill_name,
          programa: intervention?.aba_np_programs?.program_name,
          percentualErro: total > 0 ? Math.round((errors / total) * 100) : 0,
          percentualAjuda: total > 0 ? Math.round((helped / total) * 100) : 0,
          percentualIndependencia: pctIndep,
          nivelIndependencia:
            pctIndep >= 76 ? 'Excelente' :
            pctIndep >= 51 ? 'Ótimo' :
            pctIndep >= 26 ? 'Bom' : 'Em aquisição',
          child_id: trials[0].child_id,
          totalTrials: total,
        };
      });
    },
  });

  // Reports/KPIs
  const totalAprendizes = aprendizes?.length || 0;
  const totalProfissionais = profissionais?.length || 0;

  const totalAtendimentos = atendimentos?.length || 0;
  const totalFaltas = atendimentos?.filter(a => a.falta).length || 0;
  const taxaFaltas = totalAtendimentos > 0 ? Math.round((totalFaltas / totalAtendimentos) * 100) : 0;

  const avgIndependencia = desempenho?.length
    ? Math.round(desempenho.reduce((s, d) => s + d.percentualIndependencia, 0) / desempenho.length)
    : 0;

  const regressoes = desempenho?.filter(d => d.percentualIndependencia < 26) || [];

  const programasComMaiorErro = [...(desempenho || [])]
    .sort((a, b) => b.percentualErro - a.percentualErro)
    .slice(0, 5);

  const programasComMaiorIndep = [...(desempenho || [])]
    .sort((a, b) => b.percentualIndependencia - a.percentualIndependencia)
    .slice(0, 5);

  // Sessions by professional
  const sessoesPorProfissional = new Map<string, number>();
  for (const a of agendamentos || []) {
    const name = a.nomeProfissional || 'N/A';
    sessoesPorProfissional.set(name, (sessoesPorProfissional.get(name) || 0) + 1);
  }

  // Distribution by convenio
  const porConvenio = new Map<string, number>();
  for (const a of aprendizes || []) {
    const conv = a.convenio || 'Particular';
    porConvenio.set(conv, (porConvenio.get(conv) || 0) + 1);
  }

  // Distribution by support level
  const porNivelSuporte = new Map<string, number>();
  for (const a of aprendizes || []) {
    const nivel = a.nivelSuporte || 'Não informado';
    porNivelSuporte.set(nivel, (porNivelSuporte.get(nivel) || 0) + 1);
  }

  return {
    aprendizes: aprendizes || [],
    profissionais: profissionais || [],
    agendamentos: agendamentos || [],
    atendimentos: atendimentos || [],
    desempenho: desempenho || [],
    loading: loadingAprendizes || loadingProfissionais || loadingAgendamentos || loadingAtendimentos || loadingDesempenho,
    // KPIs
    kpis: {
      totalAprendizes,
      totalProfissionais,
      totalAtendimentos,
      totalFaltas,
      taxaFaltas,
      avgIndependencia,
      regressoes,
      programasComMaiorErro,
      programasComMaiorIndep,
      sessoesPorProfissional: Object.fromEntries(sessoesPorProfissional),
      porConvenio: Object.fromEntries(porConvenio),
      porNivelSuporte: Object.fromEntries(porNivelSuporte),
    },
  };
}
