-- Fix public_profiles view to explicitly use SECURITY INVOKER
DROP VIEW IF EXISTS public_profiles;

CREATE VIEW public_profiles 
WITH (security_invoker = true) AS
SELECT 
    id,
    full_name,
    role,
    created_at
FROM profiles;

-- Grant select to authenticated users only
REVOKE ALL ON public_profiles FROM anon;
REVOKE ALL ON public_profiles FROM public;
GRANT SELECT ON public_profiles TO authenticated;

COMMENT ON VIEW public_profiles IS 'View of profiles for authenticated users only. Excludes email addresses. Uses SECURITY INVOKER to respect RLS policies.';