
-- Tabela de agendas (estrutura)
CREATE TABLE public.schedule_agendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  description text,
  status text NOT NULL DEFAULT 'ativa',
  professional_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  allow_no_professional boolean NOT NULL DEFAULT false,
  unit text,
  sector text,
  specialty text,
  room_resource text,
  default_interval integer NOT NULL DEFAULT 30,
  default_duration integer NOT NULL DEFAULT 30,
  agenda_type text NOT NULL DEFAULT 'consulta',
  opening_mode text NOT NULL DEFAULT 'grade_fixa',
  accepts_fit_in boolean NOT NULL DEFAULT true,
  allows_overlap boolean NOT NULL DEFAULT false,
  requires_confirmation boolean NOT NULL DEFAULT false,
  allows_retroactive boolean NOT NULL DEFAULT false,
  daily_patient_limit integer,
  fit_in_limit_per_shift integer,
  delay_tolerance integer DEFAULT 15,
  accepts_return boolean NOT NULL DEFAULT true,
  auto_block_holidays boolean NOT NULL DEFAULT true,
  allows_multi_unit boolean NOT NULL DEFAULT false,
  insurance_control boolean NOT NULL DEFAULT false,
  allowed_insurances text[],
  blocked_insurances text[],
  notify_whatsapp boolean NOT NULL DEFAULT false,
  auto_confirm boolean NOT NULL DEFAULT false,
  pre_appointment_reminder boolean NOT NULL DEFAULT false,
  absence_notification boolean NOT NULL DEFAULT false,
  internal_notes text,
  reception_rules text,
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_agendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_agendas_select_auth" ON public.schedule_agendas FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_agendas_insert_auth" ON public.schedule_agendas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_agendas_update_auth" ON public.schedule_agendas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_agendas_delete_auth" ON public.schedule_agendas FOR DELETE TO authenticated USING (true);

-- Períodos da agenda (grade semanal)
CREATE TABLE public.schedule_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id uuid NOT NULL REFERENCES public.schedule_agendas(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  period_type text NOT NULL DEFAULT 'manha',
  start_time time NOT NULL,
  end_time time NOT NULL,
  interval_minutes integer NOT NULL DEFAULT 30,
  slot_count integer,
  block_type text NOT NULL DEFAULT 'atendimento',
  opening_type text NOT NULL DEFAULT 'automatica',
  allows_fit_in boolean NOT NULL DEFAULT true,
  allowed_insurances text[],
  allowed_procedures text[],
  notes text,
  valid_from date,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_periods_select_auth" ON public.schedule_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_periods_insert_auth" ON public.schedule_periods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_periods_update_auth" ON public.schedule_periods FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_periods_delete_auth" ON public.schedule_periods FOR DELETE TO authenticated USING (true);

-- Horários especiais
CREATE TABLE public.schedule_special_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id uuid NOT NULL REFERENCES public.schedule_agendas(id) ON DELETE CASCADE,
  specific_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_type text NOT NULL DEFAULT 'atendimento',
  slot_count integer,
  professional_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  unit text,
  origin text NOT NULL DEFAULT 'manual',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_special_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_special_hours_select_auth" ON public.schedule_special_hours FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_special_hours_insert_auth" ON public.schedule_special_hours FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_special_hours_update_auth" ON public.schedule_special_hours FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_special_hours_delete_auth" ON public.schedule_special_hours FOR DELETE TO authenticated USING (true);

-- Bloqueios da agenda
CREATE TABLE public.schedule_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id uuid NOT NULL REFERENCES public.schedule_agendas(id) ON DELETE CASCADE,
  block_type text NOT NULL DEFAULT 'total',
  start_date date NOT NULL,
  start_time time,
  end_date date NOT NULL,
  end_time time,
  recurrence text,
  reason text NOT NULL,
  internal_notes text,
  origin text NOT NULL DEFAULT 'manual',
  affected_slots integer DEFAULT 0,
  affected_patients integer DEFAULT 0,
  block_new_only boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_blocks_select_auth" ON public.schedule_blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_blocks_insert_auth" ON public.schedule_blocks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_blocks_update_auth" ON public.schedule_blocks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_blocks_delete_auth" ON public.schedule_blocks FOR DELETE TO authenticated USING (true);

-- Feriados
CREATE TABLE public.schedule_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  holiday_type text NOT NULL DEFAULT 'nacional',
  holiday_date date NOT NULL,
  unit text,
  auto_block boolean NOT NULL DEFAULT true,
  allows_exception boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_holidays_select_auth" ON public.schedule_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_holidays_insert_auth" ON public.schedule_holidays FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_holidays_update_auth" ON public.schedule_holidays FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_holidays_delete_auth" ON public.schedule_holidays FOR DELETE TO authenticated USING (true);

-- Fila de espera
CREATE TABLE public.schedule_wait_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  agenda_id uuid REFERENCES public.schedule_agendas(id) ON DELETE SET NULL,
  professional_name text,
  desired_date date,
  desired_period text,
  appointment_type text,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'aguardando',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_wait_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_wait_list_select_auth" ON public.schedule_wait_list FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_wait_list_insert_auth" ON public.schedule_wait_list FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_wait_list_update_auth" ON public.schedule_wait_list FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_wait_list_delete_auth" ON public.schedule_wait_list FOR DELETE TO authenticated USING (true);

-- Anotações e particularidades da agenda
CREATE TABLE public.schedule_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id uuid NOT NULL REFERENCES public.schedule_agendas(id) ON DELETE CASCADE,
  note_type text NOT NULL DEFAULT 'anotacao',
  specific_date date,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_notes_select_auth" ON public.schedule_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_notes_insert_auth" ON public.schedule_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_notes_update_auth" ON public.schedule_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_notes_delete_auth" ON public.schedule_notes FOR DELETE TO authenticated USING (true);
