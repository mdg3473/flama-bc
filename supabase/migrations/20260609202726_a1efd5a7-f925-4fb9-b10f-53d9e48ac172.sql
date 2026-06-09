
-- 1. Restrict profiles SELECT to owner + admins
DROP POLICY IF EXISTS "authenticated read profiles" ON public.profiles;

CREATE POLICY "users read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "admins read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Public-safe view for community chat (no sensitive fields)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT id, full_name, avatar_url, grade
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

-- 3. Realtime: only authenticated users may subscribe
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated can subscribe to realtime" ON realtime.messages;
CREATE POLICY "authenticated can subscribe to realtime"
ON realtime.messages FOR SELECT
TO authenticated
USING (true);

-- 4. Storage: allow users to manage their own avatar files
DROP POLICY IF EXISTS "users update own avatar" ON storage.objects;
CREATE POLICY "users update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "users delete own avatar" ON storage.objects;
CREATE POLICY "users delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 5. Length limits to harden against abuse / large payloads (supports ~100 concurrent users)
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_content_length;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_content_length CHECK (char_length(content) BETWEEN 1 AND 2000);

-- 6. Index for fast channel queries (scales for many users)
CREATE INDEX IF NOT EXISTS idx_messages_channel_created
  ON public.messages (channel, created_at DESC);
