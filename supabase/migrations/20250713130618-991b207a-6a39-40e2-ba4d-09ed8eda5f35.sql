-- Update signup tables to rename progress reports to beta tester
-- Rename wants_progress_reports to interested_in_beta_testing for field rep signups
ALTER TABLE public.field_rep_signups 
RENAME COLUMN wants_progress_reports TO interested_in_beta_testing;

-- Rename wants_progress_reports to interested_in_beta_testing for vendor signups  
ALTER TABLE public.vendor_signups 
RENAME COLUMN wants_progress_reports TO interested_in_beta_testing;

-- Create Beta Tester communications table
CREATE TABLE public.beta_testers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('field-rep', 'vendor')),
  name TEXT,
  signup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;

-- Create policies for beta testers table
CREATE POLICY "Admins can view all beta testers" 
ON public.beta_testers 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage beta testers" 
ON public.beta_testers 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for automatic timestamp updates on beta_testers
CREATE TRIGGER update_beta_testers_updated_at
BEFORE UPDATE ON public.beta_testers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Populate beta_testers table with existing interested users
INSERT INTO public.beta_testers (email, user_type, name, signup_date)
SELECT 
  email, 
  'field-rep' as user_type,
  field_rep_name as name,
  created_at as signup_date
FROM public.field_rep_signups 
WHERE interested_in_beta_testing = true;

INSERT INTO public.beta_testers (email, user_type, name, signup_date)
SELECT 
  email, 
  'vendor' as user_type,
  company_name as name,
  created_at as signup_date
FROM public.vendor_signups 
WHERE interested_in_beta_testing = true
ON CONFLICT (email) DO NOTHING;