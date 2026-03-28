
ALTER TABLE public.queue_tickets
  ADD COLUMN IF NOT EXISTS recall_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.unit_config
  ADD COLUMN IF NOT EXISTS voice_rate numeric NOT NULL DEFAULT 0.85,
  ADD COLUMN IF NOT EXISTS voice_pitch numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS voice_volume numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS pre_call_sound text NOT NULL DEFAULT 'triple_tone';
