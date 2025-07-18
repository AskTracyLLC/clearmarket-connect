-- Remove old signup tables that are no longer being used
-- Only the pre_launch_signups table should be used for prelaunch signups

DROP TABLE IF EXISTS public.field_rep_signups CASCADE;
DROP TABLE IF EXISTS public.vendor_signups CASCADE;

-- Ensure pre_launch_signups table has all necessary columns
-- Add any missing columns if needed
ALTER TABLE public.pre_launch_signups 
ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'field-rep',
ADD COLUMN IF NOT EXISTS anonymous_username TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS primary_state TEXT,
ADD COLUMN IF NOT EXISTS work_types TEXT[],
ADD COLUMN IF NOT EXISTS current_challenges TEXT[],
ADD COLUMN IF NOT EXISTS interested_features TEXT[],
ADD COLUMN IF NOT EXISTS interested_in_beta_testing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agreed_to_analytics BOOLEAN DEFAULT false;

-- Update the anonymous username generation trigger to work with pre_launch_signups
CREATE OR REPLACE FUNCTION public.set_anonymous_username_prelaunch()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set username if not already provided
  IF NEW.anonymous_username IS NULL OR NEW.anonymous_username = '' THEN
    NEW.anonymous_username := public.generate_anonymous_username(NEW.user_type);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for pre_launch_signups
DROP TRIGGER IF EXISTS set_anonymous_username_trigger ON public.pre_launch_signups;
CREATE TRIGGER set_anonymous_username_trigger
  BEFORE INSERT ON public.pre_launch_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_anonymous_username_prelaunch();