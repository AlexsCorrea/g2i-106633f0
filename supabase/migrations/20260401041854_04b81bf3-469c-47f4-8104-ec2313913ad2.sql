
-- Make patient_id nullable for provisional patients
ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;

-- Add provisional patient fields
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS provisional_name text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS provisional_birth_date date;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS provisional_gender text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS provisional_phone text;

-- Create appointment_logs table for audit trail
CREATE TABLE public.appointment_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL,
  action text NOT NULL,
  old_status text,
  new_status text,
  changed_by uuid,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.appointment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointment_logs_select_auth" ON public.appointment_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "appointment_logs_insert_auth" ON public.appointment_logs FOR INSERT TO authenticated WITH CHECK (true);
