
-- 1) Add child_id FK to child_profiles to link the two tables
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.children(id) ON DELETE SET NULL;

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_child_profiles_child_id ON public.child_profiles(child_id);

-- 2) Create teacher_training table (separate from parent_training)
CREATE TABLE IF NOT EXISTS public.teacher_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  score INTEGER NOT NULL DEFAULT 0,
  certificate_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own training" ON public.teacher_training
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can insert own training" ON public.teacher_training
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can update own training" ON public.teacher_training
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 3) Create certificates storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload certificates" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Public can read certificates" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'certificates');
