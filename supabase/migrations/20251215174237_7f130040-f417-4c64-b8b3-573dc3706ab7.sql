-- Fix community_points RLS: restrict to authenticated users viewing only their own data

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view all community points" ON public.community_points;
DROP POLICY IF EXISTS "Anyone can view community points" ON public.community_points;
DROP POLICY IF EXISTS "Community points are viewable by everyone" ON public.community_points;

-- Create proper RLS policies
CREATE POLICY "Users can view their own community points"
ON public.community_points
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own community points"
ON public.community_points
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community points"
ON public.community_points
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow admins to view all community points for leaderboard
CREATE POLICY "Admins can view all community points"
ON public.community_points
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);