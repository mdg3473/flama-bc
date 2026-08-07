CREATE POLICY "anyone can read video files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'videos');

CREATE POLICY "admins upload video files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update video files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete video files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'::app_role));