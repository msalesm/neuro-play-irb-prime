-- Create educational system tables for the complete learning platform

-- Learning trails for progressive education
CREATE TABLE public.learning_trails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cognitive_category TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  max_level_unlocked INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  completed_exercises INTEGER NOT NULL DEFAULT 0,
  learning_path JSONB NOT NULL DEFAULT '[]'::jsonb,
  adaptive_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Neurodiversity profiles and detection
CREATE TABLE public.neurodiversity_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  detected_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  adaptive_strategies JSONB NOT NULL DEFAULT '{}'::jsonb,
  assessment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_assessment DATE,
  needs_educator_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning sessions with detailed tracking
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trail_id UUID NOT NULL REFERENCES public.learning_trails(id),
  game_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  performance_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  learning_indicators JSONB NOT NULL DEFAULT '{}'::jsonb,
  struggles_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
  improvements_noted JSONB NOT NULL DEFAULT '[]'::jsonb,
  session_duration_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Educational achievements and milestones
CREATE TABLE public.educational_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria_met JSONB NOT NULL DEFAULT '{}'::jsonb,
  educational_impact TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning analytics for educators
CREATE TABLE public.learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Educator notes and observations
CREATE TABLE public.educator_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  educator_id UUID NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'observation',
  content TEXT NOT NULL,
  learning_area TEXT,
  priority_level TEXT NOT NULL DEFAULT 'medium',
  action_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.learning_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurodiversity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educator_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_trails
CREATE POLICY "Users can view their own learning trails" 
ON public.learning_trails FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning trails" 
ON public.learning_trails FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning trails" 
ON public.learning_trails FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for neurodiversity_profiles
CREATE POLICY "Users can view their own neurodiversity profile" 
ON public.neurodiversity_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own neurodiversity profile" 
ON public.neurodiversity_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own neurodiversity profile" 
ON public.neurodiversity_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_sessions
CREATE POLICY "Users can manage their own learning sessions" 
ON public.learning_sessions FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for educational_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.educational_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.educational_achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.learning_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON public.learning_analytics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for educator_notes
CREATE POLICY "Students can view notes about them" 
ON public.educator_notes FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Educators can manage their notes" 
ON public.educator_notes FOR ALL 
USING (auth.uid() = educator_id)
WITH CHECK (auth.uid() = educator_id);

-- Triggers for updated_at
CREATE TRIGGER update_learning_trails_updated_at
  BEFORE UPDATE ON public.learning_trails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_neurodiversity_profiles_updated_at
  BEFORE UPDATE ON public.neurodiversity_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize learning trails for a user
CREATE OR REPLACE FUNCTION public.initialize_learning_trails()
RETURNS TRIGGER AS $$
DECLARE
  categories TEXT[] := ARRAY['memory', 'attention', 'logic', 'math', 'language', 'executive'];
  category TEXT;
BEGIN
  -- Create initial learning trails for each cognitive category
  FOREACH category IN ARRAY categories LOOP
    INSERT INTO public.learning_trails (user_id, cognitive_category)
    VALUES (NEW.id, category);
  END LOOP;
  
  -- Create initial neurodiversity profile
  INSERT INTO public.neurodiversity_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;