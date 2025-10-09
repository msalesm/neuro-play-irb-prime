-- Fix the security definer view issue by removing the view and keeping only the RPC function
-- The view was flagged because it bypasses RLS in an unsafe way

DROP VIEW IF EXISTS public.public_user_profiles_safe;

-- The get_public_profiles_safe() function is already secure and sufficient
-- It enforces authentication and returns only safe fields
-- No view is needed - all public profile queries should use the RPC function