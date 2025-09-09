-- ===================================
-- CORREÇÃO DE SEGURANÇA: doctor_profiles (Versão 2)
-- ===================================

-- 1. REMOVER TODAS as políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Public can view approved doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "doctor_select_public" ON public.doctor_profiles;
DROP POLICY IF EXISTS "doctor_manage_own" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Admins can view all doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors can create their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors can delete their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors can insert their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can view their own doctor profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Patients can view minimal doctor info for appointments" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors can view/manage own complete profile" ON public.doctor_profiles;

-- 2. Criar view SEGURA para dados públicos (sem informações sensíveis)
CREATE OR REPLACE VIEW public.doctor_profiles_public AS
SELECT 
  id,
  user_id,
  specialty,
  bio,
  photo_url,
  is_online,
  rating_avg,
  approved,
  -- Endereço simplificado (apenas cidade/estado, SEM dados pessoais)
  CASE 
    WHEN approved = true THEN 
      jsonb_build_object(
        'city', address->>'city',
        'state', address->>'state'
      )
    ELSE NULL
  END as location_public,
  created_at
FROM public.doctor_profiles
WHERE approved = true AND is_online = true;

-- 3. POLÍTICAS RESTRITIVAS para tabela principal
CREATE POLICY "doctor_own_complete_access" 
ON public.doctor_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_complete_access" 
ON public.doctor_profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Política para pacientes com consultas agendadas (acesso limitado)
CREATE POLICY "patient_appointment_limited_access" 
ON public.doctor_profiles 
FOR SELECT 
USING (
  approved = true 
  AND is_online = true 
  AND EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.doctor_user_id = doctor_profiles.user_id 
    AND a.patient_id = auth.uid()
    AND a.status IN ('confirmed', 'in_progress')
  )
);

-- 5. Função para busca segura de médicos (dados públicos apenas)
CREATE OR REPLACE FUNCTION public.search_doctors_secure(
  p_specialty text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  specialty text,
  bio text,
  photo_url text,
  rating_avg numeric,
  location_city text,
  location_state text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    dp.id,
    dp.user_id,
    dp.specialty,
    dp.bio,
    dp.photo_url,
    dp.rating_avg,
    dp.address->>'city' as location_city,
    dp.address->>'state' as location_state
  FROM public.doctor_profiles dp
  WHERE dp.approved = true 
    AND dp.is_online = true
    AND (p_specialty IS NULL OR dp.specialty ILIKE '%' || p_specialty || '%')
    AND (p_city IS NULL OR dp.address->>'city' ILIKE '%' || p_city || '%')
    AND (p_state IS NULL OR dp.address->>'state' ILIKE '%' || p_state || '%')
  ORDER BY dp.rating_avg DESC
  LIMIT 50; -- Limite de segurança
$$;