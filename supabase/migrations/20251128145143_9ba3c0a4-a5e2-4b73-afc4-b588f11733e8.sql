-- Make parent_id nullable in children table to allow therapist-created profiles
ALTER TABLE public.children ALTER COLUMN parent_id DROP NOT NULL;

-- Add RLS policy for therapists to create children
CREATE POLICY "Therapists can create children"
ON public.children
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'therapist'
  )
);

-- Add RLS policy for therapists to view children they have access to
CREATE POLICY "Therapists can view children with access (via child_access)"
ON public.children
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_access
    WHERE child_access.child_id = children.id 
    AND child_access.professional_id = auth.uid()
  )
);

-- Add RLS policy for therapists to update children they have access to
CREATE POLICY "Therapists can update children with access"
ON public.children
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_access
    WHERE child_access.child_id = children.id 
    AND child_access.professional_id = auth.uid()
  )
);

-- Ensure child_access table allows therapists to grant themselves access when creating children
CREATE POLICY "Therapists can grant themselves access"
ON public.child_access
FOR INSERT
TO authenticated
WITH CHECK (
  professional_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'therapist'
  )
);