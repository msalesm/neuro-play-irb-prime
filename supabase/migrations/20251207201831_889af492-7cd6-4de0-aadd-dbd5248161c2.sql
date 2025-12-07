-- Create story categories enum
CREATE TYPE public.story_category AS ENUM ('rotinas', 'habilidades_sociais', 'emocoes', 'sensorial');

-- Create routines table
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  routine_type TEXT CHECK (routine_type IN ('manha', 'escola', 'noite', 'custom')) DEFAULT 'custom',
  is_template BOOLEAN DEFAULT false,
  icon TEXT DEFAULT 'sun',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create routine steps table
CREATE TABLE public.routine_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  audio_url TEXT,
  order_number INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create story assignments for therapists
CREATE TABLE public.story_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES public.social_stories(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT assignment_type_check CHECK (
    (story_id IS NOT NULL AND routine_id IS NULL) OR
    (story_id IS NULL AND routine_id IS NOT NULL)
  )
);

-- Create user progress table for gamification
CREATE TABLE public.story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES public.social_stories(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT progress_type_check CHECK (
    (story_id IS NOT NULL AND routine_id IS NULL) OR
    (story_id IS NULL AND routine_id IS NOT NULL)
  )
);

-- Add category column to existing social_stories table
ALTER TABLE public.social_stories ADD COLUMN IF NOT EXISTS category story_category DEFAULT 'rotinas';

-- Enable RLS
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

-- RLS for routines
CREATE POLICY "Users can view own routines" ON public.routines
  FOR SELECT USING (user_id = auth.uid() OR is_template = true);

CREATE POLICY "Users can create own routines" ON public.routines
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own routines" ON public.routines
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own routines" ON public.routines
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all routines" ON public.routines
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for routine_steps
CREATE POLICY "Users can view steps of accessible routines" ON public.routine_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_steps.routine_id
        AND (r.user_id = auth.uid() OR r.is_template = true)
    )
  );

CREATE POLICY "Users can manage steps of own routines" ON public.routine_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_steps.routine_id AND r.user_id = auth.uid()
    )
  );

-- RLS for story_assignments
CREATE POLICY "Users can view assignments for or by them" ON public.story_assignments
  FOR SELECT USING (assigned_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Therapists can create assignments" ON public.story_assignments
  FOR INSERT WITH CHECK (
    assigned_by = auth.uid() AND has_role(auth.uid(), 'therapist'::app_role)
  );

CREATE POLICY "Assigners can update their assignments" ON public.story_assignments
  FOR UPDATE USING (assigned_by = auth.uid());

CREATE POLICY "Assigned users can complete assignments" ON public.story_assignments
  FOR UPDATE USING (assigned_to = auth.uid());

-- RLS for story_progress
CREATE POLICY "Users can view own progress" ON public.story_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress" ON public.story_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Therapists can view patient progress" ON public.story_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.child_access ca
      JOIN public.children c ON c.id = ca.child_id
      WHERE c.parent_id = story_progress.user_id
        AND ca.professional_id = auth.uid()
        AND ca.is_active = true
        AND ca.approval_status = 'approved'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Insert template routines
INSERT INTO public.routines (id, title, description, routine_type, is_template, icon) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Rotina da Manhã', 'Passos para começar o dia bem', 'manha', true, 'sun'),
  ('00000000-0000-0000-0000-000000000002', 'Rotina da Escola', 'Preparação para ir à escola', 'escola', true, 'school'),
  ('00000000-0000-0000-0000-000000000003', 'Rotina da Noite', 'Passos para dormir tranquilo', 'noite', true, 'moon');

-- Insert steps for morning routine
INSERT INTO public.routine_steps (routine_id, title, description, order_number) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Acordar', 'Abra os olhos devagar e espreguice', 1),
  ('00000000-0000-0000-0000-000000000001', 'Ir ao banheiro', 'Vá ao banheiro fazer xixi', 2),
  ('00000000-0000-0000-0000-000000000001', 'Lavar o rosto', 'Lave seu rosto com água', 3),
  ('00000000-0000-0000-0000-000000000001', 'Escovar os dentes', 'Escove bem todos os dentes', 4),
  ('00000000-0000-0000-0000-000000000001', 'Trocar de roupa', 'Vista a roupa do dia', 5),
  ('00000000-0000-0000-0000-000000000001', 'Tomar café', 'Tome seu café da manhã', 6);

-- Insert steps for school routine
INSERT INTO public.routine_steps (routine_id, title, description, order_number) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Arrumar a mochila', 'Coloque os materiais na mochila', 1),
  ('00000000-0000-0000-0000-000000000002', 'Colocar uniforme', 'Vista o uniforme da escola', 2),
  ('00000000-0000-0000-0000-000000000002', 'Pegar lanche', 'Pegue sua lancheira', 3),
  ('00000000-0000-0000-0000-000000000002', 'Despedir da família', 'Dê tchau para sua família', 4),
  ('00000000-0000-0000-0000-000000000002', 'Entrar no carro/ônibus', 'Entre no transporte escolar', 5);

-- Insert steps for night routine
INSERT INTO public.routine_steps (routine_id, title, description, order_number) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Jantar', 'Coma seu jantar com calma', 1),
  ('00000000-0000-0000-0000-000000000003', 'Tomar banho', 'Tome um banho relaxante', 2),
  ('00000000-0000-0000-0000-000000000003', 'Vestir pijama', 'Vista seu pijama favorito', 3),
  ('00000000-0000-0000-0000-000000000003', 'Escovar os dentes', 'Escove bem os dentes', 4),
  ('00000000-0000-0000-0000-000000000003', 'Ler uma história', 'Leia ou peça para lerem uma história', 5),
  ('00000000-0000-0000-0000-000000000003', 'Dormir', 'Feche os olhos e durma bem', 6);