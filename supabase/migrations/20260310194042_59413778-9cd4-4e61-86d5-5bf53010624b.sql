
-- Link schools to institutions
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);
CREATE INDEX IF NOT EXISTS idx_schools_institution ON public.schools(institution_id);

-- Add FK from school_classes to schools (was missing constraint)  
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'school_classes_school_id_fkey' AND table_name = 'school_classes'
  ) THEN
    ALTER TABLE public.school_classes 
      ADD CONSTRAINT school_classes_school_id_fkey 
      FOREIGN KEY (school_id) REFERENCES public.schools(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_school_classes_school ON public.school_classes(school_id);
CREATE INDEX IF NOT EXISTS idx_school_classes_teacher ON public.school_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_child ON public.class_students(child_id);
