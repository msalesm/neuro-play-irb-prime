-- Drop the insecure policy that exposes all unlinked children to any authenticated user
DROP POLICY IF EXISTS "Users can search unlinked children" ON public.children;

-- Create a new restricted policy that only allows therapists to search unlinked children
CREATE POLICY "Therapists can search unlinked children"
ON public.children
FOR SELECT
USING (
  parent_id IS NULL 
  AND has_role(auth.uid(), 'therapist')
);

-- Also fix the therapist blanket access issue on child_profiles
-- First drop the problematic policy
DROP POLICY IF EXISTS "Therapists can view child profiles with access" ON public.child_profiles;

-- Recreate with proper access control (only through explicit child_access grants)
CREATE POLICY "Therapists can view child profiles with explicit access"
ON public.child_profiles
FOR SELECT
USING (
  parent_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM child_access
    JOIN children ON children.id = child_access.child_id
    WHERE children.id = child_profiles.id 
    AND child_access.professional_id = auth.uid()
    AND child_access.is_active = true
  )
  OR has_role(auth.uid(), 'admin')
);