
-- Tabela de certificados ABA+
CREATE TABLE public.aba_certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificado_hash TEXT NOT NULL,
  valido_ate TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ativo BOOLEAN DEFAULT true
);

ALTER TABLE public.aba_certificados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage aba_certificados"
ON public.aba_certificados FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de aprendizes ABA+
CREATE TABLE public.aba_aprendizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_aprendiz TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT,
  sexo TEXT,
  data_nascimento DATE,
  convenio TEXT,
  nivel_suporte TEXT,
  ativo BOOLEAN DEFAULT true,
  child_id UUID REFERENCES public.children(id),
  raw_json JSONB,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aba_aprendizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and therapists can view aba_aprendizes"
ON public.aba_aprendizes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'therapist')
);

CREATE POLICY "Admins can manage aba_aprendizes"
ON public.aba_aprendizes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de profissionais ABA+
CREATE TABLE public.aba_profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_profissional TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT,
  especialidade TEXT,
  cargo TEXT,
  ativo BOOLEAN DEFAULT true,
  profile_id UUID REFERENCES public.profiles(id),
  raw_json JSONB,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aba_profissionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and therapists can view aba_profissionais"
ON public.aba_profissionais FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'therapist')
);

CREATE POLICY "Admins can manage aba_profissionais"
ON public.aba_profissionais FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de agendamentos ABA+
CREATE TABLE public.aba_agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_agendamento TEXT UNIQUE,
  codigo_aprendiz TEXT REFERENCES public.aba_aprendizes(codigo_aprendiz),
  codigo_profissional TEXT REFERENCES public.aba_profissionais(codigo_profissional),
  tipo TEXT,
  situacao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  raw_json JSONB,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aba_agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and therapists can view aba_agendamentos"
ON public.aba_agendamentos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'therapist')
);

CREATE POLICY "Admins can manage aba_agendamentos"
ON public.aba_agendamentos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de atendimentos ABA+
CREATE TABLE public.aba_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador TEXT UNIQUE,
  codigo_aprendiz TEXT REFERENCES public.aba_aprendizes(codigo_aprendiz),
  tipo TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  falta BOOLEAN DEFAULT false,
  observacoes TEXT,
  data_alteracao TIMESTAMP WITH TIME ZONE,
  raw_json JSONB,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aba_atendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and therapists can view aba_atendimentos"
ON public.aba_atendimentos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'therapist')
);

CREATE POLICY "Admins can manage aba_atendimentos"
ON public.aba_atendimentos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de desempenho ABA+
CREATE TABLE public.aba_desempenho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador_sessao TEXT,
  identificador_programa TEXT,
  codigo_aprendiz TEXT REFERENCES public.aba_aprendizes(codigo_aprendiz),
  habilidade TEXT,
  programa TEXT,
  percentual_erro NUMERIC,
  percentual_ajuda NUMERIC,
  percentual_independencia NUMERIC,
  nivel_independencia TEXT,
  raw_json JSONB,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aba_desempenho ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and therapists can view aba_desempenho"
ON public.aba_desempenho FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'therapist')
);

CREATE POLICY "Admins can manage aba_desempenho"
ON public.aba_desempenho FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de sync logs
CREATE TABLE public.aba_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started',
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

ALTER TABLE public.aba_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view aba_sync_logs"
ON public.aba_sync_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage aba_sync_logs"
ON public.aba_sync_logs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de score de progresso neuro
CREATE TABLE public.aba_neuro_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_aprendiz TEXT REFERENCES public.aba_aprendizes(codigo_aprendiz),
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  score_components JSONB,
  alert_type TEXT,
  alert_message TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aba_neuro_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and therapists can view aba_neuro_scores"
ON public.aba_neuro_scores FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'therapist')
);

CREATE POLICY "Admins can manage aba_neuro_scores"
ON public.aba_neuro_scores FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_aba_aprendizes_codigo ON public.aba_aprendizes(codigo_aprendiz);
CREATE INDEX idx_aba_profissionais_codigo ON public.aba_profissionais(codigo_profissional);
CREATE INDEX idx_aba_agendamentos_aprendiz ON public.aba_agendamentos(codigo_aprendiz);
CREATE INDEX idx_aba_atendimentos_aprendiz ON public.aba_atendimentos(codigo_aprendiz);
CREATE INDEX idx_aba_desempenho_aprendiz ON public.aba_desempenho(codigo_aprendiz);
CREATE INDEX idx_aba_desempenho_sessao ON public.aba_desempenho(identificador_sessao);
CREATE INDEX idx_aba_neuro_scores_aprendiz ON public.aba_neuro_scores(codigo_aprendiz);
CREATE INDEX idx_aba_neuro_scores_calculated ON public.aba_neuro_scores(calculated_at DESC);
