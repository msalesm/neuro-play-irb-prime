-- Drop the SECURITY DEFINER view and recreate as regular view
DROP VIEW IF EXISTS public.teacher_student_view;

-- Recreate view without SECURITY DEFINER (uses invoker's permissions by default)
CREATE VIEW public.teacher_student_view 
WITH (security_invoker = true)
AS
SELECT 
  c.id,
  c.name,
  c.birth_date,
  c.gender,
  -- Masked: only show if conditions exist, not the details
  CASE 
    WHEN c.neurodevelopmental_conditions IS NOT NULL 
    AND c.neurodevelopmental_conditions != '{}'::jsonb 
    THEN true 
    ELSE false 
  END as has_special_needs,
  -- Don't expose sensory_profile or neurodevelopmental_conditions
  cs.class_id,
  sc.name as class_name,
  sc.grade_level
FROM children c
JOIN class_students cs ON cs.child_id = c.id
JOIN school_classes sc ON sc.id = cs.class_id
WHERE cs.is_active = true;

-- Grant select on view to authenticated users (RLS on underlying tables still applies)
GRANT SELECT ON public.teacher_student_view TO authenticated;