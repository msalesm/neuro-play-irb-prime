-- Add RLS policies for admins to view all data

-- Parent training: allow admins to view all
CREATE POLICY "Admins can view all parent_training" 
ON public.parent_training 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Clinical reports: allow admins to view all
CREATE POLICY "Admins can view all clinical_reports" 
ON public.clinical_reports 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- PEI plans: allow admins to view all
CREATE POLICY "Admins can view all pei_plans" 
ON public.pei_plans 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Learning sessions: allow admins to view all
CREATE POLICY "Admins can view all learning_sessions" 
ON public.learning_sessions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Game sessions: allow admins to view all
CREATE POLICY "Admins can view all game_sessions" 
ON public.game_sessions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Child profiles: allow admins to view all
CREATE POLICY "Admins can view all child_profiles" 
ON public.child_profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));