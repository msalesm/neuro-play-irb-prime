-- Create granular admin roles for better security
CREATE TYPE public.admin_permission AS ENUM (
    'view_basic_profiles',      -- Can view name, email only
    'view_contact_info',        -- Can view phone, address  
    'view_medical_data',        -- Can view medical information
    'modify_profiles',          -- Can update profile data
    'delete_profiles',          -- Can delete profiles
    'full_admin_access'         -- Full access (emergency only)
);

-- Create admin permissions table
CREATE TABLE public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission admin_permission NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    reason TEXT,
    UNIQUE(user_id, permission)
);

-- Enable RLS on admin permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage permissions
CREATE POLICY "Only super admins can manage permissions"
ON public.admin_permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.has_admin_permission(_user_id UUID, _permission admin_permission)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_permissions ap
        WHERE ap.user_id = _user_id
            AND ap.permission = _permission
            AND ap.is_active = true
            AND (ap.expires_at IS NULL OR ap.expires_at > now())
    ) OR has_role(_user_id, 'admin'::app_role);
$$;

-- Create audit trigger for user_profiles
CREATE OR REPLACE FUNCTION public.audit_user_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'SELECT' AND auth.uid() != NEW.id THEN
        -- Log admin access to user profiles
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, 
            old_data, new_data, ip_address
        ) VALUES (
            auth.uid(), 
            'ADMIN_VIEW_PROFILE',
            'user_profiles',
            NEW.id::text,
            NULL,
            to_jsonb(NEW),
            inet_client_addr()
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id,
            old_data, new_data, ip_address
        ) VALUES (
            auth.uid(),
            TG_OP,
            'user_profiles', 
            NEW.id::text,
            to_jsonb(OLD),
            to_jsonb(NEW),
            inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id,
            old_data, new_data, ip_address
        ) VALUES (
            auth.uid(),
            TG_OP,
            'user_profiles',
            OLD.id::text, 
            to_jsonb(OLD),
            NULL,
            inet_client_addr()
        );
        RETURN OLD;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit trigger
CREATE TRIGGER audit_user_profiles_trigger
    AFTER UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_user_profiles();