
-- 1. Agenda Insurances (Convênios por Agenda)
CREATE TABLE public.agenda_insurances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agenda_id UUID REFERENCES public.schedule_agendas(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  daily_limit INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agenda_insurances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_insurances_select_auth" ON public.agenda_insurances FOR SELECT TO authenticated USING (true);
CREATE POLICY "agenda_insurances_insert_auth" ON public.agenda_insurances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agenda_insurances_update_auth" ON public.agenda_insurances FOR UPDATE TO authenticated USING (true);
CREATE POLICY "agenda_insurances_delete_auth" ON public.agenda_insurances FOR DELETE TO authenticated USING (true);

-- 2. Agenda Procedures (Procedimentos por Agenda)
CREATE TABLE public.agenda_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agenda_id UUID REFERENCES public.schedule_agendas(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  custom_name TEXT,
  duration_minutes INTEGER DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agenda_procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_procedures_select_auth" ON public.agenda_procedures FOR SELECT TO authenticated USING (true);
CREATE POLICY "agenda_procedures_insert_auth" ON public.agenda_procedures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agenda_procedures_update_auth" ON public.agenda_procedures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "agenda_procedures_delete_auth" ON public.agenda_procedures FOR DELETE TO authenticated USING (true);

-- 3. Agenda Appointment Types (Tipos de Atendimento)
CREATE TABLE public.agenda_appointment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  requires_return_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agenda_appointment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_appt_types_select_auth" ON public.agenda_appointment_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "agenda_appt_types_insert_auth" ON public.agenda_appointment_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agenda_appt_types_update_auth" ON public.agenda_appointment_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "agenda_appt_types_delete_auth" ON public.agenda_appointment_types FOR DELETE TO authenticated USING (true);

-- 4. Agenda Type Orientations (Tipos x Orientações)
CREATE TABLE public.agenda_type_orientations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_type_id UUID REFERENCES public.agenda_appointment_types(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  options JSONB,
  required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agenda_type_orientations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_orientations_select_auth" ON public.agenda_type_orientations FOR SELECT TO authenticated USING (true);
CREATE POLICY "agenda_orientations_insert_auth" ON public.agenda_type_orientations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agenda_orientations_update_auth" ON public.agenda_type_orientations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "agenda_orientations_delete_auth" ON public.agenda_type_orientations FOR DELETE TO authenticated USING (true);

-- 5. Agenda Statuses (Situações)
CREATE TABLE public.agenda_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  allowed_transitions TEXT[],
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agenda_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_statuses_select_auth" ON public.agenda_statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "agenda_statuses_insert_auth" ON public.agenda_statuses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agenda_statuses_update_auth" ON public.agenda_statuses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "agenda_statuses_delete_auth" ON public.agenda_statuses FOR DELETE TO authenticated USING (true);

-- 6. Agenda Permissions (Permissões)
CREATE TABLE public.agenda_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agenda_id UUID REFERENCES public.schedule_agendas(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_name TEXT,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_cancel BOOLEAN NOT NULL DEFAULT false,
  can_reschedule BOOLEAN NOT NULL DEFAULT false,
  can_fit_in BOOLEAN NOT NULL DEFAULT false,
  can_open_attendance BOOLEAN NOT NULL DEFAULT false,
  can_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agenda_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_permissions_select_auth" ON public.agenda_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "agenda_permissions_insert_auth" ON public.agenda_permissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agenda_permissions_update_auth" ON public.agenda_permissions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "agenda_permissions_delete_auth" ON public.agenda_permissions FOR DELETE TO authenticated USING (true);

-- Seed default statuses
INSERT INTO public.agenda_statuses (name, color, icon, display_order, is_system, allowed_transitions) VALUES
  ('agendado', '#3b82f6', 'calendar', 1, true, ARRAY['confirmado','cancelado','reagendado']),
  ('confirmado', '#8b5cf6', 'check-circle', 2, true, ARRAY['chegou','cancelado','reagendado','nao_compareceu']),
  ('chegou', '#f59e0b', 'log-in', 3, true, ARRAY['em_espera','em_atendimento','cancelado']),
  ('em_espera', '#f97316', 'clock', 4, true, ARRAY['em_atendimento','cancelado']),
  ('em_atendimento', '#6366f1', 'stethoscope', 5, true, ARRAY['concluido']),
  ('concluido', '#22c55e', 'check', 6, true, ARRAY[]::text[]),
  ('cancelado', '#ef4444', 'x-circle', 7, true, ARRAY['agendado']),
  ('nao_compareceu', '#64748b', 'user-x', 8, true, ARRAY['agendado','reagendado']),
  ('reagendado', '#0ea5e9', 'refresh-cw', 9, true, ARRAY['agendado']),
  ('encaixe', '#a855f7', 'shield-alert', 10, true, ARRAY['confirmado','chegou','cancelado']);

-- Seed default appointment types
INSERT INTO public.agenda_appointment_types (name, description, display_order) VALUES
  ('Primeira Vez', 'Paciente sem atendimento prévio na especialidade', 1),
  ('Retorno', 'Retorno dentro do prazo estipulado', 2),
  ('Rotina', 'Consulta de acompanhamento regular', 3),
  ('Emergencial', 'Encaixe prioritário por urgência clínica', 4),
  ('Pré-Operatório', 'Avaliação pré-cirúrgica', 5),
  ('Pós-Operatório', 'Acompanhamento pós-cirúrgico', 6);
