-- Add RLS policy for therapists to view PEI plans of their accessible patients
CREATE POLICY "Therapists can view patient PEI plans"
ON public.pei_plans
FOR SELECT
USING (
  user_id IN (
    SELECT c.parent_id 
    FROM public.children c
    INNER JOIN public.child_access ca ON ca.child_id = c.id
    WHERE ca.professional_id = auth.uid()
      AND ca.is_active = true
      AND ca.approval_status = 'approved'
      AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
  )
);