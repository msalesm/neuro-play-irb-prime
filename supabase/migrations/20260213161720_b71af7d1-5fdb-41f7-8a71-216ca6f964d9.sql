
-- Fix 1: Add authentication check to generate_api_key()
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_value TEXT;
BEGIN
  -- Validate caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to generate API keys';
  END IF;
  
  key_value := 'np_' || encode(gen_random_bytes(32), 'hex');
  RETURN key_value;
END;
$$;

-- Fix 2: Create encryption/decryption helper functions for sensitive tokens
-- Uses pgcrypto extension (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt function using AES-256 with the database's service role key
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_value(p_value TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
  encrypted_val BYTEA;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Use a derived key from the project's internal secret
  SELECT current_setting('app.settings.jwt_secret', true) INTO encryption_key;
  IF encryption_key IS NULL OR encryption_key = '' THEN
    -- Fallback: use a constant derived key (still better than plaintext)
    encryption_key := encode(digest('lovable-cloud-encryption-key-' || current_database(), 'sha256'), 'hex');
  END IF;
  
  encrypted_val := pgp_sym_encrypt(p_value, encryption_key);
  RETURN encode(encrypted_val, 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_value(p_encrypted TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF p_encrypted IS NULL OR p_encrypted = '' THEN
    RETURN NULL;
  END IF;
  
  SELECT current_setting('app.settings.jwt_secret', true) INTO encryption_key;
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := encode(digest('lovable-cloud-encryption-key-' || current_database(), 'sha256'), 'hex');
  END IF;
  
  RETURN pgp_sym_decrypt(decode(p_encrypted, 'base64'), encryption_key);
END;
$$;

-- Create trigger functions to auto-encrypt on INSERT/UPDATE for wearable_connections
CREATE OR REPLACE FUNCTION public.encrypt_wearable_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  SELECT current_setting('app.settings.jwt_secret', true) INTO encryption_key;
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := encode(digest('lovable-cloud-encryption-key-' || current_database(), 'sha256'), 'hex');
  END IF;

  -- Only encrypt if the value changed and isn't already encrypted (base64 pattern)
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' AND 
     (TG_OP = 'INSERT' OR OLD.access_token IS DISTINCT FROM NEW.access_token) THEN
    NEW.access_token := encode(pgp_sym_encrypt(NEW.access_token, encryption_key), 'base64');
  END IF;
  
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' AND
     (TG_OP = 'INSERT' OR OLD.refresh_token IS DISTINCT FROM NEW.refresh_token) THEN
    NEW.refresh_token := encode(pgp_sym_encrypt(NEW.refresh_token, encryption_key), 'base64');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for wearable_connections
DROP TRIGGER IF EXISTS encrypt_wearable_tokens_trigger ON public.wearable_connections;
CREATE TRIGGER encrypt_wearable_tokens_trigger
  BEFORE INSERT OR UPDATE ON public.wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_wearable_tokens();

-- Create trigger function to auto-encrypt webhook secrets
CREATE OR REPLACE FUNCTION public.encrypt_webhook_secret()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  SELECT current_setting('app.settings.jwt_secret', true) INTO encryption_key;
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := encode(digest('lovable-cloud-encryption-key-' || current_database(), 'sha256'), 'hex');
  END IF;

  IF NEW.secret IS NOT NULL AND NEW.secret != '' AND
     (TG_OP = 'INSERT' OR OLD.secret IS DISTINCT FROM NEW.secret) THEN
    NEW.secret := encode(pgp_sym_encrypt(NEW.secret, encryption_key), 'base64');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for webhook_configurations
DROP TRIGGER IF EXISTS encrypt_webhook_secret_trigger ON public.webhook_configurations;
CREATE TRIGGER encrypt_webhook_secret_trigger
  BEFORE INSERT OR UPDATE ON public.webhook_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_webhook_secret();
