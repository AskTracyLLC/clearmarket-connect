-- Reset anonymous username generation and reorder columns

-- First, let's create new tables with proper column order and copy data
-- field_rep_signups table
CREATE TABLE public.field_rep_signups_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_username TEXT DEFAULT public.generate_anonymous_username('field-rep'),
  email TEXT NOT NULL,
  primary_state TEXT,
  field_rep_name TEXT,
  work_types TEXT[],
  experience_level TEXT,
  current_challenges TEXT[],
  interested_features TEXT[],
  interested_in_beta_testing BOOLEAN DEFAULT false,
  join_feedback_group BOOLEAN DEFAULT false,
  agreed_to_analytics BOOLEAN DEFAULT false,
  feedback_access_token TEXT,
  feedback_token_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- vendor_signups table  
CREATE TABLE public.vendor_signups_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_username TEXT DEFAULT public.generate_anonymous_username('vendor'),
  email TEXT NOT NULL,
  company_name TEXT,
  company_website TEXT,
  states_covered TEXT[],
  primary_service TEXT[],
  current_challenges TEXT[],
  interested_features TEXT[],
  interested_in_beta_testing BOOLEAN DEFAULT false,
  join_feedback_group BOOLEAN DEFAULT false,
  agreed_to_analytics BOOLEAN DEFAULT false,
  feedback_access_token TEXT,
  feedback_token_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- users table
CREATE TABLE public.users_new (
  id UUID NOT NULL PRIMARY KEY,
  anonymous_username TEXT,
  email TEXT,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'field_rep',
  trust_score INTEGER DEFAULT 0,
  profile_complete INTEGER DEFAULT 0,
  community_score INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- feedback_sessions table
CREATE TABLE public.feedback_sessions_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_username TEXT NOT NULL,
  user_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Copy existing data (if any) to new tables
INSERT INTO public.field_rep_signups_new SELECT * FROM public.field_rep_signups;
INSERT INTO public.vendor_signups_new SELECT * FROM public.vendor_signups;
INSERT INTO public.users_new SELECT * FROM public.users;
INSERT INTO public.feedback_sessions_new SELECT * FROM public.feedback_sessions;

-- Drop old tables and rename new ones
DROP TABLE public.field_rep_signups CASCADE;
DROP TABLE public.vendor_signups CASCADE;
DROP TABLE public.users CASCADE;
DROP TABLE public.feedback_sessions CASCADE;

ALTER TABLE public.field_rep_signups_new RENAME TO field_rep_signups;
ALTER TABLE public.vendor_signups_new RENAME TO vendor_signups;
ALTER TABLE public.users_new RENAME TO users;
ALTER TABLE public.feedback_sessions_new RENAME TO feedback_sessions;

-- Recreate RLS policies for field_rep_signups
ALTER TABLE public.field_rep_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all field rep signups" 
ON public.field_rep_signups 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Anonymous users can create field rep signups" 
ON public.field_rep_signups 
FOR INSERT 
WITH CHECK (true);

-- Recreate RLS policies for vendor_signups  
ALTER TABLE public.vendor_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all vendor signups" 
ON public.vendor_signups 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Anonymous users can create vendor signups" 
ON public.vendor_signups 
FOR INSERT 
WITH CHECK (true);

-- Recreate RLS policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can update any user" 
ON public.users 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Recreate RLS policies for feedback_sessions
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restricted feedback session access" 
ON public.feedback_sessions 
FOR SELECT 
USING (false);

CREATE POLICY "System can insert feedback sessions" 
ON public.feedback_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update feedback sessions" 
ON public.feedback_sessions 
FOR UPDATE 
USING (true);

-- Recreate triggers
CREATE TRIGGER update_field_rep_signups_updated_at
BEFORE UPDATE ON public.field_rep_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_signups_updated_at
BEFORE UPDATE ON public.vendor_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER auto_generate_field_rep_username
BEFORE INSERT ON public.field_rep_signups
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_signup_username();

CREATE TRIGGER auto_generate_vendor_username
BEFORE INSERT ON public.vendor_signups
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_signup_username();

CREATE TRIGGER send_field_rep_signup_email_trigger
AFTER INSERT ON public.field_rep_signups
FOR EACH ROW
EXECUTE FUNCTION public.send_field_rep_signup_email();

CREATE TRIGGER send_vendor_signup_email_trigger
AFTER INSERT ON public.vendor_signups
FOR EACH ROW
EXECUTE FUNCTION public.send_vendor_signup_email();

CREATE TRIGGER handle_new_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER log_user_creation_trigger
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.log_user_creation();

CREATE TRIGGER audit_role_changes_trigger
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_changes();

CREATE TRIGGER log_profile_update_trigger
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.log_profile_update();