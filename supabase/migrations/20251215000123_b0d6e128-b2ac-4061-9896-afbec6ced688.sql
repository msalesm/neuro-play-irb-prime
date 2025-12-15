-- Add missing policy for professionals to view profiles of children they have access to
CREATE POLICY "Professionals can view profiles of accessible children parents"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT c.parent_id FROM public.children c
    INNER JOIN public.child_access ca ON ca.child_id = c.id
    WHERE ca.professional_id = auth.uid() 
      AND ca.is_active = true
      AND ca.approval_status = 'approved'
  )
);

-- Add policy for professionals to view biofeedback with explicit child access
CREATE POLICY "Professionals can view biofeedback for accessible children"
ON public.biofeedback_readings
FOR SELECT
USING (
  child_id IN (
    SELECT ca.child_id FROM public.child_access ca
    WHERE ca.professional_id = auth.uid()
      AND ca.is_active = true
      AND ca.approval_status = 'approved'
      AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
  )
);

-- Add admin access to biofeedback for oversight
CREATE POLICY "Admins can view all biofeedback readings"
ON public.biofeedback_readings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));