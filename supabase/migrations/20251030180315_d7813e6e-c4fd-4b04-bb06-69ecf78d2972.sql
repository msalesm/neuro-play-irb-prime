-- Create Teacher Training Progress table (only if not exists)
CREATE TABLE IF NOT EXISTS public.teacher_training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  time_spent_seconds INTEGER DEFAULT 0,
  certificate_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.teacher_training_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own training progress" ON public.teacher_training_progress;
DROP POLICY IF EXISTS "Users can create their own training progress" ON public.teacher_training_progress;
DROP POLICY IF EXISTS "Users can update their own training progress" ON public.teacher_training_progress;

-- Create policies
CREATE POLICY "Users can view their own training progress"
  ON public.teacher_training_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training progress"
  ON public.teacher_training_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training progress"
  ON public.teacher_training_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_teacher_training_progress_updated_at ON public.teacher_training_progress;
CREATE TRIGGER update_teacher_training_progress_updated_at
  BEFORE UPDATE ON public.teacher_training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_training_user_id ON public.teacher_training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_training_completed ON public.teacher_training_progress(completed);