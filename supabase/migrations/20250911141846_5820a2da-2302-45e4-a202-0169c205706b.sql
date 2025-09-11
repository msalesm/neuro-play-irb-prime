-- Drop the current insecure public view
DROP VIEW IF EXISTS public.doctor_profiles_public;

-- Create a secure view that only works for authenticated users
CREATE VIEW public.doctor_profiles_public 
WITH (security_barrier = true) AS
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
    AND auth.uid() IS NOT NULL;  -- Only authenticated users can access

-- Grant access to authenticated users only
REVOKE ALL ON public.doctor_profiles_public FROM PUBLIC;
GRANT SELECT ON public.doctor_profiles_public TO authenticated;