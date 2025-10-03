-- Enable RLS on pre_launch_signups table if not already enabled
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view pre-launch signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Public can view signups" ON public.pre_launch_signups;

-- Only admins can view pre-launch signup data
CREATE POLICY "Only admins can view pre-launch signups"
ON public.pre_launch_signups
FOR SELECT
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Allow anyone to insert their own signup (for the pre-launch form)
CREATE POLICY "Anyone can create pre-launch signup"
ON public.pre_launch_signups
FOR INSERT
WITH CHECK (true);

-- Only admins can update or delete signups
CREATE POLICY "Only admins can update pre-launch signups"
ON public.pre_launch_signups
FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Only admins can delete pre-launch signups"
ON public.pre_launch_signups
FOR DELETE
USING (get_user_role(auth.uid()) = 'admin'::user_role);