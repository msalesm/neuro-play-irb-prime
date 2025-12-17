
-- Create club_partner role
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'club_partner' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'club_partner';
  END IF;
END $$;

-- Club Service Categories
CREATE TABLE public.club_service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Club Partners (service providers)
CREATE TABLE public.club_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  specialty TEXT,
  bio TEXT,
  avatar_url TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  bank_account JSONB,
  commission_rate NUMERIC(5,2) DEFAULT 20.00,
  is_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Club Services
CREATE TABLE public.club_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.club_partners(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.club_service_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC(10,2) NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  location_type TEXT DEFAULT 'clinic' CHECK (location_type IN ('clinic', 'external', 'online')),
  location_address TEXT,
  cancellation_policy TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Partner Availability
CREATE TABLE public.club_partner_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.club_partners(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Club Bookings
CREATE TABLE public.club_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.club_services(id),
  partner_id UUID NOT NULL REFERENCES public.club_partners(id),
  parent_id UUID NOT NULL REFERENCES public.profiles(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  price NUMERIC(10,2) NOT NULL,
  discount_applied NUMERIC(10,2) DEFAULT 0,
  final_price NUMERIC(10,2) NOT NULL,
  clinic_commission NUMERIC(10,2) NOT NULL,
  partner_amount NUMERIC(10,2) NOT NULL,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Club Payments
CREATE TABLE public.club_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.club_bookings(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'debit_card')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Club Subscriptions (optional membership)
CREATE TABLE public.club_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(id),
  plan_name TEXT NOT NULL DEFAULT 'basic',
  price_monthly NUMERIC(10,2) NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 10,
  benefits JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  stripe_subscription_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.club_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_partner_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (public read)
CREATE POLICY "Categories are viewable by everyone" ON public.club_service_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.club_service_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Partners
CREATE POLICY "Approved partners are viewable by authenticated users" ON public.club_partners
  FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Partners can view own profile" ON public.club_partners
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Partners can update own profile" ON public.club_partners
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can create partner application" ON public.club_partners
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all partners" ON public.club_partners
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Services
CREATE POLICY "Active services are viewable by authenticated users" ON public.club_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own services" ON public.club_services
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.club_partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all services" ON public.club_services
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Availability
CREATE POLICY "Availability is viewable by authenticated users" ON public.club_partner_availability
  FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own availability" ON public.club_partner_availability
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.club_partners WHERE user_id = auth.uid())
  );

-- RLS Policies for Bookings
CREATE POLICY "Parents can view own bookings" ON public.club_bookings
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can create bookings" ON public.club_bookings
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own bookings" ON public.club_bookings
  FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "Partners can view their bookings" ON public.club_bookings
  FOR SELECT USING (
    partner_id IN (SELECT id FROM public.club_partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Partners can update booking status" ON public.club_bookings
  FOR UPDATE USING (
    partner_id IN (SELECT id FROM public.club_partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all bookings" ON public.club_bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Payments
CREATE POLICY "Parents can view own payments" ON public.club_payments
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.club_bookings WHERE parent_id = auth.uid())
  );

CREATE POLICY "Partners can view their payments" ON public.club_payments
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.club_bookings WHERE partner_id IN (
      SELECT id FROM public.club_partners WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Admins can manage all payments" ON public.club_payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Subscriptions
CREATE POLICY "Parents can view own subscription" ON public.club_subscriptions
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage subscriptions" ON public.club_subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.club_service_categories (name, description, icon, sort_order) VALUES
  ('Massagem', 'Serviços de massagem relaxante e terapêutica', 'Sparkles', 1),
  ('Cabeleireiro', 'Cortes, coloração e tratamentos capilares', 'Scissors', 2),
  ('Estética', 'Tratamentos faciais e corporais', 'Heart', 3),
  ('Nutrição', 'Consultas e acompanhamento nutricional', 'Apple', 4),
  ('Psicoterapia Adulto', 'Atendimento psicológico para adultos', 'Brain', 5),
  ('Bem-estar', 'Yoga, meditação e práticas integrativas', 'Sun', 6),
  ('Workshops', 'Eventos e workshops exclusivos', 'Users', 7);

-- Create indexes for performance
CREATE INDEX idx_club_services_partner ON public.club_services(partner_id);
CREATE INDEX idx_club_services_category ON public.club_services(category_id);
CREATE INDEX idx_club_bookings_parent ON public.club_bookings(parent_id);
CREATE INDEX idx_club_bookings_partner ON public.club_bookings(partner_id);
CREATE INDEX idx_club_bookings_date ON public.club_bookings(scheduled_date);
CREATE INDEX idx_club_payments_booking ON public.club_payments(booking_id);

-- Update triggers
CREATE TRIGGER update_club_partners_updated_at
  BEFORE UPDATE ON public.club_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_services_updated_at
  BEFORE UPDATE ON public.club_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_bookings_updated_at
  BEFORE UPDATE ON public.club_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_payments_updated_at
  BEFORE UPDATE ON public.club_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
