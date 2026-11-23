-- Provision the previously authorized owner account even if it was created
-- manually in Supabase before the auth-user trigger was installed.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS suspended_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_by uuid;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
CREATE POLICY "profiles self read" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_profile_access_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND current_setting('app.super_admin_provisioning', true) IS DISTINCT FROM 'on' THEN
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

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  PERFORM set_config('app.super_admin_provisioning', 'on', true);
  PERFORM set_config('app.admin_role_change', 'on', true);
  PERFORM set_config('app.admin_status_change', 'on', true);

  SELECT id
  INTO target_user_id
  FROM auth.users
  WHERE lower(email) = 'shajwannamiqsalh@gmail.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'The owner Auth account was not found. Create it in Supabase, then run this migration again.';
  ELSE
    INSERT INTO public.profiles (
      id,
      role,
      full_name,
      account_status,
      suspended_reason,
      suspended_at,
      suspended_by
    )
    VALUES (
      target_user_id,
      'super_admin',
      'Bazary Gawra Super Admin',
      'active',
      NULL,
      NULL,
      NULL
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        account_status = 'active',
        suspended_reason = NULL,
        suspended_at = NULL,
        suspended_by = NULL;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_super_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF lower(coalesce(NEW.email, '')) = 'shajwannamiqsalh@gmail.com' THEN
    PERFORM set_config('app.super_admin_provisioning', 'on', true);
    PERFORM set_config('app.admin_role_change', 'on', true);
    PERFORM set_config('app.admin_status_change', 'on', true);

    INSERT INTO public.profiles (
      id,
      role,
      full_name,
      account_status,
      suspended_reason,
      suspended_at,
      suspended_by
    )
    VALUES (
      NEW.id,
      'super_admin',
      'Bazary Gawra Super Admin',
      'active',
      NULL,
      NULL,
      NULL
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        account_status = 'active',
        suspended_reason = NULL,
        suspended_at = NULL,
        suspended_by = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_bazary_super_admin ON auth.users;
CREATE TRIGGER on_auth_user_bazary_super_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_super_admin_profile();
