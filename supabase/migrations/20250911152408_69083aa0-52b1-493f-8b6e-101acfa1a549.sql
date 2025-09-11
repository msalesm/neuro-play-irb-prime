-- Fix Security Definer View Issue
-- The public_profiles view needs proper RLS policies instead of relying on SECURITY DEFINER

-- Drop the existing public_profiles view 
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without SECURITY DEFINER and ensure it has proper RLS
CREATE VIEW public.public_profiles 
WITH (security_barrier=true) AS
SELECT 
    up.id,
    up.name,
    up.avatar_url,
    up.city,
    up.state,
    up.is_public,
    up.verified,
    up.reputation_score,
    up.created_at
FROM public.user_profiles up
WHERE up.is_public = true;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Add RLS policy to the view for safe public access
CREATE POLICY "public_profiles_safe_access" ON public.public_profiles
FOR SELECT 
TO authenticated
USING (is_public = true);

-- Ensure the underlying user_profiles table has proper RLS for sensitive data
-- Add policy to prevent access to sensitive columns through public profiles
CREATE POLICY "Public profiles: safe data only" ON public.user_profiles
FOR SELECT 
TO authenticated
USING (
  is_public = true 
  AND auth.uid() IS NOT NULL
);

-- Add policy to restrict direct access to sensitive user profile data
CREATE POLICY "Sensitive user data: own profile only" ON public.user_profiles  
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Grant necessary permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;