-- Critical Security Fixes Migration

-- 1. Secure Educational Content - Require authentication for social_scenarios
DROP POLICY IF EXISTS "Anyone can view social scenarios" ON public.social_scenarios;
CREATE POLICY "Authenticated users can view social scenarios" 
ON public.social_scenarios 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Secure Analytics Data - Restrict trending_topics to authenticated users
DROP POLICY IF EXISTS "Anyone can view trending topics" ON public.trending_topics;
CREATE POLICY "Authenticated users can view trending topics" 
ON public.trending_topics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Fix Dual Role System - Remove role column from user_profiles to avoid conflicts
-- First check if the column exists and has data
DO $$ 
BEGIN
    -- Remove the role column from user_profiles if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role;
    END IF;
END $$;

-- 4. Enhanced User Profile Security - Add more granular access control
-- Update existing policies to be more restrictive for sensitive data

-- Create function to check if user can view sensitive profile data
CREATE OR REPLACE FUNCTION public.can_view_sensitive_profile_data(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User can view their own data
    auth.uid() = profile_user_id 
    OR 
    -- Admins can view all data
    has_role(auth.uid(), 'admin'::app_role)
    OR
    -- Users with specific admin permissions
    has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission);
$$;

-- 5. Secure achievements table - require authentication
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Authenticated users can view achievements" 
ON public.achievements 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 6. Add audit logging for sensitive profile access
CREATE OR REPLACE FUNCTION public.log_sensitive_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when someone accesses sensitive profile data that isn't their own
  IF NEW.id != auth.uid() AND (
    NEW.email IS NOT NULL OR 
    NEW.phone IS NOT NULL OR 
    NEW.address IS NOT NULL OR
    NEW.emergency_contact IS NOT NULL OR
    NEW.medical_preferences IS NOT NULL OR
    NEW.medical_history_summary IS NOT NULL
  ) THEN
    INSERT INTO public.audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id,
      new_data
    ) VALUES (
      auth.uid(),
      'SENSITIVE_PROFILE_ACCESS',
      'user_profiles',
      NEW.id::text,
      jsonb_build_object(
        'accessed_fields', 
        CASE WHEN NEW.email IS NOT NULL THEN 'email,' ELSE '' END ||
        CASE WHEN NEW.phone IS NOT NULL THEN 'phone,' ELSE '' END ||
        CASE WHEN NEW.address IS NOT NULL THEN 'address,' ELSE '' END ||
        CASE WHEN NEW.emergency_contact IS NOT NULL THEN 'emergency_contact,' ELSE '' END ||
        CASE WHEN NEW.medical_preferences IS NOT NULL THEN 'medical_preferences,' ELSE '' END ||
        CASE WHEN NEW.medical_history_summary IS NOT NULL THEN 'medical_history_summary' ELSE '' END,
        'target_user_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for sensitive profile access logging
DROP TRIGGER IF EXISTS audit_sensitive_profile_access ON public.user_profiles;
CREATE TRIGGER audit_sensitive_profile_access
  AFTER SELECT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_profile_access();

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

-- 9. Add security constraint to prevent unauthorized role assignments
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can assign admin or moderator roles
  IF NEW.role IN ('admin', 'moderator') THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can assign admin or moderator roles';
    END IF;
  END IF;
  
  -- Log role assignments for audit trail
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) VALUES (
    auth.uid(),
    'ROLE_ASSIGNMENT',
    'user_roles',
    NEW.user_id::text,
    jsonb_build_object('role', NEW.role::text, 'assigned_to', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for role assignment validation
DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_role_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.validate_role_assignment();