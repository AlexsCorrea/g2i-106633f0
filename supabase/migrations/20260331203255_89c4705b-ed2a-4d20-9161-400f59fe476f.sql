ALTER TABLE public.schedule_holidays
ADD COLUMN IF NOT EXISTS affected_agendas text[],
ADD COLUMN IF NOT EXISTS notes text;