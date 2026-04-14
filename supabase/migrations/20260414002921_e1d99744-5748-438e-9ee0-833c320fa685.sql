
-- Drop existing policies
DROP POLICY "Teachers can insert observations for own classes" ON public.student_observations;
DROP POLICY "Teachers can update own observations" ON public.student_observations;
DROP POLICY "Teachers can delete own observations" ON public.student_observations;

-- Recreate with admin access
CREATE POLICY "Teachers and admins can insert observations"
ON public.student_observations FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM school_classes sc
      WHERE sc.id = student_observations.class_id AND sc.teacher_id = auth.uid()
    )
  )
);

CREATE POLICY "Teachers and admins can update observations"
ON public.student_observations FOR UPDATE
USING (
  teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can delete observations"
ON public.student_observations FOR DELETE
USING (
  teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
