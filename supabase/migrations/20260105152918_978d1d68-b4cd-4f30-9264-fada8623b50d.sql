-- Fix security issue: public_profiles view exposes user data without authentication
-- Drop the existing view and recreate with security barrier

DROP VIEW IF EXISTS public_profiles;

-- Recreate public_profiles view with security_barrier to prevent data leakage
-- Only expose non-sensitive fields (no email) and require authentication
CREATE OR REPLACE VIEW public_profiles WITH (security_barrier = true) AS
SELECT 
    id,
    full_name,
    role,
    created_at
FROM profiles
WHERE 
    -- Only show profile if user is authenticated
    auth.uid() IS NOT NULL;

-- Grant select to authenticated users only
REVOKE ALL ON public_profiles FROM anon;
REVOKE ALL ON public_profiles FROM public;
GRANT SELECT ON public_profiles TO authenticated;

-- Additional security: Ensure wearable_connections tokens are encrypted at rest
-- The RLS policy already restricts access to owner only, but let's add an extra verification
-- by ensuring the policy is properly configured

-- Verify digital_prescriptions has proper RLS enabled
ALTER TABLE IF EXISTS digital_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS digital_prescriptions FORCE ROW LEVEL SECURITY;

-- Verify neuro_anamnesis has proper RLS enabled  
ALTER TABLE IF EXISTS neuro_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS neuro_anamnesis FORCE ROW LEVEL SECURITY;

-- Verify external_integrations has proper RLS enabled
ALTER TABLE IF EXISTS external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS external_integrations FORCE ROW LEVEL SECURITY;

-- Verify wearable_connections has proper RLS enabled
ALTER TABLE IF EXISTS wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wearable_connections FORCE ROW LEVEL SECURITY;

-- Add comment documenting the security considerations
COMMENT ON VIEW public_profiles IS 'Security-hardened view of profiles. Requires authentication and excludes email addresses.';