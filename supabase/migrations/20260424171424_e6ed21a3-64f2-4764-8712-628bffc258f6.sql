-- Class announcements (broadcasts from teacher to all parents in class)
CREATE TABLE IF NOT EXISTS public.class_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'event', 'reminder', 'pedagogical', 'celebration')),
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_announcements_class ON public.class_announcements(class_id, created_at DESC);

ALTER TABLE public.class_announcements ENABLE ROW LEVEL SECURITY;

-- Teachers (or admins) of the class can manage announcements
CREATE POLICY "Teachers manage own class announcements"
ON public.class_announcements
FOR ALL
TO authenticated
USING (
  teacher_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.school_classes sc WHERE sc.id = class_id AND sc.teacher_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  teacher_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.school_classes sc WHERE sc.id = class_id AND sc.teacher_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Parents of children in the class can read announcements
CREATE POLICY "Parents view announcements for their children's class"
ON public.class_announcements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.children c ON c.id = cs.child_id
    WHERE cs.class_id = class_announcements.class_id
      AND cs.is_active = true
      AND c.parent_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_class_announcements_updated_at
BEFORE UPDATE ON public.class_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();