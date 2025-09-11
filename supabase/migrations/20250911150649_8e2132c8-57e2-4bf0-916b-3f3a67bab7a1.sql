-- Create tables for new sensory integration games

-- SensoryFlow (Auditory Processing) sessions
CREATE TABLE IF NOT EXISTS public.sensory_flow_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  reaction_time_avg_ms INTEGER,
  frequency_discrimination_score INTEGER,
  temporal_processing_score INTEGER,
  audio_patterns_completed JSONB DEFAULT '[]'::jsonb,
  difficulty_progression JSONB DEFAULT '{}'::jsonb,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- TouchMapper (Tactile Processing) sessions  
CREATE TABLE IF NOT EXISTS public.touch_mapper_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  tactile_sensitivity_score NUMERIC(5,2),
  texture_recognition_accuracy NUMERIC(5,2),
  pressure_tolerance_level INTEGER,
  spatial_discrimination_score INTEGER,
  haptic_patterns_completed JSONB DEFAULT '[]'::jsonb,
  desensitization_progress JSONB DEFAULT '{}'::jsonb,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- VisualSync (Visual Processing) sessions
CREATE TABLE IF NOT EXISTS public.visual_sync_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  visual_tracking_accuracy NUMERIC(5,2),
  spatial_processing_score INTEGER,
  visual_motor_integration_score INTEGER,
  contrast_sensitivity_level NUMERIC(5,2),
  movement_patterns_completed JSONB DEFAULT '[]'::jsonb,
  eye_tracking_data JSONB DEFAULT '{}'::jsonb,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- BalanceQuest (Vestibular System) sessions
CREATE TABLE IF NOT EXISTS public.balance_quest_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  balance_stability_score NUMERIC(5,2),
  motion_tolerance_level INTEGER,
  coordination_accuracy NUMERIC(5,2),
  postural_control_score INTEGER,
  balance_challenges_completed JSONB DEFAULT '[]'::jsonb,
  motion_data JSONB DEFAULT '{}'::jsonb,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- EmotionPalette (Advanced Emotional Regulation) sessions
CREATE TABLE IF NOT EXISTS public.emotion_palette_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  emotion_recognition_accuracy NUMERIC(5,2),
  regulation_strategy_usage JSONB DEFAULT '{}'::jsonb,
  biofeedback_data JSONB DEFAULT '{}'::jsonb,
  art_creation_data JSONB DEFAULT '{}'::jsonb,
  emotional_journey_completion JSONB DEFAULT '[]'::jsonb,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- MemoryMaze (Executive Functions) sessions
CREATE TABLE IF NOT EXISTS public.memory_maze_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  working_memory_span INTEGER,
  cognitive_flexibility_score INTEGER,
  attention_switching_accuracy NUMERIC(5,2),
  n_back_performance JSONB DEFAULT '{}'::jsonb,
  maze_completion_data JSONB DEFAULT '[]'::jsonb,
  executive_function_metrics JSONB DEFAULT '{}'::jsonb,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- CommunityCircle (Advanced Social Skills) sessions
CREATE TABLE IF NOT EXISTS public.community_circle_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  leadership_score INTEGER,
  collaboration_effectiveness NUMERIC(5,2),
  group_communication_score INTEGER,
  conflict_resolution_score INTEGER,
  group_dynamics_data JSONB DEFAULT '{}'::jsonb,
  multiplayer_interactions JSONB DEFAULT '[]'::jsonb,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Comprehensive Assessment Engine
CREATE TABLE IF NOT EXISTS public.ai_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL, -- 'comprehensive', 'sensory_profile', 'cognitive_profile', 'social_profile'
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score NUMERIC(5,2),
  cognitive_profile JSONB DEFAULT '{}'::jsonb,
  sensory_profile JSONB DEFAULT '{}'::jsonb,
  social_profile JSONB DEFAULT '{}'::jsonb,
  emotional_profile JSONB DEFAULT '{}'::jsonb,
  strengths_identified JSONB DEFAULT '[]'::jsonb,
  areas_for_development JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  alert_indicators JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC(5,2),
  data_sources JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clinical Reports and Insights
CREATE TABLE IF NOT EXISTS public.clinical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL, -- 'progress', 'diagnostic_insights', 'intervention_plan'
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  report_period_start DATE,
  report_period_end DATE,
  summary_insights TEXT,
  detailed_analysis JSONB DEFAULT '{}'::jsonb,
  progress_indicators JSONB DEFAULT '{}'::jsonb,
  intervention_recommendations JSONB DEFAULT '[]'::jsonb,
  alert_flags JSONB DEFAULT '[]'::jsonb,
  generated_by_ai BOOLEAN DEFAULT true,
  reviewed_by_professional BOOLEAN DEFAULT false,
  professional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Smart Alert System
CREATE TABLE IF NOT EXISTS public.smart_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL, -- 'early_detection', 'regression', 'milestone', 'intervention_needed'
  priority_level TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  alert_data JSONB DEFAULT '{}'::jsonb,
  triggered_by TEXT, -- 'ai_analysis', 'manual', 'threshold_breach'
  action_required TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.sensory_flow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touch_mapper_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_quest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_palette_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_maze_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_circle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-owned data
CREATE POLICY "Users can manage their own sensory flow sessions" ON public.sensory_flow_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own touch mapper sessions" ON public.touch_mapper_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own visual sync sessions" ON public.visual_sync_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own balance quest sessions" ON public.balance_quest_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own emotion palette sessions" ON public.emotion_palette_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own memory maze sessions" ON public.memory_maze_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own community circle sessions" ON public.community_circle_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI assessments" ON public.ai_assessments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own clinical reports" ON public.clinical_reports
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own smart alerts" ON public.smart_alerts
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_sensory_flow_sessions_user_date ON public.sensory_flow_sessions(user_id, session_date);
CREATE INDEX idx_touch_mapper_sessions_user_date ON public.touch_mapper_sessions(user_id, session_date);
CREATE INDEX idx_visual_sync_sessions_user_date ON public.visual_sync_sessions(user_id, session_date);
CREATE INDEX idx_balance_quest_sessions_user_date ON public.balance_quest_sessions(user_id, session_date);
CREATE INDEX idx_emotion_palette_sessions_user_date ON public.emotion_palette_sessions(user_id, session_date);
CREATE INDEX idx_memory_maze_sessions_user_date ON public.memory_maze_sessions(user_id, session_date);
CREATE INDEX idx_community_circle_sessions_user_date ON public.community_circle_sessions(user_id, session_date);
CREATE INDEX idx_ai_assessments_user_type ON public.ai_assessments(user_id, assessment_type);
CREATE INDEX idx_clinical_reports_user_date ON public.clinical_reports(user_id, generated_date);
CREATE INDEX idx_smart_alerts_user_status ON public.smart_alerts(user_id, status, priority_level);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_ai_assessments_updated_at
BEFORE UPDATE ON public.ai_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();