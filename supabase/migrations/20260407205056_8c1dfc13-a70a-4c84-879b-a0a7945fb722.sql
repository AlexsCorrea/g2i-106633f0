
-- =============================================
-- MÓDULO LABORATÓRIO - TABELAS ESTRUTURAIS
-- =============================================

-- 1. Setores técnicos
CREATE TABLE public.lab_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_sectors_select_auth" ON public.lab_sectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_sectors_insert_auth" ON public.lab_sectors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_sectors_update_auth" ON public.lab_sectors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_sectors_delete_auth" ON public.lab_sectors FOR DELETE TO authenticated USING (true);

-- 2. Materiais biológicos
CREATE TABLE public.lab_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_materials_select_auth" ON public.lab_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_materials_insert_auth" ON public.lab_materials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_materials_update_auth" ON public.lab_materials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_materials_delete_auth" ON public.lab_materials FOR DELETE TO authenticated USING (true);

-- 3. Recipientes/tubos
CREATE TABLE public.lab_tubes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  volume_ml numeric,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_tubes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_tubes_select_auth" ON public.lab_tubes FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_tubes_insert_auth" ON public.lab_tubes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_tubes_update_auth" ON public.lab_tubes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_tubes_delete_auth" ON public.lab_tubes FOR DELETE TO authenticated USING (true);

-- 4. Métodos analíticos
CREATE TABLE public.lab_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_methods_select_auth" ON public.lab_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_methods_insert_auth" ON public.lab_methods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_methods_update_auth" ON public.lab_methods FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_methods_delete_auth" ON public.lab_methods FOR DELETE TO authenticated USING (true);

-- 5. Equipamentos
CREATE TABLE public.lab_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model text,
  serial_number text,
  sector_id uuid REFERENCES public.lab_sectors(id),
  manufacturer text,
  interface_code text,
  status text NOT NULL DEFAULT 'ativo',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_equipment_select_auth" ON public.lab_equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_equipment_insert_auth" ON public.lab_equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_equipment_update_auth" ON public.lab_equipment FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_equipment_delete_auth" ON public.lab_equipment FOR DELETE TO authenticated USING (true);

-- 6. Motivos de recusa/recoleta
CREATE TABLE public.lab_rejection_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'recusa',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_rejection_reasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_rejection_reasons_select_auth" ON public.lab_rejection_reasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_rejection_reasons_insert_auth" ON public.lab_rejection_reasons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_rejection_reasons_update_auth" ON public.lab_rejection_reasons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_rejection_reasons_delete_auth" ON public.lab_rejection_reasons FOR DELETE TO authenticated USING (true);

-- 7. Cadastro de exames
CREATE TABLE public.lab_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  tuss_code text,
  sector_id uuid REFERENCES public.lab_sectors(id),
  material_id uuid REFERENCES public.lab_materials(id),
  tube_id uuid REFERENCES public.lab_tubes(id),
  method_id uuid REFERENCES public.lab_methods(id),
  unit text,
  sla_minutes integer DEFAULT 1440,
  requires_fasting boolean NOT NULL DEFAULT false,
  fasting_hours integer,
  preparation_instructions text,
  criticality text NOT NULL DEFAULT 'normal',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_exams_select_auth" ON public.lab_exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_exams_insert_auth" ON public.lab_exams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_exams_update_auth" ON public.lab_exams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_exams_delete_auth" ON public.lab_exams FOR DELETE TO authenticated USING (true);

-- 8. Valores de referência
CREATE TABLE public.lab_reference_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.lab_exams(id) ON DELETE CASCADE,
  sex text,
  age_min_years numeric,
  age_max_years numeric,
  min_value numeric,
  max_value numeric,
  unit text,
  reference_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_reference_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_reference_values_select_auth" ON public.lab_reference_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_reference_values_insert_auth" ON public.lab_reference_values FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_reference_values_update_auth" ON public.lab_reference_values FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_reference_values_delete_auth" ON public.lab_reference_values FOR DELETE TO authenticated USING (true);

-- 9. Painéis de exame
CREATE TABLE public.lab_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_panels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_panels_select_auth" ON public.lab_panels FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_panels_insert_auth" ON public.lab_panels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_panels_update_auth" ON public.lab_panels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_panels_delete_auth" ON public.lab_panels FOR DELETE TO authenticated USING (true);

-- 10. Itens do painel
CREATE TABLE public.lab_panel_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL REFERENCES public.lab_panels(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.lab_exams(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_panel_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_panel_items_select_auth" ON public.lab_panel_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_panel_items_insert_auth" ON public.lab_panel_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_panel_items_update_auth" ON public.lab_panel_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_panel_items_delete_auth" ON public.lab_panel_items FOR DELETE TO authenticated USING (true);

-- =============================================
-- TABELAS OPERACIONAIS
-- =============================================

-- 11. Solicitações
CREATE TABLE public.lab_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text NOT NULL,
  patient_id uuid REFERENCES public.patients(id),
  attendance_id uuid REFERENCES public.attendances(id),
  requesting_doctor_id uuid REFERENCES public.profiles(id),
  insurance_name text,
  specialty text,
  unit text,
  priority text NOT NULL DEFAULT 'rotina',
  clinical_notes text,
  status text NOT NULL DEFAULT 'solicitado',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_requests_select_auth" ON public.lab_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_requests_insert_auth" ON public.lab_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_requests_update_auth" ON public.lab_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_requests_delete_auth" ON public.lab_requests FOR DELETE TO authenticated USING (true);

-- 12. Itens da solicitação
CREATE TABLE public.lab_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.lab_requests(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.lab_exams(id),
  material_id uuid REFERENCES public.lab_materials(id),
  tube_id uuid REFERENCES public.lab_tubes(id),
  sector_id uuid REFERENCES public.lab_sectors(id),
  priority text NOT NULL DEFAULT 'rotina',
  status text NOT NULL DEFAULT 'solicitado',
  sla_deadline timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_request_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_request_items_select_auth" ON public.lab_request_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_request_items_insert_auth" ON public.lab_request_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_request_items_update_auth" ON public.lab_request_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_request_items_delete_auth" ON public.lab_request_items FOR DELETE TO authenticated USING (true);

-- 13. Coletas
CREATE TABLE public.lab_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_item_id uuid REFERENCES public.lab_request_items(id),
  patient_id uuid REFERENCES public.patients(id),
  collector_id uuid REFERENCES public.profiles(id),
  collected_at timestamptz NOT NULL DEFAULT now(),
  collection_site text,
  incident text,
  status text NOT NULL DEFAULT 'coletado',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_collections_select_auth" ON public.lab_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_collections_insert_auth" ON public.lab_collections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_collections_update_auth" ON public.lab_collections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_collections_delete_auth" ON public.lab_collections FOR DELETE TO authenticated USING (true);

-- 14. Amostras
CREATE TABLE public.lab_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text NOT NULL,
  collection_id uuid REFERENCES public.lab_collections(id),
  request_item_id uuid REFERENCES public.lab_request_items(id),
  patient_id uuid REFERENCES public.patients(id),
  material_id uuid REFERENCES public.lab_materials(id),
  tube_id uuid REFERENCES public.lab_tubes(id),
  volume_ml numeric,
  condition text NOT NULL DEFAULT 'adequada',
  current_sector_id uuid REFERENCES public.lab_sectors(id),
  status text NOT NULL DEFAULT 'coletada',
  collected_at timestamptz,
  received_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_samples_select_auth" ON public.lab_samples FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_samples_insert_auth" ON public.lab_samples FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_samples_update_auth" ON public.lab_samples FOR UPDATE TO authenticated USING (true);
CREATE POLICY "lab_samples_delete_auth" ON public.lab_samples FOR DELETE TO authenticated USING (true);

-- 15. Triagem/recebimento de amostras
CREATE TABLE public.lab_sample_triage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid NOT NULL REFERENCES public.lab_samples(id) ON DELETE CASCADE,
  action text NOT NULL DEFAULT 'aceita',
  rejection_reason_id uuid REFERENCES public.lab_rejection_reasons(id),
  rejection_notes text,
  performed_by uuid REFERENCES public.profiles(id),
  performed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_sample_triage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_sample_triage_select_auth" ON public.lab_sample_triage FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_sample_triage_insert_auth" ON public.lab_sample_triage FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_sample_triage_update_auth" ON public.lab_sample_triage FOR UPDATE TO authenticated USING (true);

-- 16. Resultados
CREATE TABLE public.lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_item_id uuid NOT NULL REFERENCES public.lab_request_items(id),
  sample_id uuid REFERENCES public.lab_samples(id),
  value text,
  numeric_value numeric,
  unit text,
  reference_text text,
  method_id uuid REFERENCES public.lab_methods(id),
  equipment_id uuid REFERENCES public.lab_equipment(id),
  is_critical boolean NOT NULL DEFAULT false,
  is_abnormal boolean NOT NULL DEFAULT false,
  technical_notes text,
  result_source text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'pendente',
  performed_by uuid REFERENCES public.profiles(id),
  validated_by uuid REFERENCES public.profiles(id),
  performed_at timestamptz,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_results_select_auth" ON public.lab_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_results_insert_auth" ON public.lab_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_results_update_auth" ON public.lab_results FOR UPDATE TO authenticated USING (true);

-- 17. Laudos
CREATE TABLE public.lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number text NOT NULL,
  patient_id uuid REFERENCES public.patients(id),
  attendance_id uuid REFERENCES public.attendances(id),
  request_id uuid REFERENCES public.lab_requests(id),
  issued_at timestamptz,
  released_at timestamptz,
  released_by uuid REFERENCES public.profiles(id),
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'rascunho',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_reports_select_auth" ON public.lab_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_reports_insert_auth" ON public.lab_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_reports_update_auth" ON public.lab_reports FOR UPDATE TO authenticated USING (true);

-- 18. Itens do laudo
CREATE TABLE public.lab_report_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.lab_reports(id) ON DELETE CASCADE,
  result_id uuid NOT NULL REFERENCES public.lab_results(id),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_report_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_report_items_select_auth" ON public.lab_report_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_report_items_insert_auth" ON public.lab_report_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_report_items_delete_auth" ON public.lab_report_items FOR DELETE TO authenticated USING (true);

-- 19. Pendências
CREATE TABLE public.lab_pending_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  patient_id uuid REFERENCES public.patients(id),
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  sla_deadline timestamptz,
  status text NOT NULL DEFAULT 'aberta',
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_pending_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_pending_select_auth" ON public.lab_pending_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_pending_insert_auth" ON public.lab_pending_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_pending_update_auth" ON public.lab_pending_issues FOR UPDATE TO authenticated USING (true);

-- 20. Auditoria
CREATE TABLE public.lab_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  performed_by uuid REFERENCES public.profiles(id),
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_logs_select_auth" ON public.lab_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_logs_insert_auth" ON public.lab_logs FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- SEED DATA
-- =============================================

-- Setores técnicos
INSERT INTO public.lab_sectors (name, code) VALUES
  ('Hematologia', 'HEM'), ('Bioquímica', 'BIO'), ('Imunologia', 'IMU'),
  ('Microbiologia', 'MIC'), ('Urinálise', 'URI'), ('Parasitologia', 'PAR'),
  ('Hormônios', 'HOR'), ('Gasometria', 'GAS'), ('Coagulação', 'COA');

-- Materiais biológicos
INSERT INTO public.lab_materials (name, code) VALUES
  ('Sangue Total', 'ST'), ('Soro', 'SR'), ('Plasma', 'PL'),
  ('Urina', 'UR'), ('Fezes', 'FZ'), ('Secreção', 'SC'),
  ('Swab', 'SW'), ('Líquor', 'LQ'), ('Líquido Pleural', 'LP');

-- Tubos
INSERT INTO public.lab_tubes (name, color, volume_ml) VALUES
  ('EDTA', 'Roxo', 4), ('Gel Separador', 'Amarelo', 5),
  ('Citrato', 'Azul', 3.5), ('Fluoreto', 'Cinza', 4),
  ('Heparina', 'Verde', 4), ('Seco', 'Vermelho', 7),
  ('Frasco Estéril', 'Branco', 50);

-- Métodos
INSERT INTO public.lab_methods (name, code) VALUES
  ('Automatizado', 'AUTO'), ('Quimioluminescência', 'QUIM'),
  ('Colorimétrico', 'COL'), ('Imunoturbidimetria', 'ITU'),
  ('Cultura', 'CUL'), ('Microscopia', 'MIC'),
  ('Potenciometria', 'POT'), ('Coagulometria', 'COAG');

-- Motivos de recusa
INSERT INTO public.lab_rejection_reasons (name, category) VALUES
  ('Identificação incorreta', 'recusa'), ('Amostra insuficiente', 'recusa'),
  ('Material inadequado', 'recusa'), ('Hemólise', 'recusa'),
  ('Vazamento', 'recusa'), ('Tempo excedido', 'recusa'),
  ('Tubo incorreto', 'recusa'), ('Ausência de preparo', 'recusa'),
  ('Amostra coagulada', 'recusa'), ('Coleta inadequada', 'recoleta');

-- Exames (vinculados aos setores/materiais/tubos)
DO $$
DECLARE
  v_hem uuid; v_bio uuid; v_imu uuid; v_uri uuid; v_par uuid; v_hor uuid; v_gas uuid; v_coa uuid;
  v_st uuid; v_sr uuid; v_pl uuid; v_ur uuid; v_fz uuid;
  v_edta uuid; v_gel uuid; v_cit uuid; v_flu uuid; v_hep uuid; v_frasco uuid;
  v_auto uuid; v_quim uuid; v_col uuid; v_mic uuid; v_coag uuid;
  -- exam ids
  e_hemo uuid; e_glic uuid; e_ureia uuid; e_creat uuid; e_tgo uuid; e_tgp uuid;
  e_pcr uuid; e_ur1 uuid; e_ppf uuid; e_tsh uuid; e_bhcg uuid; e_hemo_cult uuid;
  e_gaso uuid; e_tp uuid; e_ttpa uuid;
BEGIN
  SELECT id INTO v_hem FROM lab_sectors WHERE code='HEM';
  SELECT id INTO v_bio FROM lab_sectors WHERE code='BIO';
  SELECT id INTO v_imu FROM lab_sectors WHERE code='IMU';
  SELECT id INTO v_uri FROM lab_sectors WHERE code='URI';
  SELECT id INTO v_par FROM lab_sectors WHERE code='PAR';
  SELECT id INTO v_hor FROM lab_sectors WHERE code='HOR';
  SELECT id INTO v_gas FROM lab_sectors WHERE code='GAS';
  SELECT id INTO v_coa FROM lab_sectors WHERE code='COA';

  SELECT id INTO v_st FROM lab_materials WHERE code='ST';
  SELECT id INTO v_sr FROM lab_materials WHERE code='SR';
  SELECT id INTO v_pl FROM lab_materials WHERE code='PL';
  SELECT id INTO v_ur FROM lab_materials WHERE code='UR';
  SELECT id INTO v_fz FROM lab_materials WHERE code='FZ';

  SELECT id INTO v_edta FROM lab_tubes WHERE name='EDTA';
  SELECT id INTO v_gel FROM lab_tubes WHERE name='Gel Separador';
  SELECT id INTO v_cit FROM lab_tubes WHERE name='Citrato';
  SELECT id INTO v_flu FROM lab_tubes WHERE name='Fluoreto';
  SELECT id INTO v_hep FROM lab_tubes WHERE name='Heparina';
  SELECT id INTO v_frasco FROM lab_tubes WHERE name='Frasco Estéril';

  SELECT id INTO v_auto FROM lab_methods WHERE code='AUTO';
  SELECT id INTO v_quim FROM lab_methods WHERE code='QUIM';
  SELECT id INTO v_col FROM lab_methods WHERE code='COL';
  SELECT id INTO v_mic FROM lab_methods WHERE code='MIC';
  SELECT id INTO v_coag FROM lab_methods WHERE code='COAG';

  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Hemograma Completo','HEM01',v_hem,v_st,v_edta,v_auto,NULL,240,false,'normal') RETURNING id INTO e_hemo;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,fasting_hours,criticality) VALUES
    ('Glicose','BIO01',v_bio,v_sr,v_flu,v_auto,'mg/dL',120,true,8,'normal') RETURNING id INTO e_glic;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Ureia','BIO02',v_bio,v_sr,v_gel,v_auto,'mg/dL',120,false,'normal') RETURNING id INTO e_ureia;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Creatinina','BIO03',v_bio,v_sr,v_gel,v_auto,'mg/dL',120,false,'normal') RETURNING id INTO e_creat;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('TGO (AST)','BIO04',v_bio,v_sr,v_gel,v_auto,'U/L',120,false,'normal') RETURNING id INTO e_tgo;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('TGP (ALT)','BIO05',v_bio,v_sr,v_gel,v_auto,'U/L',120,false,'normal') RETURNING id INTO e_tgp;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('PCR','IMU01',v_imu,v_sr,v_gel,v_col,'mg/L',180,false,'normal') RETURNING id INTO e_pcr;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Urina Tipo 1','URI01',v_uri,v_ur,v_frasco,v_mic,NULL,180,false,'normal') RETURNING id INTO e_ur1;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Parasitológico de Fezes','PAR01',v_par,v_fz,v_frasco,v_mic,NULL,1440,false,'normal') RETURNING id INTO e_ppf;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('TSH','HOR01',v_hor,v_sr,v_gel,v_quim,'mUI/L',360,false,'normal') RETURNING id INTO e_tsh;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Beta-HCG','HOR02',v_hor,v_sr,v_gel,v_quim,'mUI/mL',360,false,'urgente') RETURNING id INTO e_bhcg;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Hemocultura','MIC01',v_imu,v_st,v_frasco,NULL,NULL,4320,false,'critico') RETURNING id INTO e_hemo_cult;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Gasometria Arterial','GAS01',v_gas,v_st,v_hep,v_auto,NULL,30,false,'critico') RETURNING id INTO e_gaso;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('Tempo de Protrombina (TP)','COA01',v_coa,v_pl,v_cit,v_coag,'seg',120,false,'normal') RETURNING id INTO e_tp;
  INSERT INTO lab_exams (name,code,sector_id,material_id,tube_id,method_id,unit,sla_minutes,requires_fasting,criticality) VALUES
    ('TTPA','COA02',v_coa,v_pl,v_cit,v_coag,'seg',120,false,'normal') RETURNING id INTO e_ttpa;

  -- Reference values
  INSERT INTO lab_reference_values (exam_id,sex,min_value,max_value,unit,reference_text) VALUES
    (e_glic,NULL,70,99,'mg/dL','70 - 99 mg/dL (jejum)'),
    (e_ureia,NULL,15,40,'mg/dL','15 - 40 mg/dL'),
    (e_creat,'M',0.7,1.3,'mg/dL','0.7 - 1.3 mg/dL'),
    (e_creat,'F',0.6,1.1,'mg/dL','0.6 - 1.1 mg/dL'),
    (e_tgo,NULL,0,40,'U/L','Até 40 U/L'),
    (e_tgp,NULL,0,41,'U/L','Até 41 U/L'),
    (e_pcr,NULL,0,5,'mg/L','Até 5 mg/L'),
    (e_tsh,NULL,0.4,4.0,'mUI/L','0.4 - 4.0 mUI/L'),
    (e_bhcg,'F',0,5,'mUI/mL','< 5 mUI/mL (não grávida)'),
    (e_tp,NULL,10,14,'seg','10 - 14 seg'),
    (e_ttpa,NULL,25,35,'seg','25 - 35 seg');

  -- Panels
  INSERT INTO lab_panels (name, code) VALUES ('Check-up Básico', 'CKB');
  INSERT INTO lab_panel_items (panel_id, exam_id, display_order)
    SELECT p.id, e.id, row_number() OVER ()
    FROM lab_panels p, unnest(ARRAY[e_hemo, e_glic, e_ureia, e_creat, e_tgo, e_tgp]) AS e(id)
    WHERE p.code = 'CKB';

  INSERT INTO lab_panels (name, code) VALUES ('Coagulograma', 'COAG');
  INSERT INTO lab_panel_items (panel_id, exam_id, display_order)
    SELECT p.id, e.id, row_number() OVER ()
    FROM lab_panels p, unnest(ARRAY[e_tp, e_ttpa]) AS e(id)
    WHERE p.code = 'COAG';

  -- Equipment
  INSERT INTO lab_equipment (name, model, sector_id, manufacturer, interface_code, status) VALUES
    ('Analisador Hematológico XN-1000', 'XN-1000', v_hem, 'Sysmex', 'SYS-XN1', 'ativo'),
    ('Analisador Bioquímico AU680', 'AU680', v_bio, 'Beckman Coulter', 'BC-AU680', 'ativo'),
    ('Gasômetro ABL90', 'ABL90', v_gas, 'Radiometer', 'RAD-ABL90', 'ativo');

END $$;
