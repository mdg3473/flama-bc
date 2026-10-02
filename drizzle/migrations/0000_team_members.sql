CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team text NOT NULL,
  name text NOT NULL,
  role text,
  photo_path text,
  testimony_path text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view team" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins insert team" ON public.team_members FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update team" ON public.team_members FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete team" ON public.team_members FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "team admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='team' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "team admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='team' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "team admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='team' AND public.has_role(auth.uid(),'admin'));