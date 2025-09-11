-- Drop the insecure public_profiles view
DROP VIEW IF EXISTS public.public_profiles;

-- Create a secure function to replace the view
-- This function enforces authentication and proper access control
CREATE OR REPLACE FUNCTION public.get_safe_public_profiles()
RETURNS TABLE(
  id uuid,
  name text, 
  avatar_url text,
  city text,
  state text,
  reputation_score numeric,
  verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Only return data if user is authenticated
  SELECT 
    up.id,
    up.name,
    up.avatar_url, 
    up.city,
    up.state,
    up.reputation_score,
    up.verified
  FROM public.user_profiles up
  WHERE up.is_public = true 
    AND up.id != auth.uid()  -- Don't include own profile
    AND auth.uid() IS NOT NULL  -- Require authentication
  ORDER BY up.reputation_score DESC NULLS LAST;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_safe_public_profiles() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_safe_public_profiles() FROM anon, public;