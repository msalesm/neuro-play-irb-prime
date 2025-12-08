-- =====================================================
-- PHASE 5: NEUROPLAY ADVANCED PLATFORM EXPANSION
-- =====================================================

-- 1. BIOFEEDBACK & WEARABLES
CREATE TABLE public.wearable_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_id UUID REFERENCES public.children(id),
  provider TEXT NOT NULL, -- 'apple_watch', 'fitbit', 'amazfit', 'garmin'
  device_id TEXT,
  access_token TEXT, -- encrypted
  refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.biofeedback_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id),
  connection_id UUID REFERENCES public.wearable_connections(id),
  reading_type TEXT NOT NULL, -- 'heart_rate', 'hrv', 'sleep', 'movement', 'stress'
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.biofeedback_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  alert_type TEXT NOT NULL, -- 'high_stress', 'poor_sleep', 'activity_reminder', 'calm_mode'
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'urgent'
  message TEXT NOT NULL,
  recommendation TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MARKETPLACE
CREATE TABLE public.marketplace_creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  credentials TEXT[], -- 'therapist', 'psychologist', 'teacher', 'specialist'
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_at TIMESTAMPTZ,
  commission_rate NUMERIC DEFAULT 0.70, -- 70% to creator
  total_earnings NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.marketplace_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.marketplace_creators(id) NOT NULL,
  item_type TEXT NOT NULL, -- 'social_story', 'learning_trail', 'mini_game', 'routine_template'
  title TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  content_data JSONB NOT NULL,
  price_coins INTEGER DEFAULT 0, -- internal currency
  price_real NUMERIC DEFAULT 0, -- real currency
  is_premium_only BOOLEAN DEFAULT false,
  age_min INTEGER,
  age_max INTEGER,
  target_conditions TEXT[],
  language TEXT DEFAULT 'pt',
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'published'
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.marketplace_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.marketplace_items(id) NOT NULL,
  price_paid NUMERIC NOT NULL,
  payment_type TEXT NOT NULL, -- 'coins', 'subscription', 'direct'
  creator_earnings NUMERIC,
  platform_fee NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CLINICAL PROTOCOLS
CREATE TABLE public.clinical_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_condition TEXT NOT NULL, -- 'TEA', 'TDAH', 'TOD', 'socioemocional'
  age_min INTEGER,
  age_max INTEGER,
  duration_weeks INTEGER,
  sessions_per_week INTEGER DEFAULT 1,
  recommended_trails UUID[],
  recommended_games TEXT[],
  evaluation_metrics JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.patient_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  protocol_id UUID REFERENCES public.clinical_protocols(id) NOT NULL,
  therapist_id UUID NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  started_at TIMESTAMPTZ DEFAULT now(),
  target_end_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress_percentage NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TELEORIENTATION
CREATE TABLE public.teleorientation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  child_id UUID REFERENCES public.children(id),
  session_type TEXT DEFAULT 'orientation', -- 'orientation', 'follow_up', 'evaluation'
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
  meeting_url TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.teleorientation_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.teleorientation_sessions(id) NOT NULL,
  professional_id UUID NOT NULL,
  notes TEXT NOT NULL,
  recommendations JSONB DEFAULT '[]',
  suggested_activities UUID[],
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_date DATE,
  is_shared_with_parent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. INTERNATIONALIZATION
CREATE TABLE public.supported_languages (
  code TEXT PRIMARY KEY, -- 'pt', 'en', 'es'
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  currency_code TEXT DEFAULT 'BRL',
  date_format TEXT DEFAULT 'DD/MM/YYYY'
);

CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code TEXT REFERENCES public.supported_languages(code) NOT NULL,
  namespace TEXT NOT NULL, -- 'common', 'games', 'stories', 'ui'
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(language_code, namespace, key)
);

CREATE TABLE public.regional_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  country_code TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  price_monthly NUMERIC NOT NULL,
  price_yearly NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PREMIUM AVATAR SYSTEM
CREATE TABLE public.avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL, -- 'accessory', 'clothing', 'pet', 'background', 'effect'
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  unlock_requirement TEXT, -- 'purchase', 'achievement', 'level', 'event'
  unlock_value INTEGER, -- level number, coin cost, etc
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.child_avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  item_id UUID REFERENCES public.avatar_items(id) NOT NULL,
  is_equipped BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, item_id)
);

CREATE TABLE public.avatar_emotional_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  current_mood TEXT DEFAULT 'neutral', -- 'happy', 'calm', 'focused', 'tired', 'anxious', 'neutral'
  energy_level INTEGER DEFAULT 100,
  last_activity_at TIMESTAMPTZ,
  mode TEXT DEFAULT 'normal', -- 'normal', 'calm', 'focus'
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.unlockable_worlds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL, -- 'ocean', 'space', 'forest', 'city', 'fantasy'
  unlock_requirement TEXT NOT NULL,
  unlock_value INTEGER,
  background_url TEXT,
  ambient_sound_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MODERATED COMMUNITY EXPANSION
CREATE TABLE public.community_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  target_audience TEXT NOT NULL, -- 'parents', 'therapists', 'all'
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE public.editorial_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.community_categories(id),
  content_type TEXT NOT NULL, -- 'article', 'guide', 'video', 'podcast'
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  author_name TEXT,
  author_credentials TEXT,
  reading_time_minutes INTEGER,
  language TEXT DEFAULT 'pt',
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.content_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID REFERENCES public.editorial_content(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'post', 'comment', 'editorial'
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'action_taken', 'dismissed'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. SCHOOL/CLASSROOM EXPANSION
CREATE TABLE public.student_subgroups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.school_classes(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  focus_area TEXT, -- 'reading', 'social_skills', 'attention', 'emotional'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subgroup_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subgroup_id UUID REFERENCES public.student_subgroups(id) NOT NULL,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subgroup_id, child_id)
);

CREATE TABLE public.classroom_weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.school_classes(id) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_students INTEGER,
  active_students INTEGER,
  avg_engagement_score NUMERIC,
  skill_metrics JSONB DEFAULT '{}',
  highlights JSONB DEFAULT '[]',
  concerns JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT now(),
  is_sent BOOLEAN DEFAULT false,
  sent_to TEXT[] -- emails
);

CREATE TABLE public.external_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id),
  provider TEXT NOT NULL, -- 'google_classroom', 'microsoft_edu', 'canvas'
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. AI RECOMMENDATIONS EXPANSION
CREATE TABLE public.ai_emotional_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  analysis_date DATE NOT NULL,
  emotional_state TEXT,
  confidence_score NUMERIC,
  detected_patterns JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  data_sources JSONB DEFAULT '{}', -- which data was used
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.smart_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_id UUID REFERENCES public.children(id),
  alert_type TEXT NOT NULL, -- 'pause_reminder', 'routine_time', 'activity_suggestion', 'progress_milestone'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  scheduled_for TIMESTAMPTZ,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ai_generated_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL,
  child_id UUID REFERENCES public.children(id),
  problem_description TEXT NOT NULL,
  generated_story JSONB NOT NULL, -- title, steps, images
  status TEXT DEFAULT 'pending', -- 'pending', 'generated', 'approved', 'rejected'
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. API KEYS FOR EXTERNAL ACCESS
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_id UUID REFERENCES public.institutions(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- hashed API key
  key_prefix TEXT NOT NULL, -- first 8 chars for identification
  permissions TEXT[] DEFAULT ARRAY['read'],
  rate_limit_per_hour INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.api_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biofeedback_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biofeedback_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleorientation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleorientation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_emotional_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlockable_worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subgroups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgroup_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_emotional_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Wearables: Users manage their own connections
CREATE POLICY "Users manage own wearable connections" ON public.wearable_connections
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Parents view children biofeedback" ON public.biofeedback_readings
  FOR SELECT USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents view children alerts" ON public.biofeedback_alerts
  FOR SELECT USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents acknowledge alerts" ON public.biofeedback_alerts
  FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Marketplace: Public viewing, creators manage own items
CREATE POLICY "Users can become creators" ON public.marketplace_creators
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Creators manage own profile" ON public.marketplace_creators
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "View published items" ON public.marketplace_items
  FOR SELECT USING (status = 'published' OR creator_id IN (SELECT id FROM marketplace_creators WHERE user_id = auth.uid()));

CREATE POLICY "Creators manage own items" ON public.marketplace_items
  FOR ALL USING (creator_id IN (SELECT id FROM marketplace_creators WHERE user_id = auth.uid()));

CREATE POLICY "Users view own purchases" ON public.marketplace_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users manage own coins" ON public.user_coins
  FOR ALL USING (user_id = auth.uid());

-- Clinical protocols: Therapists and admins
CREATE POLICY "View active protocols" ON public.clinical_protocols
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'therapist'));

CREATE POLICY "Admins manage protocols" ON public.clinical_protocols
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Therapists manage patient protocols" ON public.patient_protocols
  FOR ALL USING (therapist_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Teleorientation
CREATE POLICY "Professionals manage own sessions" ON public.teleorientation_sessions
  FOR ALL USING (professional_id = auth.uid());

CREATE POLICY "Parents view own sessions" ON public.teleorientation_sessions
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Professionals manage notes" ON public.teleorientation_notes
  FOR ALL USING (professional_id = auth.uid());

-- Languages and translations: Public read
CREATE POLICY "Anyone can view languages" ON public.supported_languages
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view translations" ON public.translations
  FOR SELECT USING (true);

CREATE POLICY "Admins manage translations" ON public.translations
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "View regional pricing" ON public.regional_pricing
  FOR SELECT USING (true);

-- Avatar items: Public view, users manage own
CREATE POLICY "View avatar items" ON public.avatar_items
  FOR SELECT USING (true);

CREATE POLICY "Parents manage child avatar items" ON public.child_avatar_items
  FOR ALL USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents manage child emotional state" ON public.avatar_emotional_states
  FOR ALL USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "View unlockable worlds" ON public.unlockable_worlds
  FOR SELECT USING (true);

-- Community
CREATE POLICY "View active categories" ON public.community_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "View published editorial" ON public.editorial_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users manage own saves" ON public.content_saves
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users create reports" ON public.content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- School subgroups
CREATE POLICY "Teachers manage subgroups" ON public.student_subgroups
  FOR ALL USING (class_id IN (SELECT id FROM school_classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers manage subgroup students" ON public.subgroup_students
  FOR ALL USING (subgroup_id IN (SELECT id FROM student_subgroups WHERE class_id IN (SELECT id FROM school_classes WHERE teacher_id = auth.uid())));

CREATE POLICY "Teachers view weekly reports" ON public.classroom_weekly_reports
  FOR SELECT USING (class_id IN (SELECT id FROM school_classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Institution admins manage integrations" ON public.external_integrations
  FOR ALL USING (institution_id IN (SELECT institution_id FROM institution_members WHERE user_id = auth.uid() AND role = 'admin'));

-- AI Analysis
CREATE POLICY "Parents view child analysis" ON public.ai_emotional_analysis
  FOR SELECT USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Users manage own alerts" ON public.smart_alerts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage own AI stories" ON public.ai_generated_stories
  FOR ALL USING (requested_by = auth.uid());

-- API Keys
CREATE POLICY "Users manage own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "View own API usage" ON public.api_usage_logs
  FOR SELECT USING (api_key_id IN (SELECT id FROM api_keys WHERE user_id = auth.uid()));

-- Insert default data
INSERT INTO public.supported_languages (code, name, native_name, is_active, is_default, currency_code) VALUES
  ('pt', 'Portuguese', 'Português', true, true, 'BRL'),
  ('en', 'English', 'English', true, false, 'USD'),
  ('es', 'Spanish', 'Español', true, false, 'EUR');

INSERT INTO public.community_categories (name, description, icon, target_audience, sort_order) VALUES
  ('Rotinas', 'Compartilhe e descubra rotinas que funcionam', 'calendar', 'parents', 1),
  ('Estratégias', 'Dicas e estratégias para o dia a dia', 'lightbulb', 'parents', 2),
  ('Materiais', 'Recursos e materiais terapêuticos', 'folder', 'therapists', 3),
  ('Boas Práticas', 'Práticas baseadas em evidências', 'award', 'therapists', 4),
  ('Conquistas', 'Celebre as conquistas do seu filho', 'star', 'all', 5);

INSERT INTO public.clinical_protocols (name, description, target_condition, age_min, age_max, duration_weeks, sessions_per_week) VALUES
  ('Protocolo TEA Leve', 'Protocolo para crianças com TEA nível 1', 'TEA', 4, 12, 12, 2),
  ('Protocolo TDAH Básico', 'Foco em atenção e controle de impulsos', 'TDAH', 6, 14, 8, 2),
  ('Protocolo Socioemocional', 'Desenvolvimento de habilidades sociais', 'socioemocional', 5, 12, 10, 1),
  ('Protocolo TOD', 'Manejo comportamental para TOD', 'TOD', 6, 14, 12, 2);

INSERT INTO public.avatar_items (item_type, name, description, image_url, rarity, unlock_requirement, unlock_value) VALUES
  ('accessory', 'Chapéu Espacial', 'Um chapéu de astronauta', '/avatars/space-hat.png', 'common', 'level', 2),
  ('accessory', 'Óculos Arco-Íris', 'Óculos coloridos divertidos', '/avatars/rainbow-glasses.png', 'rare', 'achievement', 10),
  ('pet', 'Robô Amigo', 'Um pequeno robô companheiro', '/avatars/robot-pet.png', 'epic', 'level', 5),
  ('background', 'Floresta Encantada', 'Cenário de floresta mágica', '/avatars/forest-bg.png', 'rare', 'level', 3),
  ('effect', 'Brilho Estelar', 'Partículas brilhantes', '/avatars/star-effect.png', 'legendary', 'achievement', 50);

INSERT INTO public.unlockable_worlds (name, description, theme, unlock_requirement, unlock_value, sort_order) VALUES
  ('Oceano Azul', 'Explore as profundezas do mar', 'ocean', 'level', 1, 1),
  ('Galáxia Distante', 'Viaje pelo espaço sideral', 'space', 'level', 3, 2),
  ('Floresta Mágica', 'Descubra criaturas encantadas', 'forest', 'level', 5, 3),
  ('Cidade do Futuro', 'Tecnologia e inovação', 'city', 'level', 7, 4),
  ('Reino Fantasia', 'Castelos e dragões', 'fantasy', 'level', 10, 5);