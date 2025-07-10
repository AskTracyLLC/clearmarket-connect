-- Create pre-launch signups table
CREATE TABLE public.pre_launch_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('field-rep', 'vendor')),
  primary_state TEXT, -- For field reps
  states_covered TEXT[] DEFAULT '{}', -- For vendors (optional)
  company_name TEXT, -- For vendors
  company_website TEXT, -- For vendors
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for public signup form)
CREATE POLICY "Anyone can create pre-launch signups" 
ON public.pre_launch_signups 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view all signups
CREATE POLICY "Admins can view all pre-launch signups" 
ON public.pre_launch_signups 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pre_launch_signups_updated_at
BEFORE UPDATE ON public.pre_launch_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();