-- Remove the overly permissive policy that allows any user to manipulate any child's progress
DROP POLICY IF EXISTS "System can manage adaptive progress" ON public.adaptive_progress;

-- Ensure we have secure parent-scoped policies for all operations
-- The SELECT policy already exists: "Parents can view their children's progress"

-- Add INSERT policy for parents (via trigger/system operations)
CREATE POLICY "Parents can create progress via system" ON public.adaptive_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    child_profile_id IN (
      SELECT id FROM public.child_profiles
      WHERE parent_user_id = auth.uid()
    )
  );

-- Add UPDATE policy for parents (via trigger/system operations)
CREATE POLICY "Parents can update their children's progress" ON public.adaptive_progress
  FOR UPDATE
  TO authenticated
  USING (
    child_profile_id IN (
      SELECT id FROM public.child_profiles
      WHERE parent_user_id = auth.uid()
    )
  )
  WITH CHECK (
    child_profile_id IN (
      SELECT id FROM public.child_profiles
      WHERE parent_user_id = auth.uid()
    )
  );

-- Note: No DELETE policy is added intentionally - progress data should not be deleted by users