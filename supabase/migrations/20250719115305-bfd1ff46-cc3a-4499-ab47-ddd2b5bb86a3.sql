-- Temporarily disable RLS on pre_launch_signups to allow public signup
-- This is needed because the current policies may have authentication requirements

ALTER TABLE public.pre_launch_signups DISABLE ROW LEVEL SECURITY;