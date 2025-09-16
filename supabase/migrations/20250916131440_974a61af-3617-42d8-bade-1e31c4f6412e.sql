-- Critical Security Fixes Migration (Fixed Dependencies)

-- 1. First drop dependent policies that reference the role column
DROP POLICY IF EXISTS "Healthcare providers can view patient emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Healthcare providers can create emergency alerts for patients" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Admins can manage all emergency alerts" ON public.emergency_alerts;

-- 2. Now safely remove role column from user_profiles to fix dual role system
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles DROP COLUMN role;
    END IF;
END $$;

-- 3. Recreate emergency_alerts policies using the proper user_roles table
CREATE POLICY "Healthcare providers can view patient emergency alerts" 
ON public.emergency_alerts 
FOR SELECT 
USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'moderator'::app_role) OR
    auth.uid() = user_id
);

CREATE POLICY "Healthcare providers can create emergency alerts for patients" 
ON public.emergency_alerts 
FOR INSERT 
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Admins can manage all emergency alerts" 
ON public.emergency_alerts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Secure Educational Content - Require authentication for social_scenarios
DROP POLICY IF EXISTS "Anyone can view social scenarios" ON public.social_scenarios;
CREATE POLICY "Authenticated users can view social scenarios" 
ON public.social_scenarios 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 5. Secure Analytics Data - Restrict trending_topics to authenticated users
DROP POLICY IF EXISTS "Anyone can view trending topics" ON public.trending_topics;
CREATE POLICY "Authenticated users can view trending topics" 
ON public.trending_topics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 6. Secure achievements table - require authentication
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Authenticated users can view achievements" 
ON public.achievements 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 7. Secure behavioral metrics with user isolation
CREATE POLICY "Users can only access their own behavioral metrics" 
ON public.behavioral_metrics 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Secure diagnostic sessions with user isolation  
CREATE POLICY "Users can only access their own diagnostic sessions" 
ON public.diagnostic_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. Enhanced User Profile Security - Add granular access control function
CREATE OR REPLACE FUNCTION public.can_view_sensitive_profile_data(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() = profile_user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission);
$$;

-- 10. Add security constraint to prevent unauthorized role assignments
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IN ('admin', 'moderator') THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can assign admin or moderator roles';
    END IF;
  END IF;
  
  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, new_data
  ) VALUES (
    auth.uid(), 'ROLE_ASSIGNMENT', 'user_roles', NEW.user_id::text,
    jsonb_build_object('role', NEW.role::text, 'assigned_to', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_role_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.validate_role_assignment();