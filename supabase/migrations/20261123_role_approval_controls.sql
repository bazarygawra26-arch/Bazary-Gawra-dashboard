-- Keep profiles.role as the single authoritative account role. Business approval
-- is stored separately so approval does not replace a customer's account role.

ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS application_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS application_reason text,
  ADD COLUMN IF NOT EXISTS application_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS application_reviewed_by uuid;

UPDATE public.sellers
SET application_status = CASE
  WHEN verification_status = 'verified' THEN 'approved'
  WHEN verification_status = 'suspended' THEN 'suspended'
  ELSE 'pending'
END
WHERE application_status = 'pending';

ALTER TABLE public.sellers
  DROP CONSTRAINT IF EXISTS sellers_application_status_check;
ALTER TABLE public.sellers
  ADD CONSTRAINT sellers_application_status_check
  CHECK (application_status IN ('pending', 'approved', 'rejected', 'changes_requested', 'suspended'));

CREATE TABLE IF NOT EXISTS public.supplier_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  contact_name text,
  phone text,
  description text,
  business_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested', 'suspended')),
  decision_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  affected_table text,
  affected_record_id text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid,
  category text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  dedupe_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS supplier_applications_applicant_idx
  ON public.supplier_applications (applicant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS supplier_applications_status_idx
  ON public.supplier_applications (status, created_at DESC);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['profiles', 'sellers', 'supplier_applications', 'notifications'] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND lower(role) IN ('admin', 'super_admin', 'superadmin')
      AND coalesce(account_status, 'active') = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND lower(role) IN ('super_admin', 'superadmin')
      AND coalesce(account_status, 'active') = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_profile_access_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.role := 'customer';
    NEW.account_status := 'active';
    NEW.suspended_reason := NULL;
    NEW.suspended_at := NULL;
    NEW.suspended_by := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_access_insert ON public.profiles;
CREATE TRIGGER guard_profile_access_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_access_insert();

CREATE OR REPLACE FUNCTION public.guard_profile_access_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_setting('app.admin_role_change', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Role changes must use the authorized admin workflow' USING ERRCODE = '42501';
  END IF;
  IF (NEW.account_status, NEW.suspended_reason, NEW.suspended_at, NEW.suspended_by)
       IS DISTINCT FROM
     (OLD.account_status, OLD.suspended_reason, OLD.suspended_at, OLD.suspended_by)
     AND current_setting('app.admin_status_change', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Account status changes must use the authorized admin workflow' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_access_fields ON public.profiles;
CREATE TRIGGER guard_profile_access_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_access_fields();

CREATE OR REPLACE FUNCTION public.guard_seller_application_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.application_status := 'pending';
    NEW.application_reason := NULL;
    NEW.application_reviewed_at := NULL;
    NEW.application_reviewed_by := NULL;
    NEW.is_active := false;
    NEW.verification_status := 'pending';
  ELSIF NEW.application_status IS DISTINCT FROM OLD.application_status
     AND current_setting('app.seller_application_review', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Seller approval changes must use the authorized admin workflow' USING ERRCODE = '42501';
  ELSIF NEW.verification_status IS DISTINCT FROM OLD.verification_status
     AND current_setting('app.seller_verification_review', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Seller verification changes must use the authorized admin workflow' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_seller_application_status ON public.sellers;
CREATE TRIGGER guard_seller_application_status
BEFORE INSERT OR UPDATE ON public.sellers
FOR EACH ROW EXECUTE FUNCTION public.guard_seller_application_status();

CREATE OR REPLACE FUNCTION public.guard_supplier_application_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.decision_reason := NULL;
    NEW.reviewed_at := NULL;
    NEW.reviewed_by := NULL;
  ELSIF NEW.status IS DISTINCT FROM OLD.status
     AND current_setting('app.supplier_application_review', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Supplier approval changes must use the authorized admin workflow' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_supplier_application_status ON public.supplier_applications;
CREATE TRIGGER guard_supplier_application_status
BEFORE INSERT OR UPDATE ON public.supplier_applications
FOR EACH ROW EXECUTE FUNCTION public.guard_supplier_application_status();

DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
CREATE POLICY "profiles self read" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "admins read profiles" ON public.profiles;
CREATE POLICY "admins read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admins read audit" ON public.admin_audit_logs;
CREATE POLICY "admins read audit" ON public.admin_audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admins insert audit" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "recipient read notifications" ON public.notifications;
CREATE POLICY "recipient read notifications" ON public.notifications
  FOR SELECT TO authenticated USING (recipient_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "recipient update notifications" ON public.notifications;
CREATE POLICY "recipient update notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (recipient_id = auth.uid() OR public.is_admin())
  WITH CHECK (recipient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admins read sellers" ON public.sellers;
CREATE POLICY "admins read sellers" ON public.sellers
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Allow all on sellers" ON public.sellers;
DROP POLICY IF EXISTS "public read active sellers" ON public.sellers;
CREATE POLICY "public read active sellers" ON public.sellers
  FOR SELECT TO anon, authenticated USING (is_active IS TRUE AND application_status = 'approved');
DROP POLICY IF EXISTS "owners read own seller" ON public.sellers;
CREATE POLICY "owners read own seller" ON public.sellers
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "users submit own seller applications" ON public.sellers;
CREATE POLICY "users submit own seller applications" ON public.sellers
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND application_status = 'pending');
DROP POLICY IF EXISTS "owners update pending seller applications" ON public.sellers;
CREATE POLICY "owners update pending seller applications" ON public.sellers
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() AND application_status IN ('pending', 'changes_requested'))
  WITH CHECK (owner_id = auth.uid() AND application_status IN ('pending', 'changes_requested'));

DROP POLICY IF EXISTS "applicants read own supplier applications" ON public.supplier_applications;
CREATE POLICY "applicants read own supplier applications" ON public.supplier_applications
  FOR SELECT TO authenticated USING (applicant_id = auth.uid());
DROP POLICY IF EXISTS "admins read supplier applications" ON public.supplier_applications;
CREATE POLICY "admins read supplier applications" ON public.supplier_applications
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "users submit supplier applications" ON public.supplier_applications;
CREATE POLICY "users submit supplier applications" ON public.supplier_applications
  FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid() AND status = 'pending');
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.admin_audit_logs FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles, public.sellers, public.supplier_applications, public.admin_audit_logs, public.notifications TO authenticated;
GRANT SELECT ON public.sellers TO anon;
GRANT INSERT, UPDATE ON public.sellers TO authenticated;
GRANT INSERT ON public.supplier_applications TO authenticated;
GRANT UPDATE (is_read, read_at) ON public.notifications TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_change_profile_role(
  p_user_id uuid,
  p_role text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_profile public.profiles%ROWTYPE;
  next_role text := lower(trim(p_role));
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only an active Super Admin may change account roles' USING ERRCODE = '42501';
  END IF;
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  IF next_role NOT IN ('customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin') THEN
    RAISE EXCEPTION 'Unsupported role; Super Admin assignment is not available through this action' USING ERRCODE = '22023';
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) < 3 THEN
    RAISE EXCEPTION 'A reason is required for role changes' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO old_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;
  IF lower(old_profile.role) IN ('super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Super Admin roles cannot be changed through this workflow' USING ERRCODE = '42501';
  END IF;

  PERFORM set_config('app.admin_role_change', 'on', true);
  UPDATE public.profiles SET role = next_role WHERE id = p_user_id;

  INSERT INTO public.admin_audit_logs (
    admin_id, action, affected_table, affected_record_id, before_data, after_data, reason
  )
  VALUES (
    auth.uid(), 'profile_role_changed', 'profiles', p_user_id::text,
    jsonb_build_object('role', old_profile.role),
    jsonb_build_object('role', next_role),
    trim(p_reason)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_account_status(
  p_user_id uuid,
  p_status text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot suspend your own account' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'Unsupported account status' USING ERRCODE = '22023';
  END IF;
  IF p_status = 'suspended' AND (p_reason IS NULL OR length(trim(p_reason)) < 3) THEN
    RAISE EXCEPTION 'A reason is required to suspend an account' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO old_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;
  IF lower(old_profile.role) IN ('super_admin', 'superadmin')
     AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only a Super Admin may modify a Super Admin account' USING ERRCODE = '42501';
  END IF;

  PERFORM set_config('app.admin_status_change', 'on', true);
  UPDATE public.profiles
  SET account_status = p_status,
      suspended_reason = CASE WHEN p_status = 'suspended' THEN trim(p_reason) ELSE NULL END,
      suspended_at = CASE WHEN p_status = 'suspended' THEN now() ELSE NULL END,
      suspended_by = CASE WHEN p_status = 'suspended' THEN auth.uid() ELSE NULL END
  WHERE id = p_user_id;

  INSERT INTO public.admin_audit_logs (
    admin_id, action, affected_table, affected_record_id, before_data, after_data, reason
  )
  VALUES (
    auth.uid(), 'profile_account_status_changed', 'profiles', p_user_id::text,
    jsonb_build_object('account_status', old_profile.account_status),
    jsonb_build_object('account_status', p_status),
    nullif(trim(p_reason), '')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_seller_verification(
  p_seller_id uuid,
  p_status text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_seller public.sellers%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('verified', 'pending', 'unverified', 'suspended') THEN
    RAISE EXCEPTION 'Unsupported verification status' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO old_seller
  FROM public.sellers
  WHERE id = p_seller_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller not found' USING ERRCODE = 'P0002';
  END IF;

  PERFORM set_config('app.seller_verification_review', 'on', true);
  UPDATE public.sellers
  SET verification_status = p_status,
      updated_at = now()
  WHERE id = p_seller_id;

  INSERT INTO public.admin_audit_logs (
    admin_id, action, affected_table, affected_record_id, before_data, after_data, reason
  )
  VALUES (
    auth.uid(), 'seller_verification_' || p_status, 'sellers', p_seller_id::text,
    jsonb_build_object('verification_status', old_seller.verification_status),
    jsonb_build_object('verification_status', p_status),
    nullif(trim(p_reason), '')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_seller_application(
  p_seller_id uuid,
  p_status text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_seller public.sellers%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('approved', 'rejected', 'changes_requested', 'suspended') THEN
    RAISE EXCEPTION 'Unsupported seller application status' USING ERRCODE = '22023';
  END IF;
  IF p_status IN ('rejected', 'changes_requested', 'suspended')
     AND (p_reason IS NULL OR length(trim(p_reason)) < 3) THEN
    RAISE EXCEPTION 'A reason is required for this decision' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO old_seller
  FROM public.sellers
  WHERE id = p_seller_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller application not found' USING ERRCODE = 'P0002';
  END IF;

  PERFORM set_config('app.seller_application_review', 'on', true);
  UPDATE public.sellers
  SET application_status = p_status,
      application_reason = nullif(trim(p_reason), ''),
      application_reviewed_at = now(),
      application_reviewed_by = auth.uid(),
      is_active = (p_status = 'approved'),
      updated_at = now()
  WHERE id = p_seller_id;

  INSERT INTO public.admin_audit_logs (
    admin_id, action, affected_table, affected_record_id, before_data, after_data, reason
  )
  VALUES (
    auth.uid(), 'seller_application_' || p_status, 'sellers', p_seller_id::text,
    jsonb_build_object('application_status', old_seller.application_status, 'is_active', old_seller.is_active),
    jsonb_build_object('application_status', p_status, 'is_active', p_status = 'approved'),
    nullif(trim(p_reason), '')
  );

  IF old_seller.owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (recipient_id, category, title, body, link, dedupe_key)
    VALUES (
      old_seller.owner_id,
      'seller_application',
      'Seller application ' || p_status,
      coalesce(nullif(trim(p_reason), ''), 'Your application status has been updated.'),
      '/account/business',
      'seller_application:' || p_seller_id::text || ':' || p_status
    )
    ON CONFLICT (dedupe_key) DO NOTHING;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_supplier_application(
  p_application_id uuid,
  p_status text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_application public.supplier_applications%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('approved', 'rejected', 'changes_requested', 'suspended') THEN
    RAISE EXCEPTION 'Unsupported supplier application status' USING ERRCODE = '22023';
  END IF;
  IF p_status IN ('rejected', 'changes_requested', 'suspended')
     AND (p_reason IS NULL OR length(trim(p_reason)) < 3) THEN
    RAISE EXCEPTION 'A reason is required for this decision' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO old_application
  FROM public.supplier_applications
  WHERE id = p_application_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Supplier application not found' USING ERRCODE = 'P0002';
  END IF;

  PERFORM set_config('app.supplier_application_review', 'on', true);
  UPDATE public.supplier_applications
  SET status = p_status,
      decision_reason = nullif(trim(p_reason), ''),
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      updated_at = now()
  WHERE id = p_application_id;

  INSERT INTO public.admin_audit_logs (
    admin_id, action, affected_table, affected_record_id, before_data, after_data, reason
  )
  VALUES (
    auth.uid(), 'supplier_application_' || p_status, 'supplier_applications', p_application_id::text,
    jsonb_build_object('status', old_application.status),
    jsonb_build_object('status', p_status),
    nullif(trim(p_reason), '')
  );

  INSERT INTO public.notifications (recipient_id, category, title, body, link, dedupe_key)
  VALUES (
    old_application.applicant_id,
    'supplier_application',
    'Supplier application ' || p_status,
    coalesce(nullif(trim(p_reason), ''), 'Your application status has been updated.'),
    '/account/business',
    'supplier_application:' || p_application_id::text || ':' || p_status
  )
  ON CONFLICT (dedupe_key) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_seller_dashboard()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND coalesce(account_status, 'active') = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM public.sellers
      WHERE owner_id = auth.uid()
        AND application_status = 'approved'
        AND is_active IS TRUE
    );
$$;

CREATE OR REPLACE FUNCTION public.is_account_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND coalesce(account_status, 'active') = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_supplier_dashboard()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND coalesce(account_status, 'active') = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM public.supplier_applications
      WHERE applicant_id = auth.uid()
        AND status = 'approved'
    );
$$;

REVOKE ALL ON FUNCTION public.admin_change_profile_role(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_account_status(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_seller_verification(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_review_seller_application(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_review_supplier_application(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_seller_dashboard() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_supplier_dashboard() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_account_active() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_change_profile_role(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_account_status(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_seller_verification(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_seller_application(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_supplier_application(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_seller_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_supplier_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_account_active() TO authenticated;
