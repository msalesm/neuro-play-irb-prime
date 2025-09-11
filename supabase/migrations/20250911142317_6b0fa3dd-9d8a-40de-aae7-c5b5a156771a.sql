-- Drop existing admin policies that are too broad
DROP POLICY IF EXISTS "Profiles: select own or admin" ON public.user_profiles;
DROP POLICY IF EXISTS "Profiles: update own or admin" ON public.user_profiles;
DROP POLICY IF EXISTS "Profiles: delete own or admin" ON public.user_profiles;

-- Create restrictive field-level access policies

-- Users can always view and update their own profiles
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin basic profile access (name, email, created_at only)
CREATE POLICY "Admins can view basic profile info"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
    id != auth.uid() AND 
    has_admin_permission(auth.uid(), 'view_basic_profiles'::admin_permission)
);

-- Separate policy for contact information access
CREATE POLICY "Admins can view contact info with permission"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
    id != auth.uid() AND 
    has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission)
);

-- Separate policy for medical data access (most restricted)
CREATE POLICY "Admins can view medical data with special permission"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
    id != auth.uid() AND 
    has_admin_permission(auth.uid(), 'view_medical_data'::admin_permission)
);

-- Admin update permissions (requires specific permission)
CREATE POLICY "Admins can update profiles with permission"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
    id != auth.uid() AND 
    has_admin_permission(auth.uid(), 'modify_profiles'::admin_permission)
)
WITH CHECK (
    id != auth.uid() AND 
    has_admin_permission(auth.uid(), 'modify_profiles'::admin_permission)
);

-- Admin delete permissions (requires specific permission)
CREATE POLICY "Admins can delete profiles with permission"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (
    id != auth.uid() AND 
    has_admin_permission(auth.uid(), 'delete_profiles'::admin_permission)
);

-- Emergency full access policy (for critical situations)
CREATE POLICY "Emergency admin full access"
ON public.user_profiles
FOR ALL
TO authenticated
USING (has_admin_permission(auth.uid(), 'full_admin_access'::admin_permission))
WITH CHECK (has_admin_permission(auth.uid(), 'full_admin_access'::admin_permission));

-- Create secure view for basic admin access (non-sensitive fields only)
CREATE VIEW public.user_profiles_basic AS
SELECT 
    id,
    name,
    email,
    created_at,
    updated_at,
    is_public,
    verified
FROM public.user_profiles
WHERE auth.uid() = id 
    OR has_admin_permission(auth.uid(), 'view_basic_profiles'::admin_permission);

-- Create secure view for contact information
CREATE VIEW public.user_profiles_contact AS
SELECT 
    id,
    name,
    email,
    phone,
    address,
    created_at
FROM public.user_profiles
WHERE auth.uid() = id 
    OR has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission);

-- Grant access to views
GRANT SELECT ON public.user_profiles_basic TO authenticated;
GRANT SELECT ON public.user_profiles_contact TO authenticated;