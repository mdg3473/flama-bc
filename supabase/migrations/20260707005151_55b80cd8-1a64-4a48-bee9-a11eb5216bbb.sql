CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT (encode(gen_random_bytes(16), 'hex')),
  status text NOT NULL DEFAULT 'paid',
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.purchases TO authenticated;
GRANT SELECT ON public.purchases TO anon;
GRANT ALL ON public.purchases TO service_role;

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own purchases" ON public.purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins read all purchases" ON public.purchases
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "users insert own purchases" ON public.purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins update purchases" ON public.purchases
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Public validation function: reads a purchase by token (no auth needed to scan QR)
CREATE OR REPLACE FUNCTION public.validate_purchase(_token text)
RETURNS TABLE (
  id uuid,
  product_name text,
  product_slug text,
  status text,
  redeemed_at timestamptz,
  created_at timestamptz,
  buyer_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.product_name, p.product_slug, p.status, p.redeemed_at, p.created_at,
         pr.full_name AS buyer_name
  FROM public.purchases p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.token = _token;
$$;

GRANT EXECUTE ON FUNCTION public.validate_purchase(text) TO anon, authenticated;

-- Admin-only redeem function
CREATE OR REPLACE FUNCTION public.redeem_purchase(_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL OR NOT public.has_role(_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  UPDATE public.purchases
     SET status = 'redeemed', redeemed_at = now(), updated_at = now()
   WHERE token = _token AND redeemed_at IS NULL;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_purchase(text) TO authenticated;

CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();