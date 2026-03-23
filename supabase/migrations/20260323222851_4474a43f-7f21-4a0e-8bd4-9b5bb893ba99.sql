
-- Exam requests table
CREATE TABLE public.exam_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES public.profiles(id) NOT NULL,
  exam_type TEXT NOT NULL,
  exam_category TEXT NOT NULL DEFAULT 'laboratorial',
  priority TEXT NOT NULL DEFAULT 'rotina',
  status TEXT NOT NULL DEFAULT 'solicitado',
  observations TEXT,
  result_text TEXT,
  result_date TIMESTAMP WITH TIME ZONE,
  collected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exames visíveis para autenticados" ON public.exam_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profissionais podem solicitar exames" ON public.exam_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Profissionais podem atualizar exames" ON public.exam_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Profissionais podem deletar exames" ON public.exam_requests FOR DELETE TO authenticated USING (true);

-- Pharmacy dispensations table
CREATE TABLE public.pharmacy_dispensations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  dispensed_by UUID REFERENCES public.profiles(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  batch_number TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  dispensed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pharmacy_dispensations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dispensações visíveis para autenticados" ON public.pharmacy_dispensations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Farmácia pode dispensar" ON public.pharmacy_dispensations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Farmácia pode atualizar dispensação" ON public.pharmacy_dispensations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Farmácia pode deletar dispensação" ON public.pharmacy_dispensations FOR DELETE TO authenticated USING (true);

-- Medication administrations (nursing checklist)
CREATE TABLE public.medication_administrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  administered_by UUID REFERENCES public.profiles(id) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  administered_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medication_administrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Administrações visíveis para autenticados" ON public.medication_administrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enfermagem pode administrar" ON public.medication_administrations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enfermagem pode atualizar administração" ON public.medication_administrations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enfermagem pode deletar administração" ON public.medication_administrations FOR DELETE TO authenticated USING (true);

-- Surgical procedures
CREATE TABLE public.surgical_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  surgeon_id UUID REFERENCES public.profiles(id) NOT NULL,
  procedure_type TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  anesthesia_type TEXT,
  team_members TEXT,
  status TEXT NOT NULL DEFAULT 'agendado',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.surgical_procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cirurgias visíveis para autenticados" ON public.surgical_procedures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profissionais podem criar cirurgias" ON public.surgical_procedures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Profissionais podem atualizar cirurgias" ON public.surgical_procedures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Profissionais podem deletar cirurgias" ON public.surgical_procedures FOR DELETE TO authenticated USING (true);

-- Fluid balance
CREATE TABLE public.fluid_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  recorded_by UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL,
  direction TEXT NOT NULL,
  volume_ml INTEGER NOT NULL,
  shift TEXT,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fluid_balance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Balanço visível para autenticados" ON public.fluid_balance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profissionais podem registrar balanço" ON public.fluid_balance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Profissionais podem atualizar balanço" ON public.fluid_balance FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Profissionais podem deletar balanço" ON public.fluid_balance FOR DELETE TO authenticated USING (true);

-- Adverse events
CREATE TABLE public.adverse_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES public.profiles(id) NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'leve',
  description TEXT NOT NULL,
  actions_taken TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.adverse_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eventos visíveis para autenticados" ON public.adverse_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profissionais podem criar eventos" ON public.adverse_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Profissionais podem atualizar eventos" ON public.adverse_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Profissionais podem deletar eventos" ON public.adverse_events FOR DELETE TO authenticated USING (true);

-- Multidisciplinary notes (generic for all specialties)
CREATE TABLE public.multidisciplinary_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) NOT NULL,
  specialty TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'evolucao',
  content TEXT NOT NULL,
  therapeutic_plan TEXT,
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.multidisciplinary_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notas multi visíveis para autenticados" ON public.multidisciplinary_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profissionais podem criar notas multi" ON public.multidisciplinary_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Profissionais podem atualizar notas multi" ON public.multidisciplinary_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Profissionais podem deletar notas multi" ON public.multidisciplinary_notes FOR DELETE TO authenticated USING (true);
