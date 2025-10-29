-- Ensure the last_active update trigger exists and is properly configured

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_last_active ON public.users;

-- Create trigger to update last_active on any update to users table
CREATE TRIGGER update_users_last_active
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active_and_log();

-- Also create a simple function to manually update last_active 
-- This can be called from the frontend when user loads the app
CREATE OR REPLACE FUNCTION public.update_my_last_active()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update the last_active for the current authenticated user
  UPDATE public.users
  SET last_active = now()
  WHERE id = auth.uid();
END;
$function$;