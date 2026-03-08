
-- Recreate all views that weren't created in the failed first migration
CREATE OR REPLACE VIEW public.aba_aprendizes_view WITH (security_invoker = on) AS
SELECT
  c.id::text AS "codigoAprendiz",
  c.name AS "aprendiz",
  COALESCE(c.is_active, true) AS "ativo",
  c.cpf,
  c.gender AS "sexo",
  c.birth_date::text AS "dataNascimento",
  c.address_zipcode AS "cep",
  c.insurance_name AS "convenio",
  COALESCE(
    c.neurodevelopmental_conditions->>'support_level',
    CASE WHEN c.neurodevelopmental_conditions IS NOT NULL THEN 'Nível 1' ELSE NULL END
  ) AS "nivelSuporte",
  c.id AS child_id
FROM public.children c;

CREATE OR REPLACE VIEW public.aba_profissionais_view WITH (security_invoker = on) AS
SELECT
  p.id::text AS "codigoProfissional",
  p.full_name AS "profissional",
  true AS "ativo",
  NULL::text AS "cpf",
  NULL::text AS "sexo",
  COALESCE(p.role, 'Terapeuta') AS "cargo",
  COALESCE(p.professional_registration, '') AS "especialidade",
  p.id AS profile_id
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role IN ('therapist', 'admin');

CREATE OR REPLACE VIEW public.aba_agendamentos_diarios_view WITH (security_invoker = on) AS
SELECT
  (ca.scheduled_date || 'T' || ca.scheduled_time)::text AS "dataInicio",
  ca.child_id::text AS "codigoAprendiz",
  COALESCE(at_type.name, 'Sessão') AS "tipoAgendamento",
  COALESCE(ca.room, 'Clínica') AS "local",
  ca.professional_id::text AS "codigoProfissional",
  ca.status AS "situacao",
  ca.id,
  ca.scheduled_date,
  c.name AS "nomeAprendiz",
  p.full_name AS "nomeProfissional"
FROM public.clinic_appointments ca
LEFT JOIN public.children c ON c.id = ca.child_id
LEFT JOIN public.profiles p ON p.id = ca.professional_id
LEFT JOIN public.appointment_types at_type ON at_type.id = ca.appointment_type_id;

CREATE OR REPLACE VIEW public.aba_atendimentos_periodo_view WITH (security_invoker = on) AS
SELECT
  ca.id::text AS "identificador",
  COALESCE(at_type.name, 'Sessão ABA') AS "tipo",
  (ca.scheduled_date || 'T' || ca.scheduled_time)::text AS "dataInicio",
  ca.end_time::text AS "dataFim",
  ca.child_id::text AS "codigoAprendiz",
  (ca.status IN ('cancelled', 'no_show'))::boolean AS "falta",
  ca.professional_id::text AS "codigoProfissional",
  ca.status AS "situacao",
  ca.internal_notes AS "observacoes",
  ca.updated_at::text AS "dataAlteracao",
  c.name AS "nomeAprendiz",
  p.full_name AS "nomeProfissional"
FROM public.clinic_appointments ca
LEFT JOIN public.children c ON c.id = ca.child_id
LEFT JOIN public.profiles p ON p.id = ca.professional_id
LEFT JOIN public.appointment_types at_type ON at_type.id = ca.appointment_type_id;

CREATE OR REPLACE VIEW public.aba_sessoes_diarias_view WITH (security_invoker = on) AS
SELECT
  ca.child_id::text AS "codigoAprendiz",
  COALESCE(p.role, 'ABA') AS "especialidade",
  (ca.scheduled_date || 'T' || ca.scheduled_time)::text AS "dataInicio",
  ca.status AS "situacao",
  c.name AS "nomeAprendiz",
  p.full_name AS "nomeProfissional",
  ca.scheduled_date
FROM public.clinic_appointments ca
LEFT JOIN public.children c ON c.id = ca.child_id
LEFT JOIN public.profiles p ON p.id = ca.professional_id
WHERE ca.child_id IS NOT NULL;

-- Fix view 5 with security invoker
DROP VIEW IF EXISTS public.aba_desempenho_programas_view;
CREATE VIEW public.aba_desempenho_programas_view WITH (security_invoker = on) AS
SELECT
  i.id::text AS "identificadorSessao",
  i.program_id::text AS "identificadorPrograma",
  s.skill_name AS "habilidade",
  prog.program_name AS "programa",
  ROUND((COUNT(*) FILTER (WHERE NOT t.correct)::numeric / NULLIF(COUNT(*), 0)) * 100)::integer AS "percentualErro",
  ROUND((COUNT(*) FILTER (WHERE t.prompt_level != 'independente')::numeric / NULLIF(COUNT(*), 0)) * 100)::integer AS "percentualAjuda",
  ROUND((COUNT(*) FILTER (WHERE t.prompt_level = 'independente')::numeric / NULLIF(COUNT(*), 0)) * 100)::integer AS "percentualIndependencia",
  CASE
    WHEN (COUNT(*) FILTER (WHERE t.prompt_level = 'independente')::numeric / NULLIF(COUNT(*), 0)) * 100 >= 76 THEN 'Excelente'
    WHEN (COUNT(*) FILTER (WHERE t.prompt_level = 'independente')::numeric / NULLIF(COUNT(*), 0)) * 100 >= 51 THEN 'Ótimo'
    WHEN (COUNT(*) FILTER (WHERE t.prompt_level = 'independente')::numeric / NULLIF(COUNT(*), 0)) * 100 >= 26 THEN 'Bom'
    ELSE 'Em aquisição'
  END AS "nivelIndependencia",
  t.child_id,
  MAX(t.recorded_at) AS last_recorded_at
FROM public.aba_np_trials t
INNER JOIN public.aba_np_interventions i ON i.id = t.intervention_id
INNER JOIN public.aba_np_skills s ON s.id = i.skill_id
INNER JOIN public.aba_np_programs prog ON prog.id = i.program_id
GROUP BY i.id, i.program_id, s.skill_name, prog.program_name, t.child_id;
