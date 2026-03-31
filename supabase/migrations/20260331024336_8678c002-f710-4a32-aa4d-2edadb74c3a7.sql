
ALTER TABLE public.unit_config
ADD COLUMN IF NOT EXISTS print_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS print_auto boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS print_copies integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS print_paper_width text NOT NULL DEFAULT '80mm',
ADD COLUMN IF NOT EXISTS print_show_logo boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS print_show_qr boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS print_header_text text NOT NULL DEFAULT 'Aguarde sua chamada no painel',
ADD COLUMN IF NOT EXISTS print_footer_text text NOT NULL DEFAULT 'Apresente esta senha quando solicitado',
ADD COLUMN IF NOT EXISTS print_template text NOT NULL DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS print_font_size text NOT NULL DEFAULT 'large';
