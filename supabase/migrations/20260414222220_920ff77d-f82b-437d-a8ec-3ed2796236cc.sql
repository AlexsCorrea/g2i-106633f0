
-- =============================================
-- BLOCO 1: Componentes faltantes do EAS/Urina (exam_id: 2591ebcb = "Urina Tipo 1")
-- Existentes: Cor, Aspecto, pH, Densidade, Proteínas, Glicose, Hemoglobina, Leucócitos, Nitritos, Bactérias
-- =============================================

INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, reference_text, sort_order) VALUES
-- Exame Físico extras
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Volume', 'VOL_U', 'Exame Físico', 'mL', '', 0),
-- Exame Químico extras  
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Cetona', 'CET_U', 'Exame Químico', '', 'Negativo', 11),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Bilirrubina', 'BIL_U', 'Exame Químico', '', 'Negativo', 12),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Urobilinogênio', 'URO_U', 'Exame Químico', '', 'Normal', 13),
-- Microscopia do Sedimento extras
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Células Epiteliais', 'CEPI_U', 'Microscopia do Sedimento', '/campo', 'Raras', 14),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Hemácias', 'HEM_U', 'Microscopia do Sedimento', '/campo', '0 a 3/campo', 15),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Flora Bacteriana', 'FLORA_U', 'Microscopia do Sedimento', '', 'Normal', 16),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Filamento de Muco', 'MUCO_U', 'Microscopia do Sedimento', '', 'Ausente', 17),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Cilindros', 'CIL_U', 'Microscopia do Sedimento', '', 'Ausentes', 18),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Cristais', 'CRIS_U', 'Microscopia do Sedimento', '', 'Ausentes', 19),
('2591ebcb-3072-4029-9c61-64a16d65335d', 'Observação', 'OBS_U', 'Microscopia do Sedimento', '', '', 20)
ON CONFLICT DO NOTHING;

-- Fix group_name for existing components to match reference layout
UPDATE lab_exam_components SET group_name = 'Exame Físico' WHERE exam_id = '2591ebcb-3072-4029-9c61-64a16d65335d' AND code IN ('COR', 'ASP', 'PH_U', 'DENS');
UPDATE lab_exam_components SET group_name = 'Exame Químico' WHERE exam_id = '2591ebcb-3072-4029-9c61-64a16d65335d' AND code IN ('PROT_U', 'GLIC_U', 'HB_U', 'NIT');
UPDATE lab_exam_components SET group_name = 'Microscopia do Sedimento' WHERE exam_id = '2591ebcb-3072-4029-9c61-64a16d65335d' AND code IN ('LEU_U', 'BACT');

-- =============================================
-- BLOCO 2: Componentes faltantes do Hemograma (exam_id: b92bdd1d)
-- Existentes: Hemácias, Hemoglobina, Hematócrito, VCM, HCM, CHCM, RDW, Leucócitos, Bastonetes, Segmentados, Eosinófilos, Basófilos
-- =============================================

INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, reference_text, sort_order) VALUES
-- Leucograma extras
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Blastos', 'BLAST', 'Leucograma', '%', '0', 8.1),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Promielócitos', 'PROMIE', 'Leucograma', '%', '0', 8.2),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Mielócitos', 'MIELO', 'Leucograma', '%', '0', 8.3),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Metamielócitos', 'METAMIE', 'Leucograma', '%', '0', 8.4),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Linfócitos', 'LINF', 'Leucograma', '%', '20 a 40%', 12),
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Monócitos', 'MONO', 'Leucograma', '%', '2 a 10%', 13),
-- Plaquetas
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Plaquetas', 'PLT', 'Plaquetas', '/mm³', '150.000 a 400.000/mm³', 15),
-- Observação
('b92bdd1d-44ef-4525-a1d0-c2c9c44b8af0', 'Observação', 'OBS_HEM', 'Observação', '', '', 16)
ON CONFLICT DO NOTHING;

-- =============================================
-- BLOCO 3: Componentes para o EAS (URI001) - exam_id: 864740e8 
-- =============================================

INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, reference_text, sort_order) VALUES
-- Exame Físico
('864740e8-3824-497f-8d24-3090787adb3d', 'Volume', 'VOL_EAS', 'Exame Físico', 'mL', '', 0),
('864740e8-3824-497f-8d24-3090787adb3d', 'Cor', 'COR_EAS', 'Exame Físico', '', 'Amarelo citrino', 1),
('864740e8-3824-497f-8d24-3090787adb3d', 'Aspecto', 'ASP_EAS', 'Exame Físico', '', 'Límpido', 2),
('864740e8-3824-497f-8d24-3090787adb3d', 'pH', 'PH_EAS', 'Exame Físico', '', '5.0 a 7.0', 3),
('864740e8-3824-497f-8d24-3090787adb3d', 'Densidade', 'DENS_EAS', 'Exame Físico', '', '1.005 a 1.030', 4),
-- Exame Químico
('864740e8-3824-497f-8d24-3090787adb3d', 'Proteínas', 'PROT_EAS', 'Exame Químico', '', 'Negativo', 5),
('864740e8-3824-497f-8d24-3090787adb3d', 'Glicose', 'GLIC_EAS', 'Exame Químico', '', 'Negativo', 6),
('864740e8-3824-497f-8d24-3090787adb3d', 'Cetona', 'CET_EAS', 'Exame Químico', '', 'Negativo', 7),
('864740e8-3824-497f-8d24-3090787adb3d', 'Hemoglobina', 'HB_EAS', 'Exame Químico', '', 'Negativo', 8),
('864740e8-3824-497f-8d24-3090787adb3d', 'Bilirrubina', 'BIL_EAS', 'Exame Químico', '', 'Negativo', 9),
('864740e8-3824-497f-8d24-3090787adb3d', 'Urobilinogênio', 'URO_EAS', 'Exame Químico', '', 'Normal', 10),
('864740e8-3824-497f-8d24-3090787adb3d', 'Nitrito', 'NIT_EAS', 'Exame Químico', '', 'Negativo', 11),
('864740e8-3824-497f-8d24-3090787adb3d', 'Leucócitos', 'LEU_EAS', 'Exame Químico', '', 'Negativo', 12),
-- Microscopia do Sedimento
('864740e8-3824-497f-8d24-3090787adb3d', 'Células Epiteliais', 'CEPI_EAS', 'Microscopia do Sedimento', '/campo', 'Raras', 13),
('864740e8-3824-497f-8d24-3090787adb3d', 'Leucócitos (sedimento)', 'LEU_SED_EAS', 'Microscopia do Sedimento', '/mL', 'Até 7.000/mL', 14),
('864740e8-3824-497f-8d24-3090787adb3d', 'Hemácias (sedimento)', 'HEM_SED_EAS', 'Microscopia do Sedimento', '/mL', 'Até 5.000/mL', 15),
('864740e8-3824-497f-8d24-3090787adb3d', 'Flora Bacteriana', 'FLORA_EAS', 'Microscopia do Sedimento', '', 'Normal', 16),
('864740e8-3824-497f-8d24-3090787adb3d', 'Filamento de Muco', 'MUCO_EAS', 'Microscopia do Sedimento', '', 'Ausente', 17),
('864740e8-3824-497f-8d24-3090787adb3d', 'Cilindros', 'CIL_EAS', 'Microscopia do Sedimento', '', 'Ausentes', 18),
('864740e8-3824-497f-8d24-3090787adb3d', 'Cristais', 'CRIS_EAS', 'Microscopia do Sedimento', '', 'Ausentes', 19),
('864740e8-3824-497f-8d24-3090787adb3d', 'Observação', 'OBS_EAS', 'Microscopia do Sedimento', '', '', 20)
ON CONFLICT DO NOTHING;

-- =============================================
-- BLOCO 4: Componentes para o segundo Hemograma (exam_id: 18009f8c)
-- =============================================

INSERT INTO lab_exam_components (exam_id, name, code, group_name, unit, reference_text, sort_order) VALUES
-- Eritrograma
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Hemácias', 'RBC2', 'Eritrograma', 'milhões/mm³', '4.0 a 5.5 milhões/mm³', 1),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Hemoglobina', 'HGB2', 'Eritrograma', 'g/dL', '12.0 a 17.0 g/dL', 2),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Hematócrito', 'HCT2', 'Eritrograma', '%', '36.0 a 50.0%', 3),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'VCM', 'MCV2', 'Eritrograma', 'fL', '80 a 100 fL', 4),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'HCM', 'MCH2', 'Eritrograma', 'pg', '27 a 33 pg', 5),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'CHCM', 'MCHC2', 'Eritrograma', 'g/dL', '32 a 36 g/dL', 6),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'RDW', 'RDW2', 'Eritrograma', '%', '11.0 a 15.0%', 7),
-- Leucograma
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Leucócitos', 'WBC2', 'Leucograma', '/mm³', '4.000 a 11.000/mm³', 8),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Blastos', 'BLAST2', 'Leucograma', '%', '0', 8.1),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Promielócitos', 'PROMIE2', 'Leucograma', '%', '0', 8.2),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Mielócitos', 'MIELO2', 'Leucograma', '%', '0', 8.3),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Metamielócitos', 'METAMIE2', 'Leucograma', '%', '0', 8.4),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Bastonetes', 'BAND2', 'Leucograma', '%', '0 a 5%', 9),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Segmentados', 'SEG2', 'Leucograma', '%', '40 a 70%', 10),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Eosinófilos', 'EOS2', 'Leucograma', '%', '1 a 5%', 11),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Basófilos', 'BASO2', 'Leucograma', '%', '0 a 1%', 12),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Linfócitos', 'LINF2', 'Leucograma', '%', '20 a 40%', 13),
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Monócitos', 'MONO2', 'Leucograma', '%', '2 a 10%', 14),
-- Plaquetas
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Plaquetas', 'PLT2', 'Plaquetas', '/mm³', '150.000 a 400.000/mm³', 15),
-- Observação
('18009f8c-a2c6-432f-8f22-d88636f6c3eb', 'Observação', 'OBS_HEM2', 'Observação', '', '', 16)
ON CONFLICT DO NOTHING;
