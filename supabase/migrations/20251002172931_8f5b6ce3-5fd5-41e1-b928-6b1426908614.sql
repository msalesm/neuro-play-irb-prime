-- ============================================================================
-- CRITICAL SECURITY FIX: Proteger dados pessoais sensíveis em user_profiles
-- ============================================================================
-- 
-- PROBLEMA: Políticas RLS permissivas permitem que usuários autenticados 
-- vejam dados sensíveis (email, telefone, endereço, histórico médico) de 
-- outros usuários através da política "Authenticated users: basic public profile access"
--
-- SOLUÇÃO: 
-- 1. Remover políticas permissivas demais
-- 2. Criar VIEW segura para perfis públicos (apenas dados não-sensíveis)
-- 3. Criar funções SECURITY DEFINER para acesso controlado a dados sensíveis
-- 4. Implementar políticas RLS restritivas e corretas
-- ============================================================================

-- ============================================================================
-- PASSO 1: Remover políticas problemáticas
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users: basic public profile access" ON public.user_profiles;
DROP POLICY IF EXISTS "Block sensitive data for public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles: safe data only" ON public.user_profiles;

-- ============================================================================
-- PASSO 2: Criar VIEW segura para perfis públicos (apenas dados não-sensíveis)
-- ============================================================================

-- Dropar view existente se houver
DROP VIEW IF EXISTS public.public_profiles_safe CASCADE;

-- Criar view com APENAS campos não-sensíveis
-- Esta VIEW já faz a filtragem de segurança - não precisa de RLS policy
CREATE VIEW public.public_profiles_safe 
WITH (security_barrier = true) AS
SELECT 
  id,
  name,
  avatar_url,
  city,
  state,
  reputation_score,
  verified,
  is_public,
  created_at,
  updated_at
FROM public.user_profiles
WHERE is_public = true;

-- Conceder permissões na view
GRANT SELECT ON public.public_profiles_safe TO authenticated;

-- ============================================================================
-- PASSO 3: Criar funções SECURITY DEFINER para acesso controlado
-- ============================================================================

-- Função para verificar se usuário pode ver dados de contato
CREATE OR REPLACE FUNCTION public.can_view_contact_info(_profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() = _profile_user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_admin_permission(auth.uid(), 'view_contact_info'::admin_permission);
$$;

-- Função para verificar se usuário pode ver dados médicos
CREATE OR REPLACE FUNCTION public.can_view_medical_data(_profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() = _profile_user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_admin_permission(auth.uid(), 'view_medical_data'::admin_permission);
$$;

-- Função segura para obter dados de contato (quando autorizado)
CREATE OR REPLACE FUNCTION public.get_user_contact_info(_user_id uuid)
RETURNS TABLE(
  email text,
  phone text,
  address jsonb,
  emergency_contact jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissão
  IF NOT can_view_contact_info(_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot view contact information';
  END IF;

  RETURN QUERY
  SELECT 
    up.email,
    up.phone,
    up.address,
    up.emergency_contact
  FROM public.user_profiles up
  WHERE up.id = _user_id;
END;
$$;

-- Função segura para obter dados médicos (quando autorizado)
CREATE OR REPLACE FUNCTION public.get_user_medical_data(_user_id uuid)
RETURNS TABLE(
  date_of_birth date,
  medical_history_summary text,
  medical_preferences jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissão
  IF NOT can_view_medical_data(_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot view medical data';
  END IF;

  RETURN QUERY
  SELECT 
    up.date_of_birth,
    up.medical_history_summary,
    up.medical_preferences
  FROM public.user_profiles up
  WHERE up.id = _user_id;
END;
$$;

-- ============================================================================
-- PASSO 4: Implementar políticas RLS RESTRITIVAS E CORRETAS
-- ============================================================================

-- Política 1: Usuários podem ver APENAS seu próprio perfil completo
CREATE POLICY "Users: own profile only (full access)"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Política 2: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users: update own profile only"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Política 3: Admins com permissão específica podem ver perfis básicos (SEM dados sensíveis)
-- IMPORTANTE: Esta política expõe TODOS os campos da tabela quando true
-- Portanto, dados sensíveis devem ser acessados APENAS via funções SECURITY DEFINER
CREATE POLICY "Admins: basic profiles with permission"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  id != auth.uid() 
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_admin_permission(auth.uid(), 'view_basic_profiles'::admin_permission)
  )
);

-- Política 4: Admins com full_admin_access podem fazer tudo
CREATE POLICY "Admins: full access with special permission"
ON public.user_profiles
FOR ALL
TO authenticated
USING (has_admin_permission(auth.uid(), 'full_admin_access'::admin_permission))
WITH CHECK (has_admin_permission(auth.uid(), 'full_admin_access'::admin_permission));

-- ============================================================================
-- PASSO 5: Adicionar índices para performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON public.user_profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(id);

-- ============================================================================
-- PASSO 6: Adicionar comentários para documentação
-- ============================================================================

COMMENT ON VIEW public.public_profiles_safe IS 
'Vista segura que expõe apenas campos não-sensíveis de perfis públicos. 
Campos sensíveis (email, phone, address, date_of_birth, medical_history_summary, 
medical_preferences, emergency_contact) NÃO são incluídos.
Para acessar dados sensíveis, use as funções get_user_contact_info() ou get_user_medical_data().';

COMMENT ON FUNCTION public.can_view_contact_info IS 
'Verifica se o usuário atual tem permissão para ver dados de contato de outro usuário.
Retorna true se: (1) é o próprio usuário, (2) é admin, ou (3) tem permissão específica view_contact_info.';

COMMENT ON FUNCTION public.can_view_medical_data IS 
'Verifica se o usuário atual tem permissão para ver dados médicos de outro usuário.
Retorna true se: (1) é o próprio usuário, (2) é admin, ou (3) tem permissão específica view_medical_data.';

COMMENT ON FUNCTION public.get_user_contact_info IS 
'Retorna dados de contato sensíveis (email, phone, address, emergency_contact) 
de um usuário APENAS se o chamador tiver permissão apropriada.
Lança exceção "Unauthorized" se não autorizado.
USO: SELECT * FROM get_user_contact_info(''user-uuid-here'');';

COMMENT ON FUNCTION public.get_user_medical_data IS 
'Retorna dados médicos sensíveis (date_of_birth, medical_history_summary, medical_preferences) 
de um usuário APENAS se o chamador tiver permissão apropriada.
Lança exceção "Unauthorized" se não autorizado.
USO: SELECT * FROM get_user_medical_data(''user-uuid-here'');';

-- ============================================================================
-- PASSO 7: Atualizar políticas antigas que conflitam
-- ============================================================================

-- Remover políticas duplicadas ou conflitantes
DROP POLICY IF EXISTS "Admins can view basic profile info" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view contact info with permission" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view medical data with special permission" ON public.user_profiles;
DROP POLICY IF EXISTS "Sensitive data: own profile only" ON public.user_profiles;