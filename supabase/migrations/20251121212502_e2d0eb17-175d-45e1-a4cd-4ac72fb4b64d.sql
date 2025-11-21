-- Atualizar tabela profiles para incluir campos profissionais
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('parent', 'therapist', 'educator', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_registration text;

-- Criar tabela children (substituindo child_profiles se necessário)
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles(id) NOT NULL,
  name text NOT NULL,
  birth_date date NOT NULL,
  gender text,
  neurodevelopmental_conditions jsonb DEFAULT '[]'::jsonb,
  sensory_profile jsonb DEFAULT '{}'::jsonb,
  consent_data_usage boolean DEFAULT false,
  consent_research boolean DEFAULT false,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de controle de acesso compartilhado
CREATE TABLE IF NOT EXISTS child_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES profiles(id) NOT NULL,
  access_level text CHECK (access_level IN ('view', 'edit', 'full')) NOT NULL,
  granted_at timestamp with time zone DEFAULT now(),
  granted_by uuid REFERENCES profiles(id) NOT NULL,
  expires_at timestamp with time zone,
  UNIQUE(child_id, professional_id)
);

-- Tabela de consentimentos LGPD
CREATE TABLE IF NOT EXISTS data_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES children(id),
  consent_type text NOT NULL,
  consent_given boolean NOT NULL,
  consent_version text NOT NULL,
  ip_address inet,
  user_agent text,
  consented_at timestamp with time zone DEFAULT now(),
  revoked_at timestamp with time zone
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para children
CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can create children"
  ON children FOR INSERT
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own children"
  ON children FOR UPDATE
  USING (parent_id = auth.uid());

CREATE POLICY "Professionals can view children with granted access"
  ON children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = children.id
      AND child_access.professional_id = auth.uid()
    )
  );

-- Políticas RLS para child_access
CREATE POLICY "Parents can view access grants for own children"
  ON child_access FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can grant access to own children"
  ON child_access FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view own access grants"
  ON child_access FOR SELECT
  USING (professional_id = auth.uid());

-- Políticas RLS para data_consents
CREATE POLICY "Users can view own consents"
  ON data_consents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own consents"
  ON data_consents FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Políticas RLS para audit_logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Trigger para atualizar updated_at em children
CREATE OR REPLACE FUNCTION update_children_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_children_updated_at();

-- Inserir versão inicial dos termos
INSERT INTO data_consents (user_id, consent_type, consent_given, consent_version, consented_at)
SELECT id, 'platform_terms_v1', false, '1.0.0', now()
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM data_consents 
  WHERE data_consents.user_id = profiles.id 
  AND consent_type = 'platform_terms_v1'
)
ON CONFLICT DO NOTHING;