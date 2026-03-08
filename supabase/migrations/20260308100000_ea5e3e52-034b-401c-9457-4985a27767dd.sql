
-- Baseline metrics for age-normalized scoring (Z-score)
CREATE TABLE public.baseline_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  age_group TEXT NOT NULL, -- '4-6', '7-9', '10-12', '13-15', '16+'
  metric_name TEXT NOT NULL, -- 'reaction_time', 'accuracy', 'omission_rate', etc.
  domain TEXT NOT NULL, -- 'attention', 'inhibition', 'memory', 'flexibility', 'coordination', 'persistence'
  mean NUMERIC NOT NULL,
  standard_deviation NUMERIC NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'provisional', -- 'provisional', 'validated', 'literature'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(age_group, metric_name, domain)
);

-- Cognitive history for longitudinal tracking
CREATE TABLE public.cognitive_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  age_group TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  domain_attention INTEGER NOT NULL DEFAULT 50,
  domain_inhibition INTEGER NOT NULL DEFAULT 50,
  domain_memory INTEGER NOT NULL DEFAULT 50,
  domain_flexibility INTEGER NOT NULL DEFAULT 50,
  domain_coordination INTEGER NOT NULL DEFAULT 50,
  domain_persistence INTEGER NOT NULL DEFAULT 50,
  behavioral_indicators JSONB DEFAULT '[]'::jsonb,
  evolution_trend TEXT DEFAULT 'stable',
  session_ids TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast longitudinal queries
CREATE INDEX idx_cognitive_history_user ON public.cognitive_history(user_id, assessment_date DESC);
CREATE INDEX idx_cognitive_history_child ON public.cognitive_history(child_id, assessment_date DESC);

-- Enable RLS
ALTER TABLE public.baseline_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_history ENABLE ROW LEVEL SECURITY;

-- Baseline metrics: readable by all authenticated users (reference data)
CREATE POLICY "baseline_metrics_read" ON public.baseline_metrics
  FOR SELECT TO authenticated USING (true);

-- Baseline metrics: only admins can modify
CREATE POLICY "baseline_metrics_admin_write" ON public.baseline_metrics
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Cognitive history: users can read their own
CREATE POLICY "cognitive_history_own_read" ON public.cognitive_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Cognitive history: users can insert their own
CREATE POLICY "cognitive_history_own_insert" ON public.cognitive_history
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Cognitive history: professionals can read for their patients
CREATE POLICY "cognitive_history_professional_read" ON public.cognitive_history
  FOR SELECT TO authenticated 
  USING (child_id IS NOT NULL AND public.has_child_access(auth.uid(), child_id));
