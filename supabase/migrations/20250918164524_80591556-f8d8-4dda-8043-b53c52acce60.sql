-- Add Row Level Security policies for public tables containing sensitive data

-- Enable RLS on pre_launch_signups table (CRITICAL - contains email addresses)
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- Admins can view all pre-launch signups for management purposes
CREATE POLICY "Admins can view all pre-launch signups" ON public.pre_launch_signups
FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- System can insert new signups (for the prelaunch form)
CREATE POLICY "System can insert pre-launch signups" ON public.pre_launch_signups
FOR INSERT WITH CHECK (true);

-- Users can only view their own signup data (if they're authenticated and match email)
CREATE POLICY "Users can view own pre-launch signup" ON public.pre_launch_signups
FOR SELECT USING (get_user_email(auth.uid()) = email);

-- Enable RLS on feedback_posts table (contains email addresses)
ALTER TABLE public.feedback_posts ENABLE ROW LEVEL SECURITY;

-- Admins can manage all feedback posts
CREATE POLICY "Admins can manage feedback posts" ON public.feedback_posts
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Users can view their own feedback posts
CREATE POLICY "Users can view own feedback posts" ON public.feedback_posts
FOR SELECT USING (get_user_email(auth.uid()) = email);

-- System can insert new feedback posts
CREATE POLICY "System can insert feedback posts" ON public.feedback_posts
FOR INSERT WITH CHECK (true);

-- Enable RLS on user_business_hours table
ALTER TABLE public.user_business_hours ENABLE ROW LEVEL SECURITY;

-- Users can manage their own business hours
CREATE POLICY "Users can manage own business hours" ON public.user_business_hours
FOR ALL USING (auth.uid() = user_id);

-- Network connections can view business hours
CREATE POLICY "Network can view business hours" ON public.user_business_hours
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.contact_unlocks 
    WHERE (unlocker_id = auth.uid() AND unlocked_user_id = user_business_hours.user_id)
       OR (unlocked_user_id = auth.uid() AND unlocker_id = user_business_hours.user_id)
  )
);

-- Enable RLS on system_templates table
ALTER TABLE public.system_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage system templates
CREATE POLICY "Admins can manage system templates" ON public.system_templates
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Enable RLS on field_rep_signups table if it exists
ALTER TABLE public.field_rep_signups ENABLE ROW LEVEL SECURITY;

-- Admins can view all field rep signups
CREATE POLICY "Admins can view field rep signups" ON public.field_rep_signups
FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- System can insert field rep signups
CREATE POLICY "System can insert field rep signups" ON public.field_rep_signups
FOR INSERT WITH CHECK (true);

-- Users can view their own signup data
CREATE POLICY "Users can view own field rep signup" ON public.field_rep_signups
FOR SELECT USING (get_user_email(auth.uid()) = email);

-- Enable RLS on vendor_signups table if it exists  
ALTER TABLE public.vendor_signups ENABLE ROW LEVEL SECURITY;

-- Admins can view all vendor signups
CREATE POLICY "Admins can view vendor signups" ON public.vendor_signups
FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- System can insert vendor signups
CREATE POLICY "System can insert vendor signups" ON public.vendor_signups
FOR INSERT WITH CHECK (true);

-- Users can view their own signup data
CREATE POLICY "Users can view own vendor signup" ON public.vendor_signups
FOR SELECT USING (get_user_email(auth.uid()) = email);