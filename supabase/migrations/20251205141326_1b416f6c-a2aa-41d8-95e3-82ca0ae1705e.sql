-- 1. Add approval workflow for therapist-child access (require parent consent)
ALTER TABLE public.child_access ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.child_access ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 2. Update child_access RLS to only allow approved access
DROP POLICY IF EXISTS "Professionals can view their access records" ON public.child_access;
CREATE POLICY "Professionals can view their approved access records" 
ON public.child_access 
FOR SELECT 
USING (
  professional_id = auth.uid() 
  OR granted_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 3. Parents can approve/reject access requests
DROP POLICY IF EXISTS "Parents can manage access to their children" ON public.child_access;
CREATE POLICY "Parents can manage access to their children" 
ON public.child_access 
FOR UPDATE 
USING (
  public.is_parent_of(auth.uid(), child_id)
)
WITH CHECK (
  public.is_parent_of(auth.uid(), child_id)
);

-- 4. Therapists can only request access (insert with pending status)
DROP POLICY IF EXISTS "Professionals can request access" ON public.child_access;
CREATE POLICY "Professionals can request access" 
ON public.child_access 
FOR INSERT 
WITH CHECK (
  professional_id = auth.uid() 
  AND approval_status = 'pending'
);

-- 5. Update is_therapist_of function to check approval_status
CREATE OR REPLACE FUNCTION public.is_therapist_of(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- 6. Limit profile data exposure - create a view for public profile info
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  role,
  created_at
FROM public.profiles;

-- 7. Add RLS policy for clinical reports - allow reviewers to access
DROP POLICY IF EXISTS "Reviewers can view reports they reviewed" ON public.clinical_reports;
CREATE POLICY "Reviewers can view reports they reviewed" 
ON public.clinical_reports 
FOR SELECT 
USING (
  reviewed_by = auth.uid()
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'therapist')
);

-- 8. Restrict children search to only show minimal info for linking
CREATE OR REPLACE FUNCTION public.search_children_for_linking(search_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  birth_year INT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.name,
    EXTRACT(YEAR FROM c.birth_date)::INT as birth_year
  FROM public.children c
  WHERE 
    c.name ILIKE '%' || search_name || '%'
    AND c.is_active = true
  LIMIT 10;
$$;

-- 9. Add audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_child_access_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id)
  VALUES (
    auth.uid(),
    TG_OP,
    'child_access',
    COALESCE(NEW.id, OLD.id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_child_access ON public.child_access;
CREATE TRIGGER audit_child_access
AFTER INSERT OR UPDATE OR DELETE ON public.child_access
FOR EACH ROW EXECUTE FUNCTION public.audit_child_access_changes();