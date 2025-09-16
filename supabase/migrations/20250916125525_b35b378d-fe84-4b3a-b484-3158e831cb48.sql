-- Create behavioral_metrics table for storing diagnostic data
CREATE TABLE public.behavioral_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  category TEXT NOT NULL,
  value NUMERIC NOT NULL,
  context_data JSONB DEFAULT '{}',
  session_id UUID,
  game_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.behavioral_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for behavioral_metrics
CREATE POLICY "Users can view their own behavioral metrics" 
ON public.behavioral_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavioral metrics" 
ON public.behavioral_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinicians can view metrics of their patients"
ON public.behavioral_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role = 'clinician'
  )
);

-- Create clinical_reports table for storing generated reports
CREATE TABLE public.clinical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'comprehensive',
  report_data JSONB NOT NULL DEFAULT '{}',
  generated_by UUID,
  confidence_score NUMERIC,
  recommendations TEXT[],
  follow_up_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for clinical_reports
ALTER TABLE public.clinical_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for clinical_reports
CREATE POLICY "Users can view their own clinical reports" 
ON public.clinical_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clinical reports" 
ON public.clinical_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinicians can manage reports"
ON public.clinical_reports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role = 'clinician'
  )
);

-- Create diagnostic_sessions table for tracking test sessions
CREATE TABLE public.diagnostic_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  behavioral_indicators JSONB DEFAULT '{}',
  completion_status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for diagnostic_sessions
ALTER TABLE public.diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for diagnostic_sessions
CREATE POLICY "Users can manage their own diagnostic sessions" 
ON public.diagnostic_sessions 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_behavioral_metrics_user_timestamp ON public.behavioral_metrics(user_id, timestamp DESC);
CREATE INDEX idx_behavioral_metrics_type ON public.behavioral_metrics(metric_type);
CREATE INDEX idx_clinical_reports_user ON public.clinical_reports(user_id);
CREATE INDEX idx_diagnostic_sessions_user ON public.diagnostic_sessions(user_id);

-- Create function to update updated_at timestamp
CREATE TRIGGER update_clinical_reports_updated_at
BEFORE UPDATE ON public.clinical_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();