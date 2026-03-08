
-- View 5: aba_desempenho_programas_view
CREATE OR REPLACE VIEW public.aba_desempenho_programas_view AS
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
