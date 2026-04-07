
-- Add missing columns to lab_partners
ALTER TABLE public.lab_partners ADD COLUMN IF NOT EXISTS partner_type text DEFAULT 'apoio';

-- Add missing columns to lab_equipment for interfacing
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS connection_type text DEFAULT 'serial';
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS protocol text DEFAULT 'ASTM';
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS host text;
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS port integer;
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS message_format text DEFAULT 'ASTM';
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS parsing_rules jsonb;
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS responsible text;
ALTER TABLE public.lab_equipment ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
