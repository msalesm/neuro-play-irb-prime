
-- =====================================================
-- FASE 4: SISTEMA INSTITUCIONAL E MONETIZAÇÃO
-- =====================================================

-- Enum para tipos de plano
DO $$ BEGIN
  CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro_family', 'pro_therapist', 'institutional');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para status de assinatura
DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('active', 'trial', 'cancelled', 'expired', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para tipo de mensagem
DO $$ BEGIN
  CREATE TYPE public.message_type AS ENUM ('text', 'feedback', 'recommendation', 'alert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- TABELA: institutions (Instituições B2B)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'clinic', -- clinic, school, therapy_center
  logo_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',
  settings JSONB DEFAULT '{}',
  max_users INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: institution_members (Membros da Instituição)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.institution_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- admin, coordinator, therapist, teacher, member
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, user_id)
);

ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: subscription_plans (Definição dos Planos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan_type public.subscription_plan NOT NULL,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}', -- max_stories, max_routines, max_games, etc
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, plan_type, price_monthly, price_yearly, features, limits, trial_days, sort_order) VALUES
('Gratuito', 'free', 'free', 0, 0, 
  '{"stories": true, "basic_routines": true, "limited_games": true}',
  '{"max_stories": 5, "max_routines": 3, "max_games": 5, "max_children": 1}',
  0, 1),
('Pro Família', 'pro-family', 'pro_family', 29.90, 299.00,
  '{"unlimited_stories": true, "unlimited_routines": true, "all_games": true, "progress_reports": true, "priority_support": true}',
  '{"max_stories": -1, "max_routines": -1, "max_games": -1, "max_children": 5}',
  7, 2),
('Pro Terapeuta', 'pro-therapist', 'pro_therapist', 79.90, 799.00,
  '{"unlimited_stories": true, "unlimited_routines": true, "all_games": true, "clinical_reports": true, "patient_management": true, "custom_content": true, "priority_support": true}',
  '{"max_stories": -1, "max_routines": -1, "max_games": -1, "max_patients": 50}',
  14, 3),
('Institucional', 'institutional', 'institutional', 299.90, 2999.00,
  '{"everything": true, "multi_user": true, "admin_dashboard": true, "bulk_import": true, "api_access": true, "white_label": true, "dedicated_support": true}',
  '{"max_stories": -1, "max_routines": -1, "max_games": -1, "max_users": 100}',
  14, 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- TABELA: subscriptions (Assinaturas dos Usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'trial',
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  payment_provider TEXT, -- stripe, mercadopago
  external_subscription_id TEXT,
  external_customer_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT subscription_owner CHECK (user_id IS NOT NULL OR institution_id IS NOT NULL)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: payment_history (Histórico de Pagamentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method TEXT,
  payment_provider TEXT,
  external_payment_id TEXT,
  invoice_url TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: secure_messages (Mensagens Seguras)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.secure_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID REFERENCES public.profiles(id),
  child_id UUID REFERENCES public.children(id),
  institution_id UUID REFERENCES public.institutions(id),
  message_type public.message_type DEFAULT 'text',
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.secure_messages(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: message_attachments (Anexos de Mensagens)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.secure_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: weekly_feedback (Feedbacks Automáticos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weekly_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary TEXT,
  highlights JSONB DEFAULT '[]',
  areas_of_improvement JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  is_auto_generated BOOLEAN DEFAULT true,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.weekly_feedback ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: content_library (Biblioteca de Mídia)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- image, icon, audio, video
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  institution_id UUID REFERENCES public.institutions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: development_trails (Trilhas de Desenvolvimento)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.development_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_age_min INTEGER DEFAULT 3,
  target_age_max INTEGER DEFAULT 18,
  target_conditions TEXT[] DEFAULT '{}',
  difficulty_level INTEGER DEFAULT 1,
  estimated_duration_days INTEGER DEFAULT 30,
  content_items JSONB DEFAULT '[]', -- [{type: 'story', id: 'xxx'}, {type: 'routine', id: 'yyy'}]
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.development_trails ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: trail_progress (Progresso nas Trilhas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.trail_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  trail_id UUID NOT NULL REFERENCES public.development_trails(id) ON DELETE CASCADE,
  current_item_index INTEGER DEFAULT 0,
  completed_items JSONB DEFAULT '[]',
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, trail_id)
);

ALTER TABLE public.trail_progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: group_assignments (Atribuições em Grupo)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.school_classes(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  content_type TEXT NOT NULL, -- story, routine, trail, game
  content_id UUID NOT NULL,
  due_date TIMESTAMPTZ,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.group_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: user_analytics (Analytics Detalhado)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  stories_viewed INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  routines_started INTEGER DEFAULT 0,
  routines_completed INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, date)
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: ai_recommendations (Recomendações de IA)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_content_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- story, routine, game, trail
  content_id UUID,
  content_name TEXT,
  reason TEXT,
  confidence_score DECIMAL(5,2),
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_content_recommendations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: abandonment_alerts (Alertas de Abandono)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.abandonment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- no_activity, declining_engagement, incomplete_content
  severity TEXT DEFAULT 'medium', -- low, medium, high
  days_inactive INTEGER,
  last_activity_at TIMESTAMPTZ,
  message TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.abandonment_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: content_versions (Controle de Versão)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- story, routine, trail
  content_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  changes_summary TEXT,
  content_snapshot JSONB NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELA: internal_notifications (Notificações Internas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.internal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.internal_notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Institutions
CREATE POLICY "Admins can manage all institutions"
ON public.institutions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution admins can view their institution"
ON public.institutions FOR SELECT
USING (id IN (
  SELECT institution_id FROM public.institution_members 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Institution Members
CREATE POLICY "Admins can manage all institution members"
ON public.institution_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution admins can manage their members"
ON public.institution_members FOR ALL
USING (institution_id IN (
  SELECT institution_id FROM public.institution_members 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can view their own membership"
ON public.institution_members FOR SELECT
USING (user_id = auth.uid());

-- Subscription Plans (public read)
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Payment History
CREATE POLICY "Users can view own payment history"
ON public.payment_history FOR SELECT
USING (subscription_id IN (
  SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
));

-- Secure Messages
CREATE POLICY "Users can view messages they sent or received"
ON public.secure_messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.secure_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update message status"
ON public.secure_messages FOR UPDATE
USING (recipient_id = auth.uid());

-- Message Attachments
CREATE POLICY "Users can view attachments of their messages"
ON public.message_attachments FOR SELECT
USING (message_id IN (
  SELECT id FROM public.secure_messages 
  WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
));

-- Weekly Feedback
CREATE POLICY "Parents can view feedback for their children"
ON public.weekly_feedback FOR SELECT
USING (child_id IN (
  SELECT id FROM public.children WHERE parent_id = auth.uid()
));

CREATE POLICY "Therapists can manage feedback for their patients"
ON public.weekly_feedback FOR ALL
USING (
  therapist_id = auth.uid() OR 
  child_id IN (
    SELECT child_id FROM public.child_access 
    WHERE professional_id = auth.uid() AND is_active = true
  )
);

-- Content Library
CREATE POLICY "Users can view public content"
ON public.content_library FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Admins can manage all content"
ON public.content_library FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Development Trails
CREATE POLICY "Anyone can view active trails"
ON public.development_trails FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage trails"
ON public.development_trails FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trail Progress
CREATE POLICY "Parents can view their children progress"
ON public.trail_progress FOR SELECT
USING (child_id IN (
  SELECT id FROM public.children WHERE parent_id = auth.uid()
));

CREATE POLICY "Parents can manage their children progress"
ON public.trail_progress FOR ALL
USING (child_id IN (
  SELECT id FROM public.children WHERE parent_id = auth.uid()
));

-- Group Assignments
CREATE POLICY "Institution members can view assignments"
ON public.group_assignments FOR SELECT
USING (
  institution_id IN (
    SELECT institution_id FROM public.institution_members WHERE user_id = auth.uid()
  ) OR
  class_id IN (
    SELECT id FROM public.school_classes WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage class assignments"
ON public.group_assignments FOR ALL
USING (class_id IN (
  SELECT id FROM public.school_classes WHERE teacher_id = auth.uid()
));

-- User Analytics
CREATE POLICY "Users can view own analytics"
ON public.user_analytics FOR SELECT
USING (user_id = auth.uid() OR child_id IN (
  SELECT id FROM public.children WHERE parent_id = auth.uid()
));

CREATE POLICY "Admins can view all analytics"
ON public.user_analytics FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- AI Content Recommendations
CREATE POLICY "Parents can view their children recommendations"
ON public.ai_content_recommendations FOR SELECT
USING (child_id IN (
  SELECT id FROM public.children WHERE parent_id = auth.uid()
));

-- Abandonment Alerts
CREATE POLICY "Parents can view alerts for their children"
ON public.abandonment_alerts FOR SELECT
USING (child_id IN (
  SELECT id FROM public.children WHERE parent_id = auth.uid()
));

CREATE POLICY "Therapists can view and resolve alerts"
ON public.abandonment_alerts FOR ALL
USING (child_id IN (
  SELECT child_id FROM public.child_access 
  WHERE professional_id = auth.uid() AND is_active = true
));

-- Content Versions
CREATE POLICY "Admins can manage content versions"
ON public.content_versions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Internal Notifications
CREATE POLICY "Users can view own notifications"
ON public.internal_notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON public.internal_notifications FOR UPDATE
USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_development_trails_updated_at
  BEFORE UPDATE ON public.development_trails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
