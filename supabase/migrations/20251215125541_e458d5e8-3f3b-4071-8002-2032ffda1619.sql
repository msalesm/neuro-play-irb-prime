-- =====================================================
-- SECURITY FIX: RLS for remaining sensitive tables
-- =====================================================

-- 5. DIGITAL_PRESCRIPTIONS TABLE
DROP POLICY IF EXISTS "Parents can view own children prescriptions" ON public.digital_prescriptions;
DROP POLICY IF EXISTS "Prescribing professional can view own prescriptions" ON public.digital_prescriptions;
DROP POLICY IF EXISTS "Professionals can insert prescriptions" ON public.digital_prescriptions;
DROP POLICY IF EXISTS "Prescribing professional can update own prescriptions" ON public.digital_prescriptions;
DROP POLICY IF EXISTS "Admins can manage all prescriptions" ON public.digital_prescriptions;
DROP POLICY IF EXISTS "Anyone can view digital_prescriptions" ON public.digital_prescriptions;

ALTER TABLE public.digital_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children prescriptions" ON public.digital_prescriptions
  FOR SELECT USING (public.is_parent_of(auth.uid(), child_id));

CREATE POLICY "Prescribing professional can view own prescriptions" ON public.digital_prescriptions
  FOR SELECT USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert prescriptions" ON public.digital_prescriptions
  FOR INSERT WITH CHECK (professional_id = auth.uid() AND public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Prescribing professional can update own prescriptions" ON public.digital_prescriptions
  FOR UPDATE USING (professional_id = auth.uid());

CREATE POLICY "Admins can manage all prescriptions" ON public.digital_prescriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. BIOFEEDBACK_READINGS TABLE
DROP POLICY IF EXISTS "Parents can view own children biofeedback" ON public.biofeedback_readings;
DROP POLICY IF EXISTS "Professionals can view authorized children biofeedback" ON public.biofeedback_readings;
DROP POLICY IF EXISTS "Parents can insert own children biofeedback" ON public.biofeedback_readings;
DROP POLICY IF EXISTS "Admins can manage all biofeedback" ON public.biofeedback_readings;
DROP POLICY IF EXISTS "Anyone can view biofeedback_readings" ON public.biofeedback_readings;

ALTER TABLE public.biofeedback_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children biofeedback" ON public.biofeedback_readings
  FOR SELECT USING (public.is_parent_of(auth.uid(), child_id));

CREATE POLICY "Professionals can view authorized children biofeedback" ON public.biofeedback_readings
  FOR SELECT USING (public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Parents can insert own children biofeedback" ON public.biofeedback_readings
  FOR INSERT WITH CHECK (public.is_parent_of(auth.uid(), child_id));

CREATE POLICY "Admins can manage all biofeedback" ON public.biofeedback_readings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. PAYMENT_HISTORY TABLE (uses subscription_id, not user_id)
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Anyone can view payment_history" ON public.payment_history;

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history" ON public.payment_history
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payment history" ON public.payment_history
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 8. INSTITUTIONS TABLE
DROP POLICY IF EXISTS "Institution members can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Institution admins can manage their institution" ON public.institutions;
DROP POLICY IF EXISTS "System admins can manage all institutions" ON public.institutions;
DROP POLICY IF EXISTS "Anyone can view institutions" ON public.institutions;

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members can view their institution" ON public.institutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.institution_members im
      WHERE im.institution_id = institutions.id
        AND im.user_id = auth.uid()
        AND im.is_active = true
    )
  );

CREATE POLICY "Institution admins can manage their institution" ON public.institutions
  FOR ALL USING (public.is_institution_admin(auth.uid(), id));

CREATE POLICY "System admins can manage all institutions" ON public.institutions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));