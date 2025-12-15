-- Sprint 5: Billing & Contracts

-- Invoices table for institutional billing
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  line_items JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contracts for institutional agreements
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL UNIQUE,
  contract_type TEXT DEFAULT 'subscription' CHECK (contract_type IN ('subscription', 'pilot', 'custom', 'trial')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  value_monthly NUMERIC,
  value_total NUMERIC,
  payment_terms TEXT,
  auto_renew BOOLEAN DEFAULT true,
  renewal_notice_days INTEGER DEFAULT 30,
  terms_document_url TEXT,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contract amendments/addendums
CREATE TABLE IF NOT EXISTS public.contract_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  amendment_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  changes JSONB DEFAULT '{}',
  effective_date DATE NOT NULL,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 6: Evidence & Impact

-- Outcome measurements for clinical effectiveness
CREATE TABLE IF NOT EXISTS public.outcome_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id),
  child_id UUID REFERENCES public.children(id),
  professional_id UUID REFERENCES auth.users(id),
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('baseline', 'progress', 'exit', 'follow_up')),
  domain TEXT NOT NULL CHECK (domain IN ('cognitive', 'behavioral', 'socioemotional', 'academic', 'functional')),
  instrument_used TEXT,
  score_raw NUMERIC,
  score_normalized NUMERIC,
  percentile INTEGER,
  interpretation TEXT,
  notes TEXT,
  measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Intervention effectiveness tracking
CREATE TABLE IF NOT EXISTS public.intervention_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id),
  intervention_type TEXT NOT NULL,
  sample_size INTEGER DEFAULT 0,
  avg_improvement_cognitive NUMERIC,
  avg_improvement_behavioral NUMERIC,
  avg_improvement_socioemotional NUMERIC,
  effect_size NUMERIC,
  confidence_interval_low NUMERIC,
  confidence_interval_high NUMERIC,
  measurement_period_start DATE,
  measurement_period_end DATE,
  methodology_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Evidence-based reports for stakeholders
CREATE TABLE IF NOT EXISTS public.impact_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_patients_served INTEGER DEFAULT 0,
  new_patients INTEGER DEFAULT 0,
  completed_interventions INTEGER DEFAULT 0,
  avg_sessions_per_patient NUMERIC,
  outcomes_summary JSONB DEFAULT '{}',
  key_achievements JSONB DEFAULT '[]',
  challenges_identified JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  comparative_analysis JSONB DEFAULT '{}',
  generated_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Institution admins view invoices"
ON public.invoices FOR SELECT
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND is_active = true
  )
);

-- RLS Policies for contracts
CREATE POLICY "Institution admins manage contracts"
ON public.contracts FOR ALL
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND is_active = true
  )
);

-- RLS Policies for contract amendments
CREATE POLICY "Institution admins manage amendments"
ON public.contract_amendments FOR ALL
USING (
  contract_id IN (
    SELECT c.id FROM public.contracts c
    JOIN public.institution_members im ON im.institution_id = c.institution_id
    WHERE im.user_id = auth.uid() AND im.role IN ('admin', 'owner') AND im.is_active = true
  )
);

-- RLS Policies for outcome measurements
CREATE POLICY "Professionals manage measurements"
ON public.outcome_measurements FOR ALL
USING (
  professional_id = auth.uid() OR
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- RLS Policies for intervention effectiveness
CREATE POLICY "Institution members view effectiveness"
ON public.intervention_effectiveness FOR SELECT
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins manage effectiveness data"
ON public.intervention_effectiveness FOR ALL
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND is_active = true
  )
);

-- RLS Policies for impact reports
CREATE POLICY "Institution members view reports"
ON public.impact_reports FOR SELECT
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins manage impact reports"
ON public.impact_reports FOR ALL
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND is_active = true
  )
);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_month TEXT;
  seq INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1 INTO seq
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '%';
  RETURN 'INV-' || year_month || '-' || LPAD(seq::TEXT, 4, '0');
END;
$$;

-- Function to calculate intervention effectiveness
CREATE OR REPLACE FUNCTION public.calculate_intervention_effectiveness(
  p_institution_id UUID,
  p_intervention_type TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  sample_size INTEGER,
  avg_cognitive NUMERIC,
  avg_behavioral NUMERIC,
  avg_socioemotional NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH baseline AS (
    SELECT child_id, domain, score_normalized
    FROM outcome_measurements
    WHERE institution_id = p_institution_id
      AND measurement_type = 'baseline'
      AND measured_at >= p_start_date
  ),
  latest AS (
    SELECT DISTINCT ON (child_id, domain) child_id, domain, score_normalized
    FROM outcome_measurements
    WHERE institution_id = p_institution_id
      AND measurement_type IN ('progress', 'exit')
      AND measured_at <= p_end_date
    ORDER BY child_id, domain, measured_at DESC
  ),
  improvements AS (
    SELECT 
      l.child_id,
      l.domain,
      (l.score_normalized - b.score_normalized) as improvement
    FROM latest l
    JOIN baseline b ON l.child_id = b.child_id AND l.domain = b.domain
  )
  SELECT 
    COUNT(DISTINCT child_id)::INTEGER as sample_size,
    AVG(improvement) FILTER (WHERE domain = 'cognitive') as avg_cognitive,
    AVG(improvement) FILTER (WHERE domain = 'behavioral') as avg_behavioral,
    AVG(improvement) FILTER (WHERE domain = 'socioemotional') as avg_socioemotional
  FROM improvements;
END;
$$;