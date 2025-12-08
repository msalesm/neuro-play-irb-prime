
-- Create helper function to check if user is parent of a child (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_parent_of_child(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.children
    WHERE id = _child_id AND parent_id = _user_id
  );
$$;

-- Create helper function to check if user has professional access to a child (avoids recursion)
CREATE OR REPLACE FUNCTION public.has_professional_access(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_access
    WHERE child_id = _child_id 
      AND professional_id = _user_id 
      AND is_active = true
      AND approval_status = 'approved'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- Create helper function to check if user is institution admin
CREATE OR REPLACE FUNCTION public.is_institution_admin(_user_id uuid, _institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institution_members
    WHERE user_id = _user_id 
      AND institution_id = _institution_id 
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- Create helper function to get user's institution IDs where they are admin
CREATE OR REPLACE FUNCTION public.get_admin_institution_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.institution_members
  WHERE user_id = _user_id 
    AND role = 'admin'
    AND is_active = true;
$$;

-- Drop problematic policies on child_access table
DROP POLICY IF EXISTS "Parents can grant access to own children" ON public.child_access;
DROP POLICY IF EXISTS "Parents can view access grants for own children" ON public.child_access;

-- Recreate policies using SECURITY DEFINER functions
CREATE POLICY "Parents can grant access to own children" 
ON public.child_access 
FOR INSERT 
WITH CHECK (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can view access grants for own children" 
ON public.child_access 
FOR SELECT 
USING (public.is_parent_of_child(auth.uid(), child_id));

-- Drop problematic policies on children table that cause recursion
DROP POLICY IF EXISTS "Therapists can view approved patients" ON public.children;

-- Recreate using the helper function
CREATE POLICY "Therapists can view approved patients" 
ON public.children 
FOR SELECT 
USING (public.has_professional_access(auth.uid(), id));

-- Drop problematic policies on institution_members table
DROP POLICY IF EXISTS "Institution admins can manage their members" ON public.institution_members;

-- Recreate using the helper function (avoiding self-reference)
CREATE POLICY "Institution admins can manage their members" 
ON public.institution_members 
FOR ALL 
USING (institution_id IN (SELECT public.get_admin_institution_ids(auth.uid())));

-- Drop problematic policy on external_integrations that references institution_members
DROP POLICY IF EXISTS "Institution admins manage integrations" ON public.external_integrations;

-- Recreate using the helper function
CREATE POLICY "Institution admins manage integrations" 
ON public.external_integrations 
FOR ALL 
USING (institution_id IN (SELECT public.get_admin_institution_ids(auth.uid())));
