
ALTER TABLE public.unit_config
  ADD COLUMN IF NOT EXISTS locution_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS locution_speak_priority boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS locution_speak_location boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_clock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_history boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ads_idle_seconds integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS totem_retirar_senha boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS totem_checkin boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS totem_timeout_seconds integer NOT NULL DEFAULT 60;
