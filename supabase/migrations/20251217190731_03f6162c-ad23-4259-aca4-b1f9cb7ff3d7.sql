-- Add RLS policy for admin to view all PEI plans
CREATE POLICY "Admins can view all PEI plans"
ON public.pei_plans
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));