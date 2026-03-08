
-- Fix clinical_audit_logs: restrict to user's own audit entries
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.clinical_audit_logs;
CREATE POLICY "Users insert own audit logs"
ON public.clinical_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
