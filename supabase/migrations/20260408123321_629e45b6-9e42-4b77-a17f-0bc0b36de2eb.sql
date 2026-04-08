
-- Shipments / Remessas table
CREATE TABLE public.lab_external_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number text NOT NULL,
  partner_id uuid REFERENCES public.lab_partners(id),
  status text NOT NULL DEFAULT 'aberta',
  channel text DEFAULT 'manual',
  notes text,
  sent_at timestamptz,
  received_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.lab_external_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage shipments" ON public.lab_external_shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add shipment_id to external orders
ALTER TABLE public.lab_external_orders ADD COLUMN IF NOT EXISTS shipment_id uuid REFERENCES public.lab_external_shipments(id);

-- External recollections
CREATE TABLE public.lab_external_recollections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.lab_external_orders(id),
  result_id uuid REFERENCES public.lab_external_results(id),
  reason text NOT NULL,
  notes text,
  new_order_id uuid REFERENCES public.lab_external_orders(id),
  status text DEFAULT 'aberta',
  requested_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lab_external_recollections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage ext recollections" ON public.lab_external_recollections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- External critical communications
CREATE TABLE public.lab_external_critical_comms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid REFERENCES public.lab_external_results(id) NOT NULL,
  communicated_to text NOT NULL,
  channel text DEFAULT 'telefone',
  notes text,
  communicated_by uuid,
  communicated_at timestamptz DEFAULT now()
);

ALTER TABLE public.lab_external_critical_comms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage ext critical comms" ON public.lab_external_critical_comms FOR ALL TO authenticated USING (true) WITH CHECK (true);
