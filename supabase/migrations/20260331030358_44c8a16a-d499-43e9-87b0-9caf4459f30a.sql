
ALTER TABLE public.unit_config
  ADD COLUMN IF NOT EXISTS print_margin_top integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS print_margin_bottom integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS print_margin_left integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS print_margin_right integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS print_block_spacing integer NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS print_cut_extra_height integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS print_auto_cut boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS result_countdown_seconds integer NOT NULL DEFAULT 30;
