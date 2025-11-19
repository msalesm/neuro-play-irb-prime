-- Create profiles table for basic user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text DEFAULT 'parent',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create screenings table for diagnostic tests
CREATE TABLE public.screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('dislexia', 'tdah', 'tea')),
  score numeric NOT NULL,
  percentile numeric,
  duration integer,
  recommended_action text,
  test_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own screenings"
  ON public.screenings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own screenings"
  ON public.screenings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create PEI plans table
CREATE TABLE public.pei_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id uuid REFERENCES public.screenings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goals jsonb DEFAULT '[]'::jsonb,
  accommodations jsonb DEFAULT '[]'::jsonb,
  strategies jsonb DEFAULT '[]'::jsonb,
  progress_notes jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.pei_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PEI plans"
  ON public.pei_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own PEI plans"
  ON public.pei_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PEI plans"
  ON public.pei_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Create parent training modules table (renamed from teacher_training)
CREATE TABLE public.parent_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_name text NOT NULL,
  status text DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'concluido')),
  score numeric,
  started_at timestamptz,
  completed_at timestamptz,
  certificate_url text,
  progress_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_name)
);

ALTER TABLE public.parent_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training"
  ON public.parent_training FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own training"
  ON public.parent_training FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training"
  ON public.parent_training FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_screenings_user_id ON public.screenings(user_id);
CREATE INDEX idx_screenings_type ON public.screenings(type);
CREATE INDEX idx_pei_plans_user_id ON public.pei_plans(user_id);
CREATE INDEX idx_pei_plans_screening_id ON public.pei_plans(screening_id);
CREATE INDEX idx_parent_training_user_id ON public.parent_training(user_id);
CREATE INDEX idx_parent_training_status ON public.parent_training(status);