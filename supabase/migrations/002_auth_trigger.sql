-- ============================================================
-- Transform Quest — Auth Trigger
-- Automatically creates a profiles row when a new user signs up.
-- Run this AFTER 001_schema.sql.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      -- Use Google display name if available
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      -- Fall back to email prefix (everything before @)
      SPLIT_PART(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to avoid duplicates on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
