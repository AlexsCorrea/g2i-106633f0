
CREATE TABLE public.lab_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  integration_type text NOT NULL DEFAULT 'api_rest',
  environment text NOT NULL DEFAULT 'homologacao',
  endpoint_url text,
  username text,
  credential_token text,
  timeout_seconds integer DEFAULT 30,
  retry_attempts integer DEFAULT 3,
  retry_interval_seconds integer DEFAULT 60,
  sends_pdf boolean NOT NULL DEFAULT false,
  sends_image boolean NOT NULL DEFAULT false,
  sends_external_protocol boolean NOT NULL DEFAULT true,
  accepts_partial boolean NOT NULL DEFAULT true,
  allows_recollection boolean NOT NULL DEFAULT true,
  returns_rejection_code boolean NOT NULL DEFAULT true,
  sla_hours integer DEFAULT 48,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_partners_auth" ON public.lab_partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lab_exam_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.lab_exams(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.lab_partners(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES public.lab_equipment(id) ON DELETE CASCADE,
  external_code text NOT NULL,
  external_name text,
  external_method text,
  external_material text,
  external_sector text,
  loinc_code text,
  tuss_code text,
  expected_hours integer,
  criticality text DEFAULT 'normal',
  version integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_exam_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_exam_mappings_auth" ON public.lab_exam_mappings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lab_external_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  partner_id uuid NOT NULL REFERENCES public.lab_partners(id),
  request_id uuid REFERENCES public.lab_requests(id),
  patient_id uuid REFERENCES public.patients(id),
  attendance_id uuid REFERENCES public.attendances(id),
  external_protocol text,
  insurance_name text,
  requesting_doctor text,
  unit text,
  priority text NOT NULL DEFAULT 'rotina',
  clinical_notes text,
  material text,
  internal_status text NOT NULL DEFAULT 'rascunho',
  external_status text,
  sent_at timestamptz,
  received_at timestamptz,
  result_at timestamptz,
  sent_by uuid REFERENCES public.profiles(id),
  error_message text,
  payload_sent jsonb,
  payload_received jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_external_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_external_orders_auth" ON public.lab_external_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lab_external_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.lab_external_orders(id) ON DELETE CASCADE,
  request_item_id uuid REFERENCES public.lab_request_items(id),
  exam_id uuid REFERENCES public.lab_exams(id),
  mapping_id uuid REFERENCES public.lab_exam_mappings(id),
  external_code text,
  external_name text,
  status text NOT NULL DEFAULT 'pendente',
  result_value text,
  result_unit text,
  result_reference text,
  is_critical boolean NOT NULL DEFAULT false,
  is_abnormal boolean NOT NULL DEFAULT false,
  attachment_url text,
  rejection_code text,
  rejection_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_external_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_external_order_items_auth" ON public.lab_external_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lab_integration_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_type text NOT NULL DEFAULT 'apoio',
  direction text NOT NULL DEFAULT 'outbound',
  partner_id uuid REFERENCES public.lab_partners(id),
  equipment_id uuid REFERENCES public.lab_equipment(id),
  order_id uuid REFERENCES public.lab_external_orders(id),
  sample_id uuid REFERENCES public.lab_samples(id),
  request_item_id uuid REFERENCES public.lab_request_items(id),
  patient_id uuid REFERENCES public.patients(id),
  status text NOT NULL DEFAULT 'pendente',
  attempt integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  next_retry_at timestamptz,
  payload_sent jsonb,
  payload_received jsonb,
  response_status integer,
  response_time_ms integer,
  error_message text,
  error_stack text,
  endpoint_url text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_integration_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_integration_queue_auth" ON public.lab_integration_queue FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lab_integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level text NOT NULL DEFAULT 'info',
  log_type text NOT NULL DEFAULT 'tecnico',
  queue_id uuid REFERENCES public.lab_integration_queue(id),
  partner_id uuid REFERENCES public.lab_partners(id),
  equipment_id uuid REFERENCES public.lab_equipment(id),
  order_id uuid REFERENCES public.lab_external_orders(id),
  entity_type text,
  entity_id uuid,
  action text NOT NULL,
  message text,
  endpoint text,
  http_status integer,
  response_time_ms integer,
  payload jsonb,
  response jsonb,
  error_details text,
  performed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_integration_logs_select" ON public.lab_integration_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_integration_logs_insert" ON public.lab_integration_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.lab_external_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES public.lab_external_order_items(id),
  partner_id uuid NOT NULL REFERENCES public.lab_partners(id),
  patient_id uuid REFERENCES public.patients(id),
  external_protocol text,
  exam_code text,
  exam_name text,
  value text,
  numeric_value numeric,
  unit text,
  reference_text text,
  is_critical boolean NOT NULL DEFAULT false,
  is_abnormal boolean NOT NULL DEFAULT false,
  observation text,
  attachment_url text,
  raw_payload jsonb,
  conference_status text NOT NULL DEFAULT 'pendente',
  conferenced_by uuid REFERENCES public.profiles(id),
  conferenced_at timestamptz,
  released_at timestamptz,
  released_by uuid REFERENCES public.profiles(id),
  linked_result_id uuid REFERENCES public.lab_results(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_external_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_external_results_auth" ON public.lab_external_results FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lab_integration_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type text NOT NULL,
  severity text NOT NULL DEFAULT 'media',
  partner_id uuid REFERENCES public.lab_partners(id),
  equipment_id uuid REFERENCES public.lab_equipment(id),
  order_id uuid REFERENCES public.lab_external_orders(id),
  queue_id uuid REFERENCES public.lab_integration_queue(id),
  patient_id uuid REFERENCES public.patients(id),
  description text NOT NULL,
  resolution text,
  status text NOT NULL DEFAULT 'aberta',
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_integration_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_integration_issues_auth" ON public.lab_integration_issues FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SEED
INSERT INTO public.lab_partners (name, code, integration_type, environment, endpoint_url, sla_hours, sends_pdf, active, notes) VALUES
  ('Hermes Pardini', 'HERMES', 'api_rest', 'homologacao', 'https://api.hermespardini.com.br/v1', 24, true, true, 'Principal laboratório de apoio'),
  ('Dasa Apoio', 'DASA', 'api_rest', 'homologacao', 'https://api.dasa.com.br/lab/v2', 48, true, true, 'Apoio exames especializados'),
  ('Lab Regional Sul', 'LRSUL', 'sftp', 'producao', 'sftp://labsul.example.com', 72, false, true, 'Laboratório regional'),
  ('Citologia Express', 'CITO', 'email', 'producao', NULL, 120, true, false, 'Citopatologia — inativo');

DO $$
DECLARE
  v_hermes uuid; v_dasa uuid;
  v_tsh uuid; v_bhcg uuid; v_pcr uuid; v_creat uuid; v_glic uuid; v_hemo uuid;
  v_eq_bio uuid; v_eq_hem uuid;
BEGIN
  SELECT id INTO v_hermes FROM public.lab_partners WHERE code='HERMES';
  SELECT id INTO v_dasa FROM public.lab_partners WHERE code='DASA';
  SELECT id INTO v_tsh FROM public.lab_exams WHERE code='HOR01';
  SELECT id INTO v_bhcg FROM public.lab_exams WHERE code='HOR02';
  SELECT id INTO v_pcr FROM public.lab_exams WHERE code='IMU01';
  SELECT id INTO v_creat FROM public.lab_exams WHERE code='BIO03';
  SELECT id INTO v_glic FROM public.lab_exams WHERE code='BIO01';
  SELECT id INTO v_hemo FROM public.lab_exams WHERE code='HEM01';
  SELECT id INTO v_eq_bio FROM public.lab_equipment WHERE name LIKE '%AU680%' LIMIT 1;
  SELECT id INTO v_eq_hem FROM public.lab_equipment WHERE name LIKE '%XN-1000%' LIMIT 1;

  INSERT INTO public.lab_exam_mappings (exam_id, partner_id, external_code, external_name, loinc_code, expected_hours) VALUES
    (v_tsh, v_hermes, 'HP-TSH01', 'TSH Ultrassensível', '11580-8', 12),
    (v_bhcg, v_hermes, 'HP-BHCG01', 'Beta-HCG Quantitativo', '19080-1', 6),
    (v_pcr, v_hermes, 'HP-PCR01', 'PCR', '1988-5', 8),
    (v_creat, v_dasa, 'DA-CREAT', 'Creatinina Sérica', NULL, 24);

  INSERT INTO public.lab_exam_mappings (exam_id, equipment_id, external_code, external_name) VALUES
    (v_glic, v_eq_bio, 'GLU', 'Glucose'),
    (v_creat, v_eq_bio, 'CREA', 'Creatinine'),
    (v_hemo, v_eq_hem, 'CBC', 'Complete Blood Count');

  INSERT INTO public.lab_external_orders (order_number, partner_id, external_protocol, priority, internal_status, external_status, sent_at, material) VALUES
    ('EXT-2026-0001', v_hermes, 'HP-98765', 'rotina', 'enviado', 'recebido', now()-interval '2h', 'Soro'),
    ('EXT-2026-0002', v_hermes, 'HP-98766', 'urgente', 'resultado_parcial', 'em_processamento', now()-interval '1d', 'Soro'),
    ('EXT-2026-0003', v_dasa, 'DA-45001', 'rotina', 'enviado', 'recebido', now()-interval '3h', 'Soro'),
    ('EXT-2026-0004', v_hermes, NULL, 'rotina', 'falha_envio', NULL, NULL, 'Soro'),
    ('EXT-2026-0005', v_dasa, 'DA-45002', 'urgente', 'resultado_final', 'concluido', now()-interval '1d', 'Soro');

  INSERT INTO public.lab_integration_queue (queue_type, direction, partner_id, status, attempt, payload_sent, response_status, response_time_ms) VALUES
    ('apoio', 'outbound', v_hermes, 'sucesso', 1, '{"o":"0001"}'::jsonb, 200, 345),
    ('apoio', 'outbound', v_dasa, 'sucesso', 1, '{"o":"0003"}'::jsonb, 200, 890),
    ('apoio', 'inbound', v_dasa, 'sucesso', 1, NULL, 200, 120);

  INSERT INTO public.lab_integration_queue (queue_type, direction, partner_id, status, attempt, payload_sent, response_status, response_time_ms, error_message) VALUES
    ('apoio', 'outbound', v_hermes, 'erro', 3, '{"o":"0004"}'::jsonb, 500, 2100, 'Connection timeout');

  INSERT INTO public.lab_integration_queue (queue_type, direction, equipment_id, status, attempt, payload_sent, error_message) VALUES
    ('equipamento', 'inbound', v_eq_bio, 'sucesso', 1, '{"test":"GLU","value":"92"}'::jsonb, NULL),
    ('equipamento', 'inbound', v_eq_bio, 'erro_parsing', 1, '{"raw":"BAD"}'::jsonb, 'Parse failed');

  INSERT INTO public.lab_integration_logs (log_level, log_type, action, message, partner_id, http_status, response_time_ms) VALUES
    ('info', 'funcional', 'pedido_enviado', 'EXT-0001 enviado ao Hermes', v_hermes, 200, 345),
    ('error', 'tecnico', 'falha_envio', 'Timeout Hermes', v_hermes, 500, 2100),
    ('info', 'funcional', 'resultado_importado', 'Creatinina da Dasa', v_dasa, 200, 120),
    ('warn', 'tecnico', 'erro_parsing', 'Mensagem AU680 inválida', NULL, NULL, NULL);
  UPDATE public.lab_integration_logs SET equipment_id = v_eq_bio WHERE action = 'erro_parsing';

  INSERT INTO public.lab_external_results (partner_id, external_protocol, exam_code, exam_name, value, unit, reference_text, is_critical, is_abnormal, conference_status) VALUES
    (v_hermes, 'HP-98766', 'HP-BHCG01', 'Beta-HCG', '25000', 'mUI/mL', '< 5', false, true, 'pendente'),
    (v_dasa, 'DA-45002', 'DA-CREAT', 'Creatinina', '1.1', 'mg/dL', '0.7-1.3', false, false, 'conferido'),
    (v_hermes, 'HP-98765', 'HP-TSH01', 'TSH', '8.5', 'mUI/L', '0.4-4.0', false, true, 'pendente');

  INSERT INTO public.lab_integration_issues (issue_type, severity, partner_id, description, status) VALUES
    ('falha_envio', 'alta', v_hermes, 'EXT-0004 timeout', 'aberta'),
    ('exame_sem_mapeamento', 'baixa', v_dasa, 'Parasitológico sem map Dasa', 'aberta'),
    ('recoleta_solicitada', 'alta', v_hermes, 'Recoleta HP-98765 hemólise', 'aberta');
  INSERT INTO public.lab_integration_issues (issue_type, severity, equipment_id, description, status) VALUES
    ('erro_parsing', 'media', v_eq_bio, 'AU680 formato inesperado', 'aberta');
END $$;
