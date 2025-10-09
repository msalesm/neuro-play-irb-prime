-- PHASE 1: Create secure view for public profiles with only safe columns
CREATE OR REPLACE VIEW public.public_user_profiles_safe AS
SELECT 
  id,
  name,
  avatar_url,
  city,
  state,
  reputation_score,
  verified,
  created_at
FROM public.user_profiles
WHERE is_public = true
  AND auth.uid() IS NOT NULL;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.public_user_profiles_safe TO authenticated;

-- PHASE 2: Harden subscriber table - Add NOT NULL constraint and index
ALTER TABLE public.subscribers 
  ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscribers_user_id 
  ON public.subscribers(user_id);

-- PHASE 3: Add role escalation protection trigger
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from modifying their own role
  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Users cannot modify their own role';
    END IF;
  END IF;
  
  -- Prevent users from inserting admin/moderator roles for themselves
  IF TG_OP = 'INSERT' AND NEW.user_id = auth.uid() THEN
    IF NEW.role IN ('admin', 'moderator') THEN
      RAISE EXCEPTION 'Users cannot assign themselves elevated roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to user_roles table
DROP TRIGGER IF EXISTS enforce_no_self_role_escalation ON public.user_roles;
CREATE TRIGGER enforce_no_self_role_escalation
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_escalation();

-- PHASE 4: Add security documentation comments
COMMENT ON TABLE public.user_profiles IS 
'SECURITY WARNING: Contains PII (email, phone, address, medical data). 
Direct SELECT queries may expose sensitive fields. 
USE ONLY: get_public_profiles_safe() for public profiles.
For PII access: get_user_contact_info() or get_user_medical_data().';

COMMENT ON VIEW public.public_user_profiles_safe IS
'SECURITY: Safe view for public profile browsing. Only exposes non-PII fields (name, avatar, city, state, reputation, verified status).';

COMMENT ON TABLE public.subscribers IS
'SECURITY: Contains email addresses and Stripe customer IDs. 
RLS enforced: users can only view their own subscription.';

COMMENT ON FUNCTION public.get_public_profiles_safe() IS
'SECURITY: Returns only safe, non-PII fields for public profiles. Requires authentication.';

COMMENT ON FUNCTION public.prevent_self_role_escalation() IS
'SECURITY: Prevents privilege escalation by blocking users from modifying their own roles or assigning themselves elevated privileges.';