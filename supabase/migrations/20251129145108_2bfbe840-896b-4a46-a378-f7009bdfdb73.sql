-- Add RLS policies for therapists to access child_profiles via child_access
CREATE POLICY "Therapists can view child profiles with access"
ON public.child_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_access
    JOIN public.children ON children.id = child_access.child_id
    WHERE children.id = child_profiles.id
    AND child_access.professional_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'therapist'
  )
);

CREATE POLICY "Therapists can update child profiles with access"
ON public.child_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_access
    JOIN public.children ON children.id = child_access.child_id
    WHERE children.id = child_profiles.id
    AND child_access.professional_id = auth.uid()
  )
);

-- Add default role assignment for new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign 'parent' role as default for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign default role
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();