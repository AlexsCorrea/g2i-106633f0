
-- =====================================================
-- 1. Add missing columns to doc_protocols
-- =====================================================
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS pending_items integer DEFAULT 0;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS received_at timestamptz;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS flow_profile_id uuid;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS acceptance_type text;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS cancel_reason text;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS last_movement_at timestamptz;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS user_agent text;

-- FK for emitter_id and receiver_id to profiles
ALTER TABLE public.doc_protocols
  ADD CONSTRAINT doc_protocols_emitter_id_fkey
  FOREIGN KEY (emitter_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.doc_protocols
  ADD CONSTRAINT doc_protocols_receiver_id_fkey
  FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =====================================================
-- 2. Add missing columns to doc_protocol_items
-- =====================================================
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS item_reason_id uuid REFERENCES public.doc_protocol_reasons(id) ON DELETE SET NULL;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS item_type text DEFAULT 'manual';
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS sector_origin_id uuid REFERENCES public.doc_protocol_sectors(id) ON DELETE SET NULL;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS sector_current_id uuid REFERENCES public.doc_protocol_sectors(id) ON DELETE SET NULL;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS document_reference text;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS protocol_reference text;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS manual_title text;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS item_date date;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS pending_reason text;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS snapshot jsonb DEFAULT '{}'::jsonb;

-- =====================================================
-- 3. Add missing columns to doc_protocol_movements
-- =====================================================
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS performed_at timestamptz;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS from_status text;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS to_status text;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS acceptance_type text;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS context jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.doc_protocol_movements ADD COLUMN IF NOT EXISTS user_agent text;

-- FK for performed_by
-- (already added inline above)

-- =====================================================
-- 4. Create doc_protocol_flow_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.doc_protocol_flow_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  description text,
  active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.doc_protocol_flow_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage flow profiles"
  ON public.doc_protocol_flow_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 5. Create doc_protocol_flow_rules
-- =====================================================
CREATE TABLE IF NOT EXISTS public.doc_protocol_flow_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_profile_id uuid NOT NULL REFERENCES public.doc_protocol_flow_profiles(id) ON DELETE CASCADE,
  sector_origin_id uuid NOT NULL REFERENCES public.doc_protocol_sectors(id) ON DELETE CASCADE,
  sector_destination_id uuid NOT NULL REFERENCES public.doc_protocol_sectors(id) ON DELETE CASCADE,
  document_type_id uuid REFERENCES public.doc_protocol_document_types(id) ON DELETE SET NULL,
  item_type text,
  rule_order integer DEFAULT 0,
  active boolean DEFAULT true,
  allows_return boolean DEFAULT true,
  return_is_restricted boolean DEFAULT false,
  required_previous_sector_id uuid REFERENCES public.doc_protocol_sectors(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.doc_protocol_flow_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage flow rules"
  ON public.doc_protocol_flow_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 6. FK for doc_protocols.flow_profile_id
-- =====================================================
ALTER TABLE public.doc_protocols
  ADD CONSTRAINT doc_protocols_flow_profile_id_fkey
  FOREIGN KEY (flow_profile_id) REFERENCES public.doc_protocol_flow_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- 7. Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_doc_protocols_emitter_id ON public.doc_protocols(emitter_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocols_receiver_id ON public.doc_protocols(receiver_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocols_flow_profile_id ON public.doc_protocols(flow_profile_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocol_items_item_reason_id ON public.doc_protocol_items(item_reason_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocol_items_sector_origin_id ON public.doc_protocol_items(sector_origin_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocol_items_sector_current_id ON public.doc_protocol_items(sector_current_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocol_movements_performed_by ON public.doc_protocol_movements(performed_by);
CREATE INDEX IF NOT EXISTS idx_doc_protocol_flow_rules_profile ON public.doc_protocol_flow_rules(flow_profile_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocol_flow_rules_origin ON public.doc_protocol_flow_rules(sector_origin_id);
CREATE INDEX IF NOT EXISTS idx_doc_protocol_flow_rules_dest ON public.doc_protocol_flow_rules(sector_destination_id);

-- =====================================================
-- 8. Triggers for updated_at
-- =====================================================
CREATE TRIGGER update_doc_protocol_flow_profiles_updated_at
  BEFORE UPDATE ON public.doc_protocol_flow_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doc_protocol_flow_rules_updated_at
  BEFORE UPDATE ON public.doc_protocol_flow_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
