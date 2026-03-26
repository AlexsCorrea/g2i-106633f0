
-- Storage bucket for exam gallery files
INSERT INTO storage.buckets (id, name, public) VALUES ('exam-gallery', 'exam-gallery', true);

-- Table for exam gallery items
CREATE TABLE public.exam_gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  exam_request_id uuid REFERENCES public.exam_requests(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES public.profiles(id),
  exam_date date NOT NULL DEFAULT CURRENT_DATE,
  exam_time time,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'outros',
  subcategory text,
  laterality text, -- OD, OE, AO
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'image', -- image, video, pdf, dicom
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'recebido',
  origin text,
  equipment text,
  professional_name text,
  observations text,
  report_text text,
  report_url text,
  tags text[],
  annotations jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery items visible to authenticated" ON public.exam_gallery_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professionals can insert gallery items" ON public.exam_gallery_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Professionals can update gallery items" ON public.exam_gallery_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Professionals can delete gallery items" ON public.exam_gallery_items FOR DELETE TO authenticated USING (true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload exam files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exam-gallery');
CREATE POLICY "Authenticated users can view exam files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'exam-gallery');
CREATE POLICY "Authenticated users can update exam files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'exam-gallery');
CREATE POLICY "Authenticated users can delete exam files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'exam-gallery');
CREATE POLICY "Public can view exam files" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'exam-gallery');
