
-- Unit/client configuration table for branding, privacy and ads
CREATE TABLE public.unit_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_name text NOT NULL DEFAULT 'OftalmoCenter',
  logo_url text,
  primary_color text DEFAULT '#1e5a8a',
  secondary_color text DEFAULT '#0f3460',
  background_image_url text,
  privacy_mode text NOT NULL DEFAULT 'senha_iniciais',
  social_name_policy text NOT NULL DEFAULT 'iniciais_social',
  call_display_seconds integer NOT NULL DEFAULT 15,
  ads_enabled boolean NOT NULL DEFAULT false,
  ads_interval_seconds integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.unit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unit_config_select_all" ON public.unit_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "unit_config_insert_auth" ON public.unit_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "unit_config_update_auth" ON public.unit_config FOR UPDATE TO authenticated USING (true);

-- Ads/media table
CREATE TABLE public.unit_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_config_id uuid REFERENCES public.unit_config(id) ON DELETE CASCADE,
  title text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  media_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.unit_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unit_ads_select_all" ON public.unit_ads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "unit_ads_insert_auth" ON public.unit_ads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "unit_ads_update_auth" ON public.unit_ads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "unit_ads_delete_auth" ON public.unit_ads FOR DELETE TO authenticated USING (true);

-- Insert default config
INSERT INTO public.unit_config (unit_name, privacy_mode, social_name_policy) VALUES ('OftalmoCenter', 'senha_iniciais', 'iniciais_social');

-- Add nome_social to patients
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS nome_social text;
