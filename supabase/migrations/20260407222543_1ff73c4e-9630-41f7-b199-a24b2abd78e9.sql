
-- Cenário 3 - Parceiro inativo
UPDATE lab_partners SET active = false WHERE id = 'a8cb4aa5-be00-4a09-8b56-14dcb11ea9b5';

INSERT INTO lab_integration_logs (log_level, log_type, action, message, partner_id)
VALUES ('error', 'funcional', 'envio_bloqueado', 'Parceiro Dasa inativo — envio bloqueado para pedido PED-EXT-HOM03', 'a8cb4aa5-be00-4a09-8b56-14dcb11ea9b5');

-- Cenário 6 - Falha de envio + reenvio
INSERT INTO lab_external_orders (id, order_number, partner_id, internal_status, patient_id, request_id, priority, material, requesting_doctor, clinical_notes, error_message, unit)
VALUES ('c1000001-0000-0000-0000-000000000002', 'PED-EXT-HOM06', '68c98aa6-0577-48e7-8e6f-c91250f773f3', 'falha_envio', '966e7951-a26d-45ba-a8f2-5495d5114c40', 'a1000001-0000-0000-0000-000000000003', 'urgente', 'Sangue arterial', 'Dra. Fernanda Costa', 'Gasometria urgente', 'Connection timeout after 30s', 'PA')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab_external_order_items (id, order_id, external_code, external_name, status)
VALUES ('d1000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000002', 'GASO', 'Gasometria Arterial', 'falha')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab_integration_logs (log_level, log_type, action, message, partner_id, order_id, endpoint, http_status, response_time_ms)
VALUES 
  ('error', 'tecnico', 'envio_falhou', 'Timeout ao enviar PED-EXT-HOM06 ao Biolab', '68c98aa6-0577-48e7-8e6f-c91250f773f3', 'c1000001-0000-0000-0000-000000000002', 'https://api.biolab.com/orders', 504, 30120),
  ('info', 'funcional', 'reenvio_agendado', 'Reenvio agendado para PED-EXT-HOM06 (tentativa 2/3)', '68c98aa6-0577-48e7-8e6f-c91250f773f3', 'c1000001-0000-0000-0000-000000000002', null, null, null);
