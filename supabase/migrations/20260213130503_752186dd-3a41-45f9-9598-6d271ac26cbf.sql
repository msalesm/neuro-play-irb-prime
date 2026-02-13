-- Update validate_api_key to compare SHA-256 hashes instead of plaintext
CREATE OR REPLACE FUNCTION public.validate_api_key(p_key_prefix text, p_key_hash text)
 RETURNS TABLE(user_id uuid, permissions text[], institution_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ak.user_id,
    ak.permissions,
    ak.institution_id
  FROM public.api_keys ak
  WHERE ak.key_prefix = p_key_prefix
    AND ak.key_hash = p_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
END;
$function$;
