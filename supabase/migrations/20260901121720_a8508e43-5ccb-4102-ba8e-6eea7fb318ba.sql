DROP POLICY IF EXISTS "users insert own messages" ON public.messages;

CREATE POLICY "users insert own messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_muted(auth.uid())
  AND (
    public.is_staff(auth.uid())
    OR channel = (SELECT grade FROM public.profiles WHERE id = auth.uid())
  )
);