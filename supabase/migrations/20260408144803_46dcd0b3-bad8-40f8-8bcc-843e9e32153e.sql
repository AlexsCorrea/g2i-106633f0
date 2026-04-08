
-- Tabela de tipos de conselho profissional
CREATE TABLE IF NOT EXISTS public.tipo_conselho_profissional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  sigla text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tipo_conselho_profissional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read tipo_conselho" ON public.tipo_conselho_profissional FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage tipo_conselho" ON public.tipo_conselho_profissional FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tabela de CBO
CREATE TABLE IF NOT EXISTS public.solicitante_cbo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  descricao text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.solicitante_cbo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read solicitante_cbo" ON public.solicitante_cbo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage solicitante_cbo" ON public.solicitante_cbo FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tabela de situações cadastrais
CREATE TABLE IF NOT EXISTS public.situacao_cadastral (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.situacao_cadastral ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read situacao" ON public.situacao_cadastral FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage situacao" ON public.situacao_cadastral FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tabela de unidades
CREATE TABLE IF NOT EXISTS public.unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read unidades" ON public.unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage unidades" ON public.unidades FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tabela principal de solicitantes
CREATE TABLE IF NOT EXISTS public.solicitantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  conselho text NOT NULL,
  sigla text NOT NULL,
  cpf text NOT NULL,
  situacao_id uuid REFERENCES public.situacao_cadastral(id),
  unidade_id uuid REFERENCES public.unidades(id),
  cbo_id uuid REFERENCES public.solicitante_cbo(id),
  tipo_conselho_id uuid REFERENCES public.tipo_conselho_profissional(id),
  login text,
  senha text,
  -- Endereço
  cep text,
  endereco text,
  numero text,
  complemento text,
  bairro text,
  estado text,
  cidade text,
  fone1 text,
  fone2 text,
  -- Produtividade
  produtividade_habilitado boolean DEFAULT false,
  produtividade_percentual numeric(5,2) DEFAULT 0,
  produtividade_perc_recebe_vl_caixa numeric(5,2) DEFAULT 0,
  produtividade_perc_recebe_vl_convenio numeric(5,2) DEFAULT 0,
  produtividade_perc_desconto_vl_caixa numeric(5,2) DEFAULT 0,
  produtividade_perc_desconto_vl_convenio numeric(5,2) DEFAULT 0,
  -- Auditoria
  user_id uuid REFERENCES public.profiles(id),
  user_modified uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.solicitantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read solicitantes" ON public.solicitantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage solicitantes" ON public.solicitantes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_solicitantes_cpf ON public.solicitantes(cpf);
CREATE INDEX idx_solicitantes_nome ON public.solicitantes(nome);
CREATE INDEX idx_solicitantes_situacao ON public.solicitantes(situacao_id);
CREATE INDEX idx_solicitantes_unidade ON public.solicitantes(unidade_id);

-- Seed data
INSERT INTO public.situacao_cadastral (nome) VALUES ('Ativo'), ('Inativo'), ('Bloqueado');

INSERT INTO public.tipo_conselho_profissional (nome, sigla) VALUES
  ('Conselho Regional de Medicina', 'CRM'),
  ('Conselho Regional de Enfermagem', 'COREN'),
  ('Conselho Regional de Odontologia', 'CRO'),
  ('Conselho Regional de Farmácia', 'CRF'),
  ('Conselho Regional de Psicologia', 'CRP'),
  ('Conselho Regional de Nutricionistas', 'CRN'),
  ('Conselho Regional de Fisioterapia e Terapia Ocupacional', 'CREFITO'),
  ('Conselho Regional de Fonoaudiologia', 'CREFONO'),
  ('Conselho Regional de Serviço Social', 'CRESS'),
  ('Conselho Regional de Biomedicina', 'CRBM');

INSERT INTO public.solicitante_cbo (codigo, descricao) VALUES
  ('000000', 'Não informado'),
  ('225125', 'Médico clínico'),
  ('225130', 'Médico cirurgião geral'),
  ('225142', 'Médico ginecologista e obstetra'),
  ('225155', 'Médico pediatra'),
  ('225170', 'Médico psiquiatra'),
  ('223505', 'Enfermeiro'),
  ('223208', 'Cirurgião-dentista clínico geral'),
  ('223405', 'Farmacêutico'),
  ('225250', 'Médico ortopedista e traumatologista'),
  ('225285', 'Médico cardiologista'),
  ('251510', 'Psicólogo clínico');

INSERT INTO public.unidades (nome, codigo) VALUES
  ('Unidade Principal', 'UP'),
  ('Ambulatório', 'AMB'),
  ('Pronto-Atendimento', 'PA'),
  ('Centro Cirúrgico', 'CC');
