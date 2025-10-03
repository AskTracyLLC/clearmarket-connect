-- Ensure display_name defaults to anonymous_username when null or empty
CREATE OR REPLACE FUNCTION public.sync_display_name_to_anonymous()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If display_name is null or empty, set it to anonymous_username
  IF NEW.display_name IS NULL OR trim(NEW.display_name) = '' THEN
    NEW.display_name := NEW.anonymous_username;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user inserts
DROP TRIGGER IF EXISTS ensure_display_name_on_insert ON public.users;
CREATE TRIGGER ensure_display_name_on_insert
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_display_name_to_anonymous();

-- Create trigger for user updates
DROP TRIGGER IF EXISTS ensure_display_name_on_update ON public.users;
CREATE TRIGGER ensure_display_name_on_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_display_name_to_anonymous();

-- Update existing users where display_name is null or empty
UPDATE public.users
SET display_name = anonymous_username
WHERE display_name IS NULL OR trim(display_name) = '';