-- Corrigir warning do SECURITY DEFINER VIEW
-- Alterar para security_invoker = true (mais seguro)
ALTER VIEW public.doctor_profiles_public SET (security_invoker = true);

-- Conceder permissões apropriadas para a view
GRANT SELECT ON public.doctor_profiles_public TO public;