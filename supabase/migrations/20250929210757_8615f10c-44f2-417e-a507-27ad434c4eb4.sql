-- Drop existing policies and triggers if they exist
DROP POLICY IF EXISTS "Users can view own connection request limits" ON public.daily_connection_request_limits;
DROP POLICY IF EXISTS "System can manage connection request limits" ON public.daily_connection_request_limits;
DROP TRIGGER IF EXISTS connection_request_created_trigger ON public.connection_requests;

-- Add daily connection request limit tracking table
CREATE TABLE IF NOT EXISTS public.daily_connection_request_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INTEGER NOT NULL DEFAULT 0,
  anonymous_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_connection_request_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own limits
CREATE POLICY "Users can view own connection request limits"
  ON public.daily_connection_request_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can manage limits
CREATE POLICY "System can manage connection request limits"
  ON public.daily_connection_request_limits
  FOR ALL
  USING (true);

-- Function to check if user can send connection request
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
  daily_limit INTEGER := 10; -- Maximum 10 connection requests per day
  today_count INTEGER := 0;
  existing_request RECORD;
  result JSONB;
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
    'remaining_today', daily_limit - today_count
  );
  
  RETURN result;
END;
$$;

-- Function to increment daily connection request count
CREATE OR REPLACE FUNCTION public.increment_daily_connection_request_count(
  user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_connection_request_limits (user_id, date, request_count)
  VALUES (user_id_param, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET request_count = daily_connection_request_limits.request_count + 1;
END;
$$;

-- Trigger to automatically increment count when connection request is created
CREATE OR REPLACE FUNCTION public.track_connection_request_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only track if status is pending (new request)
  IF NEW.status = 'pending' THEN
    PERFORM public.increment_daily_connection_request_count(NEW.sender_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER connection_request_created_trigger
  AFTER INSERT ON public.connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.track_connection_request_creation();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_recipient 
  ON public.connection_requests(sender_id, recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_connection_limits_user_date 
  ON public.daily_connection_request_limits(user_id, date);