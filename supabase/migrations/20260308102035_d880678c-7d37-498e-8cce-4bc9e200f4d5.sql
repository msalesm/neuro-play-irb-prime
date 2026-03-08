
-- Layer 2: Executive Routine Execution Tracking
CREATE TABLE public.routine_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  total_steps INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  planned_duration_minutes INTEGER,
  actual_duration_minutes NUMERIC,
  autonomy_score NUMERIC DEFAULT 0, -- 0-100
  reminders_needed INTEGER DEFAULT 0,
  interruptions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.routine_step_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES public.routine_executions(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.routine_steps(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false,
  latency_seconds NUMERIC, -- time from step appearing to starting
  duration_seconds NUMERIC, -- actual time on step
  needed_reminder BOOLEAN DEFAULT false,
  needed_help BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Layer 3: Interactive Story Decision Tracking
CREATE TABLE public.story_decision_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  step_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  decision_type TEXT NOT NULL DEFAULT 'moral', -- moral, emotional, strategic, social
  options JSONB NOT NULL DEFAULT '[]',
  correct_option_index INTEGER, -- NULL if no "correct" answer
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.story_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_point_id UUID NOT NULL REFERENCES public.story_decision_points(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  story_id UUID NOT NULL,
  selected_option_index INTEGER NOT NULL,
  response_time_ms INTEGER, -- latency
  changed_answer BOOLEAN DEFAULT false, -- indecision indicator
  change_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Layer 3: Socioemotional Profile
CREATE TABLE public.socioemotional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  empathy_score NUMERIC DEFAULT 0, -- 0-100
  impulse_control_score NUMERIC DEFAULT 0,
  social_flexibility_score NUMERIC DEFAULT 0,
  conflict_avoidance_score NUMERIC DEFAULT 0,
  moral_consistency_score NUMERIC DEFAULT 0,
  frustration_tolerance_score NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  data_sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Layer 4: Integrated Profile combining all layers
CREATE TABLE public.integrated_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Cognitive Battery (Layer 1)
  cognitive_attention NUMERIC,
  cognitive_inhibition NUMERIC,
  cognitive_memory NUMERIC,
  cognitive_flexibility NUMERIC,
  cognitive_coordination NUMERIC,
  cognitive_persistence NUMERIC,
  cognitive_overall NUMERIC,
  -- Executive Routine (Layer 2)
  executive_autonomy_score NUMERIC,
  executive_completion_rate NUMERIC,
  executive_consistency_score NUMERIC,
  executive_organization_index NUMERIC,
  -- Socioemotional (Layer 3)
  socioemotional_empathy NUMERIC,
  socioemotional_impulse_control NUMERIC,
  socioemotional_flexibility NUMERIC,
  socioemotional_overall NUMERIC,
  -- Meta
  layer1_sessions_count INTEGER DEFAULT 0,
  layer2_executions_count INTEGER DEFAULT 0,
  layer3_decisions_count INTEGER DEFAULT 0,
  interpretation TEXT,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.routine_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_decision_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socioemotional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrated_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users manage own routine executions" ON public.routine_executions
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own step executions" ON public.routine_step_executions
  FOR ALL TO authenticated USING (
    execution_id IN (SELECT id FROM public.routine_executions WHERE user_id = auth.uid())
  ) WITH CHECK (
    execution_id IN (SELECT id FROM public.routine_executions WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can read decision points" ON public.story_decision_points
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage decision points" ON public.story_decision_points
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users manage own story decisions" ON public.story_decisions
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals read child socioemotional profiles" ON public.socioemotional_profiles
  FOR SELECT TO authenticated USING (public.has_child_access(auth.uid(), child_id));

CREATE POLICY "System inserts socioemotional profiles" ON public.socioemotional_profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Professionals read integrated profiles" ON public.integrated_profiles
  FOR SELECT TO authenticated USING (public.has_child_access(auth.uid(), child_id));

CREATE POLICY "System inserts integrated profiles" ON public.integrated_profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_child_access(auth.uid(), child_id));
