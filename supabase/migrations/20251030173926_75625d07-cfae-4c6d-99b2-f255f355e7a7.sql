-- Create screenings table for gamified cognitive assessments
CREATE TABLE IF NOT EXISTS public.screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dislexia', 'tdah', 'tea')),
  score NUMERIC NOT NULL DEFAULT 0,
  percentile NUMERIC,
  duration NUMERIC,
  game_data JSONB DEFAULT '{}'::jsonb,
  recommended_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create PEI (Plano Educacional Individualizado) table
CREATE TABLE IF NOT EXISTS public.pei_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screening_id UUID REFERENCES public.screenings(id),
  objectives TEXT NOT NULL,
  activities TEXT NOT NULL,
  recommendations TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT true,
  progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'arquivado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teacher training table
CREATE TABLE IF NOT EXISTS public.teacher_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido')),
  score NUMERIC DEFAULT 0,
  certificate_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  file_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pei_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for screenings
CREATE POLICY "Users can view their own screenings"
  ON public.screenings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own screenings"
  ON public.screenings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own screenings"
  ON public.screenings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for pei_plans
CREATE POLICY "Users can view their own PEI plans"
  ON public.pei_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PEI plans"
  ON public.pei_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PEI plans"
  ON public.pei_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for teacher_training
CREATE POLICY "Users can view their own training"
  ON public.teacher_training FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training"
  ON public.teacher_training FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training"
  ON public.teacher_training FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_screenings_user_id ON public.screenings(user_id);
CREATE INDEX idx_screenings_type ON public.screenings(type);
CREATE INDEX idx_screenings_created_at ON public.screenings(created_at DESC);
CREATE INDEX idx_pei_plans_user_id ON public.pei_plans(user_id);
CREATE INDEX idx_teacher_training_user_id ON public.teacher_training(user_id);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pei_plans_updated_at
  BEFORE UPDATE ON public.pei_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_training_updated_at
  BEFORE UPDATE ON public.teacher_training
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();