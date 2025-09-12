-- Create table for tracking user neuroplasticity scores
CREATE TABLE public.user_neuroplasticity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  logic_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  math_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  music_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  language_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  focus_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  coordination_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  quick_reasoning NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  flexible_thinking NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  tracking_ability NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  memory_thinking NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  games_completed INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_neuroplasticity ENABLE ROW LEVEL SECURITY;

-- Create policies for user neuroplasticity
CREATE POLICY "Users can manage their own neuroplasticity data"
ON public.user_neuroplasticity
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create table for neuroplasticity history tracking
CREATE TABLE public.neuroplasticity_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  game_session_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE public.neuroplasticity_history ENABLE ROW LEVEL SECURITY;

-- Create policies for neuroplasticity history
CREATE POLICY "Users can manage their own neuroplasticity history"
ON public.neuroplasticity_history
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_neuroplasticity_updated_at
BEFORE UPDATE ON public.user_neuroplasticity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_neuroplasticity_user_id ON public.user_neuroplasticity(user_id);
CREATE INDEX idx_neuroplasticity_history_user_id ON public.neuroplasticity_history(user_id);
CREATE INDEX idx_neuroplasticity_history_category ON public.neuroplasticity_history(category, recorded_at);