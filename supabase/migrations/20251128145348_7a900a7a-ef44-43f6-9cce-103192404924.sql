-- Create school_classes table for teachers to manage their classes
CREATE TABLE IF NOT EXISTS public.school_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade_level text,
  school_year text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_classes ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own classes
CREATE POLICY "Teachers can view own classes"
ON public.school_classes
FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create own classes"
ON public.school_classes
FOR INSERT
TO authenticated
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own classes"
ON public.school_classes
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own classes"
ON public.school_classes
FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

-- Create class_students junction table
CREATE TABLE IF NOT EXISTS public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  enrolled_at timestamp with time zone DEFAULT now(),
  notes text,
  UNIQUE(class_id, child_id)
);

-- Enable RLS
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view students in own classes"
ON public.class_students
FOR SELECT
TO authenticated
USING (
  class_id IN (
    SELECT id FROM public.school_classes WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can add students to own classes"
ON public.class_students
FOR INSERT
TO authenticated
WITH CHECK (
  class_id IN (
    SELECT id FROM public.school_classes WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can remove students from own classes"
ON public.class_students
FOR DELETE
TO authenticated
USING (
  class_id IN (
    SELECT id FROM public.school_classes WHERE teacher_id = auth.uid()
  )
);

-- Create school_occurrences table for behavioral/academic incidents
CREATE TABLE IF NOT EXISTS public.school_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occurrence_type text NOT NULL, -- behavioral, academic, social, positive
  severity text, -- low, medium, high
  title text NOT NULL,
  description text NOT NULL,
  intervention_taken text,
  follow_up_needed boolean DEFAULT false,
  occurred_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_occurrences ENABLE ROW LEVEL SECURITY;

-- Teachers can manage occurrences for students in their classes
CREATE POLICY "Teachers can view occurrences for their students"
ON public.school_occurrences
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT cs.child_id 
    FROM public.class_students cs
    JOIN public.school_classes sc ON cs.class_id = sc.id
    WHERE sc.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can create occurrences"
ON public.school_occurrences
FOR INSERT
TO authenticated
WITH CHECK (
  teacher_id = auth.uid() AND
  child_id IN (
    SELECT cs.child_id 
    FROM public.class_students cs
    JOIN public.school_classes sc ON cs.class_id = sc.id
    WHERE sc.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update own occurrences"
ON public.school_occurrences
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid());

-- Parents can view occurrences for their children
CREATE POLICY "Parents can view occurrences for own children"
ON public.school_occurrences
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT id FROM public.children WHERE parent_id = auth.uid()
  )
);

-- Professionals can view occurrences for children they have access to
CREATE POLICY "Professionals can view occurrences for accessible children"
ON public.school_occurrences
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT child_id FROM public.child_access WHERE professional_id = auth.uid()
  )
);

-- Create school_communications table for school-family-therapist messaging
CREATE TABLE IF NOT EXISTS public.school_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL, -- teacher, parent, therapist
  recipient_role text NOT NULL, -- teacher, parent, therapist, all
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal', -- low, normal, high, urgent
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_communications ENABLE ROW LEVEL SECURITY;

-- Users can view communications related to children they have access to
CREATE POLICY "Users can view communications for accessible children"
ON public.school_communications
FOR SELECT
TO authenticated
USING (
  -- Sender can see their sent messages
  sender_id = auth.uid() OR
  -- Parents can see messages about their children
  (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())) OR
  -- Teachers can see messages about students in their classes
  (child_id IN (
    SELECT cs.child_id 
    FROM public.class_students cs
    JOIN public.school_classes sc ON cs.class_id = sc.id
    WHERE sc.teacher_id = auth.uid()
  )) OR
  -- Professionals can see messages about children they have access to
  (child_id IN (SELECT child_id FROM public.child_access WHERE professional_id = auth.uid()))
);

CREATE POLICY "Users can send communications"
ON public.school_communications
FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own communications"
ON public.school_communications
FOR UPDATE
TO authenticated
USING (
  sender_id = auth.uid() OR
  (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())) OR
  (child_id IN (
    SELECT cs.child_id 
    FROM public.class_students cs
    JOIN public.school_classes sc ON cs.class_id = sc.id
    WHERE sc.teacher_id = auth.uid()
  )) OR
  (child_id IN (SELECT child_id FROM public.child_access WHERE professional_id = auth.uid()))
);