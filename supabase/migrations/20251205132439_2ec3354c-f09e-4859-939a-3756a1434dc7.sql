-- Remove the overly permissive INSERT policy on audit_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create a SECURITY DEFINER function to safely insert audit logs
-- Only this function can insert into audit_logs, preventing direct user manipulation
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, user_agent, ip_address)
  VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_user_agent,
    inet '0.0.0.0' -- IP address should be captured at edge function level
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, text) TO authenticated;

-- Now audit logs can only be inserted via the function, not directly
-- The existing SELECT policies remain unchanged (admins can read logs)