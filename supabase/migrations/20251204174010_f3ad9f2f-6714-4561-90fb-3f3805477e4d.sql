-- Corrigir views para usar SECURITY INVOKER (padrão seguro)
DROP VIEW IF EXISTS public.parent_child_relationships;
DROP VIEW IF EXISTS public.therapist_patient_relationships;
DROP VIEW IF EXISTS public.teacher_student_relationships;

-- Recriar views com security_invoker = true
CREATE VIEW public.parent_child_relationships 
WITH (security_invoker = true) AS
SELECT 
  c.id,
  c.parent_id,
  c.id as child_id,
  c.name as child_name,
  c.birth_date,
  c.relationship_type,
  c.is_active,
  p.full_name as parent_name,
  p.email as parent_email
FROM public.children c
LEFT JOIN public.profiles p ON c.parent_id = p.id
WHERE c.is_active = true;

CREATE VIEW public.therapist_patient_relationships 
WITH (security_invoker = true) AS
SELECT 
  ca.id,
  ca.professional_id as therapist_id,
  ca.child_id as patient_id,
  ca.access_level,
  ca.granted_at,
  ca.expires_at,
  ca.is_active,
  c.name as patient_name,
  c.birth_date as patient_birth_date,
  p.full_name as therapist_name
FROM public.child_access ca
JOIN public.children c ON ca.child_id = c.id
JOIN public.profiles p ON ca.professional_id = p.id
WHERE ca.is_active = true;

CREATE VIEW public.teacher_student_relationships 
WITH (security_invoker = true) AS
SELECT 
  cs.id,
  cs.teacher_id,
  cs.child_id as student_id,
  cs.class_id,
  sc.name as class_name,
  sc.grade_level,
  cs.is_active,
  c.name as student_name,
  p.full_name as teacher_name
FROM public.class_students cs
JOIN public.school_classes sc ON cs.class_id = sc.id
JOIN public.children c ON cs.child_id = c.id
LEFT JOIN public.profiles p ON cs.teacher_id = p.id
WHERE cs.is_active = true;