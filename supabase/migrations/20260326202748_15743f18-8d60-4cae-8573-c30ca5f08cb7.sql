
-- =============================================
-- CME MODULE - DATABASE STRUCTURE
-- =============================================

-- 1. Equipamentos (autoclaves, lavadoras, etc.)
CREATE TABLE public.cme_equipamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'autoclave',
  modelo text,
  numero_serie text,
  fabricante text,
  localizacao text,
  status text NOT NULL DEFAULT 'ativo',
  ultima_manutencao timestamp with time zone,
  proxima_manutencao timestamp with time zone,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_equipamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME equipamentos visíveis autenticados" ON public.cme_equipamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME equipamentos insert autenticados" ON public.cme_equipamentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME equipamentos update autenticados" ON public.cme_equipamentos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "CME equipamentos delete autenticados" ON public.cme_equipamentos FOR DELETE TO authenticated USING (true);

-- 2. Materiais / Instrumentais
CREATE TABLE public.cme_materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nome text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'instrumental',
  categoria text,
  especialidade text,
  setor_principal text,
  criticidade text NOT NULL DEFAULT 'semi_critico',
  complexidade text DEFAULT 'media',
  necessita_montagem_kit boolean DEFAULT false,
  embalagem_especifica boolean DEFAULT false,
  metodo_esterilizacao text DEFAULT 'vapor',
  tempo_processamento_min integer,
  status text NOT NULL DEFAULT 'ativo',
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_materiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME materiais select" ON public.cme_materiais FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME materiais insert" ON public.cme_materiais FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME materiais update" ON public.cme_materiais FOR UPDATE TO authenticated USING (true);
CREATE POLICY "CME materiais delete" ON public.cme_materiais FOR DELETE TO authenticated USING (true);

-- 3. Kits / Caixas Cirúrgicas
CREATE TABLE public.cme_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text,
  especialidade text,
  tipo_embalagem text,
  metodo_esterilizacao text DEFAULT 'vapor',
  instrucoes_montagem text,
  setores_uso text,
  status text NOT NULL DEFAULT 'ativo',
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME kits select" ON public.cme_kits FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME kits insert" ON public.cme_kits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME kits update" ON public.cme_kits FOR UPDATE TO authenticated USING (true);
CREATE POLICY "CME kits delete" ON public.cme_kits FOR DELETE TO authenticated USING (true);

-- 4. Itens do Kit
CREATE TABLE public.cme_kit_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id uuid NOT NULL REFERENCES public.cme_kits(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.cme_materiais(id) ON DELETE CASCADE,
  quantidade integer NOT NULL DEFAULT 1,
  obrigatorio boolean DEFAULT true,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_kit_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME kit_itens select" ON public.cme_kit_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME kit_itens insert" ON public.cme_kit_itens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME kit_itens update" ON public.cme_kit_itens FOR UPDATE TO authenticated USING (true);
CREATE POLICY "CME kit_itens delete" ON public.cme_kit_itens FOR DELETE TO authenticated USING (true);

-- 5. Recebimentos (Expurgo)
CREATE TABLE public.cme_recebimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setor_origem text NOT NULL,
  profissional_entregou text,
  recebido_por uuid REFERENCES public.profiles(id),
  data_recebimento timestamp with time zone NOT NULL DEFAULT now(),
  tipo_material text NOT NULL,
  kit_id uuid REFERENCES public.cme_kits(id),
  material_id uuid REFERENCES public.cme_materiais(id),
  quantidade integer NOT NULL DEFAULT 1,
  situacao_sujidade text DEFAULT 'contaminado',
  prioridade text DEFAULT 'normal',
  status text NOT NULL DEFAULT 'recebido_expurgo',
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_recebimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME recebimentos select" ON public.cme_recebimentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME recebimentos insert" ON public.cme_recebimentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME recebimentos update" ON public.cme_recebimentos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "CME recebimentos delete" ON public.cme_recebimentos FOR DELETE TO authenticated USING (true);

-- 6. Etapas de Processamento
CREATE TABLE public.cme_etapas_processamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recebimento_id uuid NOT NULL REFERENCES public.cme_recebimentos(id) ON DELETE CASCADE,
  etapa text NOT NULL,
  responsavel_id uuid REFERENCES public.profiles(id),
  data_inicio timestamp with time zone NOT NULL DEFAULT now(),
  data_fim timestamp with time zone,
  tipo_limpeza text,
  equipamento_utilizado text,
  inspecao_visual boolean,
  integridade_ok boolean,
  embalagem_utilizada text,
  selagem_ok boolean,
  checklist jsonb,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_etapas_processamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME etapas select" ON public.cme_etapas_processamento FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME etapas insert" ON public.cme_etapas_processamento FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME etapas update" ON public.cme_etapas_processamento FOR UPDATE TO authenticated USING (true);

-- 7. Cargas de Esterilização
CREATE TABLE public.cme_cargas_esterilizacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_carga text NOT NULL,
  lote text NOT NULL,
  equipamento_id uuid REFERENCES public.cme_equipamentos(id),
  metodo text NOT NULL DEFAULT 'vapor',
  operador_id uuid REFERENCES public.profiles(id),
  data_inicio timestamp with time zone NOT NULL DEFAULT now(),
  data_fim timestamp with time zone,
  temperatura numeric,
  pressao numeric,
  tempo_minutos integer,
  indicador_quimico text,
  indicador_biologico text,
  integrador text,
  resultado text DEFAULT 'em_andamento',
  liberado_por uuid REFERENCES public.profiles(id),
  data_liberacao timestamp with time zone,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_cargas_esterilizacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME cargas select" ON public.cme_cargas_esterilizacao FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME cargas insert" ON public.cme_cargas_esterilizacao FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME cargas update" ON public.cme_cargas_esterilizacao FOR UPDATE TO authenticated USING (true);
CREATE POLICY "CME cargas delete" ON public.cme_cargas_esterilizacao FOR DELETE TO authenticated USING (true);

-- 8. Itens da Carga
CREATE TABLE public.cme_carga_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid NOT NULL REFERENCES public.cme_cargas_esterilizacao(id) ON DELETE CASCADE,
  recebimento_id uuid REFERENCES public.cme_recebimentos(id),
  kit_id uuid REFERENCES public.cme_kits(id),
  material_id uuid REFERENCES public.cme_materiais(id),
  quantidade integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_carga_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME carga_itens select" ON public.cme_carga_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME carga_itens insert" ON public.cme_carga_itens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME carga_itens update" ON public.cme_carga_itens FOR UPDATE TO authenticated USING (true);
CREATE POLICY "CME carga_itens delete" ON public.cme_carga_itens FOR DELETE TO authenticated USING (true);

-- 9. Testes de Qualidade
CREATE TABLE public.cme_testes_qualidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid REFERENCES public.cme_cargas_esterilizacao(id),
  equipamento_id uuid REFERENCES public.cme_equipamentos(id),
  tipo_teste text NOT NULL,
  data_teste timestamp with time zone NOT NULL DEFAULT now(),
  resultado text NOT NULL DEFAULT 'pendente',
  responsavel_id uuid REFERENCES public.profiles(id),
  lote_indicador text,
  acao_corretiva text,
  situacao text DEFAULT 'aberto',
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_testes_qualidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME testes select" ON public.cme_testes_qualidade FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME testes insert" ON public.cme_testes_qualidade FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME testes update" ON public.cme_testes_qualidade FOR UPDATE TO authenticated USING (true);

-- 10. Armazenamento
CREATE TABLE public.cme_armazenamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid REFERENCES public.cme_cargas_esterilizacao(id),
  kit_id uuid REFERENCES public.cme_kits(id),
  material_id uuid REFERENCES public.cme_materiais(id),
  lote text NOT NULL,
  data_esterilizacao timestamp with time zone NOT NULL,
  data_validade timestamp with time zone NOT NULL,
  local_armazenamento text,
  prateleira text,
  quantidade integer NOT NULL DEFAULT 1,
  reservado_para text,
  status text NOT NULL DEFAULT 'disponivel',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_armazenamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME armazenamento select" ON public.cme_armazenamento FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME armazenamento insert" ON public.cme_armazenamento FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME armazenamento update" ON public.cme_armazenamento FOR UPDATE TO authenticated USING (true);

-- 11. Distribuições
CREATE TABLE public.cme_distribuicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  armazenamento_id uuid REFERENCES public.cme_armazenamento(id),
  kit_id uuid REFERENCES public.cme_kits(id),
  material_id uuid REFERENCES public.cme_materiais(id),
  setor_destino text NOT NULL,
  profissional_solicitante text,
  quantidade integer NOT NULL DEFAULT 1,
  lote text NOT NULL,
  entregue_por uuid REFERENCES public.profiles(id),
  recebido_por text,
  data_distribuicao timestamp with time zone NOT NULL DEFAULT now(),
  finalidade text,
  status text NOT NULL DEFAULT 'separado',
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_distribuicoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME distribuicoes select" ON public.cme_distribuicoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME distribuicoes insert" ON public.cme_distribuicoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME distribuicoes update" ON public.cme_distribuicoes FOR UPDATE TO authenticated USING (true);

-- 12. Devoluções
CREATE TABLE public.cme_devolucoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribuicao_id uuid REFERENCES public.cme_distribuicoes(id),
  setor_devolvente text NOT NULL,
  motivo text NOT NULL,
  usado boolean DEFAULT true,
  violacao_embalagem boolean DEFAULT false,
  validade_expirada boolean DEFAULT false,
  material_danificado boolean DEFAULT false,
  destino_final text DEFAULT 'reprocessamento',
  responsavel_id uuid REFERENCES public.profiles(id),
  data_devolucao timestamp with time zone NOT NULL DEFAULT now(),
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_devolucoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME devolucoes select" ON public.cme_devolucoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME devolucoes insert" ON public.cme_devolucoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME devolucoes update" ON public.cme_devolucoes FOR UPDATE TO authenticated USING (true);

-- 13. Não Conformidades
CREATE TABLE public.cme_nao_conformidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  descricao text NOT NULL,
  carga_id uuid REFERENCES public.cme_cargas_esterilizacao(id),
  equipamento_id uuid REFERENCES public.cme_equipamentos(id),
  material_id uuid REFERENCES public.cme_materiais(id),
  kit_id uuid REFERENCES public.cme_kits(id),
  severidade text NOT NULL DEFAULT 'media',
  acao_corretiva text,
  responsavel_id uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'aberta',
  data_ocorrencia timestamp with time zone NOT NULL DEFAULT now(),
  data_resolucao timestamp with time zone,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_nao_conformidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME nc select" ON public.cme_nao_conformidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME nc insert" ON public.cme_nao_conformidades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CME nc update" ON public.cme_nao_conformidades FOR UPDATE TO authenticated USING (true);

-- 14. Logs de Rastreabilidade
CREATE TABLE public.cme_logs_rastreabilidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo text NOT NULL,
  entidade_id uuid NOT NULL,
  acao text NOT NULL,
  usuario_id uuid REFERENCES public.profiles(id),
  detalhes jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.cme_logs_rastreabilidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CME logs select" ON public.cme_logs_rastreabilidade FOR SELECT TO authenticated USING (true);
CREATE POLICY "CME logs insert" ON public.cme_logs_rastreabilidade FOR INSERT TO authenticated WITH CHECK (true);
