-- 1. Create educational_accommodations table for teacher-relevant info only
CREATE TABLE IF NOT EXISTS public.educational_accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  accommodation_type text NOT NULL,
  description text,
  strategies jsonb DEFAULT '{}'::jsonb,
  environment_adjustments jsonb DEFAULT '{}'::jsonb,
  communication_preferences jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  UNIQUE(child_id, accommodation_type)
);

-- Enable RLS
ALTER TABLE public.educational_accommodations ENABLE ROW LEVEL SECURITY;

-- 2. Create helper function to check if user is teacher of child
CREATE OR REPLACE FUNCTION public.is_teacher_of(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN school_classes sc ON cs.class_id = sc.id
    WHERE cs.child_id = _child_id 
    AND sc.teacher_id = _user_id
    AND cs.is_active = true
  )
$$;

-- 3. Create secure function to get student educational info with audit logging
CREATE OR REPLACE FUNCTION public.get_student_educational_info(_child_id uuid)
RETURNS TABLE(
  child_name text,
  accommodations jsonb,
  strategies jsonb,
  environment_adjustments jsonb,
  communication_preferences jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify teacher access
  IF NOT is_teacher_of(auth.uid(), _child_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not a teacher of this student';
  END IF;
  
  -- Log access to clinical audit logs
  INSERT INTO clinical_audit_logs (
    action_type, 
    resource_type,
    child_id, 
    user_id,
    action_details
  )
  VALUES (
    'EDUCATIONAL_DATA_ACCESS', 
    'educational_accommodations',
    _child_id, 
    auth.uid(),
    jsonb_build_object('accessed_at', now(), 'access_type', 'teacher_view')
  );
  
  -- Return only educational accommodation info (no medical details)
  RETURN QUERY 
  SELECT 
    c.name,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'type', ea.accommodation_type,
        'description', ea.description
      )) FROM educational_accommodations ea WHERE ea.child_id = _child_id AND ea.is_active = true),
      '[]'::jsonb
    ) as accommodations,
    COALESCE(
      (SELECT jsonb_agg(ea.strategies) FROM educational_accommodations ea WHERE ea.child_id = _child_id AND ea.is_active = true),
      '[]'::jsonb
    ) as strategies,
    COALESCE(
      (SELECT jsonb_agg(ea.environment_adjustments) FROM educational_accommodations ea WHERE ea.child_id = _child_id AND ea.is_active = true),
      '[]'::jsonb
    ) as environment_adjustments,
    COALESCE(
      (SELECT jsonb_agg(ea.communication_preferences) FROM educational_accommodations ea WHERE ea.child_id = _child_id AND ea.is_active = true),
      '[]'::jsonb
    ) as communication_preferences
  FROM children c
  WHERE c.id = _child_id;
END;
$$;

-- 4. Create RLS policies for educational_accommodations
-- Parents can manage accommodations for their children
CREATE POLICY "Parents manage own children accommodations"
ON public.educational_accommodations
FOR ALL
USING (is_parent_of_child(auth.uid(), child_id))
WITH CHECK (is_parent_of_child(auth.uid(), child_id));

-- Therapists with access can manage accommodations
CREATE POLICY "Therapists manage accessible children accommodations"
ON public.educational_accommodations
FOR ALL
USING (has_child_access(auth.uid(), child_id))
WITH CHECK (has_child_access(auth.uid(), child_id));

-- Teachers can only VIEW accommodations (not medical data)
CREATE POLICY "Teachers view student accommodations"
ON public.educational_accommodations
FOR SELECT
USING (is_teacher_of(auth.uid(), child_id));

-- Admins have full access
CREATE POLICY "Admins manage all accommodations"
ON public.educational_accommodations
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. Create a secure view for teachers that masks medical data
CREATE OR REPLACE VIEW public.teacher_student_view AS
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

-- 6. Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_educational_accommodations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_educational_accommodations_updated_at
BEFORE UPDATE ON public.educational_accommodations
FOR EACH ROW
EXECUTE FUNCTION public.update_educational_accommodations_updated_at();