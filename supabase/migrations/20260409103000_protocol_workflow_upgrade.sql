-- Flow profiles and rules for document protocol validation
CREATE TABLE IF NOT EXISTS public.doc_protocol_flow_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doc_protocol_flow_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_profile_id uuid NOT NULL REFERENCES public.doc_protocol_flow_profiles(id) ON DELETE CASCADE,
  sector_origin_id uuid NOT NULL REFERENCES public.doc_protocol_sectors(id) ON DELETE CASCADE,
  sector_destination_id uuid NOT NULL REFERENCES public.doc_protocol_sectors(id) ON DELETE CASCADE,
  document_type_id uuid REFERENCES public.doc_protocol_document_types(id) ON DELETE SET NULL,
  item_type text,
  rule_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  allows_return boolean NOT NULL DEFAULT false,
  return_is_restricted boolean NOT NULL DEFAULT false,
  required_previous_sector_id uuid REFERENCES public.doc_protocol_sectors(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doc_protocol_counters (
  counter_key text NOT NULL,
  counter_year integer NOT NULL,
  last_value integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (counter_key, counter_year)
);

ALTER TABLE public.doc_protocols
  ADD COLUMN IF NOT EXISTS flow_profile_id uuid REFERENCES public.doc_protocol_flow_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS received_at timestamptz,
  ADD COLUMN IF NOT EXISTS acceptance_type text,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS last_movement_at timestamptz,
  ADD COLUMN IF NOT EXISTS pending_items integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS user_agent text;

ALTER TABLE public.doc_protocol_sectors
  ADD COLUMN IF NOT EXISTS type text;

ALTER TABLE public.doc_protocol_reasons
  ADD COLUMN IF NOT EXISTS requires_observation boolean NOT NULL DEFAULT false;

ALTER TABLE public.doc_protocol_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'billing_account',
  ADD COLUMN IF NOT EXISTS item_reason_id uuid REFERENCES public.doc_protocol_reasons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sector_origin_id uuid REFERENCES public.doc_protocol_sectors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sector_current_id uuid REFERENCES public.doc_protocol_sectors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS document_reference text,
  ADD COLUMN IF NOT EXISTS protocol_reference text,
  ADD COLUMN IF NOT EXISTS manual_title text,
  ADD COLUMN IF NOT EXISTS item_date date,
  ADD COLUMN IF NOT EXISTS pending_reason text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.doc_protocol_movements
  ADD COLUMN IF NOT EXISTS action text,
  ADD COLUMN IF NOT EXISTS acceptance_type text,
  ADD COLUMN IF NOT EXISTS performed_by uuid,
  ADD COLUMN IF NOT EXISTS performed_at timestamptz,
  ADD COLUMN IF NOT EXISTS from_status text,
  ADD COLUMN IF NOT EXISTS to_status text,
  ADD COLUMN IF NOT EXISTS context jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS user_agent text;

ALTER TABLE public.doc_protocol_logs
  ADD COLUMN IF NOT EXISTS context jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS user_agent text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doc_protocols_emitter_id_fkey') THEN
    ALTER TABLE public.doc_protocols
      ADD CONSTRAINT doc_protocols_emitter_id_fkey
      FOREIGN KEY (emitter_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doc_protocols_receiver_id_fkey') THEN
    ALTER TABLE public.doc_protocols
      ADD CONSTRAINT doc_protocols_receiver_id_fkey
      FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doc_protocol_movements_user_id_fkey') THEN
    ALTER TABLE public.doc_protocol_movements
      ADD CONSTRAINT doc_protocol_movements_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doc_protocol_movements_performed_by_fkey') THEN
    ALTER TABLE public.doc_protocol_movements
      ADD CONSTRAINT doc_protocol_movements_performed_by_fkey
      FOREIGN KEY (performed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doc_protocol_movements_accepted_by_fkey') THEN
    ALTER TABLE public.doc_protocol_movements
      ADD CONSTRAINT doc_protocol_movements_accepted_by_fkey
      FOREIGN KEY (accepted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doc_protocol_logs_user_id_fkey') THEN
    ALTER TABLE public.doc_protocol_logs
      ADD CONSTRAINT doc_protocol_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_doc_protocol_flow_rules_origin_dest
  ON public.doc_protocol_flow_rules (sector_origin_id, sector_destination_id, active);

CREATE INDEX IF NOT EXISTS idx_doc_protocol_items_protocol_sort
  ON public.doc_protocol_items (protocol_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_doc_protocol_items_lookup
  ON public.doc_protocol_items (billing_account_id, attendance_id, patient_id, document_type_id);

CREATE INDEX IF NOT EXISTS idx_doc_protocol_movements_protocol_performed_at
  ON public.doc_protocol_movements (protocol_id, performed_at DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_doc_protocol_logs_entity_created_at
  ON public.doc_protocol_logs (entity_type, entity_id, created_at DESC);

ALTER TABLE public.doc_protocol_flow_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocol_flow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_protocol_counters ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_profiles' AND policyname = 'doc_protocol_flow_profiles_select'
  ) THEN
    CREATE POLICY "doc_protocol_flow_profiles_select" ON public.doc_protocol_flow_profiles FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_profiles' AND policyname = 'doc_protocol_flow_profiles_insert'
  ) THEN
    CREATE POLICY "doc_protocol_flow_profiles_insert" ON public.doc_protocol_flow_profiles FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_profiles' AND policyname = 'doc_protocol_flow_profiles_update'
  ) THEN
    CREATE POLICY "doc_protocol_flow_profiles_update" ON public.doc_protocol_flow_profiles FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_profiles' AND policyname = 'doc_protocol_flow_profiles_delete'
  ) THEN
    CREATE POLICY "doc_protocol_flow_profiles_delete" ON public.doc_protocol_flow_profiles FOR DELETE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_rules' AND policyname = 'doc_protocol_flow_rules_select'
  ) THEN
    CREATE POLICY "doc_protocol_flow_rules_select" ON public.doc_protocol_flow_rules FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_rules' AND policyname = 'doc_protocol_flow_rules_insert'
  ) THEN
    CREATE POLICY "doc_protocol_flow_rules_insert" ON public.doc_protocol_flow_rules FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_rules' AND policyname = 'doc_protocol_flow_rules_update'
  ) THEN
    CREATE POLICY "doc_protocol_flow_rules_update" ON public.doc_protocol_flow_rules FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_flow_rules' AND policyname = 'doc_protocol_flow_rules_delete'
  ) THEN
    CREATE POLICY "doc_protocol_flow_rules_delete" ON public.doc_protocol_flow_rules FOR DELETE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_counters' AND policyname = 'doc_protocol_counters_select'
  ) THEN
    CREATE POLICY "doc_protocol_counters_select" ON public.doc_protocol_counters FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_counters' AND policyname = 'doc_protocol_counters_insert'
  ) THEN
    CREATE POLICY "doc_protocol_counters_insert" ON public.doc_protocol_counters FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doc_protocol_counters' AND policyname = 'doc_protocol_counters_update'
  ) THEN
    CREATE POLICY "doc_protocol_counters_update" ON public.doc_protocol_counters FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.doc_protocol_log_event(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_user_id uuid DEFAULT auth.uid(),
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL,
  p_context jsonb DEFAULT '{}'::jsonb,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.doc_protocol_logs (
    entity_type,
    entity_id,
    action,
    old_value,
    new_value,
    user_id,
    context,
    session_id,
    user_agent
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_action,
    p_old_value,
    p_new_value,
    p_user_id,
    COALESCE(p_context, '{}'::jsonb),
    p_session_id,
    p_user_agent
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_next_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_year integer := EXTRACT(YEAR FROM now())::integer;
  v_next integer;
BEGIN
  INSERT INTO public.doc_protocol_counters (counter_key, counter_year, last_value, updated_at)
  VALUES ('protocol', v_year, 0, now())
  ON CONFLICT (counter_key, counter_year) DO NOTHING;

  UPDATE public.doc_protocol_counters
  SET last_value = last_value + 1,
      updated_at = now()
  WHERE counter_key = 'protocol'
    AND counter_year = v_year
  RETURNING last_value INTO v_next;

  RETURN format('PROT-%s-%s', v_year, lpad(v_next::text, 3, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_match_rule(
  p_sector_origin_id uuid,
  p_sector_destination_id uuid,
  p_document_type_id uuid DEFAULT NULL,
  p_item_type text DEFAULT NULL
)
RETURNS TABLE (
  rule_id uuid,
  flow_profile_id uuid,
  flow_profile_code text,
  allows_return boolean,
  return_is_restricted boolean,
  required_previous_sector_id uuid
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    r.id,
    fp.id,
    fp.code,
    r.allows_return,
    r.return_is_restricted,
    r.required_previous_sector_id
  FROM public.doc_protocol_flow_rules r
  INNER JOIN public.doc_protocol_flow_profiles fp
    ON fp.id = r.flow_profile_id
   AND fp.active = true
  WHERE r.active = true
    AND r.sector_origin_id = p_sector_origin_id
    AND r.sector_destination_id = p_sector_destination_id
    AND (r.document_type_id IS NULL OR r.document_type_id = p_document_type_id)
    AND (r.item_type IS NULL OR r.item_type = p_item_type)
  ORDER BY
    CASE WHEN r.document_type_id IS NOT NULL THEN 0 ELSE 1 END,
    CASE WHEN r.item_type IS NOT NULL THEN 0 ELSE 1 END,
    CASE WHEN fp.is_default THEN 0 ELSE 1 END,
    r.rule_order,
    r.created_at
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_recompute(p_protocol_id uuid)
RETURNS public.doc_protocols
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total integer := 0;
  v_accepted integer := 0;
  v_returned integer := 0;
  v_pending integer := 0;
  v_status text := 'pendente_recebimento';
  v_protocol public.doc_protocols%ROWTYPE;
BEGIN
  SELECT
    COUNT(*)::integer,
    COUNT(*) FILTER (WHERE item_status IN ('aceito', 'concluido'))::integer,
    COUNT(*) FILTER (WHERE item_status = 'devolvido')::integer,
    COUNT(*) FILTER (WHERE item_status IN ('enviado', 'pendente', 'recebido'))::integer
  INTO v_total, v_accepted, v_returned, v_pending
  FROM public.doc_protocol_items
  WHERE protocol_id = p_protocol_id;

  IF v_total = 0 THEN
    v_status := 'aberto';
  ELSIF v_returned = v_total THEN
    v_status := 'devolvido';
  ELSIF v_accepted = v_total THEN
    v_status := 'recebido';
  ELSIF v_accepted > 0 OR v_returned > 0 THEN
    v_status := 'aceito_parcialmente';
  ELSE
    v_status := 'pendente_recebimento';
  END IF;

  UPDATE public.doc_protocols
  SET total_items = v_total,
      accepted_items = v_accepted,
      returned_items = v_returned,
      pending_items = v_pending,
      status = CASE
        WHEN status = 'cancelado' THEN status
        WHEN status = 'concluido' THEN status
        ELSE v_status
      END,
      acceptance_type = CASE
        WHEN status IN ('cancelado', 'concluido') THEN acceptance_type
        WHEN v_returned = v_total AND v_total > 0 THEN 'devolucao'
        WHEN v_accepted = v_total AND v_total > 0 THEN 'integral'
        WHEN v_accepted > 0 OR v_returned > 0 THEN 'parcial'
        ELSE acceptance_type
      END,
      received_at = CASE
        WHEN status IN ('cancelado', 'concluido') THEN received_at
        WHEN v_accepted = v_total AND v_total > 0 THEN COALESCE(received_at, now())
        WHEN v_accepted > 0 OR v_returned > 0 THEN COALESCE(received_at, now())
        ELSE received_at
      END,
      last_movement_at = now(),
      updated_at = now()
  WHERE id = p_protocol_id
  RETURNING * INTO v_protocol;

  RETURN v_protocol;
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_create(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_session_id text := NULLIF(COALESCE(p_payload->>'session_id', ''), '');
  v_user_agent text := NULLIF(COALESCE(p_payload->>'user_agent', ''), '');
  v_protocol public.doc_protocols%ROWTYPE;
  v_protocol_id uuid;
  v_protocol_number text;
  v_sector_origin uuid := NULLIF(p_payload->>'sector_origin_id', '')::uuid;
  v_sector_destination uuid := NULLIF(p_payload->>'sector_destination_id', '')::uuid;
  v_reason_id uuid := NULLIF(p_payload->>'reason_id', '')::uuid;
  v_protocol_date timestamptz := COALESCE(NULLIF(p_payload->>'protocol_date', '')::timestamptz, now());
  v_notes text := NULLIF(COALESCE(p_payload->>'notes', ''), '');
  v_flow_profile_id uuid := NULL;
  v_items jsonb := COALESCE(p_payload->'items', '[]'::jsonb);
  v_item jsonb;
  v_item_id uuid;
  v_idx integer := 0;
  v_rule RECORD;
  v_item_type text;
  v_document_type_id uuid;
  v_protocol_context jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário autenticado é obrigatório';
  END IF;

  IF v_sector_origin IS NULL THEN
    RAISE EXCEPTION 'Setor de origem é obrigatório';
  END IF;

  IF v_sector_destination IS NULL THEN
    RAISE EXCEPTION 'Setor de destino é obrigatório';
  END IF;

  IF v_sector_origin = v_sector_destination THEN
    RAISE EXCEPTION 'Origem e destino não podem ser iguais';
  END IF;

  IF jsonb_typeof(v_items) <> 'array' OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'O protocolo precisa conter ao menos um item';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
  LOOP
    v_item_type := COALESCE(NULLIF(v_item->>'item_type', ''), 'manual');
    v_document_type_id := NULLIF(v_item->>'document_type_id', '')::uuid;
    SELECT * INTO v_rule
    FROM public.doc_protocol_match_rule(v_sector_origin, v_sector_destination, v_document_type_id, v_item_type);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Fluxo inválido para o item % entre os setores informados', COALESCE(v_item->>'manual_title', v_item->>'patient_name', v_item->>'document_reference', '#');
    END IF;

    IF v_flow_profile_id IS NULL THEN
      v_flow_profile_id := v_rule.flow_profile_id;
    END IF;
  END LOOP;

  v_protocol_number := public.doc_protocol_next_number();

  INSERT INTO public.doc_protocols (
    protocol_number,
    protocol_date,
    protocol_type,
    sector_origin_id,
    sector_destination_id,
    reason_id,
    status,
    priority,
    emitter_id,
    external_protocol,
    batch_number,
    notes,
    flow_profile_id,
    sent_at,
    last_movement_at,
    pending_items,
    session_id,
    user_agent
  ) VALUES (
    v_protocol_number,
    v_protocol_date,
    COALESCE(NULLIF(p_payload->>'protocol_type', ''), 'envio'),
    v_sector_origin,
    v_sector_destination,
    v_reason_id,
    'pendente_recebimento',
    COALESCE(NULLIF(p_payload->>'priority', ''), 'normal'),
    v_user_id,
    NULLIF(p_payload->>'external_protocol', ''),
    NULLIF(p_payload->>'batch_number', ''),
    v_notes,
    v_flow_profile_id,
    now(),
    now(),
    jsonb_array_length(v_items),
    v_session_id,
    v_user_agent
  )
  RETURNING * INTO v_protocol;

  v_protocol_id := v_protocol.id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
  LOOP
    v_idx := v_idx + 1;
    INSERT INTO public.doc_protocol_items (
      protocol_id,
      billing_account_id,
      attendance_id,
      patient_id,
      document_type_id,
      item_reason_id,
      item_type,
      account_number,
      medical_record,
      insurance_name,
      attendance_type,
      attendance_date,
      competence,
      current_status,
      item_status,
      priority,
      tags,
      sla_deadline,
      notes,
      sector_origin_id,
      sector_current_id,
      document_reference,
      protocol_reference,
      manual_title,
      item_date,
      pending_reason,
      sort_order,
      snapshot
    ) VALUES (
      v_protocol_id,
      NULLIF(v_item->>'billing_account_id', '')::uuid,
      NULLIF(v_item->>'attendance_id', '')::uuid,
      NULLIF(v_item->>'patient_id', '')::uuid,
      NULLIF(v_item->>'document_type_id', '')::uuid,
      NULLIF(v_item->>'item_reason_id', '')::uuid,
      COALESCE(NULLIF(v_item->>'item_type', ''), 'manual'),
      NULLIF(v_item->>'account_number', ''),
      NULLIF(v_item->>'medical_record', ''),
      NULLIF(v_item->>'insurance_name', ''),
      NULLIF(v_item->>'attendance_type', ''),
      NULLIF(v_item->>'attendance_date', '')::date,
      NULLIF(v_item->>'competence', ''),
      'enviado',
      'enviado',
      COALESCE(NULLIF(v_item->>'priority', ''), COALESCE(NULLIF(p_payload->>'priority', ''), 'normal')),
      CASE
        WHEN jsonb_typeof(v_item->'tags') = 'array' THEN ARRAY(SELECT jsonb_array_elements_text(v_item->'tags'))
        ELSE NULL
      END,
      NULLIF(v_item->>'sla_deadline', '')::timestamptz,
      NULLIF(v_item->>'notes', ''),
      v_sector_origin,
      v_sector_destination,
      NULLIF(v_item->>'document_reference', ''),
      NULLIF(v_item->>'protocol_reference', ''),
      NULLIF(v_item->>'manual_title', ''),
      NULLIF(v_item->>'item_date', '')::date,
      NULLIF(v_item->>'pending_reason', ''),
      v_idx,
      COALESCE(v_item, '{}'::jsonb)
    )
    RETURNING id INTO v_item_id;

    INSERT INTO public.doc_protocol_movements (
      protocol_id,
      item_id,
      movement_type,
      action,
      sector_origin_id,
      sector_destination_id,
      reason_id,
      user_id,
      performed_by,
      performed_at,
      status,
      from_status,
      to_status,
      notes,
      context,
      session_id,
      user_agent
    ) VALUES (
      v_protocol_id,
      v_item_id,
      'envio',
      'item_enviado',
      v_sector_origin,
      v_sector_destination,
      COALESCE(NULLIF(v_item->>'item_reason_id', '')::uuid, v_reason_id),
      v_user_id,
      v_user_id,
      now(),
      'enviado',
      NULL,
      'enviado',
      NULLIF(v_item->>'notes', ''),
      jsonb_build_object('item_snapshot', COALESCE(v_item, '{}'::jsonb)),
      v_session_id,
      v_user_agent
    );

    PERFORM public.doc_protocol_log_event(
      'item',
      v_item_id,
      'item_incluido',
      v_user_id,
      NULL,
      COALESCE(v_item, '{}'::jsonb),
      jsonb_build_object('protocol_id', v_protocol_id),
      v_session_id,
      v_user_agent
    );
  END LOOP;

  v_protocol_context := jsonb_build_object(
    'protocol_number', v_protocol_number,
    'origin', v_sector_origin,
    'destination', v_sector_destination,
    'total_items', jsonb_array_length(v_items)
  );

  INSERT INTO public.doc_protocol_movements (
    protocol_id,
    movement_type,
    action,
    sector_origin_id,
    sector_destination_id,
    reason_id,
    user_id,
    performed_by,
    performed_at,
    status,
    from_status,
    to_status,
    notes,
    context,
    session_id,
    user_agent
  ) VALUES (
    v_protocol_id,
    'envio',
    'protocolo_enviado',
    v_sector_origin,
    v_sector_destination,
    v_reason_id,
    v_user_id,
    v_user_id,
    now(),
    'pendente_recebimento',
    NULL,
    'pendente_recebimento',
    v_notes,
    v_protocol_context,
    v_session_id,
    v_user_agent
  );

  PERFORM public.doc_protocol_log_event(
    'protocol',
    v_protocol_id,
    'protocolo_criado',
    v_user_id,
    NULL,
    to_jsonb(v_protocol),
    v_protocol_context,
    v_session_id,
    v_user_agent
  );

  RETURN (
    SELECT jsonb_build_object(
      'protocol_id', p.id,
      'protocol_number', p.protocol_number,
      'status', p.status
    )
    FROM public.doc_protocols p
    WHERE p.id = v_protocol_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_receive(
  p_protocol_id uuid,
  p_observation text DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_protocol public.doc_protocols%ROWTYPE;
  v_item RECORD;
BEGIN
  SELECT * INTO v_protocol
  FROM public.doc_protocols
  WHERE id = p_protocol_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Protocolo não encontrado';
  END IF;

  IF v_protocol.status = 'cancelado' THEN
    RAISE EXCEPTION 'Protocolo cancelado não pode ser recebido';
  END IF;

  FOR v_item IN
    SELECT *
    FROM public.doc_protocol_items
    WHERE protocol_id = p_protocol_id
      AND item_status NOT IN ('aceito', 'concluido', 'devolvido')
  LOOP
    UPDATE public.doc_protocol_items
    SET item_status = 'aceito',
        current_status = 'aceito',
        accepted_at = now(),
        sector_current_id = v_protocol.sector_destination_id
    WHERE id = v_item.id;

    INSERT INTO public.doc_protocol_movements (
      protocol_id,
      item_id,
      movement_type,
      action,
      sector_origin_id,
      sector_destination_id,
      user_id,
      performed_by,
      performed_at,
      status,
      acceptance_type,
      from_status,
      to_status,
      notes,
      session_id,
      user_agent
    ) VALUES (
      p_protocol_id,
      v_item.id,
      'recebimento',
      'item_aceito',
      v_protocol.sector_origin_id,
      v_protocol.sector_destination_id,
      v_user_id,
      v_user_id,
      now(),
      'recebido',
      'integral',
      v_item.item_status,
      'aceito',
      p_observation,
      p_session_id,
      p_user_agent
    );
  END LOOP;

  UPDATE public.doc_protocols
  SET receiver_id = v_user_id,
      accepted_at = now(),
      received_at = now(),
      acceptance_type = 'integral',
      status = 'recebido',
      last_movement_at = now(),
      session_id = COALESCE(p_session_id, session_id),
      user_agent = COALESCE(p_user_agent, user_agent),
      updated_at = now()
  WHERE id = p_protocol_id;

  INSERT INTO public.doc_protocol_movements (
    protocol_id,
    movement_type,
    action,
    sector_origin_id,
    sector_destination_id,
    user_id,
    performed_by,
    performed_at,
    status,
    acceptance_type,
    from_status,
    to_status,
    notes,
    context,
    session_id,
    user_agent
  ) VALUES (
    p_protocol_id,
    'recebimento',
    'protocolo_recebido',
    v_protocol.sector_origin_id,
    v_protocol.sector_destination_id,
    v_user_id,
    v_user_id,
    now(),
    'recebido',
    'integral',
    v_protocol.status,
    'recebido',
    p_observation,
    jsonb_build_object('mode', 'integral'),
    p_session_id,
    p_user_agent
  );

  PERFORM public.doc_protocol_log_event(
    'protocol',
    p_protocol_id,
    'recebimento_integral',
    v_user_id,
    to_jsonb(v_protocol),
    to_jsonb((SELECT p FROM public.doc_protocols p WHERE p.id = p_protocol_id)),
    jsonb_build_object('mode', 'integral', 'observation', p_observation),
    p_session_id,
    p_user_agent
  );

  PERFORM public.doc_protocol_recompute(p_protocol_id);

  RETURN (
    SELECT jsonb_build_object(
      'protocol_id', p.id,
      'status', p.status,
      'accepted_items', p.accepted_items,
      'returned_items', p.returned_items,
      'pending_items', p.pending_items
    )
    FROM public.doc_protocols p
    WHERE p.id = p_protocol_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_receive_partially(
  p_protocol_id uuid,
  p_accepted_item_ids uuid[] DEFAULT '{}',
  p_pending_item_ids uuid[] DEFAULT '{}',
  p_returned_items jsonb DEFAULT '[]'::jsonb,
  p_observation text DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_protocol public.doc_protocols%ROWTYPE;
  v_item RECORD;
  v_returned jsonb;
  v_item_id uuid;
  v_reason_id uuid;
  v_return_note text;
BEGIN
  SELECT * INTO v_protocol
  FROM public.doc_protocols
  WHERE id = p_protocol_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Protocolo não encontrado';
  END IF;

  FOREACH v_item_id IN ARRAY COALESCE(p_accepted_item_ids, '{}')
  LOOP
    UPDATE public.doc_protocol_items
    SET item_status = 'aceito',
        current_status = 'aceito',
        accepted_at = now(),
        sector_current_id = v_protocol.sector_destination_id,
        pending_reason = NULL
    WHERE id = v_item_id
      AND protocol_id = p_protocol_id;

    INSERT INTO public.doc_protocol_movements (
      protocol_id,
      item_id,
      movement_type,
      action,
      sector_origin_id,
      sector_destination_id,
      user_id,
      performed_by,
      performed_at,
      status,
      acceptance_type,
      from_status,
      to_status,
      notes,
      session_id,
      user_agent
    ) VALUES (
      p_protocol_id,
      v_item_id,
      'recebimento',
      'item_aceito',
      v_protocol.sector_origin_id,
      v_protocol.sector_destination_id,
      v_user_id,
      v_user_id,
      now(),
      'aceito',
      'parcial',
      'enviado',
      'aceito',
      p_observation,
      p_session_id,
      p_user_agent
    );
  END LOOP;

  FOREACH v_item_id IN ARRAY COALESCE(p_pending_item_ids, '{}')
  LOOP
    UPDATE public.doc_protocol_items
    SET item_status = 'pendente',
        current_status = 'pendente',
        pending_reason = COALESCE(p_observation, pending_reason),
        sector_current_id = v_protocol.sector_destination_id
    WHERE id = v_item_id
      AND protocol_id = p_protocol_id;

    INSERT INTO public.doc_protocol_movements (
      protocol_id,
      item_id,
      movement_type,
      action,
      sector_origin_id,
      sector_destination_id,
      user_id,
      performed_by,
      performed_at,
      status,
      acceptance_type,
      from_status,
      to_status,
      notes,
      session_id,
      user_agent
    ) VALUES (
      p_protocol_id,
      v_item_id,
      'recebimento',
      'item_pendente',
      v_protocol.sector_origin_id,
      v_protocol.sector_destination_id,
      v_user_id,
      v_user_id,
      now(),
      'pendente',
      'parcial',
      'enviado',
      'pendente',
      p_observation,
      p_session_id,
      p_user_agent
    );
  END LOOP;

  FOR v_returned IN SELECT * FROM jsonb_array_elements(COALESCE(p_returned_items, '[]'::jsonb))
  LOOP
    v_item_id := NULLIF(v_returned->>'item_id', '')::uuid;
    v_reason_id := NULLIF(v_returned->>'reason_id', '')::uuid;
    v_return_note := COALESCE(NULLIF(v_returned->>'return_reason', ''), NULLIF(v_returned->>'notes', ''), p_observation);

    IF v_item_id IS NULL OR COALESCE(v_return_note, '') = '' THEN
      RAISE EXCEPTION 'Todo item devolvido precisa ter item_id e motivo';
    END IF;

    UPDATE public.doc_protocol_items
    SET item_status = 'devolvido',
        current_status = 'devolvido',
        return_reason = v_return_note,
        returned_at = now(),
        sector_current_id = v_protocol.sector_origin_id,
        item_reason_id = COALESCE(v_reason_id, item_reason_id)
    WHERE id = v_item_id
      AND protocol_id = p_protocol_id;

    INSERT INTO public.doc_protocol_movements (
      protocol_id,
      item_id,
      movement_type,
      action,
      sector_origin_id,
      sector_destination_id,
      reason_id,
      user_id,
      performed_by,
      performed_at,
      status,
      acceptance_type,
      from_status,
      to_status,
      notes,
      session_id,
      user_agent
    ) VALUES (
      p_protocol_id,
      v_item_id,
      'devolucao',
      'item_devolvido',
      v_protocol.sector_destination_id,
      v_protocol.sector_origin_id,
      v_reason_id,
      v_user_id,
      v_user_id,
      now(),
      'devolvido',
      'parcial',
      'enviado',
      'devolvido',
      v_return_note,
      p_session_id,
      p_user_agent
    );
  END LOOP;

  UPDATE public.doc_protocols
  SET receiver_id = v_user_id,
      accepted_at = COALESCE(accepted_at, now()),
      received_at = COALESCE(received_at, now()),
      acceptance_type = 'parcial',
      last_movement_at = now(),
      session_id = COALESCE(p_session_id, session_id),
      user_agent = COALESCE(p_user_agent, user_agent),
      updated_at = now()
  WHERE id = p_protocol_id;

  INSERT INTO public.doc_protocol_movements (
    protocol_id,
    movement_type,
    action,
    sector_origin_id,
    sector_destination_id,
    user_id,
    performed_by,
    performed_at,
    status,
    acceptance_type,
    from_status,
    to_status,
    notes,
    context,
    session_id,
    user_agent
  ) VALUES (
    p_protocol_id,
    'recebimento',
    'protocolo_recebimento_parcial',
    v_protocol.sector_origin_id,
    v_protocol.sector_destination_id,
    v_user_id,
    v_user_id,
    now(),
    'aceito_parcialmente',
    'parcial',
    v_protocol.status,
    'aceito_parcialmente',
    p_observation,
    jsonb_build_object(
      'accepted_item_ids', COALESCE(p_accepted_item_ids, '{}'),
      'pending_item_ids', COALESCE(p_pending_item_ids, '{}'),
      'returned_items', COALESCE(p_returned_items, '[]'::jsonb)
    ),
    p_session_id,
    p_user_agent
  );

  PERFORM public.doc_protocol_log_event(
    'protocol',
    p_protocol_id,
    'recebimento_parcial',
    v_user_id,
    to_jsonb(v_protocol),
    NULL,
    jsonb_build_object(
      'accepted_item_ids', COALESCE(p_accepted_item_ids, '{}'),
      'pending_item_ids', COALESCE(p_pending_item_ids, '{}'),
      'returned_items', COALESCE(p_returned_items, '[]'::jsonb),
      'observation', p_observation
    ),
    p_session_id,
    p_user_agent
  );

  PERFORM public.doc_protocol_recompute(p_protocol_id);

  RETURN (
    SELECT jsonb_build_object(
      'protocol_id', p.id,
      'status', p.status,
      'accepted_items', p.accepted_items,
      'returned_items', p.returned_items,
      'pending_items', p.pending_items
    )
    FROM public.doc_protocols p
    WHERE p.id = p_protocol_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_return_items(
  p_protocol_id uuid,
  p_returned_items jsonb,
  p_observation text DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.doc_protocol_receive_partially(
    p_protocol_id,
    '{}'::uuid[],
    '{}'::uuid[],
    COALESCE(p_returned_items, '[]'::jsonb),
    p_observation,
    p_session_id,
    p_user_agent
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_cancel(
  p_protocol_id uuid,
  p_reason text,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_protocol public.doc_protocols%ROWTYPE;
BEGIN
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'Motivo do cancelamento é obrigatório';
  END IF;

  SELECT * INTO v_protocol
  FROM public.doc_protocols
  WHERE id = p_protocol_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Protocolo não encontrado';
  END IF;

  IF v_protocol.status IN ('recebido', 'concluido') THEN
    RAISE EXCEPTION 'Protocolo já finalizado não pode ser cancelado';
  END IF;

  UPDATE public.doc_protocols
  SET status = 'cancelado',
      cancel_reason = p_reason,
      last_movement_at = now(),
      updated_at = now()
  WHERE id = p_protocol_id;

  INSERT INTO public.doc_protocol_movements (
    protocol_id,
    movement_type,
    action,
    sector_origin_id,
    sector_destination_id,
    user_id,
    performed_by,
    performed_at,
    status,
    from_status,
    to_status,
    notes,
    session_id,
    user_agent
  ) VALUES (
    p_protocol_id,
    'cancelamento',
    'protocolo_cancelado',
    v_protocol.sector_origin_id,
    v_protocol.sector_destination_id,
    v_user_id,
    v_user_id,
    now(),
    'cancelado',
    v_protocol.status,
    'cancelado',
    p_reason,
    p_session_id,
    p_user_agent
  );

  PERFORM public.doc_protocol_log_event(
    'protocol',
    p_protocol_id,
    'cancelamento',
    v_user_id,
    to_jsonb(v_protocol),
    to_jsonb((SELECT p FROM public.doc_protocols p WHERE p.id = p_protocol_id)),
    jsonb_build_object('reason', p_reason),
    p_session_id,
    p_user_agent
  );

  RETURN (
    SELECT jsonb_build_object(
      'protocol_id', p.id,
      'status', p.status,
      'cancel_reason', p.cancel_reason
    )
    FROM public.doc_protocols p
    WHERE p.id = p_protocol_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_duplicate(
  p_protocol_id uuid,
  p_sector_origin_id uuid DEFAULT NULL,
  p_sector_destination_id uuid DEFAULT NULL,
  p_reason_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_protocol public.doc_protocols%ROWTYPE;
  v_payload jsonb;
BEGIN
  SELECT * INTO v_protocol
  FROM public.doc_protocols
  WHERE id = p_protocol_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Protocolo não encontrado';
  END IF;

  v_payload := jsonb_build_object(
    'protocol_type', v_protocol.protocol_type,
    'sector_origin_id', COALESCE(p_sector_origin_id, v_protocol.sector_origin_id),
    'sector_destination_id', COALESCE(p_sector_destination_id, v_protocol.sector_destination_id),
    'reason_id', COALESCE(p_reason_id, v_protocol.reason_id),
    'priority', v_protocol.priority,
    'external_protocol', v_protocol.external_protocol,
    'batch_number', v_protocol.batch_number,
    'notes', COALESCE(p_notes, v_protocol.notes),
    'session_id', p_session_id,
    'user_agent', p_user_agent,
    'items',
    COALESCE((
      SELECT jsonb_agg(
        jsonb_strip_nulls(
          jsonb_build_object(
            'billing_account_id', i.billing_account_id,
            'attendance_id', i.attendance_id,
            'patient_id', i.patient_id,
            'document_type_id', i.document_type_id,
            'item_reason_id', i.item_reason_id,
            'item_type', i.item_type,
            'account_number', i.account_number,
            'medical_record', i.medical_record,
            'insurance_name', i.insurance_name,
            'attendance_type', i.attendance_type,
            'attendance_date', i.attendance_date,
            'competence', i.competence,
            'priority', i.priority,
            'notes', i.notes,
            'document_reference', i.document_reference,
            'protocol_reference', i.protocol_reference,
            'manual_title', i.manual_title,
            'item_date', i.item_date,
            'tags', to_jsonb(i.tags),
            'snapshot', i.snapshot
          )
        )
        ORDER BY i.sort_order, i.created_at
      )
      FROM public.doc_protocol_items i
      WHERE i.protocol_id = p_protocol_id
    ), '[]'::jsonb)
  );

  RETURN public.doc_protocol_create(v_payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.doc_protocol_reissue(
  p_protocol_id uuid,
  p_sector_origin_id uuid DEFAULT NULL,
  p_sector_destination_id uuid DEFAULT NULL,
  p_reason_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.doc_protocol_duplicate(
    p_protocol_id,
    p_sector_origin_id,
    p_sector_destination_id,
    p_reason_id,
    p_notes,
    p_session_id,
    p_user_agent
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.doc_protocol_next_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.doc_protocol_create(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.doc_protocol_receive(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.doc_protocol_receive_partially(uuid, uuid[], uuid[], jsonb, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.doc_protocol_return_items(uuid, jsonb, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.doc_protocol_cancel(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.doc_protocol_duplicate(uuid, uuid, uuid, uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.doc_protocol_reissue(uuid, uuid, uuid, uuid, text, text, text) TO authenticated;

INSERT INTO public.doc_protocol_flow_profiles (name, code, description, active, is_default)
VALUES ('Geral', 'geral', 'Fluxo documental geral do módulo de protocolo', true, true)
ON CONFLICT (code) DO UPDATE
SET active = EXCLUDED.active,
    is_default = EXCLUDED.is_default,
    description = EXCLUDED.description,
    updated_at = now();

INSERT INTO public.doc_protocol_flow_rules (
  flow_profile_id,
  sector_origin_id,
  sector_destination_id,
  rule_order,
  active,
  allows_return,
  return_is_restricted,
  notes
)
SELECT
  fp.id,
  s.id,
  allowed_dest,
  0,
  s.active,
  COALESCE(s.can_return, false),
  false,
  'Regra migrada de allowed_destinations'
FROM public.doc_protocol_sectors s
INNER JOIN public.doc_protocol_flow_profiles fp
  ON fp.code = 'geral'
INNER JOIN LATERAL unnest(COALESCE(s.allowed_destinations, '{}'::uuid[])) AS allowed_dest ON true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.doc_protocol_flow_rules r
  WHERE r.flow_profile_id = fp.id
    AND r.sector_origin_id = s.id
    AND r.sector_destination_id = allowed_dest
);

WITH item_order AS (
  SELECT
    i.id,
    ROW_NUMBER() OVER (PARTITION BY i.protocol_id ORDER BY i.created_at, i.id) AS computed_sort_order
  FROM public.doc_protocol_items i
)
UPDATE public.doc_protocol_items i
SET sector_origin_id = COALESCE(i.sector_origin_id, p.sector_origin_id),
    sector_current_id = COALESCE(i.sector_current_id, p.sector_destination_id),
    item_date = COALESCE(i.item_date, i.attendance_date),
    item_type = CASE
      WHEN i.billing_account_id IS NOT NULL THEN 'billing_account'
      WHEN i.attendance_id IS NOT NULL THEN 'attendance'
      WHEN i.patient_id IS NOT NULL THEN 'patient_document'
      ELSE COALESCE(i.item_type, 'manual')
    END,
    sort_order = CASE WHEN i.sort_order = 0 THEN io.computed_sort_order ELSE i.sort_order END,
    snapshot = CASE
      WHEN i.snapshot = '{}'::jsonb THEN jsonb_strip_nulls(
        jsonb_build_object(
          'billing_account_id', i.billing_account_id,
          'attendance_id', i.attendance_id,
          'patient_id', i.patient_id,
          'document_type_id', i.document_type_id,
          'insurance_name', i.insurance_name,
          'competence', i.competence,
          'account_number', i.account_number,
          'medical_record', i.medical_record,
          'notes', i.notes
        )
      )
      ELSE i.snapshot
    END
FROM public.doc_protocols p
, item_order io
WHERE p.id = i.protocol_id
  AND io.id = i.id;

UPDATE public.doc_protocols
SET sent_at = COALESCE(sent_at, created_at),
    last_movement_at = COALESCE(last_movement_at, accepted_at, created_at),
    pending_items = GREATEST(total_items - COALESCE(accepted_items, 0) - COALESCE(returned_items, 0), 0);

DO $$
DECLARE
  v_protocol_id uuid;
BEGIN
  FOR v_protocol_id IN SELECT id FROM public.doc_protocols
  LOOP
    PERFORM public.doc_protocol_recompute(v_protocol_id);
  END LOOP;
END $$;
