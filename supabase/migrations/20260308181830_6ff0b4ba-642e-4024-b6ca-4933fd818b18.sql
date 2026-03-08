
-- Fix 1: clinical_audit_logs - restrict INSERT to authenticated users
DROP POLICY IF EXISTS "System can insert audit logs" ON public.clinical_audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.clinical_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix 2: data_access_logs - restrict INSERT to authenticated users
DROP POLICY IF EXISTS "System can insert access logs" ON public.data_access_logs;
CREATE POLICY "Authenticated users can insert access logs"
ON public.data_access_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix 3: data_anonymization_logs - restrict INSERT to admins only
DROP POLICY IF EXISTS "System can insert anonymization logs" ON public.data_anonymization_logs;
CREATE POLICY "Admins can insert anonymization logs"
ON public.data_anonymization_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 4: queue_performance_metrics - restrict INSERT to institution admins
DROP POLICY IF EXISTS "System can insert metrics" ON public.queue_performance_metrics;
CREATE POLICY "Institution admins can insert metrics"
ON public.queue_performance_metrics
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_institution_admin(auth.uid(), institution_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- Fix 5: rate_limit_requests - add RLS policies
CREATE POLICY "Users can insert own rate limits"
ON public.rate_limit_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own rate limits"
ON public.rate_limit_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own rate limits"
ON public.rate_limit_requests
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
