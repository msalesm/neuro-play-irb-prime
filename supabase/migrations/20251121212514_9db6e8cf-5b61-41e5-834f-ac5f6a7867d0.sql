-- Corrigir search_path da função update_children_updated_at
DROP FUNCTION IF EXISTS update_children_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_children_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_children_updated_at();