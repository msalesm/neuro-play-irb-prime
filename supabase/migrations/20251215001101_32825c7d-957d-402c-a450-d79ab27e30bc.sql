-- Criar tabelas faltantes
CREATE TABLE IF NOT EXISTS public.clinical_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  professional_id UUID NOT NULL,
  measurement_start DATE NOT NULL,
  measurement_end DATE,
  entry_cognitive_score INTEGER,
  entry_behavioral_score INTEGER,
  entry_socioemotional_score INTEGER,
  entry_global_risk TEXT,
  exit_cognitive_score INTEGER,
  exit_behavioral_score INTEGER,
  exit_socioemotional_score INTEGER,
  exit_global_risk TEXT,
  cognitive_improvement NUMERIC,
  behavioral_improvement NUMERIC,
  socioemotional_improvement NUMERIC,
  global_improvement NUMERIC,
  outcome_classification TEXT,
  total_sessions INTEGER DEFAULT 0,
  plan_adherence_percentage NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pre_triage_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  session_id UUID,
  checklist_responses JSONB NOT NULL DEFAULT '{}',
  auto_summary TEXT,
  calculated_risk_score INTEGER,
  risk_level TEXT,
  historical_summary JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  completed_by UUID,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.clinical_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_triage_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage outcomes" ON public.clinical_outcomes FOR ALL USING (professional_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "View outcomes" ON public.clinical_outcomes FOR SELECT USING (is_parent_of_child(auth.uid(), child_id));
CREATE POLICY "Manage pre-triage" ON public.pre_triage_forms FOR ALL USING (is_parent_of_child(auth.uid(), child_id) OR has_role(auth.uid(), 'admin'));

-- Índices
CREATE INDEX IF NOT EXISTS idx_clinical_outcomes_child ON public.clinical_outcomes(child_id);
CREATE INDEX IF NOT EXISTS idx_pre_triage_forms_child ON public.pre_triage_forms(child_id);

-- Funções
CREATE OR REPLACE FUNCTION public.calculate_global_risk_score(p_cognitive INTEGER, p_behavioral INTEGER, p_socioemotional INTEGER)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN ROUND((COALESCE(p_cognitive, 50) * 0.40) + (COALESCE(p_behavioral, 50) * 0.35) + (COALESCE(p_socioemotional, 50) * 0.25));
END;
$$;

CREATE OR REPLACE FUNCTION public.classify_risk_level(p_score INTEGER)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_score >= 75 THEN RETURN 'low';
  ELSIF p_score >= 50 THEN RETURN 'medium';
  ELSIF p_score >= 25 THEN RETURN 'high';
  ELSE RETURN 'critical';
  END IF;
END;
$$;