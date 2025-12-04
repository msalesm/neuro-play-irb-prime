-- Add RLS policies for admins to view ALL relationships

-- Children table: allow admins to view all
CREATE POLICY "Admins can view all children" 
ON public.children 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Child access table: allow admins to view all
CREATE POLICY "Admins can view all child_access" 
ON public.child_access 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Class students table: allow admins to view all
CREATE POLICY "Admins can view all class_students" 
ON public.class_students 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- School classes: allow admins to view all
CREATE POLICY "Admins can view all school_classes" 
ON public.school_classes 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));