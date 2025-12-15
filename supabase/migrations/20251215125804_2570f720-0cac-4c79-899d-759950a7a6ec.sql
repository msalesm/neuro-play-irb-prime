-- Final security fixes
DROP POLICY IF EXISTS "Users can send messages" ON public.secure_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.secure_messages;
DROP POLICY IF EXISTS "Parents manage own child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Admins manage all child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Professionals manage own observations" ON public.teleconsult_observations;
DROP POLICY IF EXISTS "Admins manage government integrations" ON public.government_health_integration;

CREATE POLICY "Users can view own messages" ON public.secure_messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.secure_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Parents manage own child profiles" ON public.child_profiles FOR ALL USING (parent_user_id = auth.uid());
CREATE POLICY "Admins manage all child profiles" ON public.child_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Professionals manage own observations" ON public.teleconsult_observations FOR ALL USING (professional_id = auth.uid());
CREATE POLICY "Admins manage government integrations" ON public.government_health_integration FOR ALL USING (public.has_role(auth.uid(), 'admin'));