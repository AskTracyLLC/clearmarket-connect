-- Add RLS policies for email_templates table
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all email templates
CREATE POLICY "Admins can view all email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Allow admins to manage email templates  
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);