-- SPRINT 4: CAMADA DE OPERAÇÃO EM ESCALA

-- 1. Tabela de filas de atendimento
CREATE TABLE public.service_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id),
  name TEXT NOT NULL,
  description TEXT,
  priority_weight INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_queues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins manage queues"
ON public.service_queues FOR ALL
USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE POLICY "Institution members view queues"
ON public.service_queues FOR SELECT
USING (institution_id IN (
  SELECT institution_id FROM public.institution_members 
  WHERE user_id = auth.uid() AND is_active = true
));

-- 2. Itens na fila (pacientes aguardando atendimento)
CREATE TABLE public.queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES public.service_queues(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  priority_score INTEGER DEFAULT 50,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled', 'no_show')),
  assigned_to UUID REFERENCES public.profiles(id),
  entered_queue_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals manage queue items"
ON public.queue_items FOR ALL
USING (
  queue_id IN (
    SELECT sq.id FROM public.service_queues sq
    JOIN public.institution_members im ON im.institution_id = sq.institution_id
    WHERE im.user_id = auth.uid() AND im.is_active = true
  )
);

-- 3. Configurações de SLA por instituição
CREATE TABLE public.sla_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  max_wait_hours INTEGER NOT NULL,
  escalation_hours INTEGER,
  alert_threshold_percent INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, risk_level)
);

ALTER TABLE public.sla_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins manage SLA"
ON public.sla_configurations FOR ALL
USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE POLICY "Institution members view SLA"
ON public.sla_configurations FOR SELECT
USING (institution_id IN (
  SELECT institution_id FROM public.institution_members 
  WHERE user_id = auth.uid() AND is_active = true
));

-- 4. Distribuição de carga por profissional
CREATE TABLE public.professional_workload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.profiles(id) NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  max_daily_cases INTEGER DEFAULT 10,
  max_weekly_cases INTEGER DEFAULT 50,
  current_active_cases INTEGER DEFAULT 0,
  specializations TEXT[],
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'away', 'offline')),
  last_assignment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, institution_id)
);

ALTER TABLE public.professional_workload ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals view own workload"
ON public.professional_workload FOR SELECT
USING (professional_id = auth.uid());

CREATE POLICY "Institution admins manage workloads"
ON public.professional_workload FOR ALL
USING (public.is_institution_admin(auth.uid(), institution_id));

-- 5. Alertas de gargalo e atraso
CREATE TABLE public.operational_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  queue_id UUID REFERENCES public.service_queues(id),
  queue_item_id UUID REFERENCES public.queue_items(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('sla_warning', 'sla_breach', 'queue_overload', 'professional_overload', 'bottleneck')),
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMPTZ,
  auto_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.operational_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members view alerts"
ON public.operational_alerts FOR SELECT
USING (institution_id IN (
  SELECT institution_id FROM public.institution_members 
  WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Institution admins manage alerts"
ON public.operational_alerts FOR ALL
USING (public.is_institution_admin(auth.uid(), institution_id));

-- 6. Histórico de atribuições (audit trail)
CREATE TABLE public.case_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID REFERENCES public.queue_items(id) NOT NULL,
  from_professional_id UUID REFERENCES public.profiles(id),
  to_professional_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT,
  assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members view assignments"
ON public.case_assignments FOR SELECT
USING (
  queue_item_id IN (
    SELECT qi.id FROM public.queue_items qi
    JOIN public.service_queues sq ON sq.id = qi.queue_id
    JOIN public.institution_members im ON im.institution_id = sq.institution_id
    WHERE im.user_id = auth.uid() AND im.is_active = true
  )
);

CREATE POLICY "Professionals create assignments"
ON public.case_assignments FOR INSERT
WITH CHECK (assigned_by = auth.uid());

-- Índices para performance
CREATE INDEX idx_queue_items_status ON public.queue_items(status);
CREATE INDEX idx_queue_items_priority ON public.queue_items(priority_score DESC);
CREATE INDEX idx_queue_items_risk ON public.queue_items(risk_level);
CREATE INDEX idx_queue_items_sla ON public.queue_items(sla_deadline) WHERE sla_breached = false;
CREATE INDEX idx_operational_alerts_unack ON public.operational_alerts(institution_id) WHERE is_acknowledged = false;
CREATE INDEX idx_professional_workload_available ON public.professional_workload(institution_id) WHERE availability_status = 'available';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_queue_items_updated_at
BEFORE UPDATE ON public.queue_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_workload_updated_at
BEFORE UPDATE ON public.professional_workload
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();