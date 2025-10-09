-- CRITICAL FIX: Remove the insecure public profile policy
-- This policy was allowing public access to ALL fields when is_public=true

-- Drop the insecure policy that exposes sensitive data
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.user_profiles;

-- Also clean up duplicate policies that we may have created
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Keep only these secure policies:
-- 1. "Only view own profile or use safe functions" - Restricts SELECT to own profile or admin
-- 2. "Users can insert their own profile" - For profile creation
-- 3. "Users can update their own profile" - For profile updates
-- 4. "Admins have full access to all profiles" - Admin access with auditing

-- Verify that direct SELECT queries cannot access sensitive fields
-- Users MUST use get_public_profiles_safe() function for public profile browsing
COMMENT ON POLICY "Only view own profile or use safe functions" ON public.user_profiles IS 
'SECURITY: Direct SELECT only allows viewing own profile. Public profile browsing MUST use get_public_profiles_safe() which returns only safe fields (name, avatar, city, state) and requires authentication.';