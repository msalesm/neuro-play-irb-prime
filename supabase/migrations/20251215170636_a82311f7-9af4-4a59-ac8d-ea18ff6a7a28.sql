
-- Data governance tables for LGPD compliance

-- Data retention policies per data type
CREATE TABLE public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  anonymize_after_days INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Data export requests (LGPD portability)
CREATE TABLE public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('full_export', 'partial_export', 'child_data')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  export_url TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data deletion requests (LGPD erasure)
CREATE TABLE public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('full_account', 'child_data', 'specific_data')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  data_categories TEXT[],
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data access log (who accessed what sensitive data)
CREATE TABLE public.data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  accessed_user_id UUID,
  accessed_child_id UUID,
  data_category TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'export', 'modify', 'delete')),
  access_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data anonymization log
CREATE TABLE public.data_anonymization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  anonymized_fields TEXT[] NOT NULL,
  anonymized_by TEXT NOT NULL DEFAULT 'system',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_anonymization_logs ENABLE ROW LEVEL SECURITY;

-- Policies for data_retention_policies (admin only)
CREATE POLICY "Admins manage retention policies"
ON public.data_retention_policies FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view retention policies"
ON public.data_retention_policies FOR SELECT
USING (true);

-- Policies for data_export_requests
CREATE POLICY "Users can create own export requests"
ON public.data_export_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own export requests"
ON public.data_export_requests FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update export requests"
ON public.data_export_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for data_deletion_requests
CREATE POLICY "Users can create own deletion requests"
ON public.data_deletion_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own deletion requests"
ON public.data_deletion_requests FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage deletion requests"
ON public.data_deletion_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for data_access_logs
CREATE POLICY "Users can view own access logs"
ON public.data_access_logs FOR SELECT
USING (user_id = auth.uid() OR accessed_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert access logs"
ON public.data_access_logs FOR INSERT
WITH CHECK (true);

-- Policies for anonymization logs (admin only)
CREATE POLICY "Admins can view anonymization logs"
ON public.data_anonymization_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert anonymization logs"
ON public.data_anonymization_logs FOR INSERT
WITH CHECK (true);

-- Insert default retention policies (with proper non-null values)
INSERT INTO public.data_retention_policies (data_type, retention_days, anonymize_after_days, description) VALUES
('game_sessions', 1825, 730, 'Sessões de jogos - 5 anos de retenção, anonimização após 2 anos'),
('chat_messages', 365, 180, 'Mensagens de chat terapêutico - 1 ano de retenção'),
('emotional_checkins', 1095, 365, 'Check-ins emocionais - 3 anos de retenção'),
('clinical_reports', 3650, NULL, 'Relatórios clínicos - 10 anos de retenção (requisito legal)'),
('teleconsultation_recordings', 1825, NULL, 'Gravações de teleconsultas - 5 anos de retenção'),
('audit_logs', 2555, NULL, 'Logs de auditoria - 7 anos de retenção (compliance)'),
('user_profiles', 36500, NULL, 'Perfis de usuário - 100 anos (indefinida até exclusão)'),
('behavioral_insights', 1825, 730, 'Insights comportamentais - 5 anos de retenção');

-- Function to log data access
CREATE OR REPLACE FUNCTION public.log_data_access(
  p_accessed_user_id UUID DEFAULT NULL,
  p_accessed_child_id UUID DEFAULT NULL,
  p_data_category TEXT DEFAULT 'general',
  p_access_type TEXT DEFAULT 'view',
  p_access_reason TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO data_access_logs (
    user_id, accessed_user_id, accessed_child_id,
    data_category, access_type, access_reason, user_agent
  ) VALUES (
    auth.uid(),
    p_accessed_user_id,
    p_accessed_child_id,
    p_data_category,
    p_access_type,
    p_access_reason,
    p_user_agent
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;
