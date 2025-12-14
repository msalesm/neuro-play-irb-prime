-- Prescrições Digitais
CREATE TABLE IF NOT EXISTS public.digital_prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  session_id UUID REFERENCES public.teleorientation_sessions(id),
  
  -- Dados da prescrição
  prescription_type TEXT NOT NULL CHECK (prescription_type IN ('therapy', 'medication', 'intervention', 'referral', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  notes TEXT,
  
  -- Compliance e auditoria
  signed_at TIMESTAMPTZ,
  signature_hash TEXT,
  parent_acknowledged_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alertas Automatizados de Traços/Padrões
CREATE TABLE IF NOT EXISTS public.clinical_pattern_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  professional_id UUID,
  
  -- Dados do alerta
  alert_type TEXT NOT NULL CHECK (alert_type IN ('regression', 'improvement', 'anomaly', 'threshold', 'pattern')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  domain TEXT NOT NULL CHECK (domain IN ('cognitive', 'behavioral', 'socioemotional', 'global')),
  
  -- Conteúdo
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detected_pattern JSONB,
  recommendations JSONB,
  
  -- Estado
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  action_taken TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integração com Sistema de Saúde (preparação para SUS/RNDS)
CREATE TABLE IF NOT EXISTS public.government_health_integration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id),
  
  -- Configuração de integração
  integration_type TEXT NOT NULL CHECK (integration_type IN ('sus_rnds', 'e_sus_ab', 'datasus', 'other')),
  system_identifier TEXT,
  api_endpoint TEXT,
  credentials_encrypted TEXT,
  
  -- Estado da integração
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT,
  sync_errors JSONB,
  
  -- Conformidade
  compliance_certificate TEXT,
  certified_at TIMESTAMPTZ,
  certification_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logs de exportação para sistema público
CREATE TABLE IF NOT EXISTS public.health_export_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.government_health_integration(id),
  child_id UUID REFERENCES public.children(id),
  
  -- Dados da exportação
  export_type TEXT NOT NULL CHECK (export_type IN ('report', 'prescription', 'assessment', 'referral')),
  data_exported JSONB,
  export_format TEXT DEFAULT 'HL7_FHIR',
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'rejected', 'error')),
  response_data JSONB,
  error_message TEXT,
  
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anamnese Neuro Estruturada
CREATE TABLE IF NOT EXISTS public.neuro_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  
  -- Dados básicos
  main_complaint TEXT NOT NULL,
  complaint_duration TEXT,
  previous_diagnoses TEXT[],
  
  -- Histórico familiar
  family_history JSONB,
  pregnancy_birth_history JSONB,
  developmental_milestones JSONB,
  
  -- Histórico médico
  medical_history JSONB,
  current_medications JSONB,
  allergies TEXT[],
  
  -- Histórico escolar
  school_history JSONB,
  learning_difficulties JSONB,
  social_behavior JSONB,
  
  -- Avaliações anteriores
  previous_evaluations JSONB,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
  completed_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.digital_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_pattern_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_health_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neuro_anamnesis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para digital_prescriptions
CREATE POLICY "Professionals can manage prescriptions" ON public.digital_prescriptions
  FOR ALL USING (professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view prescriptions for their children" ON public.digital_prescriptions
  FOR SELECT USING (public.is_parent_of(auth.uid(), child_id));

-- Políticas RLS para clinical_pattern_alerts
CREATE POLICY "Professionals can manage alerts" ON public.clinical_pattern_alerts
  FOR ALL USING (professional_id = auth.uid() OR public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Parents can view alerts for their children" ON public.clinical_pattern_alerts
  FOR SELECT USING (public.is_parent_of(auth.uid(), child_id));

-- Políticas RLS para government_health_integration
CREATE POLICY "Admins can manage integrations" ON public.government_health_integration
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.is_institution_admin(auth.uid(), institution_id));

-- Políticas RLS para health_export_logs
CREATE POLICY "Professionals can view export logs" ON public.health_export_logs
  FOR SELECT USING (public.has_child_access(auth.uid(), child_id) OR public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para neuro_anamnesis
CREATE POLICY "Professionals can manage anamnesis" ON public.neuro_anamnesis
  FOR ALL USING (professional_id = auth.uid() OR public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Parents can view anamnesis for their children" ON public.neuro_anamnesis
  FOR SELECT USING (public.is_parent_of(auth.uid(), child_id));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_digital_prescriptions_child ON public.digital_prescriptions(child_id);
CREATE INDEX IF NOT EXISTS idx_digital_prescriptions_professional ON public.digital_prescriptions(professional_id);
CREATE INDEX IF NOT EXISTS idx_clinical_pattern_alerts_child ON public.clinical_pattern_alerts(child_id);
CREATE INDEX IF NOT EXISTS idx_clinical_pattern_alerts_unack ON public.clinical_pattern_alerts(child_id) WHERE is_acknowledged = false;
CREATE INDEX IF NOT EXISTS idx_neuro_anamnesis_child ON public.neuro_anamnesis(child_id);

-- Triggers para updated_at
CREATE TRIGGER update_digital_prescriptions_updated_at BEFORE UPDATE ON public.digital_prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_neuro_anamnesis_updated_at BEFORE UPDATE ON public.neuro_anamnesis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gov_health_integration_updated_at BEFORE UPDATE ON public.government_health_integration
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();