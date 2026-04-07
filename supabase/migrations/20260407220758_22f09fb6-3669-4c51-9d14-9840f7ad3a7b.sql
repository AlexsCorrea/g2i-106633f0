
-- Link external orders to patients and requests
UPDATE lab_external_orders SET patient_id = '8ed78c6a-7d09-43f0-90f0-45b4465d45da', request_id = 'a1000001-0000-0000-0000-000000000001' WHERE id = '295a73fd-de3b-4eb2-8b15-f2042b45b3a4';
UPDATE lab_external_orders SET patient_id = '090961db-6d50-4e2e-97cb-22e14cce65fa', request_id = 'a1000001-0000-0000-0000-000000000002' WHERE id = 'dd02e2ae-4a57-4d27-9b74-cef7e3a36d14';
UPDATE lab_external_orders SET patient_id = '090961db-6d50-4e2e-97cb-22e14cce65fa', request_id = 'a1000001-0000-0000-0000-000000000002' WHERE id = '79bb53bc-00ca-4741-8e31-98e205e2aa25';
UPDATE lab_external_orders SET patient_id = '9980e1c8-31b6-4457-88b9-5c06b5dfadfb', request_id = 'a1000001-0000-0000-0000-000000000003' WHERE id = '64c820ae-fadf-443c-97b8-ce63c03feabc';
UPDATE lab_external_orders SET patient_id = '966e7951-a26d-45ba-a8f2-5495d5114c40', request_id = 'a1000001-0000-0000-0000-000000000005' WHERE id = '40511c4e-cb63-4e2f-b342-8371e32b0d79';
UPDATE lab_external_orders SET patient_id = '34f396b2-bbb6-4e02-aa1d-df73e5aa2920', request_id = 'a1000001-0000-0000-0000-000000000006' WHERE id = 'e6eca4e7-e62c-4803-ac44-534f58d1f21b';
UPDATE lab_external_orders SET patient_id = '34f396b2-bbb6-4e02-aa1d-df73e5aa2920', request_id = 'a1000001-0000-0000-0000-000000000006' WHERE id = '8e8a15ec-2af2-4541-b8e1-7e2340d4e75d';
UPDATE lab_external_orders SET patient_id = 'f5e658fa-208b-41bb-a117-47c1e903d94f', request_id = 'a1000001-0000-0000-0000-000000000004' WHERE id = '4e6a0bd5-e2b1-449e-bed6-d938bc502392';
UPDATE lab_external_orders SET patient_id = '29fe0f99-1040-4d44-be1f-a1d9250dd8f9', request_id = 'a1000001-0000-0000-0000-000000000007' WHERE id = '01a3a6e8-a4e6-4141-847c-d32f8c0df3fd';
UPDATE lab_external_orders SET patient_id = 'f5e658fa-208b-41bb-a117-47c1e903d94f', request_id = 'a1000001-0000-0000-0000-000000000004' WHERE id = '106395e9-b71a-40be-9114-c0f93b2f782b';

-- Link reports to patients
UPDATE lab_reports SET patient_id = '966e7951-a26d-45ba-a8f2-5495d5114c40' WHERE id = 'e1000001-0000-0000-0000-000000000001';
UPDATE lab_reports SET patient_id = '29fe0f99-1040-4d44-be1f-a1d9250dd8f9' WHERE id = 'e1000001-0000-0000-0000-000000000002';
UPDATE lab_reports SET patient_id = '9980e1c8-31b6-4457-88b9-5c06b5dfadfb' WHERE id = 'e1000001-0000-0000-0000-000000000003';

-- Add result_type column to external_results if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lab_external_results' AND column_name='result_type') THEN
    ALTER TABLE lab_external_results ADD COLUMN result_type text DEFAULT 'final';
  END IF;
END $$;
