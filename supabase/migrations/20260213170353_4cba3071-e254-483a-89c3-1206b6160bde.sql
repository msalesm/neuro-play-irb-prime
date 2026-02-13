
-- Create rate limit tracking table
CREATE TABLE public.rate_limit_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limit_user_endpoint_time 
ON public.rate_limit_requests (user_id, endpoint, requested_at DESC);

-- Auto-cleanup old entries (keep last 24h)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM rate_limit_requests WHERE requested_at < now() - interval '24 hours';
$$;

-- Rate limit check function: returns true if allowed, false if rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_count integer;
BEGIN
  -- Count requests in window
  SELECT COUNT(*) INTO request_count
  FROM rate_limit_requests
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND requested_at > now() - (p_window_minutes || ' minutes')::interval;

  IF request_count >= p_max_requests THEN
    RETURN false;
  END IF;

  -- Record this request
  INSERT INTO rate_limit_requests (user_id, endpoint)
  VALUES (p_user_id, p_endpoint);

  RETURN true;
END;
$$;

-- Enable RLS
ALTER TABLE public.rate_limit_requests ENABLE ROW LEVEL SECURITY;

-- Only service role should access this table (edge functions use service role)
-- No public policies needed - accessed only via SECURITY DEFINER function
