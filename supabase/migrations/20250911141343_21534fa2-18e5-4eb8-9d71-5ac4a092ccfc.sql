-- Enable Row Level Security on doctor_profiles_public table
ALTER TABLE public.doctor_profiles_public ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view approved and online doctor profiles
CREATE POLICY "Authenticated users can view approved doctor profiles" 
ON public.doctor_profiles_public 
FOR SELECT 
TO authenticated
USING (approved = true AND is_online = true);

-- Allow doctors to view and update their own profile
CREATE POLICY "Doctors can manage their own profile" 
ON public.doctor_profiles_public 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all doctor profiles
CREATE POLICY "Admins can manage all doctor profiles" 
ON public.doctor_profiles_public 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));