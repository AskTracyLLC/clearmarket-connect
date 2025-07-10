-- CRITICAL SECURITY FIX: Prevent users from updating their own roles
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create separate policies for different update operations
-- Users can update their basic profile info (but NOT role)
CREATE POLICY "Users can update own basic profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM public.users WHERE id = auth.uid())  -- Prevent role changes
);

-- Only admins can update user roles
CREATE POLICY "Admins can update any user profile" 
ON public.users 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Fix feedback sessions policy - make it more restrictive
DROP POLICY IF EXISTS "Users can view own feedback sessions via token" ON public.feedback_sessions;

CREATE POLICY "Restricted feedback session access" 
ON public.feedback_sessions 
FOR SELECT 
USING (false);  -- No direct database access, only through application layer

-- Create audit function for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes to audit_log table
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_log (
      user_id, 
      action, 
      target_table, 
      target_id, 
      metadata
    ) VALUES (
      auth.uid(),
      'role_change',
      'users',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role::text,
        'new_role', NEW.role::text,
        'changed_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.users;
CREATE TRIGGER audit_user_role_changes
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- Create admin-only role update function
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role user_role
)
RETURNS BOOLEAN
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