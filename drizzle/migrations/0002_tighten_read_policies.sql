DROP POLICY IF EXISTS "authenticated read messages" ON public.messages;
CREATE POLICY "read messages of own channel" ON public.messages FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR channel = (SELECT p.grade FROM public.profiles p WHERE p.id = auth.uid()));

DROP POLICY IF EXISTS "authenticated read mutes" ON public.community_mutes;
CREATE POLICY "read own or staff mutes" ON public.community_mutes FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "anyone view team" ON public.team_members;
CREATE POLICY "anyone view official teams" ON public.team_members FOR SELECT TO anon, authenticated
USING (team IN ('tecnica','cenografia','louvor','producao','spark','flama'));

DROP POLICY IF EXISTS "public read gallery objects" ON storage.objects;
CREATE POLICY "read linked gallery objects" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'gallery' AND (public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.gallery_images g WHERE g.path = storage.objects.name)));

DROP POLICY IF EXISTS "anyone can read video files" ON storage.objects;
CREATE POLICY "read published video files" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'videos' AND (public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.videos v WHERE v.published = true AND (v.storage_path = storage.objects.name OR v.thumbnail_path = storage.objects.name))));

DROP POLICY IF EXISTS "team public read" ON storage.objects;
CREATE POLICY "read linked team files" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'team' AND (public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.team_members t WHERE t.photo_path = storage.objects.name OR t.testimony_path = storage.objects.name)));