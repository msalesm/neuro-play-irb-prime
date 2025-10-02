-- ============================================================================
-- CRITICAL SECURITY FIXES - Phase 1 (Complete Reset)
-- ============================================================================

-- Drop existing conflicting functions
DROP FUNCTION IF EXISTS public.get_user_contact_info(uuid);
DROP FUNCTION IF EXISTS public.get_user_medical_data(uuid);
DROP FUNCTION IF EXISTS public.get_safe_public_profile(uuid);
DROP FUNCTION IF EXISTS public.search_doctors_secure(text, text, text);
DROP FUNCTION IF EXISTS public.detect_suspicious_pii_access() CASCADE;

-- ============================================================================
-- FIX 1: USER PROFILES PII PROTECTION
-- ============================================================================

-- Drop ALL existing user_profiles policies to start fresh
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_profiles';
  END LOOP;
END $$;

-- Function 1: Get basic (non-sensitive) profile information
CREATE OR REPLACE FUNCTION public.get_user_basic_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  avatar_url text,
  city text,
  state text,
  reputation_score numeric,
  verified boolean,
  is_public boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    EXISTS(SELECT 1 FROM user_profiles WHERE user_profiles.id = profile_user_id AND user_profiles.is_public = true)
    OR auth.uid() = profile_user_id
    OR has_role(auth.uid(), 'admin'::app_role)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot view this profile';
  END IF;

  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.avatar_url,
    up.city,
    up.state,
    up.reputation_score,
    up.verified,
    up.is_public,
    up.created_at
  FROM public.user_profiles up
  WHERE up.id = profile_user_id;
END;
$$;

-- Function 2: Get contact information (PII) with audit logging
CREATE OR REPLACE FUNCTION public.get_user_contact_info(profile_user_id uuid)
RETURNS TABLE(
  email text,
  phone text,
  address jsonb,
  emergency_contact jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    auth.uid() = profile_user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot view contact information';
  END IF;

  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, new_data
  ) VALUES (
    auth.uid(),
    'PII_ACCESS_CONTACT',
    'user_profiles',
    profile_user_id::text,
    jsonb_build_object(
      'accessed_by', auth.uid(),
      'target_user', profile_user_id,
      'timestamp', now()
    )
  );

  RETURN QUERY
  SELECT 
    up.email,
    up.phone,
    up.address,
    up.emergency_contact
  FROM public.user_profiles up
  WHERE up.id = profile_user_id;
END;
$$;

-- Function 3: Get medical data with strict audit logging
CREATE OR REPLACE FUNCTION public.get_user_medical_data(profile_user_id uuid)
RETURNS TABLE(
  date_of_birth date,
  medical_history_summary text,
  medical_preferences jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    auth.uid() = profile_user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_admin_permission(auth.uid(), 'view_medical_data'::admin_permission)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot view medical data';
  END IF;

  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, new_data
  ) VALUES (
    auth.uid(),
    'PII_ACCESS_MEDICAL',
    'user_profiles',
    profile_user_id::text,
    jsonb_build_object(
      'accessed_by', auth.uid(),
      'target_user', profile_user_id,
      'timestamp', now(),
      'severity', 'CRITICAL'
    )
  );

  RETURN QUERY
  SELECT 
    up.date_of_birth,
    up.medical_history_summary,
    up.medical_preferences
  FROM public.user_profiles up
  WHERE up.id = profile_user_id;
END;
$$;

-- Create new restrictive RLS policies for user_profiles
CREATE POLICY "Users can view basic profile info"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR is_public = true
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- FIX 2: EMAIL ENUMERATION PREVENTION IN SUBSCRIBERS
-- ============================================================================

-- Drop ALL existing subscribers policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'subscribers' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.subscribers';
  END LOOP;
END $$;

-- Create secure policies that only use user_id (no email enumeration)
CREATE POLICY "Users can view own subscription by user_id"
ON public.subscribers
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can subscribe"
ON public.subscribers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.subscribers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FIX 3: DOCTOR PROFILE DATA SCRAPING PROTECTION
-- ============================================================================

-- Create safe public view with limited fields
CREATE OR REPLACE VIEW public.doctor_profiles_public AS
SELECT 
  id,
  user_id,
  specialty,
  bio,
  photo_url,
  is_online,
  rating_avg,
  approved,
  CASE
    WHEN approved = true THEN jsonb_build_object(
      'city', address->>'city',
      'state', address->>'state'
    )
    ELSE NULL
  END AS location_public,
  CASE 
    WHEN is_online = true THEN 'available'
    ELSE 'unavailable'
  END AS availability_status,
  created_at
FROM public.doctor_profiles
WHERE approved = true AND is_online = true;

GRANT SELECT ON public.doctor_profiles_public TO authenticated;
GRANT SELECT ON public.doctor_profiles_public TO anon;

-- Drop ALL existing doctor_profiles policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'doctor_profiles' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.doctor_profiles';
  END LOOP;
END $$;

-- Restrictive policy: only doctor themselves or admin can see full profile
CREATE POLICY "doctor_profiles_restricted_access"
ON public.doctor_profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "doctor_own_complete_access"
ON public.doctor_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_complete_access"
ON public.doctor_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Safe doctor search function
CREATE OR REPLACE FUNCTION public.search_doctors_public(
  p_specialty text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  specialty text,
  bio text,
  photo_url text,
  rating_avg numeric,
  location_city text,
  location_state text,
  availability_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    dpv.id,
    dpv.user_id,
    dpv.specialty,
    dpv.bio,
    dpv.photo_url,
    dpv.rating_avg,
    dpv.location_public->>'city' as location_city,
    dpv.location_public->>'state' as location_state,
    dpv.availability_status
  FROM public.doctor_profiles_public dpv
  WHERE 
    (p_specialty IS NULL OR dpv.specialty ILIKE '%' || p_specialty || '%')
    AND (p_city IS NULL OR dpv.location_public->>'city' ILIKE '%' || p_city || '%')
    AND (p_state IS NULL OR dpv.location_public->>'state' ILIKE '%' || p_state || '%')
  ORDER BY dpv.rating_avg DESC
  LIMIT 50;
$$;

-- ============================================================================
-- SECURITY MONITORING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detect_suspicious_pii_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_count integer;
BEGIN
  SELECT COUNT(*) INTO access_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND action IN ('PII_ACCESS_CONTACT', 'PII_ACCESS_MEDICAL')
    AND created_at > now() - interval '5 minutes';

  IF access_count > 10 THEN
    INSERT INTO public.smart_alerts (
      user_id,
      alert_type,
      priority_level,
      title,
      description,
      alert_data,
      triggered_by
    ) VALUES (
      auth.uid(),
      'suspicious_pii_access',
      'high',
      'Suspicious PII Access Detected',
      'Unusual pattern of PII access detected from your account',
      jsonb_build_object(
        'access_count', access_count,
        'time_window', '5 minutes',
        'actions', ARRAY['PII_ACCESS_CONTACT', 'PII_ACCESS_MEDICAL']
      ),
      'security_monitoring'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_suspicious_pii_access
  AFTER INSERT ON public.audit_logs
  FOR EACH ROW
  WHEN (NEW.action IN ('PII_ACCESS_CONTACT', 'PII_ACCESS_MEDICAL'))
  EXECUTE FUNCTION public.detect_suspicious_pii_access();