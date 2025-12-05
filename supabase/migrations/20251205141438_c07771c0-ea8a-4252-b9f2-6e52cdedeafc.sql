-- Fix profiles table RLS - restrict to own profile + admin access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'therapist')
);

-- Fix children table RLS - restrict to authorized users only
DROP POLICY IF EXISTS "Anyone can view children" ON public.children;
DROP POLICY IF EXISTS "Children are viewable by everyone" ON public.children;
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;
DROP POLICY IF EXISTS "Therapists can view their patients" ON public.children;
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;

CREATE POLICY "Parents can view their own children" 
ON public.children 
FOR SELECT 
USING (
  parent_id = auth.uid()
);

CREATE POLICY "Therapists can view approved patients" 
ON public.children 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.child_access ca
    WHERE ca.child_id = children.id
      AND ca.professional_id = auth.uid()
      AND ca.is_active = true
      AND ca.approval_status = 'approved'
  )
);

CREATE POLICY "Teachers can view their students" 
ON public.children 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.school_classes sc ON cs.class_id = sc.id
    WHERE cs.child_id = children.id
      AND sc.teacher_id = auth.uid()
      AND cs.is_active = true
  )
);

CREATE POLICY "Admins can view all children" 
ON public.children 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix invitations table RLS - restrict visibility
DROP POLICY IF EXISTS "Anyone can view invitation by code" ON public.invitations;
DROP POLICY IF EXISTS "Invitations viewable by code" ON public.invitations;

-- Only allow authenticated users to view invitations by code
CREATE POLICY "Authenticated users can view invitations by code" 
ON public.invitations 
FOR SELECT 
USING (
  inviter_id = auth.uid() 
  OR accepted_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- Create function for public invitation validation (minimal exposure)
CREATE OR REPLACE FUNCTION public.validate_invitation_code(p_code TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  invite_type TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE WHEN i.id IS NOT NULL AND i.status = 'pending' AND (i.expires_at IS NULL OR i.expires_at > NOW()) THEN true ELSE false END as valid,
    i.invite_type,
    i.expires_at
  FROM public.invitations i
  WHERE i.invite_code = p_code
  LIMIT 1;
$$;

-- Update parent_child_relationships view with security invoker
DROP VIEW IF EXISTS public.parent_child_relationships;
CREATE VIEW public.parent_child_relationships
WITH (security_invoker = true)
AS
SELECT 
  c.id,
  c.id as child_id,
  c.name as child_name,
  c.birth_date,
  c.is_active,
  c.relationship_type,
  c.parent_id,
  p.full_name as parent_name,
  p.email as parent_email
FROM public.children c
LEFT JOIN public.profiles p ON c.parent_id = p.id;

-- Update therapist_patient_relationships view with security invoker
DROP VIEW IF EXISTS public.therapist_patient_relationships;
CREATE VIEW public.therapist_patient_relationships
WITH (security_invoker = true)
AS
SELECT 
  ca.id,
  ca.professional_id as therapist_id,
  p.full_name as therapist_name,
  ca.child_id as patient_id,
  c.name as patient_name,
  c.birth_date as patient_birth_date,
  ca.access_level,
  ca.is_active,
  ca.granted_at,
  ca.expires_at
FROM public.child_access ca
JOIN public.profiles p ON ca.professional_id = p.id
JOIN public.children c ON ca.child_id = c.id
WHERE ca.approval_status = 'approved';

-- Update teacher_student_relationships view with security invoker
DROP VIEW IF EXISTS public.teacher_student_relationships;
CREATE VIEW public.teacher_student_relationships
WITH (security_invoker = true)
AS
SELECT 
  cs.id,
  sc.teacher_id,
  p.full_name as teacher_name,
  cs.child_id as student_id,
  c.name as student_name,
  sc.id as class_id,
  sc.name as class_name,
  sc.grade_level,
  cs.is_active
FROM public.class_students cs
JOIN public.school_classes sc ON cs.class_id = sc.id
JOIN public.profiles p ON sc.teacher_id = p.id
JOIN public.children c ON cs.child_id = c.id;