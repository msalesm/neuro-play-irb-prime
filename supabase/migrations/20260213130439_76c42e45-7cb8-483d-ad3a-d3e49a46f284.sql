-- Fix 1: Tighten profiles RLS - remove therapist access from broad policy
-- The "Professionals can view profiles of accessible children parents" policy already handles this
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());
