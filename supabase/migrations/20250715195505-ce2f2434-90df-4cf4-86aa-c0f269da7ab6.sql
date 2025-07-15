-- Update field_rep_signups table to auto-generate anonymous_username
ALTER TABLE public.field_rep_signups 
ALTER COLUMN anonymous_username SET DEFAULT public.generate_anonymous_username('field-rep');

-- Update vendor_signups table to auto-generate anonymous_username  
ALTER TABLE public.vendor_signups 
ALTER COLUMN anonymous_username SET DEFAULT public.generate_anonymous_username('vendor');

-- Create trigger function to generate username on insert if not provided
CREATE OR REPLACE FUNCTION public.auto_generate_signup_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only generate if anonymous_username is not already set
  IF NEW.anonymous_username IS NULL THEN
    -- Determine user type based on table
    IF TG_TABLE_NAME = 'field_rep_signups' THEN
      NEW.anonymous_username := public.generate_anonymous_username('field-rep');
    ELSIF TG_TABLE_NAME = 'vendor_signups' THEN
      NEW.anonymous_username := public.generate_anonymous_username('vendor');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for both signup tables
CREATE TRIGGER auto_generate_field_rep_username
  BEFORE INSERT ON public.field_rep_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_signup_username();

CREATE TRIGGER auto_generate_vendor_username
  BEFORE INSERT ON public.vendor_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_signup_username();