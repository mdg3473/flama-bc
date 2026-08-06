CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text,
  width integer,
  height integer,
  size_bytes bigint,
  content_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can view gallery images" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins insert gallery images" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND uploaded_by = auth.uid());
CREATE POLICY "admins update gallery images" ON public.gallery_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins delete gallery images" ON public.gallery_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_gallery_images_updated_at BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "public read gallery objects" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');
CREATE POLICY "admins upload gallery objects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins update gallery objects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins delete gallery objects" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));