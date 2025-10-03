-- PHASE 1: Fix Critical Privilege Escalation
-- Secure users table to prevent self-role updates

-- Drop existing insecure UPDATE policies
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile (except role)" ON public.users;

-- Create secure UPDATE policy that prevents role changes
CREATE POLICY "Users can update own profile (except role)"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM public.users WHERE id = auth.uid())
);

-- Create admin-only role management function
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  new_role user_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF get_user_role(auth.uid()) != 'admin'::user_role THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Update the user's role
  UPDATE public.users 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- PHASE 2: Secure users_with_display_names view
CREATE OR REPLACE FUNCTION public.get_users_with_display_names()
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  anonymous_username text,
  role user_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    CASE 
      WHEN get_user_role(auth.uid()) = 'admin'::user_role THEN u.email
      ELSE NULL
    END as email,
    u.display_name,
    u.anonymous_username,
    u.role
  FROM public.users u
  WHERE 
    get_user_role(auth.uid()) = 'admin'::user_role
    OR EXISTS (
      SELECT 1 FROM public.contact_unlocks cu
      WHERE (cu.unlocker_id = auth.uid() AND cu.unlocked_user_id = u.id)
         OR (cu.unlocked_user_id = auth.uid() AND cu.unlocker_id = u.id)
    )
    OR u.id = auth.uid();
$$;

-- PHASE 3: Fix pre_launch_signups RLS (if not already done)
DO $$ 
BEGIN
  ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Anyone can view pre-launch signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Public can view pre-launch signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Only admins can view pre-launch signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "System can insert signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Admins can manage signups" ON public.pre_launch_signups;

CREATE POLICY "Only admins can view pre-launch signups"
ON public.pre_launch_signups
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert signups"
ON public.pre_launch_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage signups"
ON public.pre_launch_signups
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);