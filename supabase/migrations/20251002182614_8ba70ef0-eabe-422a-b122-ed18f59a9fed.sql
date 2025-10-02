-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles_safe;

-- Recreate the view with SECURITY INVOKER
-- This ensures the view respects the RLS policies of the querying user, not the view creator
CREATE VIEW public.public_profiles_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  avatar_url,
  city,
  state,
  reputation_score,
  verified,
  is_public,
  created_at,
  updated_at
FROM public.user_profiles
WHERE is_public = true;