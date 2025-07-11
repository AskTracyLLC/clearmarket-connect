-- Create separate tables for field reps and vendors
CREATE TABLE public.field_rep_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  primary_state TEXT,
  field_rep_name TEXT,
  work_types TEXT[],
  experience_level TEXT,
  current_challenges TEXT,
  interested_features TEXT[],
  wants_progress_reports BOOLEAN DEFAULT false,
  agreed_to_analytics BOOLEAN DEFAULT false,
  anonymous_username TEXT,
  feedback_access_token TEXT,
  feedback_token_expires_at TIMESTAMP WITH TIME ZONE,
  join_feedback_group BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  company_name TEXT,
  company_website TEXT,
  states_covered TEXT[],
  primary_service TEXT,
  current_challenges TEXT,
  interested_features TEXT[],
  wants_progress_reports BOOLEAN DEFAULT false,
  agreed_to_analytics BOOLEAN DEFAULT false,
  anonymous_username TEXT,
  feedback_access_token TEXT,
  feedback_token_expires_at TIMESTAMP WITH TIME ZONE,
  join_feedback_group BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.field_rep_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for field rep signups
CREATE POLICY "Anyone can create field rep signups" 
ON public.field_rep_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all field rep signups" 
ON public.field_rep_signups 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create policies for vendor signups
CREATE POLICY "Anyone can create vendor signups" 
ON public.vendor_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all vendor signups" 
ON public.vendor_signups 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Migrate existing data for field reps
INSERT INTO public.field_rep_signups (
  email, primary_state, current_challenges, interested_features, 
  wants_progress_reports, agreed_to_analytics, anonymous_username, 
  feedback_access_token, feedback_token_expires_at, join_feedback_group,
  created_at, updated_at
)
SELECT 
  email, primary_state, current_challenges, interested_features,
  wants_progress_reports, agreed_to_analytics, anonymous_username,
  feedback_access_token, feedback_token_expires_at, join_feedback_group,
  created_at, updated_at
FROM public.pre_launch_signups 
WHERE user_type = 'field-rep';

-- Migrate existing data for vendors
INSERT INTO public.vendor_signups (
  email, company_name, company_website, states_covered, primary_service,
  current_challenges, interested_features, wants_progress_reports, agreed_to_analytics,
  anonymous_username, feedback_access_token, feedback_token_expires_at, join_feedback_group,
  created_at, updated_at
)
SELECT 
  email, company_name, company_website, states_covered, primary_service,
  current_challenges, interested_features, wants_progress_reports, agreed_to_analytics,
  anonymous_username, feedback_access_token, feedback_token_expires_at, join_feedback_group,
  created_at, updated_at
FROM public.pre_launch_signups 
WHERE user_type = 'vendor';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_field_rep_signups_updated_at
BEFORE UPDATE ON public.field_rep_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_signups_updated_at
BEFORE UPDATE ON public.vendor_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop the old table
DROP TABLE public.pre_launch_signups;