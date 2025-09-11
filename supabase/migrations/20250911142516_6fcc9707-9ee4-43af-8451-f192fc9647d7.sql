-- Drop the views that triggered security warnings
DROP VIEW IF EXISTS public.user_profiles_basic;
DROP VIEW IF EXISTS public.user_profiles_contact;

-- Create secure functions instead of views
CREATE OR REPLACE FUNCTION public.get_user_profiles_basic()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN,
    verified BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        up.id,
        up.name,
        up.email,
        up.created_at,
        up.updated_at,
        up.is_public,
        up.verified
    FROM public.user_profiles up
    WHERE up.id = auth.uid() 
        OR has_admin_permission(auth.uid(), 'view_basic_profiles'::admin_permission);
$$;

CREATE OR REPLACE FUNCTION public.get_user_profiles_contact()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE  
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        up.id,
        up.name,
        up.email,
        up.phone,
        up.address,
        up.created_at
    FROM public.user_profiles up
    WHERE up.id = auth.uid() 
        OR has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission);
$$;

-- Create admin permission management function
CREATE OR REPLACE FUNCTION public.grant_admin_permission(
    _target_user_id UUID,
    _permission admin_permission,
    _expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    _reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only super admins can grant permissions
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
        RAISE EXCEPTION 'Only super admins can grant permissions';
    END IF;
    
    -- Insert or update permission
    INSERT INTO public.admin_permissions (
        user_id, permission, granted_by, expires_at, reason
    ) VALUES (
        _target_user_id, _permission, auth.uid(), _expires_at, _reason
    )
    ON CONFLICT (user_id, permission) DO UPDATE SET
        granted_by = auth.uid(),
        granted_at = now(),
        expires_at = _expires_at,
        is_active = true,
        reason = _reason;
    
    -- Log the permission grant
    INSERT INTO public.audit_logs (
        user_id, action, table_name, record_id, new_data
    ) VALUES (
        auth.uid(),
        'GRANT_ADMIN_PERMISSION',
        'admin_permissions',
        _target_user_id::text,
        jsonb_build_object(
            'permission', _permission::text,
            'expires_at', _expires_at,
            'reason', _reason
        )
    );
    
    RETURN true;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION public.get_user_profiles_basic() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_profiles_contact() FROM PUBLIC;  
REVOKE ALL ON FUNCTION public.grant_admin_permission(UUID, admin_permission, TIMESTAMP WITH TIME ZONE, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_user_profiles_basic() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profiles_contact() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_permission(UUID, admin_permission, TIMESTAMP WITH TIME ZONE, TEXT) TO authenticated;