-- Create a security definer function to safely query active hidden reviews
-- This replaces the need to query the active_hidden_reviews view directly
CREATE OR REPLACE FUNCTION public.get_active_hidden_reviews(target_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  review_id uuid,
  expires_at timestamp with time zone,
  admin_override boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    hr.user_id,
    hr.review_id,
    hr.expires_at,
    hr.admin_override
  FROM public.hidden_reviews hr
  WHERE 
    -- Filter by user if specified, otherwise use auth.uid()
    hr.user_id = COALESCE(target_user_id, auth.uid())
    -- Only return active (non-expired) reviews
    AND (hr.expires_at IS NULL OR hr.expires_at > now())
    -- Respect admin override
    AND COALESCE(hr.admin_override, false) = false
    -- Security: only show user's own data unless admin
    AND (
      auth.uid() = hr.user_id 
      OR get_user_role(auth.uid()) = 'admin'::user_role
    )
  ORDER BY hr.created_at DESC;
$$;