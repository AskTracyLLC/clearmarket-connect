-- Create connection requests table
CREATE TABLE public.connection_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_email TEXT NULL,
  recipient_username TEXT NULL,
  recipient_id UUID NULL,
  personal_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create network connections table  
CREATE TABLE public.network_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  connection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  how_connected TEXT NOT NULL DEFAULT 'invite' CHECK (how_connected IN ('invite', 'unlocked', 'referral')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create daily invite limits table for spam protection
CREATE TABLE public.daily_invite_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  invite_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_invite_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for connection_requests
CREATE POLICY "Users can create connection requests" 
ON public.connection_requests 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view requests they sent or received" 
ON public.connection_requests 
FOR SELECT 
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR
  get_user_email(auth.uid()) = recipient_email
);

CREATE POLICY "Recipients can update request status" 
ON public.connection_requests 
FOR UPDATE 
USING (
  auth.uid() = recipient_id OR
  get_user_email(auth.uid()) = recipient_email
);

-- RLS policies for network_connections
CREATE POLICY "Users can view their connections" 
ON public.network_connections 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create connections" 
ON public.network_connections 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for daily_invite_limits
CREATE POLICY "Users can view own invite limits" 
ON public.daily_invite_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage invite limits" 
ON public.daily_invite_limits 
FOR ALL 
USING (true);

-- Function to check daily invite limit
CREATE OR REPLACE FUNCTION public.check_daily_invite_limit(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Get current invite count for today
  SELECT COALESCE(invite_count, 0) 
  INTO current_count
  FROM public.daily_invite_limits 
  WHERE user_id = user_id_param AND date = CURRENT_DATE;
  
  -- Return true if under limit (5 per day)
  RETURN COALESCE(current_count, 0) < 5;
END;
$$;

-- Function to increment daily invite count
CREATE OR REPLACE FUNCTION public.increment_daily_invite_count(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_invite_limits (user_id, date, invite_count)
  VALUES (user_id_param, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET invite_count = daily_invite_limits.invite_count + 1;
END;
$$;

-- Function to accept connection request
CREATE OR REPLACE FUNCTION public.accept_connection_request(request_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_record
  FROM public.connection_requests
  WHERE id = request_id_param 
    AND status = 'pending'
    AND expires_at > now()
    AND (auth.uid() = recipient_id OR get_user_email(auth.uid()) = recipient_email);
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Create the network connection (both directions for easier querying)
  INSERT INTO public.network_connections (user1_id, user2_id, how_connected)
  VALUES (request_record.sender_id, COALESCE(request_record.recipient_id, auth.uid()), 'invite')
  ON CONFLICT (user1_id, user2_id) DO NOTHING;
  
  INSERT INTO public.network_connections (user1_id, user2_id, how_connected)
  VALUES (COALESCE(request_record.recipient_id, auth.uid()), request_record.sender_id, 'invite')
  ON CONFLICT (user1_id, user2_id) DO NOTHING;
  
  -- Update request status
  UPDATE public.connection_requests
  SET status = 'accepted', 
      recipient_id = COALESCE(recipient_id, auth.uid()),
      updated_at = now()
  WHERE id = request_id_param;
  
  RETURN true;
END;
$$;

-- Function to decline connection request
CREATE OR REPLACE FUNCTION public.decline_connection_request(request_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.connection_requests
  SET status = 'declined', 
      recipient_id = COALESCE(recipient_id, auth.uid()),
      updated_at = now()
  WHERE id = request_id_param 
    AND status = 'pending'
    AND expires_at > now()
    AND (auth.uid() = recipient_id OR get_user_email(auth.uid()) = recipient_email);
  
  RETURN FOUND;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_connection_requests_updated_at
  BEFORE UPDATE ON public.connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();