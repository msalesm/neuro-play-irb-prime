-- Tabela de versões de termos/políticas
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('terms_of_use', 'privacy_policy', 'clinical_disclaimer', 'data_processing', 'research_consent')),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  is_active BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de consentimentos do usuário
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.legal_documents(id),
  consent_given BOOLEAN NOT NULL,
  consent_method TEXT NOT NULL CHECK (consent_method IN ('checkbox', 'signature', 'verbal', 'guardian')),
  ip_address INET,
  user_agent TEXT,
  consented_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT
);

-- Índices para performance
CREATE INDEX idx_user_consents_user ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_document ON public.user_consents(document_id);
CREATE INDEX idx_legal_documents_type_active ON public.legal_documents(document_type, is_active);

-- Constraint única: apenas um documento ativo por tipo
CREATE UNIQUE INDEX idx_legal_documents_active_unique ON public.legal_documents(document_type) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Políticas para legal_documents
CREATE POLICY "Anyone can view active legal documents"
  ON public.legal_documents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage legal documents"
  ON public.legal_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Políticas para user_consents
CREATE POLICY "Users can view own consents"
  ON public.user_consents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can revoke own consents"
  ON public.user_consents FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND revoked_at IS NOT NULL);

CREATE POLICY "Admins can view all consents"
  ON public.user_consents FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Tabela de logs de auditoria clínica (complementar ao audit_logs existente)
CREATE TABLE public.clinical_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  professional_id UUID REFERENCES auth.users(id),
  child_id UUID REFERENCES public.children(id),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'view_record', 'edit_record', 'create_assessment', 'complete_assessment',
    'schedule_teleconsult', 'start_teleconsult', 'end_teleconsult',
    'generate_report', 'export_data', 'share_access', 'revoke_access',
    'add_note', 'edit_note', 'delete_note'
  )),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para clinical_audit_logs
CREATE INDEX idx_clinical_audit_user ON public.clinical_audit_logs(user_id);
CREATE INDEX idx_clinical_audit_child ON public.clinical_audit_logs(child_id);
CREATE INDEX idx_clinical_audit_created ON public.clinical_audit_logs(created_at DESC);
CREATE INDEX idx_clinical_audit_action ON public.clinical_audit_logs(action_type);

-- Enable RLS
ALTER TABLE public.clinical_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para clinical_audit_logs (apenas leitura, imutável)
CREATE POLICY "Professionals can view audit logs for their children"
  ON public.clinical_audit_logs FOR SELECT
  USING (
    user_id = auth.uid() OR
    professional_id = auth.uid() OR
    has_child_access(auth.uid(), child_id) OR
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can insert audit logs"
  ON public.clinical_audit_logs FOR INSERT
  WITH CHECK (true);

-- Função helper para inserir log de auditoria clínica
CREATE OR REPLACE FUNCTION public.log_clinical_audit(
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_child_id UUID DEFAULT NULL,
  p_action_details JSONB DEFAULT '{}',
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO clinical_audit_logs (
    user_id, professional_id, child_id, action_type, 
    resource_type, resource_id, action_details, user_agent
  ) VALUES (
    auth.uid(),
    CASE WHEN has_role(auth.uid(), 'therapist') THEN auth.uid() ELSE NULL END,
    p_child_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_action_details,
    p_user_agent
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Função para verificar se usuário tem todos os consentimentos obrigatórios
CREATE OR REPLACE FUNCTION public.has_required_consents(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM legal_documents ld
    WHERE ld.is_active = true 
      AND ld.document_type IN ('terms_of_use', 'privacy_policy')
      AND NOT EXISTS (
        SELECT 1 FROM user_consents uc
        WHERE uc.user_id = p_user_id
          AND uc.document_id = ld.id
          AND uc.consent_given = true
          AND uc.revoked_at IS NULL
      )
  );
$$;

-- Inserir documentos legais iniciais
INSERT INTO public.legal_documents (document_type, version, title, content, summary, is_active, published_at) VALUES
('terms_of_use', '1.0', 'Termos de Uso NeuroPlay', 
'# Termos de Uso

## 1. Aceitação dos Termos
Ao acessar e usar a plataforma NeuroPlay, você concorda com estes termos.

## 2. Descrição do Serviço
NeuroPlay é uma plataforma clínico-terapêutica digital para triagem e acompanhamento neurodesenvolvimentais.

## 3. Uso Apropriado
A plataforma deve ser utilizada apenas para fins terapêuticos e educacionais.

## 4. Limitações
Os resultados das triagens NÃO constituem diagnóstico médico.

## 5. Responsabilidades
O usuário é responsável pela veracidade das informações fornecidas.',
'Termos gerais de uso da plataforma NeuroPlay', true, now()),

('privacy_policy', '1.0', 'Política de Privacidade - LGPD',
'# Política de Privacidade

## 1. Dados Coletados
- Dados de identificação (nome, email)
- Dados de saúde (condições neurodesenvolvimentais, triagens)
- Dados de uso (sessões de jogos, progresso)

## 2. Finalidade
Os dados são utilizados exclusivamente para:
- Personalização terapêutica
- Geração de relatórios clínicos
- Melhoria dos serviços

## 3. Base Legal (LGPD)
- Consentimento do titular
- Execução de contrato
- Legítimo interesse

## 4. Direitos do Titular
- Acesso aos dados
- Correção de dados incompletos
- Anonimização ou bloqueio
- Portabilidade
- Eliminação

## 5. Compartilhamento
Dados são compartilhados apenas com profissionais autorizados pelo responsável.

## 6. Segurança
Implementamos medidas técnicas e organizacionais para proteção dos dados.',
'Política de privacidade conforme LGPD', true, now()),

('clinical_disclaimer', '1.0', 'Declaração Clínica',
'# Declaração Clínica

## Importante
A plataforma NeuroPlay oferece ferramentas de TRIAGEM e ACOMPANHAMENTO, não substituindo avaliação profissional.

## Limitações
- Resultados são indicativos, não diagnósticos
- Triagens não substituem avaliação por profissional qualificado
- Recomendações são baseadas em evidências, mas devem ser validadas clinicamente

## Recomendação
Sempre consulte um profissional de saúde qualificado para diagnóstico e tratamento.',
'Declaração sobre limitações clínicas da plataforma', true, now()),

('data_processing', '1.0', 'Consentimento para Processamento de Dados',
'# Consentimento para Processamento de Dados

Autorizo o processamento de dados pessoais e sensíveis para:
- Personalização de atividades terapêuticas
- Geração de relatórios de progresso
- Análise por profissionais autorizados
- Melhoria contínua dos algoritmos de recomendação',
'Consentimento para uso de dados em análises', true, now()),

('research_consent', '1.0', 'Consentimento para Pesquisa',
'# Consentimento para Pesquisa

Autorizo o uso de dados anonimizados para:
- Pesquisas científicas sobre neurodesenvolvimento
- Melhoria de protocolos terapêuticos
- Publicações acadêmicas (sem identificação individual)

Este consentimento é OPCIONAL e pode ser revogado a qualquer momento.',
'Consentimento opcional para uso em pesquisas', true, now());