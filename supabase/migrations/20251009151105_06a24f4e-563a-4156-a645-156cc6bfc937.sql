-- PHASE 4: Fix Public Profile Access - Require Authentication
-- This ensures that even "public" profiles can only be viewed by authenticated users

-- Step 1: Drop the overly permissive public profile policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.user_profiles;

-- Step 2: Create a strict policy that requires authentication AND uses security definer function
-- This prevents direct SELECT queries and forces use of the safe function
CREATE POLICY "Only view own profile or use safe functions"
  ON public.user_profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can view their own complete profile
    OR has_role(auth.uid(), 'admin'::app_role)  -- Admins can view all profiles
  );

-- Step 3: Ensure get_public_profiles_safe() requires authentication
CREATE OR REPLACE FUNCTION public.get_public_profiles_safe()
RETURNS TABLE(
  id uuid,
  name text,
  avatar_url text,
  city text,
  state text,
  reputation_score numeric,
  verified boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- CRITICAL: Only return data if user is authenticated
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
    AND auth.uid() IS NOT NULL  -- REQUIRE AUTHENTICATION
  ORDER BY up.reputation_score DESC NULLS LAST
  LIMIT 100;
$$;

-- Step 4: Add comment explaining the security model
COMMENT ON POLICY "Only view own profile or use safe functions" ON public.user_profiles IS 
'Restricts direct SELECT access to own profile or admin only. Public profile browsing must use get_public_profiles_safe() function which requires authentication and returns only safe fields.';

-- Step 5: Create helper function to check if a user can view ANY public profiles
CREATE OR REPLACE FUNCTION public.can_view_public_profiles()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only authenticated users can browse public profiles
  SELECT auth.uid() IS NOT NULL;
$$;