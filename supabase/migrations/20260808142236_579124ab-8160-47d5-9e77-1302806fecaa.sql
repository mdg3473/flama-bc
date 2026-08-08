CREATE POLICY "authenticated read staff roles" ON public.user_roles
  FOR SELECT TO authenticated USING (role IN ('admin','moderator'));

CREATE POLICY "admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role));

GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;