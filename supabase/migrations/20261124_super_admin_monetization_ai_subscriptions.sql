-- ==============================================================================
-- BAZARY GAWRA SUPER ADMIN: MONETIZATION, SUBSCRIPTIONS, AI EVENTS & GLOSSARY
-- Migration: 20261124_super_admin_monetization_ai_subscriptions.sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. SUBSCRIPTIONS TABLE (Merchant Listing Plans)
-- Free Starter: 0 IQD (up to 5 active listings)
-- Pro Merchant: 10,000 IQD/mo (up to 50 active listings, AI tools, analytics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('free_starter', 'pro_merchant')) DEFAULT 'free_starter',
  status text NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending_payment')) DEFAULT 'active',
  listing_limit integer NOT NULL DEFAULT 5,
  monthly_price_iqd numeric(14,2) NOT NULL DEFAULT 0,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  auto_renew boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_seller_idx ON public.subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status, current_period_end);

-- ------------------------------------------------------------------------------
-- 2. PROMOTIONS TABLE (Sponsored Listings & Boosts)
-- Sponsored Product: 5,000 IQD for 7 days
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sponsored_listing', 'banner', 'featured_store')) DEFAULT 'sponsored_listing',
  status text NOT NULL CHECK (status IN ('active', 'expired', 'scheduled', 'cancelled')) DEFAULT 'active',
  price_iqd numeric(14,2) NOT NULL DEFAULT 5000,
  duration_days integer NOT NULL DEFAULT 7,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promotions_product_idx ON public.promotions(product_id);
CREATE INDEX IF NOT EXISTS promotions_status_idx ON public.promotions(status, end_date);

-- ------------------------------------------------------------------------------
-- 3. PAYMENTS & FINANCIAL TRANSACTIONS TABLE
-- Realized platform revenue vs demo transactions & refunds
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type text NOT NULL CHECK (reference_type IN ('b2c_order', 'b2b_purchase_order', 'subscription', 'promotion', 'refund')),
  reference_id uuid,
  payer_id uuid REFERENCES public.profiles(id),
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'IQD',
  status text NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded')) DEFAULT 'completed',
  payment_method text NOT NULL DEFAULT 'cash_on_delivery'
    CHECK (payment_method IN ('cash_on_delivery', 'fastpay', 'fib', 'zaincash', 'bank_transfer', 'demo')),
  is_demo boolean NOT NULL DEFAULT false,
  platform_fee numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status, is_demo);
CREATE INDEX IF NOT EXISTS payments_ref_idx ON public.payments(reference_type, reference_id);

-- ------------------------------------------------------------------------------
-- 4. AI MARKET INTELLIGENCE & BUYER SEARCH EVENTS TABLE
-- Actual natural language buyer queries & visual camera scans
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_search_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  source_language text DEFAULT 'ckb',
  detected_category text,
  detected_budget_iqd numeric(14,2),
  detected_location text,
  matching_products_count integer NOT NULL DEFAULT 0,
  is_zero_result boolean NOT NULL DEFAULT false,
  event_type text NOT NULL CHECK (event_type IN ('text_search', 'camera_scan', 'voice_query')) DEFAULT 'text_search',
  detected_labels text[],
  match_confidence numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_events_created_idx ON public.ai_search_events(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_events_zero_result_idx ON public.ai_search_events(is_zero_result, created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. MARKETPLACE GLOSSARY TABLE (Kurdish Bazaar Terminology)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_glossary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_ku text NOT NULL UNIQUE,
  term_ar text NOT NULL,
  term_en text NOT NULL,
  category text,
  notes text,
  status text NOT NULL CHECK (status IN ('approved', 'pending_review', 'suggested')) DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed initial essential bazaar terms into glossary
INSERT INTO public.marketplace_glossary (term_ku, term_ar, term_en, category, status)
VALUES
  ('چاییکەر', 'صانعة شاي كهربائية', 'Electric Tea Maker', 'Kitchenware', 'approved'),
  ('چاییکەری کارەبایی', 'سماور وصانعة شاي كهربائية', 'Electric Samovar & Tea Maker', 'Kitchenware', 'approved'),
  ('قاوەساز', 'ماكينة صنع القهوة والإسبريسو', 'Coffee Machine & Espresso Maker', 'Kitchenware', 'approved'),
  ('ئێرفرایەر', 'قلاية هوائية رقمية بدون زيت', 'Digital Air Fryer', 'Kitchenware', 'approved'),
  ('جارووبەرقی', 'مكنسة كهربائية', 'Vacuum Cleaner', 'Appliances', 'approved'),
  ('هەنگوینی سروشتی', 'عسل جبلي طبيعي', 'Natural Mountain Honey', 'Organic Food', 'approved'),
  ('ڕۆنی کوردی', 'سمن بلدي كردي أصلي', 'Traditional Kurdish Pure Ghee', 'Organic Food', 'approved'),
  ('شاخی هەورامان', 'جبال هورامان الطبيعية', 'Hawraman Mountains Organic', 'Organic Food', 'approved'),
  ('قەزوان', 'بطم كردي طبيعي', 'Wild Kurdish Pistachio (Qazwan)', 'Organic Food', 'approved'),
  ('جلوبەرگی کوردی', 'أزياء كوردية تقليدية', 'Traditional Kurdish Clothing', 'Clothing', 'approved'),
  ('فەرشی دەستکرد', 'سجاد صوف يدوي', 'Handmade Wool Carpet', 'Handicrafts', 'approved'),
  ('مسی دەستکرد', 'نحاسيات يدوية أصلية', 'Handmade Copperware', 'Handicrafts', 'approved')
ON CONFLICT (term_ku) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. REALTIME PUBLICATION REGISTRATION
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  tbl_name text;
BEGIN
  FOREACH tbl_name IN ARRAY ARRAY[
    'subscriptions', 'promotions', 'payments', 'ai_search_events',
    'marketplace_glossary', 'orders', 'order_items', 'rfqs', 'rfq_items',
    'quotations', 'purchase_orders', 'purchase_order_items', 'products',
    'categories', 'locations'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = tbl_name
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl_name);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END LOOP;
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_search_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_glossary ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS
DROP POLICY IF EXISTS "admins manage subscriptions" ON public.subscriptions;
CREATE POLICY "admins manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "sellers read own subscriptions" ON public.subscriptions;
CREATE POLICY "sellers read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (
    seller_id IN (SELECT id FROM public.sellers WHERE owner_id = auth.uid())
  );

-- Promotions RLS
DROP POLICY IF EXISTS "admins manage promotions" ON public.promotions;
CREATE POLICY "admins manage promotions" ON public.promotions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "sellers read own promotions" ON public.promotions;
CREATE POLICY "sellers read own promotions" ON public.promotions
  FOR SELECT TO authenticated USING (
    seller_id IN (SELECT id FROM public.sellers WHERE owner_id = auth.uid())
  );

-- Payments RLS
DROP POLICY IF EXISTS "admins manage payments" ON public.payments;
CREATE POLICY "admins manage payments" ON public.payments
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users read own payments" ON public.payments;
CREATE POLICY "users read own payments" ON public.payments
  FOR SELECT TO authenticated USING (payer_id = auth.uid());

-- AI Search Events RLS
DROP POLICY IF EXISTS "admins read ai search events" ON public.ai_search_events;
CREATE POLICY "admins read ai search events" ON public.ai_search_events
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "users insert ai search events" ON public.ai_search_events;
CREATE POLICY "users insert ai search events" ON public.ai_search_events
  FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Marketplace Glossary RLS
DROP POLICY IF EXISTS "anyone read approved glossary" ON public.marketplace_glossary;
CREATE POLICY "anyone read approved glossary" ON public.marketplace_glossary
  FOR SELECT TO authenticated, anon USING (status = 'approved' OR public.is_admin());

DROP POLICY IF EXISTS "admins manage glossary" ON public.marketplace_glossary;
CREATE POLICY "admins manage glossary" ON public.marketplace_glossary
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. SECURE RPC PROCEDURES (Transactional & Audited)
-- ------------------------------------------------------------------------------

-- Procedure to update order status with audit log
CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id uuid,
  p_status text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('submitted', 'accepted', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Invalid order status: %', p_status USING ERRCODE = '22023';
  END IF;

  SELECT * INTO old_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.orders
  SET status = p_status, updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO public.order_status_history (order_id, status, changed_by, reason)
  VALUES (p_order_id, p_status, auth.uid(), trim(p_reason));

  INSERT INTO public.admin_audit_logs (
    admin_id, action, affected_table, affected_record_id, before_data, after_data, reason
  )
  VALUES (
    auth.uid(), 'order_status_updated', 'orders', p_order_id::text,
    jsonb_build_object('status', old_order.status),
    jsonb_build_object('status', p_status),
    trim(p_reason)
  );
END;
$$;

-- Procedure to assign or update merchant subscription
CREATE OR REPLACE FUNCTION public.admin_manage_merchant_subscription(
  p_seller_id uuid,
  p_plan text,
  p_status text,
  p_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub_id uuid;
  v_limit int := 5;
  v_price numeric(14,2) := 0;
  v_period_end timestamptz := NULL;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  IF p_plan = 'pro_merchant' THEN
    v_limit := 50;
    v_price := 10000;
    v_period_end := now() + interval '30 days';
  END IF;

  INSERT INTO public.subscriptions (
    seller_id, plan, status, listing_limit, monthly_price_iqd, current_period_start, current_period_end, notes
  )
  VALUES (
    p_seller_id, p_plan, p_status, v_limit, v_price, now(), v_period_end, trim(p_reason)
  )
  RETURNING id INTO v_sub_id;

  -- If activating pro plan with verified payment, record financial transaction
  IF p_plan = 'pro_merchant' AND p_status = 'active' THEN
    INSERT INTO public.payments (
      reference_type, reference_id, amount, currency, status, payment_method, is_demo, platform_fee, notes
    )
    VALUES (
      'subscription', v_sub_id, 10000, 'IQD', 'completed', 'fastpay', false, 10000,
      format('Pro Merchant Subscription fee for Seller %s', p_seller_id)
    );
  END IF;

  INSERT INTO public.admin_audit_logs (
    admin_id, action, affected_table, affected_record_id, before_data, after_data, reason
  )
  VALUES (
    auth.uid(), 'merchant_subscription_updated', 'subscriptions', v_sub_id::text,
    '{}'::jsonb,
    jsonb_build_object('seller_id', p_seller_id, 'plan', p_plan, 'status', p_status),
    trim(p_reason)
  );

  RETURN v_sub_id;
END;
$$;

-- Grant permissions to authenticated admins
GRANT EXECUTE ON FUNCTION public.admin_update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_merchant_subscription TO authenticated;
