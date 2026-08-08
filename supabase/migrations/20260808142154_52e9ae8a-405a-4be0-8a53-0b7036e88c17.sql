CREATE TABLE public.community_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_mutes TO authenticated;
GRANT ALL ON public.community_mutes TO service_role;

ALTER TABLE public.community_mutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read mutes" ON public.community_mutes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff insert mutes" ON public.community_mutes
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'moderator'::app_role)) AND muted_by = auth.uid());
CREATE POLICY "staff update mutes" ON public.community_mutes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'moderator'::app_role));
CREATE POLICY "staff delete mutes" ON public.community_mutes
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'moderator'::app_role));

CREATE TRIGGER trg_community_mutes_updated_at BEFORE UPDATE ON public.community_mutes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_community_mutes_user ON public.community_mutes(user_id);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','moderator'))
$$;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_muted(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_mutes
    WHERE user_id = _user_id AND (expires_at IS NULL OR expires_at > now())
  )
$$;
REVOKE ALL ON FUNCTION public.is_muted(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_muted(uuid) TO authenticated;

DROP POLICY IF EXISTS "admins delete any message" ON public.messages;
CREATE POLICY "staff delete any message" ON public.messages
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "users insert own messages" ON public.messages;
CREATE POLICY "users insert own messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT public.is_muted(auth.uid()));

CREATE POLICY "staff update any message" ON public.messages
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));