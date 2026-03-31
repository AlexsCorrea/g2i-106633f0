
-- Add structured fields to appointments for enhanced scheduling
ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS insurance TEXT,
  ADD COLUMN IF NOT EXISTS origin_channel TEXT DEFAULT 'interno',
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS is_return BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new_patient BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_fit_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS agenda_id UUID REFERENCES public.schedule_agendas(id),
  ADD COLUMN IF NOT EXISTS room TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS attendance_id UUID;

-- Add columns to surgical_procedures for enhanced surgical scheduling
ALTER TABLE public.surgical_procedures
  ADD COLUMN IF NOT EXISTS room TEXT,
  ADD COLUMN IF NOT EXISTS insurance TEXT,
  ADD COLUMN IF NOT EXISTS surgery_character TEXT DEFAULT 'eletivo',
  ADD COLUMN IF NOT EXISTS needs_icu BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pre_op_cid TEXT,
  ADD COLUMN IF NOT EXISTS expected_stay TEXT DEFAULT 'day_clinic',
  ADD COLUMN IF NOT EXISTS accommodation TEXT,
  ADD COLUMN IF NOT EXISTS surgical_risk TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS is_inpatient BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS opme TEXT,
  ADD COLUMN IF NOT EXISTS blood_reserve TEXT,
  ADD COLUMN IF NOT EXISTS equipment TEXT,
  ADD COLUMN IF NOT EXISTS fasting_notes TEXT,
  ADD COLUMN IF NOT EXISTS nursing_notes TEXT,
  ADD COLUMN IF NOT EXISTS anesthetist_name TEXT;
