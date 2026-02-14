
-- Allow teachers to create children (students) for their classes
CREATE POLICY "Teachers can create students"
  ON public.children
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'teacher'
    )
  );
