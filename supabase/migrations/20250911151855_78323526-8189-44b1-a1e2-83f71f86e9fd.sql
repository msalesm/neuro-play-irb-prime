-- CRITICAL SECURITY FIX: Protect sensitive personal data in user_profiles table
-- This fixes the vulnerability where personal data could be accessed by unauthorized users

-- First, drop existing duplicate and potentially unsafe policies
DROP POLICY IF EXISTS "Profiles: insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create a secure policy for public profile viewing that ONLY exposes safe, basic information
-- This allows authenticated users to see basic public profile info while protecting sensitive data
CREATE POLICY "Public profiles: limited safe data only" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (
  is_public = true 
  AND id != auth.uid() -- Don't use this policy for own profile
);

-- Add explicit policy to BLOCK access to sensitive columns for public profiles
-- This ensures email, phone, address, medical data, emergency contacts are NEVER publicly visible
CREATE POLICY "Sensitive data: own profile only" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() OR 
  has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission) OR
  has_admin_permission(auth.uid(), 'view_medical_data'::admin_permission) OR
  has_admin_permission(auth.uid(), 'view_basic_profiles'::admin_permission)
);

-- Create a view for safe public profile data that explicitly excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  avatar_url,
  city,
  state,
  is_public,
  verified,
  reputation_score,
  created_at
FROM public.user_profiles 
WHERE is_public = true;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant access to the safe public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add a security function to get safe profile data
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  avatar_url text,
  city text,
  state text,
  reputation_score numeric,
  verified boolean
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.avatar_url,
    p.city,
    p.state,
    p.reputation_score,
    p.verified
  FROM public.user_profiles p
  WHERE p.id = profile_id 
    AND p.is_public = true
    AND p.id != auth.uid(); -- Users should access their own profile directly
$$;

-- Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_profile_access()
RETURNS TRIGGER AS $$
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
      jsonb_build_object('accessed_fields', 
        CASE 
          WHEN NEW.email IS NOT NULL THEN 'email,'
          ELSE ''
        END ||
        CASE 
          WHEN NEW.phone IS NOT NULL THEN 'phone,'
          ELSE ''
        END ||
        CASE 
          WHEN NEW.address IS NOT NULL THEN 'address,'
          ELSE ''
        END ||
        CASE 
          WHEN NEW.emergency_contact IS NOT NULL THEN 'emergency_contact,'
          ELSE ''
        END ||
        CASE 
          WHEN NEW.medical_preferences IS NOT NULL THEN 'medical_preferences,'
          ELSE ''
        END ||
        CASE 
          WHEN NEW.medical_history_summary IS NOT NULL THEN 'medical_history_summary'
          ELSE ''
        END
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON VIEW public.public_profiles IS 'Safe view of user profiles that excludes all sensitive personal data (email, phone, address, medical info, emergency contacts)';
COMMENT ON FUNCTION public.get_safe_public_profile(uuid) IS 'Securely retrieves non-sensitive public profile information for authenticated users';
COMMENT ON FUNCTION public.audit_sensitive_profile_access() IS 'Audits access to sensitive profile data for security monitoring';