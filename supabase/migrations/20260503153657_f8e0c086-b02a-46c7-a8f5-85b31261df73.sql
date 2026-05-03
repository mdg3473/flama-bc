
-- 1) Fix touch_updated_at search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 2) Lock down SECURITY DEFINER funcs from anon/authenticated direct call
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- 3) Tighten avatars listing: only owner can list own folder; reads via public URL still work
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
CREATE POLICY "avatars owner list" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );
