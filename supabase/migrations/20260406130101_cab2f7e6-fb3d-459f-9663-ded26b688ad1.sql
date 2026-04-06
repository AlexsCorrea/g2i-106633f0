
-- Setores do fluxo documental
CREATE TABLE public.doc_protocol_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  active boolean NOT NULL DEFAULT true,
  participates_flow boolean NOT NULL DEFAULT true,
  requires_acceptance boolean NOT NULL DEFAULT true,
  can_return boolean NOT NULL DEFAULT true,
  sla_hours integer DEFAULT 48,
  color text DEFAULT '#6b7280',
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  responsible_profile_id uuid,
  allowed_doc_types text[],
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tipos de documento
CREATE TABLE public.doc_protocol_document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  category text,
  active boolean NOT NULL DEFAULT true,
  requires_protocol boolean NOT NULL DEFAULT true,
  requires_acceptance boolean NOT NULL DEFAULT true,
  requires_attachment boolean NOT NULL DEFAULT false,
  requires_label boolean NOT NULL DEFAULT false,
  passes_inloco_audit boolean NOT NULL DEFAULT false,
  integrates_tiss boolean NOT NULL DEFAULT false,
  color text DEFAULT '#6b7280',
  display_order integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Motivos de envio/devolução
CREATE TABLE public.doc_protocol_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'envio',
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Protocolos de envio
CREATE TABLE public.doc_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_number text NOT NULL,
  protocol_date timestamptz NOT NULL DEFAULT now(),
  protocol_type text NOT NULL DEFAULT 'envio',
  sector_origin_id uuid REFERENCES public.doc_protocol_sectors(id),
  sector_destination_id uuid REFERENCES public.doc_protocol_sectors(id),
  reason_id uuid REFERENCES public.doc_protocol_reasons(id),
  status text NOT NULL DEFAULT 'rascunho',
  priority text NOT NULL DEFAULT 'normal',
  total_items integer NOT NULL DEFAULT 0,
  emitter_id uuid,
  receiver_id uuid,
  accepted_at timestamptz,
  external_protocol text,
  batch_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Itens do protocolo (contas/documentos)
CREATE TABLE public.doc_protocol_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES public.doc_protocols(id) ON DELETE CASCADE,
  billing_account_id uuid REFERENCES public.billing_accounts(id),
  attendance_id uuid REFERENCES public.attendances(id),
  patient_id uuid REFERENCES public.patients(id),
  document_type_id uuid REFERENCES public.doc_protocol_document_types(id),
  account_number text,
  medical_record text,
  insurance_name text,
  attendance_type text,
  attendance_date date,
  competence text,
  current_status text NOT NULL DEFAULT 'incluido',
  priority text DEFAULT 'normal',
  tags text[],
  sla_deadline timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Movimentações (histórico de cada passo)
CREATE TABLE public.doc_protocol_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid REFERENCES public.doc_protocols(id),
  item_id uuid REFERENCES public.doc_protocol_items(id),
  movement_type text NOT NULL,
  sector_origin_id uuid REFERENCES public.doc_protocol_sectors(id),
  sector_destination_id uuid REFERENCES public.doc_protocol_sectors(id),
  reason_id uuid REFERENCES public.doc_protocol_reasons(id),
  user_id uuid,
  accepted_by uuid,
  accepted_at timestamptz,
  status text NOT NULL DEFAULT 'enviado',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Logs de auditoria
CREATE TABLE public.doc_protocol_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  user_id uuid,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.doc_protocol_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocol_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocol_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocol_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocol_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocol_logs ENABLE ROW LEVEL SECURITY;

-- Policies for all tables
CREATE POLICY "doc_protocol_sectors_select" ON public.doc_protocol_sectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_protocol_sectors_insert" ON public.doc_protocol_sectors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "doc_protocol_sectors_update" ON public.doc_protocol_sectors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "doc_protocol_sectors_delete" ON public.doc_protocol_sectors FOR DELETE TO authenticated USING (true);

CREATE POLICY "doc_protocol_document_types_select" ON public.doc_protocol_document_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_protocol_document_types_insert" ON public.doc_protocol_document_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "doc_protocol_document_types_update" ON public.doc_protocol_document_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "doc_protocol_document_types_delete" ON public.doc_protocol_document_types FOR DELETE TO authenticated USING (true);

CREATE POLICY "doc_protocol_reasons_select" ON public.doc_protocol_reasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_protocol_reasons_insert" ON public.doc_protocol_reasons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "doc_protocol_reasons_update" ON public.doc_protocol_reasons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "doc_protocol_reasons_delete" ON public.doc_protocol_reasons FOR DELETE TO authenticated USING (true);

CREATE POLICY "doc_protocols_select" ON public.doc_protocols FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_protocols_insert" ON public.doc_protocols FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "doc_protocols_update" ON public.doc_protocols FOR UPDATE TO authenticated USING (true);
CREATE POLICY "doc_protocols_delete" ON public.doc_protocols FOR DELETE TO authenticated USING (true);

CREATE POLICY "doc_protocol_items_select" ON public.doc_protocol_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_protocol_items_insert" ON public.doc_protocol_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "doc_protocol_items_update" ON public.doc_protocol_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "doc_protocol_items_delete" ON public.doc_protocol_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "doc_protocol_movements_select" ON public.doc_protocol_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_protocol_movements_insert" ON public.doc_protocol_movements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "doc_protocol_logs_select" ON public.doc_protocol_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_protocol_logs_insert" ON public.doc_protocol_logs FOR INSERT TO authenticated WITH CHECK (true);
