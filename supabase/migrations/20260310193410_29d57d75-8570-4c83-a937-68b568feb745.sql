
-- Fix overly permissive RLS policies
DROP POLICY "System inserts scan results" ON public.scan_student_results;
DROP POLICY "System updates scan results" ON public.scan_student_results;
DROP POLICY "System inserts cognitive events" ON public.cognitive_events;

-- Tighter insert: only teachers who own the session can insert results
CREATE POLICY "Teachers insert scan results" ON public.scan_student_results
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classroom_scan_sessions css
      WHERE css.id = session_id
      AND (css.teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Teachers update scan results" ON public.scan_student_results
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_scan_sessions css
      WHERE css.id = session_id
      AND (css.teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Teachers insert cognitive events" ON public.cognitive_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classroom_scan_sessions css
      WHERE css.id = session_id
      AND (css.teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );
