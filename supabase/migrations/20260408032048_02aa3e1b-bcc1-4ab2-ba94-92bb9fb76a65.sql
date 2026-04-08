
-- Recollection tracking
CREATE TABLE IF NOT EXISTS public.lab_recollections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_sample_id UUID REFERENCES public.lab_samples(id),
  new_sample_id UUID REFERENCES public.lab_samples(id),
  request_item_id UUID REFERENCES public.lab_request_items(id),
  patient_id UUID REFERENCES public.patients(id),
  reason TEXT NOT NULL,
  notes TEXT,
  requested_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_recollections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage lab_recollections" ON public.lab_recollections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Critical result communication log
CREATE TABLE IF NOT EXISTS public.lab_critical_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES public.lab_results(id),
  request_item_id UUID REFERENCES public.lab_request_items(id),
  patient_id UUID REFERENCES public.patients(id),
  communicated_to TEXT NOT NULL,
  communication_method TEXT NOT NULL DEFAULT 'telefone',
  communicated_by UUID,
  communicated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_critical_communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage lab_critical_communications" ON public.lab_critical_communications FOR ALL TO authenticated USING (true) WITH CHECK (true);
