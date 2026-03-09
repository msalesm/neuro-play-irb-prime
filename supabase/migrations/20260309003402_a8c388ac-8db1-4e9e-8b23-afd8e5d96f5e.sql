
-- Fix views: drop and recreate as SECURITY INVOKER with correct column names

DROP VIEW IF EXISTS public.parent_child_relationships CASCADE;
CREATE VIEW public.parent_child_relationships
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.id AS child_id,
  c.name AS child_name,
  c.birth_date,
  c.parent_id,
  c.neurodevelopmental_conditions,
  c.is_active,
  p.email AS parent_email,
  p.full_name AS parent_name
FROM public.children c
LEFT JOIN public.profiles p ON p.id = c.parent_id;

DROP VIEW IF EXISTS public.therapist_patient_relationships CASCADE;
CREATE VIEW public.therapist_patient_relationships
WITH (security_invoker = true)
AS
SELECT
  ca.id,
  ca.professional_id AS therapist_id,
  ca.child_id,
  ca.access_level,
  ca.approval_status,
  ca.is_active,
  ca.expires_at,
  c.name AS patient_name,
  c.birth_date AS patient_birth_date,
  p.full_name AS therapist_name
FROM public.child_access ca
JOIN public.children c ON c.id = ca.child_id
LEFT JOIN public.profiles p ON p.id = ca.professional_id;

DROP VIEW IF EXISTS public.teacher_student_view CASCADE;
CREATE VIEW public.teacher_student_view
WITH (security_invoker = true)
AS
SELECT
  cs.id,
  cs.child_id,
  cs.class_id,
  cs.is_active,
  c.name,
  c.birth_date,
  c.neurodevelopmental_conditions,
  CASE WHEN c.neurodevelopmental_conditions IS NOT NULL THEN true ELSE false END AS has_special_needs,
  sc.teacher_id,
  sc.name AS class_name
FROM public.class_students cs
JOIN public.children c ON c.id = cs.child_id
JOIN public.school_classes sc ON sc.id = cs.class_id;

DROP VIEW IF EXISTS public.teacher_student_relationships CASCADE;
CREATE VIEW public.teacher_student_relationships
WITH (security_invoker = true)
AS
SELECT
  cs.id,
  sc.teacher_id,
  cs.child_id,
  sc.name AS class_name,
  c.name AS student_name,
  p.full_name AS teacher_name
FROM public.class_students cs
JOIN public.school_classes sc ON sc.id = cs.class_id
JOIN public.children c ON c.id = cs.child_id
LEFT JOIN public.profiles p ON p.id = sc.teacher_id;

DROP VIEW IF EXISTS public.aba_aprendizes_view CASCADE;
CREATE VIEW public.aba_aprendizes_view
WITH (security_invoker = true)
AS
SELECT
  aa.id,
  aa.codigo_aprendiz,
  aa.nome,
  aa.data_nascimento,
  aa.cpf,
  aa.sexo,
  aa.convenio,
  aa.nivel_suporte,
  aa.ativo,
  aa.child_id,
  aa.synced_at,
  aa.updated_at
FROM public.aba_aprendizes aa;

DROP VIEW IF EXISTS public.aba_profissionais_view CASCADE;
CREATE VIEW public.aba_profissionais_view
WITH (security_invoker = true)
AS
SELECT
  ap.id,
  ap.codigo_profissional,
  ap.nome,
  ap.cargo,
  ap.especialidade,
  ap.cpf,
  ap.ativo,
  ap.profile_id,
  ap.synced_at,
  ap.updated_at
FROM public.aba_profissionais ap;
