
-- Create direct_messages table for proper conversation tracking
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE NULL,
  responded_at TIMESTAMP WITH TIME ZONE NULL,
  is_system_message BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_business_hours table for configurable business hours
CREATE TABLE public.user_business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- Create response_time_tracking table for calculated metrics
CREATE TABLE public.response_time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  avg_response_minutes INTEGER NOT NULL DEFAULT 0,
  avg_business_hours_response_minutes INTEGER NULL,
  response_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_messages_received INTEGER NOT NULL DEFAULT 0,
  total_messages_responded INTEGER NOT NULL DEFAULT 0,
  fastest_response_minutes INTEGER NULL,
  slowest_response_minutes INTEGER NULL,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  calculation_period_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create communication_badges table for achievement definitions
CREATE TABLE public.communication_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL,
  icon_url TEXT NULL,
  badge_color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_communication_badges table for tracking earned badges
CREATE TABLE public.user_communication_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.communication_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Add communication_score column to users table
ALTER TABLE public.users ADD COLUMN communication_score INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN avg_response_time_minutes INTEGER DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN response_rate DECIMAL(5,2) DEFAULT 0.00;

-- Add response time preferences to user_preferences
ALTER TABLE public.user_preferences ADD COLUMN show_response_time BOOLEAN DEFAULT true;
ALTER TABLE public.user_preferences ADD COLUMN business_hours_only BOOLEAN DEFAULT true;
ALTER TABLE public.user_preferences ADD COLUMN response_time_timezone TEXT DEFAULT 'America/Chicago';

-- Enable RLS on new tables
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_communication_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for direct_messages
CREATE POLICY "Users can view messages they sent or received" ON public.direct_messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create messages" ON public.direct_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" ON public.direct_messages
FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read" ON public.direct_messages
FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can view all messages" ON public.direct_messages
FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for user_business_hours
CREATE POLICY "Users can manage own business hours" ON public.user_business_hours
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view business hours" ON public.user_business_hours
FOR SELECT USING (true);

-- RLS policies for response_time_tracking
CREATE POLICY "Users can view own response tracking" ON public.response_time_tracking
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view response metrics" ON public.response_time_tracking
FOR SELECT USING (true);

CREATE POLICY "System can manage response tracking" ON public.response_time_tracking
FOR ALL USING (true);

-- RLS policies for communication_badges
CREATE POLICY "Everyone can view active badges" ON public.communication_badges
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage badges" ON public.communication_badges
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for user_communication_badges
CREATE POLICY "Users can view own badges" ON public.user_communication_badges
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active user badges" ON public.user_communication_badges
FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage user badges" ON public.user_communication_badges
FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(conversation_id, sent_at);
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id, sent_at);
CREATE INDEX idx_direct_messages_recipient ON public.direct_messages(recipient_id, sent_at);
CREATE INDEX idx_direct_messages_read_status ON public.direct_messages(recipient_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_user_business_hours_user ON public.user_business_hours(user_id, day_of_week);
CREATE INDEX idx_response_time_tracking_user ON public.response_time_tracking(user_id);
CREATE INDEX idx_user_communication_badges_user ON public.user_communication_badges(user_id, is_active);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_direct_messages_updated_at
BEFORE UPDATE ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_business_hours_updated_at
BEFORE UPDATE ON public.user_business_hours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_response_time_tracking_updated_at
BEFORE UPDATE ON public.response_time_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communication_badges_updated_at
BEFORE UPDATE ON public.communication_badges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default business hours for all existing users (8am-5pm CST, Monday-Friday)
INSERT INTO public.user_business_hours (user_id, day_of_week, start_time, end_time, timezone, is_active)
SELECT 
  u.id,
  day_num,
  '08:00:00'::TIME,
  '17:00:00'::TIME,
  'America/Chicago',
  CASE WHEN day_num IN (1,2,3,4,5) THEN true ELSE false END
FROM public.users u
CROSS JOIN generate_series(1, 5) AS day_num  -- Monday through Friday only
ON CONFLICT (user_id, day_of_week) DO NOTHING;

-- Insert default communication badges
INSERT INTO public.communication_badges (badge_type, display_name, description, criteria, badge_color, display_order) VALUES
('lightning_fast', 'Lightning Fast', 'Responds within 1 hour on average', '{"avg_response_minutes": {"max": 60}}', '#fbbf24', 1),
('quick_responder', 'Quick Responder', 'Responds within 4 hours on average', '{"avg_response_minutes": {"max": 240}}', '#10b981', 2),
('reliable_communicator', 'Reliable Communicator', '90%+ response rate', '{"response_rate": {"min": 90}}', '#3b82f6', 3),
('always_available', 'Always Available', 'Responds outside business hours regularly', '{"outside_hours_responses": {"min": 10}}', '#8b5cf6', 4),
('consistent_responder', 'Consistent Responder', 'Maintains good response time for 30+ days', '{"consistency_days": {"min": 30}, "avg_response_minutes": {"max": 480}}', '#06b6d4', 5);

-- Create function to calculate response time metrics
CREATE OR REPLACE FUNCTION public.calculate_response_metrics(target_user_id UUID, period_days INTEGER DEFAULT 30)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_received INTEGER := 0;
  total_responded INTEGER := 0;
  avg_response_mins INTEGER := 0;
  avg_business_response_mins INTEGER := NULL;
  fastest_mins INTEGER := NULL;
  slowest_mins INTEGER := NULL;
  response_rate DECIMAL(5,2) := 0.00;
BEGIN
  -- Calculate metrics from direct messages in the specified period
  WITH message_stats AS (
    SELECT 
      COUNT(*) as received_count,
      COUNT(responded_at) as responded_count,
      AVG(EXTRACT(EPOCH FROM (responded_at - sent_at))/60)::INTEGER as avg_response_minutes,
      MIN(EXTRACT(EPOCH FROM (responded_at - sent_at))/60)::INTEGER as fastest_response,
      MAX(EXTRACT(EPOCH FROM (responded_at - sent_at))/60)::INTEGER as slowest_response
    FROM public.direct_messages dm
    WHERE dm.recipient_id = target_user_id
      AND dm.sent_at >= (now() - INTERVAL '1 day' * period_days)
      AND dm.is_system_message = false
  )
  SELECT 
    received_count, 
    responded_count, 
    COALESCE(avg_response_minutes, 0),
    fastest_response,
    slowest_response,
    CASE 
      WHEN received_count > 0 THEN (responded_count::DECIMAL / received_count::DECIMAL) * 100 
      ELSE 0 
    END
  INTO total_received, total_responded, avg_response_mins, fastest_mins, slowest_mins, response_rate
  FROM message_stats;

  -- Calculate business hours only response time (placeholder for now)
  avg_business_response_mins := avg_response_mins;

  -- Insert or update response tracking record
  INSERT INTO public.response_time_tracking (
    user_id, 
    avg_response_minutes, 
    avg_business_hours_response_minutes,
    response_rate, 
    total_messages_received, 
    total_messages_responded,
    fastest_response_minutes,
    slowest_response_minutes,
    calculation_period_days,
    last_calculated_at
  ) VALUES (
    target_user_id, 
    avg_response_mins, 
    avg_business_response_mins,
    response_rate, 
    total_received, 
    total_responded,
    fastest_mins,
    slowest_mins,
    period_days,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    avg_response_minutes = EXCLUDED.avg_response_minutes,
    avg_business_hours_response_minutes = EXCLUDED.avg_business_hours_response_minutes,
    response_rate = EXCLUDED.response_rate,
    total_messages_received = EXCLUDED.total_messages_received,
    total_messages_responded = EXCLUDED.total_messages_responded,
    fastest_response_minutes = EXCLUDED.fastest_response_minutes,
    slowest_response_minutes = EXCLUDED.slowest_response_minutes,
    calculation_period_days = EXCLUDED.calculation_period_days,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();

  -- Update user's main communication metrics
  UPDATE public.users 
  SET 
    avg_response_time_minutes = avg_response_mins,
    response_rate = calculate_response_metrics.response_rate,
    communication_score = LEAST(100, GREATEST(0, 
      CASE 
        WHEN avg_response_mins <= 60 THEN 100
        WHEN avg_response_mins <= 240 THEN 90
        WHEN avg_response_mins <= 480 THEN 80
        WHEN avg_response_mins <= 1440 THEN 70
        ELSE 60
      END + 
      CASE 
        WHEN calculate_response_metrics.response_rate >= 95 THEN 0
        WHEN calculate_response_metrics.response_rate >= 90 THEN -5
        WHEN calculate_response_metrics.response_rate >= 80 THEN -10
        WHEN calculate_response_metrics.response_rate >= 70 THEN -15
        ELSE -20
      END
    )),
    updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- Create function to award communication badges
CREATE OR REPLACE FUNCTION public.update_communication_badges(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_metrics RECORD;
  badge_record RECORD;
BEGIN
  -- Get user's current metrics
  SELECT * INTO user_metrics
  FROM public.response_time_tracking
  WHERE user_id = target_user_id;
  
  IF user_metrics IS NULL THEN
    RETURN;
  END IF;

  -- Check each badge criteria and award if met
  FOR badge_record IN 
    SELECT * FROM public.communication_badges WHERE is_active = true
  LOOP
    -- Lightning Fast badge (< 60 minutes average)
    IF badge_record.badge_type = 'lightning_fast' AND user_metrics.avg_response_minutes <= 60 AND user_metrics.total_messages_received >= 5 THEN
      INSERT INTO public.user_communication_badges (user_id, badge_id)
      VALUES (target_user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO UPDATE SET is_active = true, earned_at = now();
      
    -- Quick Responder badge (< 240 minutes average)  
    ELSIF badge_record.badge_type = 'quick_responder' AND user_metrics.avg_response_minutes <= 240 AND user_metrics.total_messages_received >= 10 THEN
      INSERT INTO public.user_communication_badges (user_id, badge_id)
      VALUES (target_user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO UPDATE SET is_active = true, earned_at = now();
      
    -- Reliable Communicator badge (90%+ response rate)
    ELSIF badge_record.badge_type = 'reliable_communicator' AND user_metrics.response_rate >= 90 AND user_metrics.total_messages_received >= 20 THEN
      INSERT INTO public.user_communication_badges (user_id, badge_id)
      VALUES (target_user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO UPDATE SET is_active = true, earned_at = now();
    END IF;
  END LOOP;
END;
$$;

-- Create function to update message responded_at timestamp
CREATE OR REPLACE FUNCTION public.mark_message_responded(message_id UUID, responder_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the original message to mark it as responded to
  UPDATE public.direct_messages 
  SET responded_at = now(), updated_at = now()
  WHERE id = message_id 
    AND recipient_id = responder_user_id
    AND responded_at IS NULL;
  
  -- Recalculate metrics for the responder
  PERFORM public.calculate_response_metrics(responder_user_id);
  PERFORM public.update_communication_badges(responder_user_id);
  
  RETURN FOUND;
END;
$$;
