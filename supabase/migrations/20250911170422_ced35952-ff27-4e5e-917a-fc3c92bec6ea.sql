-- Enable Row Level Security on public_profiles table
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile data
CREATE POLICY "Users can view their own profile"
ON public.public_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Authenticated users can view public profiles only
CREATE POLICY "Authenticated users can view public profiles"
ON public.public_profiles  
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_public = true 
  AND id != auth.uid()  -- Prevent duplicate access via this policy
);

-- Policy 3: Users can update their own profiles
CREATE POLICY "Users can update their own profile"
ON public.public_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.public_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 5: Allow admins to manage all profiles (if admin role system exists)
CREATE POLICY "Admins can manage all profiles"
ON public.public_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);