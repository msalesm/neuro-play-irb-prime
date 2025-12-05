
-- Fix 1: Update professional_has_child_access() to validate approval status, is_active, and expiration
CREATE OR REPLACE FUNCTION public.professional_has_child_access(_child_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.child_access
    WHERE child_id = _child_id
      AND professional_id = _user_id
      AND is_active = true
      AND approval_status = 'approved'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- Fix 2: Drop the overly permissive therapist policy on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a secure policy that only allows:
-- 1. Users to view their own profile
-- 2. Admins to view all profiles
-- 3. Therapists to view profiles of parents whose children they have approved access to
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() 
  OR has_role(auth.uid(), 'admin')
  OR (
    has_role(auth.uid(), 'therapist') 
    AND id IN (
      SELECT c.parent_id 
      FROM public.children c
      INNER JOIN public.child_access ca ON ca.child_id = c.id
      WHERE ca.professional_id = auth.uid()
        AND ca.is_active = true
        AND ca.approval_status = 'approved'
        AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
    )
  )
);
