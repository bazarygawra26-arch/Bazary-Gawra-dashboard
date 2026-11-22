-- Provisioning migration for the Bazary Gawra owner account.
-- Run in Supabase SQL Editor after the user accepts the confirmation/reset email.

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id
  INTO target_user_id
  FROM auth.users
  WHERE lower(email) = 'shajwannamiqsalh@gmail.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Auth account not found. Complete email confirmation or password recovery first.';
  ELSE
    INSERT INTO public.profiles (
      id,
      role,
      full_name,
      account_status
    )
    VALUES (
      target_user_id,
      'super_admin',
      'Bazary Gawra Super Admin',
      'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET
      role = 'super_admin',
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      account_status = 'active';
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
    INSERT INTO public.profiles (
      id,
      role,
      full_name,
      account_status
    )
    VALUES (
      NEW.id,
      'super_admin',
      'Bazary Gawra Super Admin',
      'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        account_status = 'active';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_bazary_super_admin ON auth.users;
CREATE TRIGGER on_auth_user_bazary_super_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_super_admin_profile();
