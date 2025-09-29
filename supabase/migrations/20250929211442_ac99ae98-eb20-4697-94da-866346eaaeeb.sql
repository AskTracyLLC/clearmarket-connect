-- Add daily connection request limit column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS daily_connection_request_limit INTEGER DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.users.daily_connection_request_limit IS 
  'Custom daily connection request limit. NULL uses role-based defaults: vendors=5, field_reps=10, trusted+=unlimited';

-- Update the can_send_connection_request function to use per-user and trust-based limits
CREATE OR REPLACE FUNCTION public.can_send_connection_request(
  sender_user_id UUID,
  recipient_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  daily_limit INTEGER;
  today_count INTEGER := 0;
  existing_request RECORD;
  result JSONB;
  sender_role TEXT;
  sender_trust_badge TEXT;
  user_custom_limit INTEGER;
BEGIN
  -- Check for existing request (any status) to same recipient
  SELECT * INTO existing_request
  FROM public.connection_requests
  WHERE sender_id = sender_user_id 
    AND recipient_id = recipient_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF existing_request IS NOT NULL THEN
    -- Check if there's a recent request (within 30 days)
    IF existing_request.created_at > (now() - INTERVAL '30 days') THEN
      result := jsonb_build_object(
        'can_send', false,
        'reason', 'duplicate',
        'message', CASE 
          WHEN existing_request.status = 'pending' THEN 'You already have a pending connection request with this user.'
          WHEN existing_request.status = 'accepted' THEN 'You are already connected with this user.'
          WHEN existing_request.status = 'rejected' THEN 'Your previous connection request was declined. Please wait before sending another request.'
          ELSE 'A connection request already exists with this user.'
        END,
        'existing_status', existing_request.status
      );
      RETURN result;
    END IF;
  END IF;
  
  -- Get sender's role, trust badge, and custom limit
  SELECT u.role, ts.badge_level, u.daily_connection_request_limit
  INTO sender_role, sender_trust_badge, user_custom_limit
  FROM public.users u
  LEFT JOIN public.trust_scores ts ON ts.user_id = u.id
  WHERE u.id = sender_user_id;
  
  -- Determine daily limit
  IF user_custom_limit IS NOT NULL THEN
    -- Admin has set a custom limit
    daily_limit := user_custom_limit;
  ELSIF sender_trust_badge IN ('trusted', 'verified_pro') THEN
    -- Trusted or higher status = unlimited
    daily_limit := NULL;
  ELSIF sender_role = 'vendor' THEN
    -- Default for vendors
    daily_limit := 5;
  ELSE
    -- Default for field reps and others
    daily_limit := 10;
  END IF;
  
  -- If no limit (unlimited), allow request
  IF daily_limit IS NULL THEN
    result := jsonb_build_object(
      'can_send', true,
      'reason', null,
      'message', 'You can send this connection request.',
      'remaining_today', -1,
      'is_unlimited', true
    );
    RETURN result;
  END IF;
  
  -- Check daily limit
  SELECT COALESCE(request_count, 0) INTO today_count
  FROM public.daily_connection_request_limits
  WHERE user_id = sender_user_id 
    AND date = CURRENT_DATE;
  
  IF today_count >= daily_limit THEN
    result := jsonb_build_object(
      'can_send', false,
      'reason', 'daily_limit',
      'message', format('You have reached the daily limit of %s connection requests. Please try again tomorrow.', daily_limit),
      'daily_limit', daily_limit,
      'today_count', today_count
    );
    RETURN result;
  END IF;
  
  -- User can send request
  result := jsonb_build_object(
    'can_send', true,
    'reason', null,
    'message', 'You can send this connection request.',
    'remaining_today', daily_limit - today_count,
    'daily_limit', daily_limit
  );
  
  RETURN result;
END;
$$;

-- Function for admins to set user connection request limit
CREATE OR REPLACE FUNCTION public.admin_set_connection_request_limit(
  target_user_id UUID,
  new_limit INTEGER
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
  
  -- Validate limit (null for unlimited, or positive integer)
  IF new_limit IS NOT NULL AND new_limit < 0 THEN
    RAISE EXCEPTION 'Limit must be NULL (unlimited) or a positive integer.';
  END IF;
  
  -- Update the user's limit
  UPDATE public.users 
  SET daily_connection_request_limit = new_limit, 
      updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the change
  INSERT INTO public.audit_log (
    user_id, 
    action, 
    target_table, 
    target_id, 
    metadata
  ) VALUES (
    auth.uid(),
    'connection_limit_updated',
    'users',
    target_user_id,
    jsonb_build_object(
      'new_limit', new_limit,
      'changed_by', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN FOUND;
END;
$$;

-- Function to get user's current limit info
CREATE OR REPLACE FUNCTION public.get_user_connection_limit_info(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  trust_badge TEXT;
  custom_limit INTEGER;
  effective_limit INTEGER;
  today_count INTEGER;
  result JSONB;
BEGIN
  -- Get user info
  SELECT u.role, ts.badge_level, u.daily_connection_request_limit
  INTO user_role, trust_badge, custom_limit
  FROM public.users u
  LEFT JOIN public.trust_scores ts ON ts.user_id = u.id
  WHERE u.id = target_user_id;
  
  -- Determine effective limit
  IF custom_limit IS NOT NULL THEN
    effective_limit := custom_limit;
  ELSIF trust_badge IN ('trusted', 'verified_pro') THEN
    effective_limit := NULL; -- unlimited
  ELSIF user_role = 'vendor' THEN
    effective_limit := 5;
  ELSE
    effective_limit := 10;
  END IF;
  
  -- Get today's count
  SELECT COALESCE(request_count, 0) INTO today_count
  FROM public.daily_connection_request_limits
  WHERE user_id = target_user_id 
    AND date = CURRENT_DATE;
  
  result := jsonb_build_object(
    'user_role', user_role,
    'trust_badge', trust_badge,
    'custom_limit', custom_limit,
    'effective_limit', effective_limit,
    'is_unlimited', effective_limit IS NULL,
    'today_count', today_count,
    'remaining_today', CASE 
      WHEN effective_limit IS NULL THEN -1
      ELSE GREATEST(0, effective_limit - today_count)
    END
  );
  
  RETURN result;
END;
$$;