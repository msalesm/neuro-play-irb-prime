-- ============================================================================
-- FIX SECURITY LINTER ERROR: Remove insecure view
-- ============================================================================
-- The doctor_profiles_public view bypasses RLS and is flagged as insecure.
-- We'll drop it and rely entirely on the secure search_doctors_public function.
-- ============================================================================

-- Drop the insecure view
DROP VIEW IF EXISTS public.doctor_profiles_public;

-- Update the search function to query the table directly with proper filtering
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.user_id,
    dp.specialty,
    dp.bio,
    dp.photo_url,
    dp.rating_avg,
    dp.address->>'city' as location_city,
    dp.address->>'state' as location_state,
    CASE 
      WHEN dp.is_online = true THEN 'available'
      ELSE 'unavailable'
    END::text as availability_status
  FROM public.doctor_profiles dp
  WHERE 
    dp.approved = true 
    AND dp.is_online = true
    AND (p_specialty IS NULL OR dp.specialty ILIKE '%' || p_specialty || '%')
    AND (p_city IS NULL OR dp.address->>'city' ILIKE '%' || p_city || '%')
    AND (p_state IS NULL OR dp.address->>'state' ILIKE '%' || p_state || '%')
  ORDER BY dp.rating_avg DESC
  LIMIT 50;
END;
$$;

COMMENT ON FUNCTION public.search_doctors_public IS 'Safe public search for doctors with controlled field exposure - use this instead of direct table queries to prevent data scraping';