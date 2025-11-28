-- Create clinical_reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.clinical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  summary_insights TEXT,
  detailed_analysis JSONB DEFAULT '{}'::jsonb,
  progress_indicators JSONB DEFAULT '{}'::jsonb,
  intervention_recommendations JSONB DEFAULT '[]'::jsonb,
  alert_flags JSONB DEFAULT '[]'::jsonb,
  generated_by_ai BOOLEAN DEFAULT false,
  reviewed_by_professional BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinical_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for clinical_reports
CREATE POLICY "Users can view own clinical reports" 
ON public.clinical_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create clinical reports" 
ON public.clinical_reports 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_clinical_reports_updated_at
BEFORE UPDATE ON public.clinical_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Create index for better query performance
CREATE INDEX idx_clinical_reports_user_date ON public.clinical_reports(user_id, generated_date DESC);
CREATE INDEX idx_clinical_reports_period ON public.clinical_reports(report_period_start, report_period_end);