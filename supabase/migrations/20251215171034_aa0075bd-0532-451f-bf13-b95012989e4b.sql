
-- Add missing columns to external_integrations
ALTER TABLE public.external_integrations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS integration_type TEXT,
ADD COLUMN IF NOT EXISTS credentials_encrypted TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Webhook configurations for external integrations
CREATE TABLE IF NOT EXISTS public.webhook_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered_at TIMESTAMPTZ,
  last_status INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook delivery logs
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhook_configurations(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data sync logs
CREATE TABLE IF NOT EXISTS public.data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.external_integrations(id) ON DELETE CASCADE NOT NULL,
  sync_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'bidirectional')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policies for webhook_configurations
DROP POLICY IF EXISTS "Users manage own webhooks" ON public.webhook_configurations;
CREATE POLICY "Users manage own webhooks"
ON public.webhook_configurations FOR ALL
USING (user_id = auth.uid() OR public.is_institution_admin(auth.uid(), institution_id));

-- Policies for webhook_deliveries
DROP POLICY IF EXISTS "Users view own webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Users view own webhook deliveries"
ON public.webhook_deliveries FOR SELECT
USING (webhook_id IN (
  SELECT id FROM public.webhook_configurations 
  WHERE user_id = auth.uid() OR public.is_institution_admin(auth.uid(), institution_id)
));

-- Update external_integrations RLS
DROP POLICY IF EXISTS "Users manage own integrations" ON public.external_integrations;
CREATE POLICY "Users manage own integrations"
ON public.external_integrations FOR ALL
USING (user_id = auth.uid() OR public.is_institution_admin(auth.uid(), institution_id));

-- Policies for data_sync_logs
DROP POLICY IF EXISTS "Users view own sync logs" ON public.data_sync_logs;
CREATE POLICY "Users view own sync logs"
ON public.data_sync_logs FOR SELECT
USING (integration_id IN (
  SELECT id FROM public.external_integrations 
  WHERE user_id = auth.uid() OR public.is_institution_admin(auth.uid(), institution_id)
));

-- Function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_value TEXT;
BEGIN
  key_value := 'np_' || encode(gen_random_bytes(32), 'hex');
  RETURN key_value;
END;
$$;

-- Function to validate API key and get user
CREATE OR REPLACE FUNCTION public.validate_api_key(p_key_prefix TEXT, p_key_hash TEXT)
RETURNS TABLE(user_id UUID, permissions TEXT[], institution_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.user_id,
    ak.permissions,
    ak.institution_id
  FROM public.api_keys ak
  WHERE ak.key_prefix = p_key_prefix
    AND ak.key_hash = p_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
END;
$$;

-- Update api_keys last_used_at on validation
CREATE OR REPLACE FUNCTION public.record_api_key_usage(p_key_id UUID, p_endpoint TEXT, p_method TEXT, p_status INTEGER, p_response_time INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys 
  SET last_used_at = NOW() 
  WHERE id = p_key_id;
  
  INSERT INTO public.api_usage_logs (api_key_id, endpoint, method, status_code, response_time_ms)
  VALUES (p_key_id, p_endpoint, p_method, p_status, p_response_time);
END;
$$;
