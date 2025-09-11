-- Drop the current view to fix security linter warning
DROP VIEW IF EXISTS public.doctor_profiles_public;

-- Create a secure function instead of a view
CREATE OR REPLACE FUNCTION public.get_public_doctor_profiles()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    specialty text,
    bio text,
    photo_url text,
    is_online boolean,
    rating_avg numeric,
    approved boolean,
    location_public jsonb,
    created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT 
        dp.id,
        dp.user_id,
        dp.specialty,
        dp.bio,
        dp.photo_url,
        dp.is_online,
        dp.rating_avg,
        dp.approved,
        CASE
            WHEN dp.approved = true THEN jsonb_build_object(
                'city', dp.address->>'city',
                'state', dp.address->>'state'
            )
            ELSE NULL
        END AS location_public,
        dp.created_at
    FROM doctor_profiles dp
    WHERE dp.approved = true 
        AND dp.is_online = true
        AND auth.uid() IS NOT NULL;  -- Only authenticated users
$$;

-- Grant execute permission only to authenticated users
REVOKE ALL ON FUNCTION public.get_public_doctor_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_doctor_profiles() TO authenticated;