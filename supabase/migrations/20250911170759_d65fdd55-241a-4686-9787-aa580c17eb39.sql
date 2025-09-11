-- Fix the remaining search path security issue 
CREATE OR REPLACE FUNCTION public.audit_sensitive_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, pg_temp'  -- Fixed: explicit search path
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
$$;