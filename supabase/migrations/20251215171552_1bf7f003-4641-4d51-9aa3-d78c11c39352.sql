-- Sprint 4: Operational Scaling - Advanced Features

-- Add institution-level operational settings
CREATE TABLE IF NOT EXISTS public.institution_operational_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  auto_assign_enabled BOOLEAN DEFAULT false,
  max_queue_size INTEGER DEFAULT 100,
  default_sla_hours INTEGER DEFAULT 24,
  escalation_enabled BOOLEAN DEFAULT true,
  escalation_threshold_hours INTEGER DEFAULT 4,
  working_hours_start TIME DEFAULT '08:00:00',
  working_hours_end TIME DEFAULT '18:00:00',
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  notification_channels TEXT[] DEFAULT ARRAY['email', 'in_app'],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id)
);

-- Professional availability schedules
CREATE TABLE IF NOT EXISTS public.professional_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_cases_per_slot INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, day_of_week)
);

-- Queue performance metrics (aggregated daily)
CREATE TABLE IF NOT EXISTS public.queue_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_cases INTEGER DEFAULT 0,
  completed_cases INTEGER DEFAULT 0,
  avg_wait_time_minutes NUMERIC DEFAULT 0,
  avg_service_time_minutes NUMERIC DEFAULT 0,
  sla_compliance_rate NUMERIC DEFAULT 100,
  sla_breaches INTEGER DEFAULT 0,
  high_risk_cases INTEGER DEFAULT 0,
  professional_utilization_rate NUMERIC DEFAULT 0,
  peak_hour INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, metric_date)
);

-- Escalation history tracking
CREATE TABLE IF NOT EXISTS public.escalation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID REFERENCES public.queue_items(id) ON DELETE CASCADE,
  escalated_from UUID REFERENCES auth.users(id),
  escalated_to UUID REFERENCES auth.users(id),
  escalation_level INTEGER DEFAULT 1,
  reason TEXT NOT NULL,
  auto_escalated BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shift handoff records
CREATE TABLE IF NOT EXISTS public.shift_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  from_professional_id UUID REFERENCES auth.users(id),
  to_professional_id UUID REFERENCES auth.users(id),
  handoff_time TIMESTAMPTZ DEFAULT now(),
  pending_cases_count INTEGER DEFAULT 0,
  critical_notes TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.institution_operational_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_handoffs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_operational_settings
CREATE POLICY "Institution admins manage settings"
ON public.institution_operational_settings FOR ALL
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND is_active = true
  )
);

-- RLS Policies for professional_schedules
CREATE POLICY "Professionals manage own schedule"
ON public.professional_schedules FOR ALL
USING (professional_id = auth.uid());

CREATE POLICY "Institution admins view schedules"
ON public.professional_schedules FOR SELECT
USING (
  professional_id IN (
    SELECT user_id FROM public.institution_members im
    WHERE im.institution_id IN (
      SELECT institution_id FROM public.institution_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND is_active = true
    )
  )
);

-- RLS Policies for queue_performance_metrics
CREATE POLICY "Institution members view metrics"
ON public.queue_performance_metrics FOR SELECT
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "System can insert metrics"
ON public.queue_performance_metrics FOR INSERT
WITH CHECK (true);

-- RLS Policies for escalation_history
CREATE POLICY "View own escalations"
ON public.escalation_history FOR SELECT
USING (
  escalated_from = auth.uid() OR escalated_to = auth.uid() OR
  queue_item_id IN (
    SELECT id FROM public.queue_items WHERE assigned_to = auth.uid()
  )
);

CREATE POLICY "Create escalations"
ON public.escalation_history FOR INSERT
WITH CHECK (escalated_from = auth.uid() OR escalated_from IS NULL);

CREATE POLICY "Update own escalations"
ON public.escalation_history FOR UPDATE
USING (escalated_to = auth.uid());

-- RLS Policies for shift_handoffs
CREATE POLICY "View own handoffs"
ON public.shift_handoffs FOR SELECT
USING (from_professional_id = auth.uid() OR to_professional_id = auth.uid());

CREATE POLICY "Create handoffs"
ON public.shift_handoffs FOR INSERT
WITH CHECK (from_professional_id = auth.uid());

CREATE POLICY "Acknowledge handoffs"
ON public.shift_handoffs FOR UPDATE
USING (to_professional_id = auth.uid());

-- Function to auto-assign cases based on workload
CREATE OR REPLACE FUNCTION public.auto_assign_queue_item(p_queue_item_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_professional_id UUID;
  v_queue_id UUID;
  v_institution_id UUID;
BEGIN
  -- Get queue and institution
  SELECT qi.queue_id, sq.institution_id 
  INTO v_queue_id, v_institution_id
  FROM queue_items qi
  JOIN service_queues sq ON sq.id = qi.queue_id
  WHERE qi.id = p_queue_item_id;
  
  -- Find available professional with lowest workload
  SELECT pw.professional_id INTO v_professional_id
  FROM professional_workload pw
  JOIN institution_members im ON im.user_id = pw.professional_id
  WHERE im.institution_id = v_institution_id
    AND im.is_active = true
    AND pw.availability_status = 'available'
    AND pw.current_active_cases < pw.max_daily_cases
  ORDER BY pw.current_active_cases ASC
  LIMIT 1;
  
  IF v_professional_id IS NOT NULL THEN
    -- Assign the case
    UPDATE queue_items 
    SET assigned_to = v_professional_id,
        status = 'in_progress',
        started_at = now()
    WHERE id = p_queue_item_id;
    
    -- Update workload
    UPDATE professional_workload
    SET current_active_cases = current_active_cases + 1,
        updated_at = now()
    WHERE professional_id = v_professional_id;
  END IF;
  
  RETURN v_professional_id;
END;
$$;

-- Function to check and create SLA alerts
CREATE OR REPLACE FUNCTION public.check_sla_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Find items approaching SLA deadline (75% of time elapsed)
  FOR v_item IN 
    SELECT qi.id, qi.child_id, qi.sla_deadline, qi.assigned_to, sq.institution_id
    FROM queue_items qi
    JOIN service_queues sq ON sq.id = qi.queue_id
    WHERE qi.status IN ('waiting', 'in_progress')
      AND qi.sla_deadline IS NOT NULL
      AND qi.sla_breached = false
      AND qi.sla_deadline <= now() + INTERVAL '1 hour'
  LOOP
    -- Create warning alert
    INSERT INTO operational_alerts (
      institution_id,
      alert_type,
      severity,
      title,
      description,
      related_entity_id,
      related_entity_type
    ) VALUES (
      v_item.institution_id,
      'sla_warning',
      CASE WHEN v_item.sla_deadline <= now() THEN 'critical' ELSE 'warning' END,
      'Alerta de SLA',
      'Caso ' || v_item.id || ' está próximo do prazo de SLA',
      v_item.id,
      'queue_item'
    )
    ON CONFLICT DO NOTHING;
    
    -- Mark as breached if past deadline
    IF v_item.sla_deadline <= now() THEN
      UPDATE queue_items SET sla_breached = true WHERE id = v_item.id;
    END IF;
  END LOOP;
END;
$$;

-- Function to calculate daily metrics
CREATE OR REPLACE FUNCTION public.calculate_daily_queue_metrics(p_institution_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_metrics RECORD;
BEGIN
  SELECT
    COUNT(*) as total_cases,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_cases,
    COALESCE(AVG(EXTRACT(EPOCH FROM (started_at - entered_queue_at))/60) FILTER (WHERE started_at IS NOT NULL), 0) as avg_wait,
    COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) FILTER (WHERE completed_at IS NOT NULL), 0) as avg_service,
    CASE WHEN COUNT(*) > 0 
      THEN (COUNT(*) FILTER (WHERE NOT sla_breached)::NUMERIC / COUNT(*) * 100)
      ELSE 100 
    END as sla_rate,
    COUNT(*) FILTER (WHERE sla_breached) as sla_breaches,
    COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')) as high_risk
  INTO v_metrics
  FROM queue_items qi
  JOIN service_queues sq ON sq.id = qi.queue_id
  WHERE sq.institution_id = p_institution_id
    AND DATE(qi.created_at) = p_date;
  
  INSERT INTO queue_performance_metrics (
    institution_id,
    metric_date,
    total_cases,
    completed_cases,
    avg_wait_time_minutes,
    avg_service_time_minutes,
    sla_compliance_rate,
    sla_breaches,
    high_risk_cases
  ) VALUES (
    p_institution_id,
    p_date,
    v_metrics.total_cases,
    v_metrics.completed_cases,
    v_metrics.avg_wait,
    v_metrics.avg_service,
    v_metrics.sla_rate,
    v_metrics.sla_breaches,
    v_metrics.high_risk
  )
  ON CONFLICT (institution_id, metric_date) 
  DO UPDATE SET
    total_cases = EXCLUDED.total_cases,
    completed_cases = EXCLUDED.completed_cases,
    avg_wait_time_minutes = EXCLUDED.avg_wait_time_minutes,
    avg_service_time_minutes = EXCLUDED.avg_service_time_minutes,
    sla_compliance_rate = EXCLUDED.sla_compliance_rate,
    sla_breaches = EXCLUDED.sla_breaches,
    high_risk_cases = EXCLUDED.high_risk_cases;
END;
$$;