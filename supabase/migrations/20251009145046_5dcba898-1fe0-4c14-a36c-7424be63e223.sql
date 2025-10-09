-- PHASE 1: Fix Critical PII Exposure in user_profiles table
-- This migration restricts access to sensitive fields (email, phone, address, medical data, emergency contacts)

-- Step 1: Drop existing overly permissive policies on user_profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.user_profiles;

-- Step 2: Create restrictive policies with proper field-level access control

-- Policy 1: Users can view their OWN complete profile
CREATE POLICY "Users can view their own complete profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their OWN profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their OWN profile
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admins have full access (with audit logging via existing triggers)
CREATE POLICY "Admins have full access to all profiles"
  ON public.user_profiles
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Step 3: Create secure function for public profile access (returns ONLY safe fields)
CREATE OR REPLACE FUNCTION public.get_public_profiles_safe()
RETURNS TABLE(
  id uuid,
  name text,
  avatar_url text,
  city text,
  state text,
  reputation_score numeric,
  verified boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.id,
    up.name,
    up.avatar_url,
    up.city,
    up.state,
    up.reputation_score,
    up.verified,
    up.created_at
  FROM public.user_profiles up
  WHERE up.is_public = true 
    AND up.id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    AND auth.uid() IS NOT NULL
  ORDER BY up.reputation_score DESC NULLS LAST
  LIMIT 100;
$$;

-- Step 4: Update existing get_user_basic_profile to enforce field restrictions
CREATE OR REPLACE FUNCTION public.get_user_basic_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  avatar_url text,
  city text,
  state text,
  reputation_score numeric,
  verified boolean,
  is_public boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only allow if: profile is public OR user is viewing own profile OR user is admin
  IF NOT (
    EXISTS(SELECT 1 FROM user_profiles WHERE user_profiles.id = profile_user_id AND user_profiles.is_public = true)
    OR auth.uid() = profile_user_id
    OR has_role(auth.uid(), 'admin'::app_role)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot view this profile';
  END IF;

  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.avatar_url,
    up.city,
    up.state,
    up.reputation_score,
    up.verified,
    up.is_public,
    up.created_at
  FROM public.user_profiles up
  WHERE up.id = profile_user_id;
END;
$function$;

-- Step 5: Add comments documenting the security model
COMMENT ON TABLE public.user_profiles IS 
'User profiles table with strict RLS. Sensitive fields (email, phone, address, medical_*, emergency_contact) are NEVER exposed via public profiles. Use security definer functions: get_user_contact_info(), get_user_medical_data(), get_user_basic_profile(), get_public_profiles_safe()';

COMMENT ON POLICY "Users can view their own complete profile" ON public.user_profiles IS 
'Users have full access to their own profile data including sensitive PII';

COMMENT ON POLICY "Admins have full access to all profiles" ON public.user_profiles IS 
'Admins can access all profiles. All admin access is logged via audit_user_profiles trigger';