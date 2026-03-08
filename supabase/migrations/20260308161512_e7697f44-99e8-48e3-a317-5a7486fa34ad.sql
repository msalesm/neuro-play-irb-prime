
-- Create missing domain tables (story_decisions already exists)

CREATE TABLE public.game_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id),
  stimulus TEXT,
  expected_response TEXT,
  actual_response TEXT,
  correct BOOLEAN NOT NULL,
  reaction_time_ms INTEGER,
  error_type TEXT,
  prompt_level TEXT,
  trial_number INTEGER,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cognitive_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE UNIQUE,
  institution_id UUID REFERENCES public.institutions(id),
  attention_score NUMERIC(5,2) DEFAULT 0,
  memory_score NUMERIC(5,2) DEFAULT 0,
  flexibility_score NUMERIC(5,2) DEFAULT 0,
  coordination_score NUMERIC(5,2) DEFAULT 0,
  persistence_score NUMERIC(5,2) DEFAULT 0,
  processing_speed_score NUMERIC(5,2) DEFAULT 0,
  data_sources JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.routine_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id),
  task_name TEXT NOT NULL,
  task_category TEXT DEFAULT 'general',
  scheduled_time TIME,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  interruptions INTEGER DEFAULT 0,
  assistance_needed BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.routine_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_initiation_avg_seconds NUMERIC(8,2),
  task_completion_rate NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  avg_interruptions NUMERIC(5,2) DEFAULT 0,
  executive_function_index NUMERIC(5,2),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, metric_date)
);

CREATE TABLE public.story_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id),
  story_id UUID REFERENCES public.ai_generated_stories(id),
  story_title TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  engagement_score NUMERIC(5,2),
  emotional_responses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.behavior_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE UNIQUE,
  institution_id UUID REFERENCES public.institutions(id),
  attention_level NUMERIC(5,2),
  emotional_regulation NUMERIC(5,2),
  social_interaction NUMERIC(5,2),
  persistence_level NUMERIC(5,2),
  flexibility NUMERIC(5,2),
  impulse_control NUMERIC(5,2),
  communication NUMERIC(5,2),
  data_sources JSONB DEFAULT '{}',
  last_game_data_at TIMESTAMPTZ,
  last_aba_data_at TIMESTAMPTZ,
  last_routine_data_at TIMESTAMPTZ,
  last_story_data_at TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_children INTEGER DEFAULT 0,
  active_children INTEGER DEFAULT 0,
  avg_attention NUMERIC(5,2),
  avg_memory NUMERIC(5,2),
  avg_persistence NUMERIC(5,2),
  avg_flexibility NUMERIC(5,2),
  engagement_rate NUMERIC(5,2),
  sessions_count INTEGER DEFAULT 0,
  aba_trials_count INTEGER DEFAULT 0,
  avg_aba_accuracy NUMERIC(5,2),
  routine_completion_rate NUMERIC(5,2),
  risk_distribution JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, snapshot_date)
);

-- Enrich existing story_decisions with missing columns
ALTER TABLE public.story_decisions 
  ADD COLUMN IF NOT EXISTS decision_text TEXT,
  ADD COLUMN IF NOT EXISTS options_presented JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS emotional_tag TEXT,
  ADD COLUMN IF NOT EXISTS decision_time_ms INTEGER;
