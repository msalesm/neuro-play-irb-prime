-- Fix: Add expires_at check to "Professionals can view profiles of accessible children parents" policy
-- This ensures expired access grants don't allow profile viewing

-- Drop the existing policy
DROP POLICY IF EXISTS "Professionals can view profiles of accessible children parents" ON public.profiles;

-- Recreate with expires_at check
CREATE POLICY "Professionals can view profiles of accessible children parents" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT c.parent_id
    FROM children c
    JOIN child_access ca ON ca.child_id = c.id
    WHERE ca.professional_id = auth.uid() 
      AND ca.is_active = true 
      AND ca.approval_status = 'approved'
      AND (ca.expires_at IS NULL OR ca.expires_at > now())
  )
);