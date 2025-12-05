-- Fix Security Definer View - recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

-- Create regular view (uses invoker's permissions, respects RLS)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  role,
  created_at
FROM public.profiles;