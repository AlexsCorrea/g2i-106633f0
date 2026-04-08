
-- 1. Add result_mode to lab_exams
ALTER TABLE lab_exams ADD COLUMN IF NOT EXISTS result_mode text DEFAULT 'simples';

-- 2. Create lab_exam_components
CREATE TABLE IF NOT EXISTS lab_exam_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES lab_exams(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  code text,
  group_name text,
  unit text,
  sort_order integer DEFAULT 0,
  reference_min numeric,
  reference_max numeric,
  reference_text text,
  critical_min numeric,
  critical_max numeric,
  result_type text DEFAULT 'numerico',
  options text[],
  ref_gender text,
  ref_age_min integer,
  ref_age_max integer,
  ref_method text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Create lab_result_components
CREATE TABLE IF NOT EXISTS lab_result_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid REFERENCES lab_results(id) ON DELETE CASCADE NOT NULL,
  component_id uuid REFERENCES lab_exam_components(id) NOT NULL,
  value text,
  numeric_value numeric,
  is_abnormal boolean DEFAULT false,
  is_critical boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_lab_exam_components_exam ON lab_exam_components(exam_id);
CREATE INDEX IF NOT EXISTS idx_lab_result_components_result ON lab_result_components(result_id);
CREATE INDEX IF NOT EXISTS idx_lab_result_components_component ON lab_result_components(component_id);

-- 5. RLS
ALTER TABLE lab_exam_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage exam components" ON lab_exam_components FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage result components" ON lab_result_components FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Update result_mode for structured exams
UPDATE lab_exams SET result_mode = 'estruturado' WHERE id IN (
  'b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0',
  '18009f8c-a2c6-432f-8f22-d88636f6c3eb',
  '296c9fee-7c90-4d3a-85c2-ad24ade5cc3d',
  '0a367833-39b4-4289-b724-6ab03b7a657d',
  '01bce22b-29f8-4caa-8f6f-7c3fe1406854',
  '2591ebcb-3072-4029-9c61-64a16d65335d',
  '864740e8-3824-497f-8d24-3090787adb3d',
  'ba4c52ef-3f87-46a5-87c8-aa428e4fa8cd'
);

-- 7. Seed Hemograma components (using first hemograma id)
INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, sort_order, reference_min, reference_max, reference_text, critical_min, critical_max) VALUES
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Hemácias', 'RBC', 'Eritrograma', 'milhões/mm³', 1, 4.0, 5.5, '4.0 a 5.5 milhões/mm³', 2.0, 7.0),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Hemoglobina', 'HGB', 'Eritrograma', 'g/dL', 2, 12.0, 17.0, '12.0 a 17.0 g/dL', 7.0, 20.0),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Hematócrito', 'HCT', 'Eritrograma', '%', 3, 36.0, 50.0, '36.0 a 50.0%', 20.0, 60.0),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'VCM', 'MCV', 'Eritrograma', 'fL', 4, 80.0, 100.0, '80 a 100 fL', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'HCM', 'MCH', 'Eritrograma', 'pg', 5, 27.0, 33.0, '27 a 33 pg', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'CHCM', 'MCHC', 'Eritrograma', 'g/dL', 6, 32.0, 36.0, '32 a 36 g/dL', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'RDW', 'RDW', 'Eritrograma', '%', 7, 11.0, 15.0, '11.0 a 15.0%', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Leucócitos', 'WBC', 'Leucograma', '/mm³', 8, 4000, 11000, '4.000 a 11.000/mm³', 2000, 30000),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Bastonetes', 'BAND', 'Leucograma', '%', 9, 0, 5, '0 a 5%', NULL, 20),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Segmentados', 'SEG', 'Leucograma', '%', 10, 40, 70, '40 a 70%', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Eosinófilos', 'EOS', 'Leucograma', '%', 11, 1, 5, '1 a 5%', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Basófilos', 'BASO', 'Leucograma', '%', 12, 0, 1, '0 a 1%', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Linfócitos', 'LYMPH', 'Leucograma', '%', 13, 20, 40, '20 a 40%', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Monócitos', 'MONO', 'Leucograma', '%', 14, 2, 10, '2 a 10%', NULL, NULL),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Plaquetas', 'PLT', 'Plaquetas', 'mil/mm³', 15, 150, 400, '150.000 a 400.000/mm³', 50, 1000);

-- Seed Gasometria components
INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, sort_order, reference_min, reference_max, reference_text, critical_min, critical_max) VALUES
('296c9fee-7c90-4d3a-85c2-ad24ade5cc3d', 'pH', 'PH', 'Gasometria', '', 1, 7.35, 7.45, '7.35 a 7.45', 7.10, 7.60),
('296c9fee-7c90-4d3a-85c2-ad24ade5cc3d', 'pCO2', 'PCO2', 'Gasometria', 'mmHg', 2, 35, 45, '35 a 45 mmHg', 20, 70),
('296c9fee-7c90-4d3a-85c2-ad24ade5cc3d', 'pO2', 'PO2', 'Gasometria', 'mmHg', 3, 80, 100, '80 a 100 mmHg', 40, NULL),
('296c9fee-7c90-4d3a-85c2-ad24ade5cc3d', 'HCO3', 'HCO3', 'Gasometria', 'mEq/L', 4, 22, 26, '22 a 26 mEq/L', 10, 40),
('296c9fee-7c90-4d3a-85c2-ad24ade5cc3d', 'BE', 'BE', 'Gasometria', 'mEq/L', 5, -2, 2, '-2 a +2 mEq/L', -10, 10),
('296c9fee-7c90-4d3a-85c2-ad24ade5cc3d', 'SatO2', 'SATO2', 'Gasometria', '%', 6, 95, 100, '95 a 100%', 80, NULL),
('296c9fee-7c90-4d3a-85c2-ad24ade5cc3d', 'Lactato', 'LAC', 'Gasometria', 'mmol/L', 7, 0.5, 2.0, '0.5 a 2.0 mmol/L', NULL, 4.0);

-- Seed Coagulograma components
INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, sort_order, reference_min, reference_max, reference_text, critical_min, critical_max) VALUES
('01bce22b-29f8-4caa-8f6f-7c3fe1406854', 'TP (Tempo de Protrombina)', 'TP', 'Coagulação', 'segundos', 1, 10, 14, '10 a 14 segundos', NULL, 30),
('01bce22b-29f8-4caa-8f6f-7c3fe1406854', 'INR', 'INR', 'Coagulação', '', 2, 0.8, 1.2, '0.8 a 1.2', NULL, 5.0),
('01bce22b-29f8-4caa-8f6f-7c3fe1406854', 'TTPa', 'TTPA', 'Coagulação', 'segundos', 3, 25, 35, '25 a 35 segundos', NULL, 70),
('01bce22b-29f8-4caa-8f6f-7c3fe1406854', 'Fibrinogênio', 'FIB', 'Coagulação', 'mg/dL', 4, 200, 400, '200 a 400 mg/dL', 100, 700);

-- Seed EAS/Urinalise components
INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, sort_order, reference_min, reference_max, reference_text, result_type) VALUES
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Cor', 'COR', 'Físico-Químico', '', 1, NULL, NULL, 'Amarelo citrino', 'texto'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Aspecto', 'ASP', 'Físico-Químico', '', 2, NULL, NULL, 'Límpido', 'texto'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'pH', 'PH_U', 'Físico-Químico', '', 3, 5.0, 7.0, '5.0 a 7.0', 'numerico'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Densidade', 'DENS', 'Físico-Químico', '', 4, 1.005, 1.030, '1.005 a 1.030', 'numerico'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Proteínas', 'PROT_U', 'Físico-Químico', '', 5, NULL, NULL, 'Negativo', 'texto'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Glicose', 'GLIC_U', 'Físico-Químico', '', 6, NULL, NULL, 'Negativo', 'texto'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Hemoglobina', 'HB_U', 'Sedimento', '', 7, NULL, NULL, 'Negativo', 'texto'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Leucócitos', 'LEU_U', 'Sedimento', '/campo', 8, 0, 5, '0 a 5/campo', 'numerico'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Nitritos', 'NIT', 'Sedimento', '', 9, NULL, NULL, 'Negativo', 'texto'),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Bactérias', 'BACT', 'Sedimento', '', 10, NULL, NULL, 'Ausentes', 'texto');
