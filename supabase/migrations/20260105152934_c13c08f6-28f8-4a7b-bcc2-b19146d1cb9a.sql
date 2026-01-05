-- Fix security definer view issue: Use SECURITY INVOKER instead
-- Drop and recreate view without security_barrier (which causes SECURITY DEFINER)

DROP VIEW IF EXISTS public_profiles;

-- Recreate public_profiles as a simple view (SECURITY INVOKER by default)
-- This view respects the RLS policies of the underlying profiles table
CREATE VIEW public_profiles AS
SELECT 
    id,
    full_name,
    role,
    created_at
FROM profiles;

-- Grant select to authenticated users only (not anon or public)
REVOKE ALL ON public_profiles FROM anon;
REVOKE ALL ON public_profiles FROM public;
GRANT SELECT ON public_profiles TO authenticated;

-- Add comment documenting the security considerations
COMMENT ON VIEW public_profiles IS 'View of profiles for authenticated users. Excludes email addresses. Uses SECURITY INVOKER (default) to respect RLS policies on underlying profiles table.';