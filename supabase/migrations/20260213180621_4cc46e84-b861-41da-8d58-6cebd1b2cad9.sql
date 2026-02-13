
-- Table for weekly teacher observations (check-in rápido)
CREATE TABLE public.student_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id),
  observation_week DATE NOT NULL, -- Monday of the week
  
  -- Checklist items (1-3 scale: 1=adequado, 2=atenção, 3=prioridade)
  participation SMALLINT DEFAULT 1 CHECK (participation BETWEEN 1 AND 3),
  behavior_change SMALLINT DEFAULT 1 CHECK (behavior_change BETWEEN 1 AND 3),
  social_isolation SMALLINT DEFAULT 1 CHECK (social_isolation BETWEEN 1 AND 3),
  aggressiveness SMALLINT DEFAULT 1 CHECK (aggressiveness BETWEEN 1 AND 3),
  focus_difficulty SMALLINT DEFAULT 1 CHECK (focus_difficulty BETWEEN 1 AND 3),
  performance_drop SMALLINT DEFAULT 1 CHECK (performance_drop BETWEEN 1 AND 3),
  persistent_sadness SMALLINT DEFAULT 1 CHECK (persistent_sadness BETWEEN 1 AND 3),
  
  -- Computed risk level
  risk_level TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (participation + behavior_change + social_isolation + aggressiveness + focus_difficulty + performance_drop + persistent_sadness) >= 17 THEN 'high'
      WHEN (participation + behavior_change + social_isolation + aggressiveness + focus_difficulty + performance_drop + persistent_sadness) >= 12 THEN 'moderate'
      ELSE 'low'
    END
  ) STORED,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- One observation per student per week per class
  UNIQUE(class_id, child_id, observation_week)
);

-- Enable RLS
ALTER TABLE public.student_observations ENABLE ROW LEVEL SECURITY;

-- Teachers can manage observations for their own classes
CREATE POLICY "Teachers can view own class observations"
  ON public.student_observations FOR SELECT
  USING (
    teacher_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teachers can insert observations for own classes"
  ON public.student_observations FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.school_classes sc
      WHERE sc.id = class_id AND sc.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update own observations"
  ON public.student_observations FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own observations"
  ON public.student_observations FOR DELETE
  USING (teacher_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_student_observations_updated_at
  BEFORE UPDATE ON public.student_observations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_student_observations_class_week ON public.student_observations(class_id, observation_week);
CREATE INDEX idx_student_observations_child ON public.student_observations(child_id, observation_week);
CREATE INDEX idx_student_observations_teacher ON public.student_observations(teacher_id);
