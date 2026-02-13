
-- Fix search_path on cleanup_rate_limits
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM rate_limit_requests WHERE requested_at < now() - interval '24 hours';
$$;
